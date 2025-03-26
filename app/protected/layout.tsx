import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const { data: { user }} = await (await supabase).auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.user_metadata?.role !== 'admin') {
    console.log('Access Denied: User is not admin');
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}