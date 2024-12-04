import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ChatWindow from '../components/ChatWindow';

interface ChatPreview {
  id: string;
  participants: {
    username: string;
    avatar_url?: string;
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            participants:conversation_participants(
              user:profiles(username, avatar_url)
            ),
            lastMessage:messages(
              content,
              created_at
            )
          `)
          .eq('conversation_participants.user_id', user?.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setChats(data || []);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!userId) {
      loadChats();
    }
  }, [user, userId]);

  if (userId) {
    return <ChatWindow />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center mt-8 space-y-4">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-500">
                Visit profiles and click the message button to start a conversation
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3"
                >
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {chat.participants[0]?.user[0]?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {chat.participants[0]?.user[0]?.username}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500">
                          {new Date(chat.lastMessage[0].created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage[0].content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}