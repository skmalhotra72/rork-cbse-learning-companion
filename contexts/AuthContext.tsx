import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import type { StudentProfileResponse, ParentProfileResponse, UserRole } from '../backend/types/auth';

type UserProfile = StudentProfileResponse | ParentProfileResponse | null;

interface AuthState {
  session: Session | null;
  profile: UserProfile;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const STORAGE_KEY = '@auth_session';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    profile: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const sessionQuery = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      console.log('[Auth] Loading session from storage...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('[Auth] Session found, user:', session.user.id);
        return session;
      }
      
      console.log('[Auth] No active session');
      return null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const profileQuery = useQuery({
    queryKey: ['auth-profile', sessionQuery.data?.user?.id, sessionQuery.data?.user],
    queryFn: async () => {
      if (!sessionQuery.data?.user) {
        return null;
      }

      console.log('[Auth] Fetching user profile...');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionQuery.data.user.id)
        .single();

      if (userError || !userData) {
        console.error('[Auth] Error fetching user role:', userError);
        return null;
      }

      const role = userData.role as UserRole;

      if (role === 'student') {
        const { data: studentProfile, error: profileError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', sessionQuery.data.user.id)
          .single();

        if (profileError || !studentProfile) {
          console.error('[Auth] Error fetching student profile:', profileError);
          return null;
        }

        return {
          role,
          profile: {
            id: studentProfile.id,
            userId: studentProfile.user_id,
            fullName: studentProfile.full_name,
            email: sessionQuery.data.user.email || '',
            grade: studentProfile.grade,
            board: studentProfile.board,
            schoolName: studentProfile.school_name || undefined,
            dateOfBirth: studentProfile.date_of_birth || undefined,
            avatarUrl: studentProfile.avatar_url || undefined,
            currentStreak: studentProfile.current_streak,
            totalPoints: studentProfile.total_points,
            level: studentProfile.level,
          },
        };
      } else if (role === 'parent') {
        const { data: parentProfile, error: profileError } = await supabase
          .from('parent_profiles')
          .select(`
            *,
            student_parent_links!student_parent_links_parent_id_fkey (
              student_id,
              relationship,
              is_primary,
              student_profiles!student_parent_links_student_id_fkey (
                id,
                full_name,
                grade
              )
            )
          `)
          .eq('user_id', sessionQuery.data.user.id)
          .single();

        if (profileError || !parentProfile) {
          console.error('[Auth] Error fetching parent profile:', profileError);
          return null;
        }

        const linkedStudents = (parentProfile.student_parent_links || []).map((link: {
          relationship: string;
          is_primary: boolean;
          student_profiles: {
            id: string;
            full_name: string;
            grade: number;
          };
        }) => ({
          id: link.student_profiles.id,
          fullName: link.student_profiles.full_name,
          grade: link.student_profiles.grade,
          relationship: link.relationship || undefined,
          isPrimary: link.is_primary,
        }));

        return {
          role,
          profile: {
            id: parentProfile.id,
            userId: parentProfile.user_id,
            fullName: parentProfile.full_name,
            email: sessionQuery.data.user.email || '',
            phoneNumber: parentProfile.phone_number || undefined,
            linkedStudents,
          },
        };
      }

      return null;
    },
    enabled: !!sessionQuery.data?.user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          queryClient.invalidateQueries({ queryKey: ['auth-session'] });
          queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
        } else if (event === 'SIGNED_OUT') {
          await AsyncStorage.removeItem(STORAGE_KEY);
          queryClient.invalidateQueries({ queryKey: ['auth-session'] });
          queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    const isLoading = sessionQuery.isLoading || (sessionQuery.data && profileQuery.isLoading);
    const session = sessionQuery.data || null;
    const profile = profileQuery.data?.profile || null;
    const role = profileQuery.data?.role || null;
    const isAuthenticated = !!(session && profile);

    setAuthState({
      session,
      profile,
      role,
      isLoading: !!isLoading,
      isAuthenticated,
    });
  }, [
    sessionQuery.isLoading,
    sessionQuery.data,
    profileQuery.isLoading,
    profileQuery.data,
  ]);

  const signOutMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Signing out...');
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
  });

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
  };

  return {
    ...authState,
    signOut: signOutMutation.mutate,
    refreshProfile,
  };
});
