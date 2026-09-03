import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import ClientTasks from '@/components/dashboard/ClientTasks';
import PostTaskForm from '@/components/dashboard/PostTaskForm';
import WalletCard from '@/components/dashboard/WalletCard';
import VerificationBanner from '@/lib/approval';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute roles={['client']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
          <VerificationBanner />
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Client Dashboard
            </h1>
            <p className="text-muted mt-1">
              Manage your tasks and review incoming proposals.
            </p>
          </header>

          <div className="mt-8">
            <WalletCard />
          </div>

          <div className="mt-8">
            <PostTaskForm />
          </div>

          <div className="mt-10">
            <ClientTasks />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
