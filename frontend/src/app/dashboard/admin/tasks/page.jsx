import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminTaskManagement from '@/components/dashboard/AdminTaskManagement';

export default function AdminTasksPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <AdminTaskManagement />
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
