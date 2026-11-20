import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { cookies } from "next/headers";
import { getNavigationTree, getStoreSettings } from "@/lib/db/actions";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { id: string; email?: string } | null = null;
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } else {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("varnam_demo_role")?.value;
    if (demoRole === "customer" || demoRole === "admin") {
      user = { id: "demo-customer-id", email: "parent@varnam.luxury" };
    }
  }

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  const [navTree, storeSettings] = await Promise.all([
    getNavigationTree(),
    getStoreSettings(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Header
        initialNavTree={navTree}
        announcementText={storeSettings.announcement_bar_text || undefined}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
