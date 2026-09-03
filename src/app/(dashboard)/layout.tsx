import { getCurrentUser } from "@/lib/dal";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar userName={user?.name ?? ""} />
      <main className="min-w-0 flex-1 px-4 py-6 md:ml-60 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
