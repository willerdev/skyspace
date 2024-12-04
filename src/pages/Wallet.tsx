import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [money, setMoney] = useState<number>(0);
 //const [setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState<number>(1000);

  useEffect(() => {
    loadBalances();
  }, [user]);

  const loadBalances = async () => {
    if (!user) return;
    try {
      const [pointsData, moneyData] = await Promise.all([
        supabase
          .from('points_balance')
          .select('points')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('money_balance')
          .select('balance')
          .eq('user_id', user.id)
          .single()
      ]);
      
      setPoints(pointsData.data?.points || 0);
      setMoney(moneyData.data?.balance || 0);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
     // setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!user || converting) return;
    setConverting(true);
    
    try {
      const { data, error } = await supabase
        .rpc('convert_points_to_money', { points_to_convert: pointsToConvert });
      
      if (error) throw error;
      
      if (data.success) {
        await loadBalances();
        alert(`Successfully converted ${pointsToConvert} points to ${data.money_amount} Frw`);
      }
    } catch (error) {
      console.error('Error converting points:', error);
      alert('Failed to convert points');
    } finally {
      setConverting(false);
    }
  };

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
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">Points Balance</h2>
            <p className="text-3xl font-bold text-sky-500">{points} points</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-2">Money Balance</h2>
            <p className="text-3xl font-bold text-green-500">{money.toFixed(2)} Frw</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Convert Points to Money</h2>
            <p className="text-sm text-gray-500 mb-4">1000 points = 900 Frw</p>
            
            <input
              type="number"
              min="1000"
              step="1000"
              value={pointsToConvert}
              onChange={(e) => setPointsToConvert(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
            />
            
            <button
              onClick={handleConvert}
              disabled={converting || pointsToConvert > points}
              className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {converting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <span>Convert {pointsToConvert} points to {(pointsToConvert / 1000 * 900).toFixed(2)} Frw</span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 