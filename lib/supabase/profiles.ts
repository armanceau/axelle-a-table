import { supabase } from "./client";
import { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profiles = {
  async getCurrent() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("Non authentifié") };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { data, error };
  },

  async getById(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  async update(updates: ProfileUpdate) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    return { data, error };
  },

  async uploadAvatar(file: File) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) return { data: null, error: uploadError };

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { data, error } = await this.update({ avatar_url: publicUrl });

    return { data, error };
  },
};
