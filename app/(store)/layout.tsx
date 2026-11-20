import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion-provider";
import { getNavigationTree, getStoreSettings } from "@/lib/db/actions";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navTree, storeSettings] = await Promise.all([
    getNavigationTree(),
    getStoreSettings(),
  ]);

  return (
    <MotionProvider>
      <div className="flex flex-col min-h-screen bg-[#EFE6D5] text-[#261C17] font-sans selection:bg-[#C69214]/30 selection:text-[#261C17]">
        <Header
          initialNavTree={navTree}
          announcementText={storeSettings?.announcement_bar_text || undefined}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </div>
    </MotionProvider>
  );
}
