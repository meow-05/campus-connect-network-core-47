import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Linkedin, Globe, FileText } from 'lucide-react';
import { StudentProfile } from '@/hooks/useStudentProfile';
import { MentorProfile } from '@/hooks/useMentorProfile';

interface SocialLinksProps {
  profile: StudentProfile | MentorProfile;
  type?: 'student' | 'mentor';
}

export function SocialLinks({ profile, type = 'student' }: SocialLinksProps) {
  const hasResumeOrPortfolio = 'resume_link' in profile && (profile.resume_link || profile.portfolio_url);
  const hasAnyLinks = profile.github_url || profile.linkedin_url || hasResumeOrPortfolio;

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
        {'resume_link' in profile && profile.resume_link && (
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

        {'portfolio_url' in profile && profile.portfolio_url && (
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