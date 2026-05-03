import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export type PlanType = 'basic' | 'premium';

export interface Profile {
  id: string;
  email: string;
  plan_type: PlanType;
  tokens: number;
  full_name?: string;
  birthday?: string;
  gender?: string;
  plan_expires_at?: string;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      } else if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }
      return null;
    } catch (err) {
      console.error('Exception fetching profile', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // 1. Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) console.error('Get session error:', error.message);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            const fetchedProfile = await fetchProfile(initialSession.user.id);
            
            // Check for expiration
            if (fetchedProfile && fetchedProfile.plan_type === 'premium' && fetchedProfile.plan_expires_at) {
              const expires = new Date(fetchedProfile.plan_expires_at);
              if (expires < new Date()) {
                console.log('Premium plan expired. Reverting to basic.');
                await supabase
                  .from('profiles')
                  .update({ plan_type: 'basic', plan_expires_at: null })
                  .eq('id', fetchedProfile.id);
                await fetchProfile(fetchedProfile.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        // If we have a new session, we might want to show loading while we fetch profile
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setLoading(true);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        try {
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Error in onAuthStateChange handler:', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
