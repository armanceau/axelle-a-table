import { useState, useEffect } from "react";
import { groups } from "@/lib/supabase";
import { Database } from "@/types/database";

type Group = Database["public"]["Tables"]["groups"]["Row"];

export function useGroups() {
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await groups.getUserGroups();
      if (error) throw error;
      setUserGroups(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async (name: string) => {
    const { data, error } = await groups.create(name);
    if (!error && data) {
      await fetchGroups();
    }
    return { data, error };
  };

  const updateGroup = async (groupId: string, name: string) => {
    const { data, error } = await groups.update(groupId, name);
    if (!error) {
      await fetchGroups();
    }
    return { data, error };
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await groups.delete(groupId);
    if (!error) {
      await fetchGroups();
    }
    return { error };
  };

  return {
    groups: userGroups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
