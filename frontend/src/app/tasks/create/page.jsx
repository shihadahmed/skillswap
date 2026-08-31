import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import PostTaskForm from '@/components/dashboard/PostTaskForm';

export default function CreateTaskPage() {
  return (
    <ProtectedRoute roles={['client']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Post a Task
            </h1>
            <p className="text-muted mt-1">
              Describe the work you need done and set a budget.
            </p>
          </header>
          <div className="mt-8">
            <PostTaskForm />
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
