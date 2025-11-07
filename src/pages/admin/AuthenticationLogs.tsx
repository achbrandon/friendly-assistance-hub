import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AuthenticationLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('auth-logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_activity', filter: 'action=ilike.*login*,action=ilike.*auth*' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .or('action.ilike.%login%,action.ilike.%auth%,action.ilike.%verification%,action.ilike.%password%')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch authentication logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('success') || action.toLowerCase().includes('verified')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (action.toLowerCase().includes('failed') || action.toLowerCase().includes('error')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.toLowerCase().includes('attempt') || action.toLowerCase().includes('pending')) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <Shield className="h-4 w-4 text-blue-500" />;
  };

  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes('success') || action.toLowerCase().includes('verified')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
    }
    if (action.toLowerCase().includes('failed') || action.toLowerCase().includes('error')) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
    }
    if (action.toLowerCase().includes('attempt') || action.toLowerCase().includes('pending')) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
    return <Badge variant="outline">Info</Badge>;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'success' && (log.action.toLowerCase().includes('success') || log.action.toLowerCase().includes('verified'))) ||
      (filterType === 'failed' && (log.action.toLowerCase().includes('failed') || log.action.toLowerCase().includes('error'))) ||
      (filterType === 'login' && log.action.toLowerCase().includes('login')) ||
      (filterType === 'verification' && log.action.toLowerCase().includes('verification'));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading authentication logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Authentication Logs</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor all authentication events and login attempts
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, email, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="login">Login Events</SelectItem>
              <SelectItem value="verification">Verifications</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No authentication logs found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.profiles?.full_name || 'Unknown User'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.profiles?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {log.action}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.details || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} authentication events
      </div>
    </div>
  );
};

export default AuthenticationLogs;