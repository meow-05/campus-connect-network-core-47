
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderGit2, 
  UserPlus, 
  CalendarSearch, 
  Megaphone, 
  Award, 
  Users, 
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Bell,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { role } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getNavLinks = () => {
    const baseLinks = [
      {
        label: 'Home',
        icon: Home,
        path: role ? `/pages/${role}/dashboard` : '/dashboard',
        show: true,
      },
      {
        label: 'Projects',
        icon: FolderGit2,
        path: '/pages/common/projects',
        show: true,
      },
      {
        label: 'Connections',
        icon: UserPlus,
        path: '/pages/common/connections',
        show: true,
      },
      {
        label: 'Events',
        icon: CalendarSearch,
        path: '/pages/common/events',
        show: true,
      },
      {
        label: 'Notices',
        icon: Megaphone,
        path: '/pages/common/notices',
        show: true,
      },
      {
        label: 'Skill Verification',
        icon: Award,
        path: role ? `/pages/${role}/skill-verification` : '/skill-verification',
        show: true,
      },
      {
        label: 'Mentors',
        icon: Users,
        path: '/pages/common/mentors',
        show: true,
      },
      {
        label: 'Mentorship Sessions',
        icon: User,
        path: role ? `/pages/${role}/mentorship-sessions` : '/mentorship-sessions',
        show: true,
      },
    ];

    // Role-specific links
    const roleSpecificLinks = [];

    if (['faculty', 'mentor', 'platform_admin'].includes(role || '')) {
      roleSpecificLinks.push({
        label: 'Students',
        icon: Users,
        path: role ? `/pages/${role}/students` : '/students',
        show: true,
      });
    }

    if (role === 'platform_admin') {
      roleSpecificLinks.push(
        {
          label: 'Faculty',
          icon: Users,
          path: '/pages/platform-admin/faculty',
          show: true,
        },
        {
          label: 'Colleges',
          icon: Home,
          path: '/pages/platform-admin/colleges',
          show: true,
        }
      );
    }

    if (['platform_admin', 'faculty'].includes(role || '')) {
      roleSpecificLinks.push({
        label: 'Statistics',
        icon: Award,
        path: role ? `/pages/${role}/stats` : '/stats',
        show: true,
      });
    }

    if (['student', 'faculty', 'mentor'].includes(role || '')) {
      roleSpecificLinks.push({
        label: 'Profile',
        icon: User,
        path: role ? `/pages/${role}/profile` : '/profile',
        show: true,
      });
    }

    return [...baseLinks, ...roleSpecificLinks].filter(link => link.show);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const navLinks = getNavLinks();

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start"
        >
          <MoreHorizontal className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.path}
              variant={isActive(link.path) ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                isActive(link.path) && "bg-secondary text-secondary-foreground"
              )}
              asChild
            >
              <Link to={link.path}>
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{link.label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* More Menu */}
      <div className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <MoreHorizontal className="h-4 w-4" />
              {!collapsed && <span className="ml-2">More</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>More Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/pages/common/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pages/common/report-a-problem">
                <Bell className="mr-2 h-4 w-4" />
                Report a Problem
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pages/common/about-intralink">
                <Home className="mr-2 h-4 w-4" />
                About IntraLink
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
