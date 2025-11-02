import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLiveMonitoring() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();

    // Set up realtime subscription
    const channel = supabase
      .channel('user-sessions-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    // Check for stale sessions every 10 seconds
    const interval = setInterval(() => {
      fetchSessions();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("last_activity", { ascending: false });

      if (error) throw error;

      // Mark sessions as offline if inactive for more than 2 minutes
      const now = new Date();
      const sessionsWithStatus = (data || []).map(session => ({
        ...session,
        is_online: (now.getTime() - new Date(session.last_activity).getTime()) < 120000
      }));

      setSessions(sessionsWithStatus);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    if (!acc[session.user_id]) {
      acc[session.user_id] = {
        user: session.profiles,
        sessions: []
      };
    }
    acc[session.user_id].sessions.push(session);
    return acc;
  }, {} as Record<string, any>);

  const onlineCount = Object.values(groupedSessions).filter((group: any) => 
    group.sessions.some((s: any) => s.is_online)
  ).length;

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="min-h-full w-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Live User Monitoring</h1>
        <p className="text-slate-300">Track user activity and sessions in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{Object.keys(groupedSessions).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm">Online Now</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{onlineCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{sessions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live User Activity
        </h2>
        <div className="space-y-6">
          {Object.values(groupedSessions).map((group: any) => {
            const isOnline = group.sessions.some((s: any) => s.is_online);
            return (
              <div
                key={group.user.email}
                className="p-4 bg-slate-900/30 border border-slate-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {group.user.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{group.user.full_name || "Unknown"}</p>
                      <p className="text-sm text-slate-400">{group.user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={isOnline ? "default" : "secondary"}
                    className={isOnline ? "bg-green-600" : "bg-slate-600"}
                  >
                    <Circle className={`h-2 w-2 mr-2 ${isOnline ? "fill-white" : "fill-slate-400"}`} />
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="space-y-2 pl-13">
                  {group.sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          Session: {session.session_id.substring(0, 8)}
                        </Badge>
                        <span className="text-slate-400">{session.page_title || session.page_url}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(session.last_activity).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(groupedSessions).length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No active sessions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
