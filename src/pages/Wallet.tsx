import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoints = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('points_balance')
          .select('points')
          .eq('user_id', user.id)
          .single();
          
        setPoints(data?.points || 0);
      } catch (error) {
        console.error('Error loading points:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPoints();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">My Wallet</h1>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4">
            <h2 className="text-lg font-medium mb-2">Points Balance</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-sky-500">{points} points</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 