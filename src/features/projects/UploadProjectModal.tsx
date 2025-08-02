import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useCreateProject } from "./hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface UploadProjectModalProps {
  onClose: () => void;
}

export function UploadProjectModal({ onClose }: UploadProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: [] as string[], // Store skill IDs (UUIDs)
    max_team_size: "",
    github_url: "",
    status: "open" as const
  });
  
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const createProject = useCreateProject();

  // Fetch available skills from database
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching skills:', error);
        return;
      }
      
      setAvailableSkills(data || []);
    };
    
    fetchSkills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.required_skills.length === 0) {
      toast.error("Please select at least one required skill");
      return;
    }

    try {
      await createProject.mutateAsync({
        title: formData.title,
        description: formData.description,
        required_skills: formData.required_skills,
        max_team_size: formData.max_team_size ? parseInt(formData.max_team_size) : null,
        github_url: formData.github_url || null,
        status: formData.status,
        is_draft: false
      });
      toast.success("Project created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const addSkill = (skillId: string) => {
    if (!formData.required_skills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillId]
      }));
    }
  };

  const removeSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skillId)
    }));
  };

  const addCustomSkill = async () => {
    const skillName = newSkill.trim();
    if (!skillName) return;
    
    // Check if skill already exists
    const existingSkill = availableSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (existingSkill) {
      addSkill(existingSkill.id);
      setNewSkill("");
      return;
    }
    
    // Create new skill in database
    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: skillName,
        category: 'Other'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating skill:', error);
      toast.error('Failed to create new skill');
      return;
    }
    
    // Add to available skills and form
    setAvailableSkills(prev => [...prev, data]);
    addSkill(data.id);
    setNewSkill("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload New Project</h2>
        <p className="text-muted-foreground">
          Share your project with the community and find collaborators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter your project title..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project, its goals, and what you're trying to solve..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Status</label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open for collaborators</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Team Size</label>
              <Input
                type="number"
                value={formData.max_team_size}
                onChange={(e) => setFormData(prev => ({ ...prev, max_team_size: e.target.value }))}
                placeholder="e.g. 5"
                min="2"
                max="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub Repository (Optional)</label>
            <Input
              value={formData.github_url}
              onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
              placeholder="https://github.com/username/repository"
              type="url"
            />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Skills *</h3>
          
          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.required_skills.map((skillId) => {
              const skill = availableSkills.find(s => s.id === skillId);
              return (
                <Badge key={skillId} variant="secondary" className="flex items-center gap-1">
                  {skill?.name || 'Unknown Skill'}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeSkill(skillId)}
                  />
                </Badge>
              );
            })}
          </div>

          {/* Add Skills */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add custom skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              />
              <Button type="button" onClick={addCustomSkill} disabled={!newSkill.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {availableSkills
                .filter(skill => !formData.required_skills.includes(skill.id))
                .map((skill) => (
                  <Button
                    key={skill.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill.id)}
                    className="justify-start text-xs h-8"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {skill.name}
                  </Button>
                ))}
            </div>
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
            disabled={createProject.isPending}
            className="flex-1"
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}