import { supabase } from '../lib/supabase';
import { Post, MediaType, Privacy } from '../types/post';

export const createPost = async (content: string, privacy: Privacy, userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      privacy,
      user_id: userId,
    })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
};

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(id, username),
      comments(
        id,
        content,
        created_at,
        profile:profiles!comments_user_id_fkey(id, username)
      ),
      likes(user_id)
    `)
    .eq('privacy', 'public')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(id, username),
      comments(
        id,
        content,
        created_at,
        profile:profiles!comments_user_id_fkey(id, username)
      ),
      likes(user_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function likePost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: user.id
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function unlikePost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function addComment(postId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    })
    .select(`
      *,
      profile:profiles!comments_user_id_fkey(id, username)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function likeComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comment_likes')
    .insert({
      comment_id: commentId,
      user_id: user.id
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function unlikeComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function replyToComment(commentId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comment_replies')
    .insert({
      parent_comment_id: commentId,
      user_id: user.id,
      content
    })
    .select(`
      *,
      user:profiles(id, username)
    `)
    .single();

  if (error) throw error;
  return data;
} 