"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { invitations } from "@/lib/supabase/invitations";
import { Mail, Check, X } from "lucide-react";

interface Invitation {
  id: string;
  group_id: string;
  invited_email: string;
  created_at: string;
}

export function PendingInvitations() {
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    try {
      const { data, error } = await invitations.getMyInvitations();
      if (!error && data) {
        setInvites(data);
      }
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (invitationId: string) => {
    try {
      const { error } = await invitations.accept(invitationId);
      if (error) throw error;
      alert("Vous avez rejoint le groupe ! 🎉");
      window.location.reload();
    } catch (err) {
      alert("Erreur lors de l'acceptation de l'invitation");
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      const { error } = await invitations.reject(invitationId);
      if (error) throw error;
      await loadInvitations();
    } catch (err) {
      console.error("Erreur refus:", err);
      alert("Erreur lors du refus de l'invitation");
    }
  };

  if (loading) return null;
  if (invites.length === 0) return null;

  return (
    <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {invites.length === 1
              ? "Vous avez une invitation en attente !"
              : `Vous avez ${invites.length} invitations en attente !`}
          </h3>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invitation à rejoindre un groupe
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reçue le{" "}
                    {new Date(invite.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAccept(invite.id)}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Accepter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(invite.id)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
