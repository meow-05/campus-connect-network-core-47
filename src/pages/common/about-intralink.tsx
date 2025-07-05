
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Award, Projects, Events } from 'lucide-react';

export default function AboutIntraLink() {
  const features = [
    {
      icon: Users,
      title: 'Connect & Collaborate',
      description: 'Build meaningful connections with peers, faculty, and industry mentors.',
    },
    {
      icon: Projects,
      title: 'Project Collaboration',
      description: 'Find team members, share projects, and showcase your work to the community.',
    },
    {
      icon: Award,
      title: 'Skill Verification',
      description: 'Get your skills verified by experienced mentors and build credibility.',
    },
    {
      icon: Events,
      title: 'Events & Workshops',
      description: 'Discover and participate in college events, workshops, and seminars.',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '2,500+' },
    { label: 'Projects', value: '450+' },
    { label: 'Mentors', value: '150+' },
    { label: 'Colleges', value: '25+' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About IntraLink</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connecting students, faculty, and mentors to build a thriving academic community
        </p>
        <Badge variant="secondary" className="text-sm">
          Version 2.1.0
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            IntraLink is designed to bridge the gap between students, faculty, and industry professionals. 
            Our platform facilitates meaningful connections, knowledge sharing, and collaborative learning 
            within the academic ecosystem. We believe that education is enhanced when communities come 
            together to support each other's growth and development.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>
            Discover what makes IntraLink the perfect platform for academic collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Technical Support</h4>
            <p className="text-sm text-muted-foreground">support@intralink.edu</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium">Academic Partnerships</h4>
            <p className="text-sm text-muted-foreground">partnerships@intralink.edu</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium">General Inquiries</h4>
            <p className="text-sm text-muted-foreground">info@intralink.edu</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>© 2024 IntraLink. Built with ❤️ for the academic community.</p>
      </div>
    </div>
  );
}
