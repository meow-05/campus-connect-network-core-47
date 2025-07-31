import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProjectCard from "@/features/projects/ProjectCard";
import UploadProjectModal from "@/features/projects/UploadProjectModal";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useUser } from "@/hooks/useUser";
import EmptyState from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";

const SKILLS_OPTIONS = [
  "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C++", 
  "Machine Learning", "Data Science", "UI/UX Design", "Mobile Development",
  "Backend Development", "Frontend Development", "Full Stack", "DevOps",
  "Database", "API Development", "Testing", "Project Management"
];

export default function ProjectsPage() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'open' | 'in-progress' | 'completed' | ''>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: projects, isLoading, error } = useProjects({
    search: searchTerm,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    status: statusFilter || undefined,
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const canUploadProject = user?.role === 'student';

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="Error Loading Projects"
          description="We couldn't load the projects. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Discover and collaborate on exciting student projects
          </p>
        </div>
        
        {canUploadProject && (
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <UploadProjectModal onClose={() => setShowUploadModal(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card rounded-lg border">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Skills Filter */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Skills ({selectedSkills.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Filter by Skills</h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {SKILLS_OPTIONS.map((skill) => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                    className="justify-start text-left"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSkills([])}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Button
              key={skill}
              variant="secondary"
              size="sm"
              onClick={() => handleSkillToggle(skill)}
              className="text-xs"
            >
              {skill} ×
            </Button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Projects Found"
          description={
            searchTerm || selectedSkills.length > 0 || statusFilter
              ? "Try adjusting your filters to see more projects."
              : "Be the first to share your project with the community!"
          }
        />
      )}

      {/* Stats */}
      {projects && projects.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}