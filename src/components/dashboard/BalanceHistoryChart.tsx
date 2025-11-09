import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BalanceDataPoint {
  date: string;
  balance: number;
  timestamp: number;
}

interface Account {
  id: string;
  account_type: string;
  account_number: string;
}

export const BalanceHistoryChart = () => {
  const [chartData, setChartData] = useState<BalanceDataPoint[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchBalanceHistory();
    }
  }, [selectedAccount, accounts]);

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("accounts")
      .select("id, account_type, account_number")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (data) {
      setAccounts(data);
    }
  };

  const fetchBalanceHistory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      let query = supabase
        .from("transactions")
        .select("amount, type, created_at, account_id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      if (selectedAccount !== "all") {
        query = query.eq("account_id", selectedAccount);
      }

      const { data: transactions } = await query;

      if (transactions && transactions.length > 0) {
        // Calculate running balance
        let runningBalance = 0;
        const balancePoints: BalanceDataPoint[] = transactions.map((transaction) => {
          if (transaction.type === "credit") {
            runningBalance += parseFloat(String(transaction.amount));
          } else {
            runningBalance -= parseFloat(String(transaction.amount));
          }

          return {
            date: new Date(transaction.created_at).toLocaleDateString(),
            balance: runningBalance,
            timestamp: new Date(transaction.created_at).getTime(),
          };
        });

        // Group by date and take the last balance of each day
        const groupedByDate = balancePoints.reduce((acc, point) => {
          if (!acc[point.date] || point.timestamp > acc[point.date].timestamp) {
            acc[point.date] = point;
          }
          return acc;
        }, {} as Record<string, BalanceDataPoint>);

        setChartData(Object.values(groupedByDate));
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching balance history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Balance History</CardTitle>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_type} - {account.account_number.slice(-4)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No transaction history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
