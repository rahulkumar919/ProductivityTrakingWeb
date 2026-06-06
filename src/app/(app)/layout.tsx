import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="px-4 py-6 lg:ml-72 lg:px-8">
        {children}
      </main>
    </div>
  );
}
