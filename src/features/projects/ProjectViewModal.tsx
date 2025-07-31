import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Github, ExternalLink, Edit, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import JoinProjectModal from "./JoinProjectModal";
import { useUser } from "@/hooks/useUser";
import { useProjectRequests } from "./hooks/useProjects";
import type { Project } from "./hooks/useProjects";

interface ProjectViewModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectViewModal({ project, onClose }: ProjectViewModalProps) {
  const { user } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const { data: requests } = useProjectRequests(project.id);

  const isProjectLead = user?.id === project.team_lead;
  const canRequestJoin = user?.role === 'student' && 
    !isProjectLead && 
    project.status === 'open' &&
    !project.user_request_status;

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

  const approvedRequests = requests?.filter(req => req.status === 'approved') || [];
  const pendingRequests = requests?.filter(req => req.status === 'pending') || [];

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
      </div>

      {/* Links */}
      {project.github_url && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Project Links</h3>
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
        </div>
      )}

      {/* Team Members */}
      {approvedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <div className="space-y-2">
            {approvedRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={request.student_info?.avatar_path} />
                  <AvatarFallback className="text-xs">
                    {request.student_info?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{request.student_info?.display_name}</span>
                {request.skills && request.skills.length > 0 && (
                  <div className="flex gap-1 ml-auto">
                    {request.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {request.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{request.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Requests (Project Lead Only) */}
      {isProjectLead && pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pending Join Requests</h3>
          <p className="text-sm text-muted-foreground">
            {pendingRequests.length} student{pendingRequests.length !== 1 ? 's' : ''} waiting for approval
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        
        {isProjectLead && (
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
        )}

        {canRequestJoin && (
          <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
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
      </div>
    </div>
  );
}