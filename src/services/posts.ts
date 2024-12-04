import { supabase } from '../lib/supabase';
import type { Post, Comment, Like } from '../types/post';

export type Privacy = 'public' | 'private';

export async function addComment(postId: string, content: string): Promise<Comment> {
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
      users:profiles!comments_user_id_fkey(username)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function likePost(postId: string): Promise<Like> {
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

export async function unlikePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function replyToPost(commentId: string, content: string): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      parent_id: commentId,
      user_id: user.id,
      content
    })
    .select(`
      *,
      users:profiles!comments_user_id_fkey(username)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost(content: string, privacy: Privacy, userId: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      privacy,
      user_id: userId,
    })
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(username)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(username),
      comments(
        id,
        content,
        created_at,
        users:profiles!comments_user_id_fkey(username)
      ),
      likes(user_id)
    `)
    .eq('privacy', 'public')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles!posts_user_id_fkey(username),
      comments(
        id,
        content,
        created_at,
        users:profiles!comments_user_id_fkey(username)
      ),
      likes(user_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}