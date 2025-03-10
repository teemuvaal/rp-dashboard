import { createClient } from '@/utils/supabase/server';
import EmbeddingDebugDashboard from '../embedding-debug-dashboard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Embedding Management - RP Dashboard',
  description: 'Manage and debug embedding processing for content in the RP Dashboard',
};

export default async function EmbeddingManagementPage() {
  const supabase = createClient();

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    // Redirect to login if not authenticated or error
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <h2 className="text-lg font-semibold">Authentication Required</h2>
          <p className="mt-2">You need to be logged in to access this page.</p>
          <a href="/login" className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }


  // Check if user is admin
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id);

  console.log('User Roles Query Result:', userRoles);
  console.log('Roles Error:', rolesError);

  // Try a broader query to see if the table has any records
  const { data: allRoles, error: allRolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(5);
    

  const isAdmin = userRoles && userRoles.length > 0 && userRoles[0].role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="mt-2">This page is only accessible to administrators.</p>
          <p className="mt-2 text-xs">(User ID: {user.id}, Role Query Result: {JSON.stringify(userRoles)})</p>
          <a href="/dashboard" className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold">Embedding Management</h1>
        <EmbeddingDebugDashboard />
      </div>
    </div>
  );
} 