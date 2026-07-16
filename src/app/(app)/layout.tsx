import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-[220px] shrink-0 border-r">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-semibold">StockResto</span>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <Header userEmail={user.email ?? ""} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
