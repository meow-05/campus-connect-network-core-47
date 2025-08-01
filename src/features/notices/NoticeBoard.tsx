import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticeCard } from './NoticeCard';
import { NoticeModal } from './NoticeModal';
import { useNotices, useNoticeCategories } from './hooks/useNotices';
import { NoticeWithCategory, NoticeFilters } from '@/lib/api/notices';
import { useUser } from '@/hooks/useUser';
import { Plus, Search } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoticeBoard() {
  const { user } = useUser();
  const [filters, setFilters] = useState<NoticeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeWithCategory | null>(null);
  
  const { data: notices, isLoading, error } = useNotices(filters);
  const { data: categories } = useNoticeCategories(user?.college_id);

  const canCreateNotices = user?.role === 'faculty' || user?.role === 'platform_admin';

  // Filter notices by search term
  const filteredNotices = notices?.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateNotice = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleEditNotice = (notice: NoticeWithCategory) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingNotice(null);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">
          Error loading notices: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and notices
          </p>
        </div>
        {canCreateNotices && (
          <Button onClick={handleCreateNotice}>
            <Plus className="h-4 w-4 mr-2" />
            Create Notice
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.isMyNotices ? 'my' : filters.isImportantOnly ? 'important' : 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                isMyNotices: value === 'my',
                isImportantOnly: value === 'important',
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notices</SelectItem>
              {canCreateNotices && (
                <SelectItem value="my">My Notices</SelectItem>
              )}
              <SelectItem value="important">Important Only</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                categoryId: value === 'all' ? undefined : value,
              });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title="No notices found"
          description={
            searchTerm
              ? "No notices match your search criteria"
              : filters.isMyNotices
              ? "You haven't created any notices yet"
              : filters.isImportantOnly
              ? "No important notices available"
              : "No notices available at the moment"
          }
          action={
            canCreateNotices && !searchTerm ? (
              <Button onClick={handleCreateNotice}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Notice
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onEdit={handleEditNotice}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <NoticeModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        notice={editingNotice}
        onSuccess={handleModalClose}
      />
    </div>
  );
}