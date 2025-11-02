import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export const useSessionTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);

      // Get page title
      const pageTitle = document.title;

      try {
        // Check if session exists
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .eq('page_url', location.pathname)
          .maybeSingle();

        if (existingSession) {
          // Update existing session
          await supabase
            .from('user_sessions')
            .update({
              last_activity: new Date().toISOString(),
              is_online: true,
              page_title: pageTitle
            })
            .eq('id', existingSession.id);
        } else {
          // Create new session entry
          await supabase
            .from('user_sessions')
            .insert({
              user_id: user.id,
              session_id: sessionId,
              page_url: location.pathname,
              page_title: pageTitle,
              is_online: true,
              last_activity: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error tracking session:', error);
      }
    };

    trackSession();

    // Update activity every 30 seconds
    const interval = setInterval(trackSession, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);
};
