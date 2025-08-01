import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { Tables } from '@/types/db-types';

export interface MentorProfile extends Tables<'mentors'> {
  user: {
    id: string;
    display_name: string | null;
    email: string;
    avatar_path: string | null;
  };
  college: {
    name: string;
  } | null;
  availability?: Array<{
    day_of_week: number;
    time_slots: string[];
  }>;
  feedback?: Array<{
    id: string;
    feedback: string | null;
    rating: number | null;
    student: {
      display_name: string | null;
    };
  }>;
  averageRating?: number;
  totalSessions?: number;
}

export function useMentors() {
  const { user: currentUser } = useUser();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('name');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('mentors')
        .select(`
          *,
          user:users!mentors_user_id_fkey (
            id,
            display_name,
            email,
            avatar_path
          ),
          college:colleges!mentors_college_id_fkey (
            name
          )
        `)
        .eq('is_active', true);

      // Apply role-based filtering
      if (currentUser?.role !== 'platform_admin') {
        // Students, faculty, and mentors see only mentors from their college
        if (currentUser?.college_id) {
          query = query.eq('college_id', currentUser.college_id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching mentors:', error);
        toast.error('Failed to load mentors');
        return;
      }

      // Fetch additional data for each mentor
      const mentorsWithDetails = await Promise.all(
        (data || []).map(async (mentor) => {
          // Fetch availability
          const { data: availability } = await supabase
            .from('mentor_availability')
            .select('day_of_week, time_slots')
            .eq('mentor_id', mentor.user_id);

          // Fetch feedback and calculate average rating
          const { data: sessions } = await supabase
            .from('mentorship_sessions')
            .select(`
              id,
              feedback,
              rating,
              student:students!mentorship_sessions_student_id_fkey (
                user:users!students_user_id_fkey (
                  display_name
                )
              )
            `)
            .eq('mentor_id', mentor.user_id)
            .eq('status', 'completed')
            .not('feedback', 'is', null);

          const feedback = sessions?.map(session => ({
            id: session.id,
            feedback: session.feedback,
            rating: session.rating,
            student: {
              display_name: session.student?.user?.display_name || 'Anonymous'
            }
          })) || [];

          const ratings = sessions?.filter(s => s.rating).map(s => s.rating!) || [];
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;

          // Get total sessions count
          const { count: totalSessions } = await supabase
            .from('mentorship_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('mentor_id', mentor.user_id);

          return {
            ...mentor,
            availability: availability || [],
            feedback,
            averageRating,
            totalSessions: totalSessions || 0
          };
        })
      );

      setMentors(mentorsWithDetails);
    } catch (error) {
      console.error('Error in fetchMentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    if (currentUser?.role === 'platform_admin') {
      const { data } = await supabase
        .from('colleges')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      setColleges(data || []);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMentors();
      fetchColleges();
    }
  }, [currentUser]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...mentors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mentor => 
        mentor.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // College filter (platform admin only)
    if (selectedCollege !== 'all' && currentUser?.role === 'platform_admin') {
      filtered = filtered.filter(mentor => mentor.college_id === selectedCollege);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return (a.user?.display_name || '').localeCompare(b.user?.display_name || '');
    });

    setFilteredMentors(filtered);
  }, [mentors, searchTerm, sortBy, selectedCollege, currentUser?.role]);

  return {
    mentors: filteredMentors,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedCollege,
    setSelectedCollege,
    colleges,
    refetch: fetchMentors
  };
}