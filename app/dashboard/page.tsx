"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useUserProfile } from "@/hooks/useUserProfile";
import { WeekCalendar } from "@/components/week-calendar";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { PendingInvitations } from "@/components/pending-invitations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { invitations } from "@/lib/supabase/invitations";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { groups, loading: groupsLoading, createGroup } = useGroups();
  const { appleRemindersLink } = useUserProfile();
  const [mounted, setMounted] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router, mounted]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleCreateGroup = async () => {
    const name = prompt("Nom du groupe (famille, colocation...):");
    if (name) {
      await createGroup(name);
    }
  };

  const handleRedirectionRemindersApple = () => {
    if (appleRemindersLink) {
      window.location.href = appleRemindersLink;
    } else {
      alert("Lien Apple Reminders non configuré");
    }
  };

  const handleInviteMember = async (email: string) => {
    if (!selectedGroupId) return;

    const { error } = await invitations.create(selectedGroupId, email);
    if (error) {
      throw new Error(error.message);
    }
    alert(
      "Invitation envoyée ! La personne pourra rejoindre le groupe après avoir créé un compte.",
    );
  };

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Axelle à Table</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Invitations en attente */}
        <PendingInvitations />

        {/* Groups Section */}
        {groupsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Chargement des groupes...</p>
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center mb-8">
            <h2 className="text-xl font-semibold mb-4">Aucun groupe créé</h2>
            <p className="text-muted-foreground mb-4">
              Créez votre premier groupe pour commencer à planifier vos repas
            </p>
            <Button onClick={handleCreateGroup}>Créer un groupe</Button>
          </Card>
        ) : (
          <>
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 items-center flex-wrap">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroupId === group.id ? "default" : "outline"}
                  onClick={() => setSelectedGroupId(group.id)}
                  className="whitespace-nowrap"
                >
                  {group.name}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={handleCreateGroup}
                className="whitespace-nowrap"
              >
                + Nouveau groupe
              </Button>
              {selectedGroupId && (
                <InviteMemberDialog
                  groupId={selectedGroupId}
                  onInvite={handleInviteMember}
                />
              )}
              {appleRemindersLink && (
                <Button
                  variant="outline"
                  onClick={handleRedirectionRemindersApple}
                  className="whitespace-nowrap"
                >
                  → Liste de course
                </Button>
              )}
            </div>

            {/* Calendar */}
            {selectedGroupId && <WeekCalendar groupId={selectedGroupId} />}
          </>
        )}
      </div>
    </div>
  );
}
