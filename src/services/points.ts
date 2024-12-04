import { supabase } from '../lib/supabase';

export async function givePoints(postId: string, amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase.rpc('give_points', {
    post_id: postId,
    amount: amount
  });

  if (error) throw error;
} 