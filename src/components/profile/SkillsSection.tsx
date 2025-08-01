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
          <Badge variant="secondary" className="ml-2">
            {profile.verified_skills.length} verified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verified Skills */}
        {profile.verified_skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.verified_skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {skill.skill_name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Unverified Skills */}
        {allSkills.some(skill => !verifiedSkillNames.has(skill)) && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
              <Circle className="h-4 w-4 mr-2" />
              Other Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {allSkills
                .filter(skill => !verifiedSkillNames.has(skill))
                .map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-muted-foreground">
                    {skill}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}