import { supabase } from '../lib/supabase';

export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      follower:profiles!followers_follower_id_fkey(
        id,
        username
      )
    `)
    .eq('following_id', userId);

  if (error) throw error;
  return data || [];
}

export async function followUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .insert({
      follower_id: user.id,
      following_id: userId
    });

  if (error) throw error;
}

export async function unfollowUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId);

  if (error) throw error;
} 