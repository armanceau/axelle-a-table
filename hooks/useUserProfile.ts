import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [appleRemindersLink, setAppleRemindersLink] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(true);
      return;
    }

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("apple_reminders_link")
        .eq("id", user.id)
        .single();

      setAppleRemindersLink(profile?.apple_reminders_link ?? null);
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading]);

  return {
    appleRemindersLink,
    loading,
  };
}
