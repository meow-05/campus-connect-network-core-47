
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NoticeWithCategory } from '@/lib/api/notices';
import { ExternalLink, Paperclip, Flag, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface NoticeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: NoticeWithCategory | null;
}

export function NoticeDetailModal({ open, onOpenChange, notice }: NoticeDetailModalProps) {
  if (!notice) return null;

  const isImportant = notice.is_pinned;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {notice.title}
            {isImportant && (
              <Flag className="h-5 w-5 text-destructive fill-destructive" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {notice.notice_categories?.name && (
              <Badge variant="secondary">
                {notice.notice_categories.name}
              </Badge>
            )}
            {isImportant && (
              <Badge variant="destructive">Important</Badge>
            )}
            {notice.target_roles?.map((role) => (
              <Badge key={role} variant="outline">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            ))}
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {notice.content}
            </p>
          </div>

          {/* Attachment */}
          {notice.attachment_url && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachment
              </h4>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                  View Attachment
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          )}

          {/* Link */}
          {notice.link && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Related Link
              </h4>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={notice.link} target="_blank" rel="noopener noreferrer">
                  Open Link
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          )}

          {/* Target Information */}
          {(notice.target_department_ids?.length || notice.target_semesters?.length) && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Target Audience</h4>
              {notice.target_department_ids?.length && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Departments:</span>
                  <div className="flex gap-1 mt-1">
                    {notice.target_department_ids.map((deptId) => (
                      <Badge key={deptId} variant="outline" className="text-xs">
                        {deptId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {notice.target_semesters?.length && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Semesters:</span>
                  <div className="flex gap-1 mt-1">
                    {notice.target_semesters.map((sem) => (
                      <Badge key={sem} variant="outline" className="text-xs">
                        Sem {sem}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                Posted by {notice.users?.display_name || notice.users?.email || 'Unknown User'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Created on {format(new Date(notice.created_at), 'PPP')}
              </span>
            </div>

            {notice.expires_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Expires on {format(new Date(notice.expires_at), 'PPP')}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
