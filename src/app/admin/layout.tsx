import type { Metadata } from "next";
import { AdminStoreProvider } from "@/lib/admin/store";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s · Panel Don Pedro",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
