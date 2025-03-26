'use client';

import { Suspense, useEffect, useState } from 'react';
import FetchDog from "@/components/FetchDog";
import { supabase } from "@/utils/supabase/supabaseClient";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.user_metadata?.role === 'admin');
      setLoading(false);
    }
    checkAdminStatus();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {isAdmin ? 'Admin Dashboard' : 'Adopt a Dog'}
      </h1>
      
      {isAdmin && (
        <div className="w-full mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Dog</h2>
          <Suspense fallback={<div>Loading dog fetcher...</div>}>
            <FetchDog />
          </Suspense>
        </div>
      )}

      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4">
          {isAdmin ? 'Manage Dogs' : 'Available Dogs'}
        </h2>
        <Suspense fallback={<div>Loading dogs...</div>}>
          <FetchDog showAll />
        </Suspense>
      </div>
    </div>
  );
}