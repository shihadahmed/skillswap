import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import ClientTasks from '@/components/dashboard/ClientTasks';

export default function ClientMyTasksPage() {
  return (
    <ProtectedRoute roles={['client']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              My Tasks
            </h1>
            <p className="text-muted mt-1">
              All tasks you&apos;ve posted, with proposals and payments.
            </p>
          </header>
          <div className="mt-8">
            <ClientTasks />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
