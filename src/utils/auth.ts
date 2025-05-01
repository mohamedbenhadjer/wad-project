import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the complete sign-out process
 * @returns Promise resolving to true if logout was successful
 */
export async function signOut(): Promise<boolean> {
  try {
    // Simple approach first - this should work in most cases
    const { error } = await supabase.auth.signOut();
    if (!error) {
      return true;
    }
    
    console.log('Standard logout returned error, trying alternative approach:', error);
    
    // Clear all browser storage - this is a more aggressive approach
    window.localStorage.clear();
    window.sessionStorage.clear();
    
    // We'll let the calling component handle the redirect
    return true;
  } catch (error) {
    console.error("Exception during logout:", error);
    
    // If all else fails, clear storage
    window.localStorage.clear();
    window.sessionStorage.clear();
    
    return true;
  }
} 