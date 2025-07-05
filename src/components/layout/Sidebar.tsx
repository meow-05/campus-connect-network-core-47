
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
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
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
  const { role, user } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getNavLinks = () => {
    if (!role) return [];

    const baseLinks = [
      {
        label: 'Home',
        icon: Home,
        path: `/pages/${role}/dashboard`,
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
        path: `/pages/${role}/skill-verification`,
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
        path: `/pages/${role}/mentorship-sessions`,
        show: true,
      },
    ];

    // Role-specific links
    const roleSpecificLinks = [];

    // Students link - visible to faculty, mentors, and platform admins
    if (['faculty', 'mentor', 'platform_admin'].includes(role)) {
      roleSpecificLinks.push({
        label: 'Students',
        icon: Users,
        path: `/pages/${role}/students`,
        show: true,
      });
    }

    // Platform admin specific links
    if (role === 'platform_admin') {
      roleSpecificLinks.push(
        {
          label: 'Faculty',
          icon: Users,
          path: '/pages/platform_admin/faculty',
          show: true,
        },
        {
          label: 'Colleges',
          icon: Home,
          path: '/pages/platform_admin/colleges',
          show: true,
        }
      );
    }

    // Statistics - visible to platform admin and faculty
    if (['platform_admin', 'faculty'].includes(role)) {
      roleSpecificLinks.push({
        label: 'Statistics',
        icon: Award,
        path: `/pages/${role}/stats`,
        show: true,
      });
    }

    // Profile - visible to students, faculty, and mentors
    if (['student', 'faculty', 'mentor'].includes(role)) {
      roleSpecificLinks.push({
        label: 'Profile',
        icon: User,
        path: `/pages/${role}/profile`,
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
      collapsed ? "w-14" : "w-48"
    )}>
      {/* Toggle Button */}
      <div className="p-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center p-2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info (when expanded) */}
      {!collapsed && user && (
        <div className="p-3 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.display_name || 'User'}</p>
              <Badge variant="secondary" className="text-xs capitalize">
                {role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.path}
              variant={isActive(link.path) ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-3",
                isActive(link.path) && "bg-secondary text-secondary-foreground"
              )}
              asChild
            >
              <Link to={link.path}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="ml-3 truncate">{link.label}</span>}
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
              <Settings className="h-4 w-4" />
              {!collapsed && <span className="ml-3">More</span>}
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
