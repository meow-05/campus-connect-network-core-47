import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { NoticeWithCategory } from '@/lib/api/notices';
import { useDeleteNotice } from './hooks/useNotices';
import { useUser } from '@/hooks/useUser';
import { Edit2, Trash2, Flag, ExternalLink, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: NoticeWithCategory;
  onEdit?: (notice: NoticeWithCategory) => void;
}

export function NoticeCard({ notice, onEdit }: NoticeCardProps) {
  const { user } = useUser();
  const deleteNotice = useDeleteNotice();
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = user?.id === notice.posted_by;
  const isImportant = notice.is_pinned;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotice.mutateAsync(notice.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {notice.title}
            {isImportant && (
              <Flag className="inline-block ml-2 h-4 w-4 text-destructive fill-destructive" />
            )}
          </CardTitle>
          {canEdit && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(notice)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this notice? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {notice.notice_categories?.name && (
            <Badge variant="secondary">
              {notice.notice_categories.name}
            </Badge>
          )}
          {isImportant && (
            <Badge variant="destructive">Important</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm mb-3">
          {truncateContent(notice.content)}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>By {notice.users?.display_name || notice.users?.email || 'Unknown'}</span>
          <span>{format(new Date(notice.created_at), 'MMM dd, yyyy')}</span>
        </div>
      </CardContent>

      {(notice.link || notice.attachment_url) && (
        <CardFooter className="pt-0 flex gap-2">
          {notice.link && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <a href={notice.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </a>
            </Button>
          )}
          {notice.attachment_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachment
              </a>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}