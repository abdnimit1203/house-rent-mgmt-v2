import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Sidebar />
      <main className="pl-64 flex flex-col min-h-screen">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
