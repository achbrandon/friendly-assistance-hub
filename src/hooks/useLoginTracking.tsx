import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createNotification } from '@/lib/notifications';

export function useLoginTracking() {
  useEffect(() => {
    const trackLogin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get device info
        const userAgent = navigator.userAgent;
        const device = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent) 
          ? 'Mobile Device' 
          : /Tablet/.test(userAgent) 
          ? 'Tablet' 
          : 'Desktop Computer';

        // Get location (approximate from timezone)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const location = timezone.split('/')[1]?.replace(/_/g, ' ') || 'Unknown';

        // Get IP address (approximate)
        let ipAddress = 'Unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (error) {
          console.error('Error fetching IP:', error);
        }

        // Check if this is a new device/location by comparing with last login
        const lastLoginKey = `last_login_${user.id}`;
        const lastLoginData = localStorage.getItem(lastLoginKey);
        
        const currentLoginData = JSON.stringify({ device, location, userAgent, ipAddress });
        
        if (lastLoginData !== currentLoginData) {
          const lastLogin = lastLoginData ? JSON.parse(lastLoginData) : null;
          
          // Determine if this is an unusual login
          const isNewDevice = lastLogin && lastLogin.userAgent !== userAgent;
          const isNewLocation = lastLogin && lastLogin.location !== location;
          const isNewIP = lastLogin && lastLogin.ipAddress !== ipAddress;
          
          if (isNewDevice || isNewLocation || isNewIP) {
            // Send security alert for unusual login
            await createNotification({
              userId: user.id,
              title: "Unusual Login Detected",
              message: `A login was detected from ${device} in ${location}${isNewIP ? ` (IP: ${ipAddress})` : ''}. If this wasn't you, please secure your account immediately.`,
              type: "warning"
            });
          }
          
          // Update last login data
          localStorage.setItem(lastLoginKey, currentLoginData);
        }
      } catch (error) {
        console.error('Error tracking login:', error);
      }
    };

    trackLogin();
  }, []);
}
