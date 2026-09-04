import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">{children}</div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
