import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { auth } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
  };
}
