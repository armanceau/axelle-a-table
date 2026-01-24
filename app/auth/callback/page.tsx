"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.search,
      );

      if (error) {
        router.push("/login?error=auth_failed");
      } else {
        router.push("/dashboard");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">
          Authentification en cours...
        </p>
      </div>
    </div>
  );
}
