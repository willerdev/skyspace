import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:users(username),
      comments(
        id,
        content,
        created_at,
        users(id, username)
      ),
      likes(user_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function checkPrivateAccess(creatorId: string, subscriberId: string) {
  const { data, error } = await supabase
    .from('private_access')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('subscriber_id', subscriberId)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function createPrivateAccess(creatorId: string, subscriberId: string) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

  const { error } = await supabase
    .from('private_access')
    .insert({
      creator_id: creatorId,
      subscriber_id: subscriberId,
      expires_at: expiresAt.toISOString()
    });

  if (error) throw error;
} 