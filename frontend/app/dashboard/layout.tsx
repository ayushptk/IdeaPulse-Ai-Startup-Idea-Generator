import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { SidebarProvider } from '@/hooks/useSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#09090b] text-slate-200 flex selection:bg-indigo-500/30">
        <Sidebar />
        <div className="flex-1 md:ml-72 flex flex-col min-h-screen min-w-0">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden min-w-0">
            <div className="max-w-[1600px] mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
