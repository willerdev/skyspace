import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

export default function ChatList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            participants:conversation_participants!inner(
              profiles!inner(
                username,
                avatar_url
              )
            ),
            messages(
              content,
              created_at
            )
          `)
          .eq('conversation_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        
        // Transform data to match ChatPreview interface
        const transformedData = data?.map(chat => ({
          id: chat.id,
          participants: chat.participants.map((p: any) => ({
            username: p.profiles?.username || '',
            avatar_url: p.profiles?.avatar_url
          })),
          lastMessage: chat.messages?.[0] || null
        })) || [];

        setChats(transformedData);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {chats.map(chat => (
        <button
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3"
        >
          <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {chat.participants[0]?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">
                {chat.participants[0]?.username}
              </p>
              {chat.lastMessage && (
                <p className="text-xs text-gray-500">
                  {new Date(chat.lastMessage.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {chat.lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage.content}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
} 