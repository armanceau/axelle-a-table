import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useUserProfilById(userIds: string[]) {
    const [profilesList, setProfilesList] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const idsKey = useMemo(() => userIds.join(","), [userIds]);

    const fetchProfiles = async () => {
        if (!userIds.length) {
            setProfilesList([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .in("id", userIds);

            if (error) throw error;

            setProfilesList(data ?? []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [idsKey]);

    return {
        profiles: profilesList,
        loading,
        error,
        refetch: fetchProfiles,
    };
}
