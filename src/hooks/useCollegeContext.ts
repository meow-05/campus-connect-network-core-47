
import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useUser } from './useUser';

interface CollegeContextData {
  college: {
    id: string;
    name: string;
    domain: string;
    description?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useCollegeContext(): CollegeContextData {
  const [data, setData] = useState<CollegeContextData>({
    college: null,
    loading: true,
    error: null,
  });
  const supabase = useSupabase();
  const { collegeId } = useUser();

  useEffect(() => {
    async function fetchCollegeData() {
      if (!collegeId) {
        setData({ college: null, loading: false, error: null });
        return;
      }

      try {
        const { data: college, error } = await supabase
          .from('colleges')
          .select('id, name, domain, description')
          .eq('id', collegeId)
          .single();

        if (error) {
          console.error('Error fetching college:', error);
          setData({ college: null, loading: false, error: error.message });
        } else {
          setData({ college, loading: false, error: null });
        }
      } catch (error) {
        console.error('Error fetching college:', error);
        setData({ college: null, loading: false, error: 'Failed to fetch college data' });
      }
    }

    fetchCollegeData();
  }, [collegeId, supabase]);

  return data;
}
