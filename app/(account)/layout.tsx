import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
