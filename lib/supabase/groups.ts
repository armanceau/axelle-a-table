import { supabase } from "./client";
import { Database } from "@/types/database";

type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];

export const groups = {
  async getUserGroups() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .contains("member_ids", [user.id])
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async create(name: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        created_by: user.id,
        member_ids: [user.id],
      })
      .select()
      .single();

    if (groupError) {
      console.error("Erreur création groupe:", groupError);
      return { data: null, error: groupError };
    }

    if (!group) {
      console.error("Groupe non créé");
      return { data: null, error: new Error("Le groupe n'a pas pu être créé") };
    }

    return { data: group, error: null };
  },

  async getById(groupId: string) {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    return { data, error };
  },

  async update(groupId: string, name: string) {
    const { data, error } = await supabase
      .from("groups")
      .update({ name })
      .eq("id", groupId)
      .select()
      .single();

    return { data, error };
  },

  async delete(groupId: string) {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    return { error };
  },

  async addMember(groupId: string, userId: string) {
    const { data: group, error: getError } = await supabase
      .from("groups")
      .select("member_ids")
      .eq("id", groupId)
      .single();

    if (getError || !group) return { error: getError };

    const updatedMemberIds = [...new Set([...group.member_ids, userId])];

    const { error } = await supabase
      .from("groups")
      .update({ member_ids: updatedMemberIds })
      .eq("id", groupId);

    return { error };
  },

  async removeMember(groupId: string, userId: string) {
    const { data: group, error: getError } = await supabase
      .from("groups")
      .select("member_ids")
      .eq("id", groupId)
      .single();

    if (getError || !group) return { error: getError };

    const updatedMemberIds = group.member_ids.filter((id) => id !== userId);

    const { error } = await supabase
      .from("groups")
      .update({ member_ids: updatedMemberIds })
      .eq("id", groupId);

    return { error };
  },

  async leave(groupId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    return this.removeMember(groupId, user.id);
  },
};
