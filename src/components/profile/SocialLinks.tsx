import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Linkedin, Globe, FileText } from 'lucide-react';
import { StudentProfile } from '@/hooks/useStudentProfile';

interface SocialLinksProps {
  profile: StudentProfile;
}

export function SocialLinks({ profile }: SocialLinksProps) {
  const hasAnyLinks = profile.github_url || profile.linkedin_url || profile.portfolio_url || profile.resume_link;

  if (!hasAnyLinks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Links & Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No links added yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links & Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.resume_link && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={profile.resume_link} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              View Resume
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}

        {profile.github_url && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              GitHub Profile
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}

        {profile.linkedin_url && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn Profile
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}

        {profile.portfolio_url && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              Portfolio Website
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}