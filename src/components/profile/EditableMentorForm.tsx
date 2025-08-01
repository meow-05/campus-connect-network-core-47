import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { MentorProfile } from '@/hooks/useMentorProfile';

interface EditableMentorFormProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MentorProfile;
  onSave: (updates: {
    bio?: string;
    expertise?: string[];
    github_url?: string;
    linkedin_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function EditableMentorForm({ isOpen, onClose, profile, onSave }: EditableMentorFormProps) {
  const [bio, setBio] = useState(profile.bio || '');
  const [expertise, setExpertise] = useState<string[]>(profile.expertise || []);
  const [githubUrl, setGithubUrl] = useState(profile.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !expertise.includes(newSkill.trim())) {
      setExpertise([...expertise, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExpertise(expertise.filter(skill => skill !== skillToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      bio: bio.trim() || null,
      expertise,
      github_url: githubUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
    };

    const result = await onSave(updates);
    setSaving(false);
    
    if (result.success) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mentor Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          {/* Expertise Section */}
          <div className="space-y-2">
            <Label>Areas of Expertise</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Python, UI/UX)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/yourusername"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourusername"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}