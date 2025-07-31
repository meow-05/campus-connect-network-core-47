import { useState } from "react";
import { Eye, UserPlus, Calendar, Users, Github, ExternalLink, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProjectViewModal from "./ProjectViewModal";
import JoinProjectModal from "./JoinProjectModal";
import { useUser } from "@/hooks/useUser";
import { useProjectReactions, useProjectComments } from "./hooks/useProjects";
import type { Project } from "./hooks/useProjects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useUser();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: reactions } = useProjectReactions(project.id);
  const { data: comments } = useProjectComments(project.id);

  const canRequestJoin = user?.role === 'student' && 
    project.team_lead !== user.id && 
    project.status === 'open' &&
    !project.user_request_status;

  const reactionCount = reactions?.length || 0;
  const commentCount = comments?.length || 0;

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

  const getRequestStatusDisplay = () => {
    if (!project.user_request_status) return null;
    
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Request Pending' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Member' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Request Rejected' }
    };

    const config = statusConfig[project.user_request_status];
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {project.title}
          </h3>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {project.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Team Lead Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.team_lead_info?.avatar_path} />
            <AvatarFallback className="text-xs">
              {project.team_lead_info?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {project.team_lead_info?.display_name || 'Unknown'}
          </span>
          {project.college_name && (
            <span className="text-xs text-muted-foreground">
              • {project.college_name}
            </span>
          )}
        </div>

        {/* Team Size */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {project.member_count + 1}/{project.max_team_size || '∞'} members
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Required Skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.required_skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {project.required_skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.required_skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Links */}
        {project.github_url && (
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            <a 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Repository
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Request Status */}
        {getRequestStatusDisplay()}

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{reactionCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 text-sm">
              <Eye className="h-4 w-4 mr-1" />
              View Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProjectViewModal 
              project={project} 
              onClose={() => setShowViewModal(false)} 
            />
          </DialogContent>
        </Dialog>

        {canRequestJoin && (
          <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
            <DialogTrigger asChild>
              <Button className="flex-1 text-sm">
                <UserPlus className="h-4 w-4 mr-1" />
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
      </CardFooter>
    </Card>
  );
}