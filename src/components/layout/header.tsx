"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Header({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <span className="text-sm text-muted-foreground">{userEmail}</span>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="size-4" />
        Cerrar sesión
      </Button>
    </header>
  );
}
