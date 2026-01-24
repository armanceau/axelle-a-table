import { supabase } from "./client";
import { Database } from "@/types/database";

type Invitation = Database["public"]["Tables"]["group_invitations"]["Row"];
type InvitationInsert =
  Database["public"]["Tables"]["group_invitations"]["Insert"];

export const invitations = {
  async create(groupId: string, email: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("group_invitations")
      .insert({
        group_id: groupId,
        invited_by: user.id,
        invited_email: email.toLowerCase(),
      })
      .select()
      .single();

    return { data, error };
  },

  async getByGroup(groupId: string) {
    const { data, error } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getMyInvitations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) return { data: [], error: null };

    const { data, error } = await supabase
      .from("group_invitations")
      .select("*")
      .eq("invited_email", user.email.toLowerCase())
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async accept(invitationId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    try {
      const { data: invitation, error: invError } = await supabase
        .from("group_invitations")
        .select("group_id, invited_email, status")
        .eq("id", invitationId)
        .single();

      if (invError || !invitation) {
        console.error("❌ Invitation not found:", invError);
        throw invError || new Error("Invitation non trouvée");
      }

      if (
        invitation.invited_email?.toLowerCase() !== user.email?.toLowerCase()
      ) {
        console.error("❌ Email mismatch");
        throw new Error("Cette invitation ne vous appartient pas");
      }

      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "accept_group_invitation",
        {
          invitation_id: invitationId,
          user_id: user.id,
        },
      );

      if (rpcError) {
        console.error("❌ RPC error:", rpcError);
        throw rpcError;
      }

      const { error: invUpdateError } = await supabase
        .from("group_invitations")
        .update({ status: "accepted", invited_user_id: user.id })
        .eq("id", invitationId);

      if (invUpdateError) {
        console.error("❌ Invitation update error:", invUpdateError);
        throw invUpdateError;
      }

      return { data: { success: true }, error: null };
    } catch (err) {
      console.error("❌ Erreur acceptation:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },

  async reject(invitationId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    try {
      // Vérifier que l'invitation existe et appartient à l'utilisateur
      const { data: invitation, error: invError } = await supabase
        .from("group_invitations")
        .select("invited_email, status")
        .eq("id", invitationId)
        .single();

      if (invError || !invitation) {
        throw invError || new Error("Invitation non trouvée");
      }

      if (
        invitation.invited_email?.toLowerCase() !== user.email?.toLowerCase()
      ) {
        throw new Error("Cette invitation ne vous appartient pas");
      }

      const { error } = await supabase
        .from("group_invitations")
        .update({ status: "rejected" })
        .eq("id", invitationId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },

  async delete(invitationId: string) {
    const { error } = await supabase
      .from("group_invitations")
      .delete()
      .eq("id", invitationId);

    return { error };
  },
};
