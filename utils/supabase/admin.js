import { createClient } from '@/utils/supabase/server';

export async function checkIsAdmin(userId) {
    try {
        const supabase = createClient();
        
        const { data: userRole, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
        
        return userRole?.role === 'admin';
    } catch (error) {
        console.error('Error in checkIsAdmin:', error);
        return false;
    }
}

export async function getUserRole(userId) {
    try {
        const supabase = createClient();
        
        const { data: userRole, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
            
        if (error) {
            console.error('Error getting user role:', error);
            return null;
        }
        
        return userRole?.role || null;
    } catch (error) {
        console.error('Error in getUserRole:', error);
        return null;
    }
} 