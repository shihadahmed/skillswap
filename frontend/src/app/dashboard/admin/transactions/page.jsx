import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminTransactions from '@/components/dashboard/AdminTransactions';

export default function AdminTransactionsPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <AdminTransactions />
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
