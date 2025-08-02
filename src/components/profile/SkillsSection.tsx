import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { StudentProfile } from '@/hooks/useStudentProfile';

interface SkillsSectionProps {
  profile: StudentProfile;
}

export function SkillsSection({ profile }: SkillsSectionProps) {
  const verifiedSkillNames = new Set(profile.verified_skills.map(skill => skill.skill_name));
  const allSkills = profile.skills || [];

  if (allSkills.length === 0 && profile.verified_skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No skills added yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Verified Skills */}
          {profile.verified_skills.map((skill, index) => (
            <Badge key={`verified-${index}`} variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              {skill.skill_name}
            </Badge>
          ))}
          
          {/* Unverified Skills */}
          {allSkills
            .filter(skill => !verifiedSkillNames.has(skill))
            .map((skill, index) => (
              <Badge key={`unverified-${index}`} variant="outline" className="text-muted-foreground">
                {skill}
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}