import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminUserManagement from '@/components/dashboard/AdminUserManagement';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <AdminUserManagement />
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
