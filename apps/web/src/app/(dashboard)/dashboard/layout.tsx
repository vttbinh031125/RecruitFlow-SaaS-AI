import { WorkspaceProvider } from '@/features/dashboard/workspace';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
