export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          created_by: string;
          updated_at: string;
          member_ids: string[];
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          member_ids?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          member_ids?: string[];
        };
        Relationships: [];
      };
      group_invitations: {
        Row: {
          id: string;
          group_id: string;
          invited_by: string;
          invited_email: string;
          invited_user_id: string | null;
          status: "pending" | "accepted" | "rejected" | "expired";
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          invited_by: string;
          invited_email: string;
          invited_user_id?: string | null;
          status?: "pending" | "accepted" | "rejected" | "expired";
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          invited_by?: string;
          invited_email?: string;
          invited_user_id?: string | null;
          status?: "pending" | "accepted" | "rejected" | "expired";
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          description: string | null;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          date: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          description?: string | null;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          date: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          title?: string;
          description?: string | null;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
          date?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          apple_reminders_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          apple_reminders_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          apple_reminders_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_group_invitation: {
        Args: { invitation_id: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
