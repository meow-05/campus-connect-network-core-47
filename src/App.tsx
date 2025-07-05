
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

// Auth pages
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/resetpassword";
import UnauthorizedPage from "./pages/common/unauthorized";

// Common pages
import ProjectsPage from "./pages/common/projects";
import EventsPage from "./pages/common/events";
import NoticesPage from "./pages/common/notices";
import MentorsPage from "./pages/common/mentors";
import ConnectionsPage from "./pages/common/connections";
import SettingsPage from "./pages/common/settings";
import ReportProblemPage from "./pages/common/report-a-problem";
import AboutPage from "./pages/common/about-intralink";

// Student pages
import StudentDashboard from "./pages/student/dashboard";
import StudentProfile from "./pages/student/profile";
import StudentSkillVerification from "./pages/student/skill-verification";
import StudentMentorshipSessions from "./pages/student/mentorship-sessions";

// Faculty pages
import FacultyDashboard from "./pages/faculty/dashboard";
import FacultyProfile from "./pages/faculty/profile";
import FacultySkillVerification from "./pages/faculty/skill-verification";
import FacultyMentorshipSessions from "./pages/faculty/mentorship-sessions";
import FacultyStudents from "./pages/faculty/students";
import FacultyStats from "./pages/faculty/stats";
import FacultyManagement from "./pages/faculty/faculty";

// Mentor pages
import MentorDashboard from "./pages/mentor/dashboard";
import MentorProfile from "./pages/mentor/Profile";
import MentorSkillVerification from "./pages/mentor/skill-verification";
import MentorMentorshipSessions from "./pages/mentor/mentorship-sessions";
import MentorStudents from "./pages/mentor/students";

// Platform Admin pages
import PlatformAdminDashboard from "./pages/platform-admin/dashboard";
import PlatformAdminStudents from "./pages/platform-admin/students";
import PlatformAdminFaculty from "./pages/platform-admin/faculty";
import PlatformAdminColleges from "./pages/platform-admin/colleges";
import PlatformAdminStats from "./pages/platform-admin/stats";
import PlatformAdminSkillVerification from "./pages/platform-admin/skill-verification";
import PlatformAdminMentorshipSessions from "./pages/platform-admin/mentorship-sessions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/auth/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignupPage />
              </ProtectedRoute>
            } />
            <Route path="/auth/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/auth/reset-password" element={
              <ProtectedRoute requireAuth={false}>
                <ResetPasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes with AppShell */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              {/* Default route */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Common pages */}
              <Route path="pages/common/projects" element={<ProjectsPage />} />
              <Route path="pages/common/events" element={<EventsPage />} />
              <Route path="pages/common/notices" element={<NoticesPage />} />
              <Route path="pages/common/mentors" element={<MentorsPage />} />
              <Route path="pages/common/connections" element={<ConnectionsPage />} />
              <Route path="pages/common/settings" element={<SettingsPage />} />
              <Route path="pages/common/report-a-problem" element={<ReportProblemPage />} />
              <Route path="pages/common/about-intralink" element={<AboutPage />} />

              {/* Student routes */}
              <Route path="pages/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="pages/student/profile" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              } />
              <Route path="pages/student/skill-verification" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSkillVerification />
                </ProtectedRoute>
              } />
              <Route path="pages/student/mentorship-sessions" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentMentorshipSessions />
                </ProtectedRoute>
              } />

              {/* Faculty routes */}
              <Route path="pages/faculty/dashboard" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/profile" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyProfile />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/skill-verification" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultySkillVerification />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/mentorship-sessions" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyMentorshipSessions />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/students" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyStudents />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/stats" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyStats />
                </ProtectedRoute>
              } />
              <Route path="pages/faculty/faculty" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyManagement />
                </ProtectedRoute>
              } />

              {/* Mentor routes */}
              <Route path="pages/mentor/dashboard" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorDashboard />
                </ProtectedRoute>
              } />
              <Route path="pages/mentor/profile" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorProfile />
                </ProtectedRoute>
              } />
              <Route path="pages/mentor/skill-verification" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorSkillVerification />
                </ProtectedRoute>
              } />
              <Route path="pages/mentor/mentorship-sessions" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorMentorshipSessions />
                </ProtectedRoute>
              } />
              <Route path="pages/mentor/students" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                  <MentorStudents />
                </ProtectedRoute>
              } />

              {/* Platform Admin routes */}
              <Route path="pages/platform-admin/dashboard" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/students" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminStudents />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/faculty" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminFaculty />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/colleges" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminColleges />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/stats" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminStats />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/skill-verification" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminSkillVerification />
                </ProtectedRoute>
              } />
              <Route path="pages/platform-admin/mentorship-sessions" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminMentorshipSessions />
                </ProtectedRoute>
              } />

              {/* Dashboard redirect based on role */}
              <Route path="dashboard" element={<Index />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
