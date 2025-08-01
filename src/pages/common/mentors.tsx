import React, { useState } from 'react';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMentors } from '@/features/mentorship/hooks/useMentors';
import { MentorCard } from '@/features/mentorship/MentorCard';
import { MentorProfileModal } from '@/features/mentorship/MentorProfileModal';
import { BookSessionModal } from '@/features/mentorship/BookSessionModal';
import { MentorProfile } from '@/features/mentorship/hooks/useMentors';
import { useUser } from '@/hooks/useUser';

export default function MentorsPage() {
  const { user: currentUser } = useUser();
  const {
    mentors,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedCollege,
    setSelectedCollege,
    colleges,
    refetch
  } = useMentors();

  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleViewProfile = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setProfileModalOpen(true);
  };

  const handleBookSession = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Users className="h-8 w-8 mr-3 text-primary" />
                Mentors
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with experienced mentors to guide your academic and professional journey
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search mentors by name, email, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={(value: 'name' | 'rating') => setSortBy(value)}>
              <SelectTrigger>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
              </SelectContent>
            </Select>

            {currentUser?.role === 'platform_admin' && (
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="All Colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results */}
        {mentors.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No mentors found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCollege !== 'all'
                  ? 'Try adjusting your search criteria to find mentors.'
                  : 'There are no active mentors available at the moment.'}
              </p>
              {(searchTerm || selectedCollege !== 'all') && (
                <div className="flex justify-center space-x-3">
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                  {selectedCollege !== 'all' && (
                    <Button variant="outline" onClick={() => setSelectedCollege('all')}>
                      Show All Colleges
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {mentors.length} mentor{mentors.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.user_id}
                  mentor={mentor}
                  onViewProfile={handleViewProfile}
                  onBookSession={handleBookSession}
                  currentUserRole={currentUser?.role || null}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <MentorProfileModal
        mentor={selectedMentor}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onBookSession={handleBookSession}
      />

      <BookSessionModal
        mentor={selectedMentor}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}