import { useState } from 'react';
import { CreditCard, Loader, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function PointsTopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const { user } = useAuth();

  const pointPackages = [
    { points: 1000, price: '100 Frw' },
    { points: 5000, price: '500 Frw' },
    { points: 10000, price: '1000 Frw' },
    { points: 50000, price: '5000 Frw' },
  ];

  const handleTopup = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.rpc('add_points', {
        amount: selectedAmount
      });
      
      if (error) throw error;
      
      // Refresh points balance
      const { data } = await supabase
        .from('points_balance')
        .select('points')
        .eq('user_id', user.id)
        .single();
        
      setUserPoints(data?.points || 0);
      alert('Points added successfully!');
    } catch (error) {
      console.error('Error adding points:', error);
      alert('Failed to add points');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg p-6 h-[80vh] overflow-y-auto">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full" />
        
        <div className="mt-6">
          <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Gift className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Top Up Points
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  Current Balance: {userPoints} points
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {pointPackages.map(({ points, price }) => (
                  <button
                    key={points}
                    onClick={() => setSelectedAmount(points)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedAmount === points
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {points.toLocaleString()} Points
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {price}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleTopup}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Purchase Points</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 