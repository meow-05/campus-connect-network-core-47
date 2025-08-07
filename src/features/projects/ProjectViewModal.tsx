import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Calendar, 
  Github, 
  ExternalLink, 
  UserPlus,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Edit
} from "lucide-react";
import { 
  useProjectRequests, 
  useUpdateProjectRequest,
  useProjectReactions,
  useToggleReaction,
  useProjectComments,
  useAddComment,
  useDeleteComment
} from "./hooks/useProjects";
import { useUser } from "@/hooks/useUser";
import JoinProjectModal from "./JoinProjectModal";
import type { Project } from "./hooks/useProjects";

interface ProjectViewModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectViewModal({ project, onClose }: ProjectViewModalProps) {
  const { user } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  const { data: projectRequests } = useProjectRequests(project.id);
  const { data: reactions } = useProjectReactions(project.id);
  const { data: comments } = useProjectComments(project.id);
  
  const updateRequest = useUpdateProjectRequest();
  const toggleReaction = useToggleReaction();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const isTeamLead = user?.id === project.team_lead;
  const canRequestJoin = user?.role === 'student' && 
    !isTeamLead && 
    project.status === 'open' &&
    !project.user_request_status;

  // Check if current user has reacted
  const userReaction = reactions?.find(r => r.user_id === user?.id);
  const reactionCount = reactions?.length || 0;

  const approvedRequests = projectRequests?.filter(req => req.status === 'approved') || [];
  const pendingRequests = projectRequests?.filter(req => req.status === 'pending') || [];

  const handleRequestUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await updateRequest.mutateAsync({ id: requestId, status });
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleToggleReaction = () => {
    toggleReaction.mutate({ projectId: project.id });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment.mutate({ 
        projectId: project.id, 
        content: newComment 
      });
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate({ commentId, projectId: project.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold leading-tight">{project.title}</h2>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {project.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Team Lead Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.team_lead_info?.avatar_path} />
            <AvatarFallback>
              {project.team_lead_info?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{project.team_lead_info?.display_name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">Project Lead</p>
          </div>
          {project.college_name && (
            <div className="ml-auto">
              <p className="text-sm text-muted-foreground">{project.college_name}</p>
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.member_count + 1}/{project.max_team_size || '∞'} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Project Description</h3>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {project.description}
        </p>
      </div>

      {/* Required Skills */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {project.required_skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>

        {/* GitHub Link */}
        {project.github_url && (
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            <a 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              View Repository
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Reactions Section */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            variant={userReaction ? "default" : "outline"}
            size="sm"
            onClick={handleToggleReaction}
            disabled={!user || toggleReaction.isPending}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${userReaction ? 'fill-current' : ''}`} />
            <span>{reactionCount}</span>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{comments?.length || 0} comments</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {canRequestJoin && (
            <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Request to Join
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <JoinProjectModal 
                  project={project} 
                  onClose={() => setShowJoinModal(false)} 
                />
              </DialogContent>
            </Dialog>
          )}

          {isTeamLead && (
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-4">
        {approvedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Team Members</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.student_info?.avatar_path} />
                      <AvatarFallback>
                        {request.student_info?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{request.student_info?.display_name}</p>
                      {request.skills && request.skills.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {request.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {request.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{request.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests (Project Lead Only) */}
        {isTeamLead && pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Pending Join Requests</h3>
              <p className="text-sm text-muted-foreground">
                {pendingRequests.length} student{pendingRequests.length !== 1 ? 's' : ''} waiting for approval
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.student_info?.avatar_path} />
                        <AvatarFallback>
                          {request.student_info?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.student_info?.display_name}</p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                        )}
                        {request.skills && request.skills.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {request.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestUpdate(request.id, 'approved')}
                        disabled={updateRequest.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestUpdate(request.id, 'rejected')}
                        disabled={updateRequest.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Comments</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            {user && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_path} />
                  <AvatarFallback>
                    {user.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.users?.avatar_path} />
                      <AvatarFallback>
                        {comment.users?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.users?.display_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {(isTeamLead || comment.user_id === user?.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteComment.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {(!comments || comments.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}