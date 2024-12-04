import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Security() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadLogs = async () => {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error) setLogs(data);
      setLoading(false);
    };

    loadLogs();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => navigate('/settings')} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Security</h1>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Password & Authentication</h2>
            <button
              onClick={() => {/* Add password change logic */}}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Change Password
            </button>
            <button
              onClick={() => {/* Add 2FA logic */}}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Two-Factor Authentication
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log: any) => (
                  <div key={log.id} className="text-sm">
                    <p className="font-medium">{log.event_type}</p>
                    <p className="text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 