import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const fetchLoginHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .or('action.ilike.%login%,action.ilike.%auth%,action.ilike.%verification%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLoginHistory(data || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
      toast.error('Failed to fetch login history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (action: string) => {
    if (action.toLowerCase().includes('success') || action.toLowerCase().includes('verified')) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    }
    if (action.toLowerCase().includes('failed') || action.toLowerCase().includes('error')) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        Attempted
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Login History</h1>
        </div>
        <p className="text-muted-foreground">
          View your recent authentication activity and login attempts
        </p>
      </div>

      <Card className="p-6 mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Security Notice</h3>
            <p className="text-sm text-blue-800">
              If you notice any suspicious activity or unrecognized login attempts, 
              please contact support immediately and change your password.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No login history found</p>
                </TableCell>
              </TableRow>
            ) : (
              loginHistory.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {getStatusBadge(log.action)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.details || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy - HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing last {loginHistory.length} authentication events
      </div>
    </div>
  );
};

export default LoginHistory;