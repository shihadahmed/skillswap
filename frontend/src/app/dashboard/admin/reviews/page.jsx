import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminReviews from '@/components/dashboard/AdminReviews';

export default function AdminReviewsPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <AdminReviews />
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
