import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { useSubmitProjectRequest } from "./hooks/useProjects";
import type { Project } from "./hooks/useProjects";

const SKILLS_OPTIONS = [
  "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C++", 
  "Machine Learning", "Data Science", "UI/UX Design", "Mobile Development",
  "Backend Development", "Frontend Development", "Full Stack", "DevOps",
  "Database", "API Development", "Testing", "Project Management"
];

interface JoinProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function JoinProjectModal({ project, onClose }: JoinProjectModalProps) {
  const [message, setMessage] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const submitRequest = useSubmitProjectRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    try {
      await submitRequest.mutateAsync({
        project_id: project.id,
        message: message.trim(),
        skills: selectedSkills.length > 0 ? selectedSkills : undefined
      });
      onClose();
    } catch (error) {
      console.error("Error submitting join request:", error);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Request to Join Project</h2>
        <p className="text-muted-foreground">
          Send a request to join "{project.title}"
        </p>
      </div>

      {/* Project Info */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.team_lead_info?.avatar_path} />
            <AvatarFallback>
              {project.team_lead_info?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{project.team_lead_info?.display_name}</p>
            <p className="text-sm text-muted-foreground">Project Lead</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">Required Skills:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.required_skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Message to Project Lead *</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain why you'd like to join this project. Mention your relevant experience and what you can contribute..."
            rows={4}
            maxLength={500}
            required
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/500 characters
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Your Relevant Skills (Optional)</label>
          
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="default" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Available Skills */}
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {SKILLS_OPTIONS
              .filter(skill => !selectedSkills.includes(skill))
              .map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSkill(skill)}
                  className="justify-start text-left text-xs"
                >
                  {skill}
                </Button>
              ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitRequest.isPending || !message.trim()}
            className="flex-1"
          >
            {submitRequest.isPending ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}