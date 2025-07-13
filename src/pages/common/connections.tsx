
import React from 'react';
import { ConnectionsTabs } from '@/components/connections/ConnectionsTabs';

export default function Connections() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground">
          Connect with fellow students, faculty, and mentors in your college network.
        </p>
      </div>

      <ConnectionsTabs />
    </div>
  );
}
