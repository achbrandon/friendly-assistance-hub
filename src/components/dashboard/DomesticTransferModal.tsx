import { useState, useEffect } from "react";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransferReceipt } from "./TransferReceipt";
import { OTPVerificationModal } from "./OTPVerificationModal";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import bankLogo from "@/assets/vaultbank-logo.png";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { AlertTriangle, ShieldAlert, Phone, Mail, MessageSquare } from "lucide-react";

interface DomesticTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function DomesticTransferModal({ onClose, onSuccess }: DomesticTransferModalProps) {
  const navigate = useNavigate();
  const { playSound } = useNotificationSound();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [fromAccount, setFromAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [transferMethod, setTransferMethod] = useState<"ACH" | "Wire">("ACH");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [showInheritanceWarning, setShowInheritanceWarning] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isAccountRestricted, setIsAccountRestricted] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found in DomesticTransferModal");
      return;
    }

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    console.log("Accounts fetched in DomesticTransferModal:", data);
    setAccounts(data || []);
    // Calculate total balance for inheritance warning
    const total = (data || []).reduce((sum, acc) => sum + parseFloat(String(acc.balance || 0)), 0);
    setTotalBalance(total);
  };

  const handleTransfer = async () => {
    // Check if account is restricted
    if (profile?.can_transact === false) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Account Restricted",
          message: "Your account has been restricted and transfer can't be made on this account until further notice, kindly visit support center for further assistance.",
          type: "error"
        });
      }
      // Show receipt with restricted message
      const selectedAccount = accounts.find(a => a.id === fromAccount) || accounts[0];
      setReceiptData({
        type: 'domestic' as const,
        fromAccount: selectedAccount?.account_type || 'Account',
        toAccount: recipientName || 'Recipient',
        recipientName: recipientName || 'N/A',
        recipientBank: recipientBank || 'N/A',
        amount: amount || '0.00',
        currency: '$',
        reference: `DOM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date(),
        routingNumber: routingNumber,
        accountNumber: accountNumber
      });
      setIsAccountRestricted(true);
      setShowReceipt(true);
      return;
    }

    if (!fromAccount || !recipientName || !recipientBank || !routingNumber || !accountNumber || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (routingNumber.length !== 9) {
      toast.error("Routing number must be 9 digits");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if user is in the restricted inheritance accounts
    const restrictedEmails = ["annanbelle72@gmail.com", "ultimateambahe@gmail.com"];
    if (restrictedEmails.includes(profile?.email?.toLowerCase())) {
      // Create notification for blocked transfer
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createNotification({
          userId: user.id,
          title: "Transfer Blocked - Compliance Hold",
          message: `Your transfer of $${amount} has been blocked. Per FinCEN BSA/AML compliance requirements (31 CFR Chapter X), a 3% Anti-Money Laundering verification deposit of $${(totalBalance * 0.03).toLocaleString('en-US', { minimumFractionDigits: 2 })} is required before any fund disbursement from your estate inheritance account. Please contact our Estate Services Department through support to complete the AML compliance deposit.`,
          type: "error"
        });
      }
      
      // Play alert sound and show warning
      playSound('inheritance');
      setShowInheritanceWarning(true);
      return;
    }

    // Store transfer data and show OTP modal
    const selectedAccount = accounts.find(a => a.id === fromAccount);
    const fee = transferMethod === "Wire" ? "25.00" : "0.00";
    const reference = `DOM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    setPendingTransfer({
      fromAccount,
      selectedAccount,
      transferAmount,
      fee,
      reference
    });
    setShowOTP(true);
  };

  const handleOTPVerified = async () => {
    setShowOTP(false);
    setLoading(true);
    setShowLoadingSpinner(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current account balance
      const { data: accountData } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", pendingTransfer.fromAccount)
        .single();

      if (!accountData) throw new Error("Account not found");

      const currentBalance = parseFloat(String(accountData.balance) || '0');
      const newBalance = currentBalance - pendingTransfer.transferAmount;

      if (newBalance < 0) {
        throw new Error("Insufficient funds");
      }

      // Update account balance and create transfer/transaction in parallel
      const [transferResult, transactionResult] = await Promise.all([
        supabase.from("transfers").insert({
          user_id: user.id,
          from_account: pendingTransfer.fromAccount,
          to_account: accountNumber,
          amount: pendingTransfer.transferAmount,
          status: "pending"
        }),
        supabase.from("transactions").insert({
          user_id: user.id,
          account_id: pendingTransfer.fromAccount,
          type: "debit",
          amount: pendingTransfer.transferAmount,
          description: `Domestic ${transferMethod} Transfer to ${recipientName} - Pending`,
          status: "pending"
        })
      ]);

      if (transferResult.error) throw transferResult.error;
      if (transactionResult.error) throw transactionResult.error;
      
      // Send pending notification
      await createNotification({
        userId: user.id,
        title: "Transfer Pending",
        message: `Your ${transferMethod} transfer of $${pendingTransfer.transferAmount.toFixed(2)} to ${recipientName} at ${recipientBank} is pending`,
        type: "pending"
      });
      
      setTimeout(() => {
        setShowLoadingSpinner(false);
        setReceiptData({
          type: 'domestic',
          fromAccount: pendingTransfer.selectedAccount?.account_type || '',
          toAccount: accountNumber,
          recipientName,
          recipientBank,
          amount: pendingTransfer.transferAmount.toFixed(2),
          currency: '$',
          reference: pendingTransfer.reference,
          date: new Date(),
          fee: pendingTransfer.fee,
          routingNumber,
          accountNumber,
          status: 'pending'
        });
        setShowReceipt(true);
        onSuccess();
        toast.success("Transfer submitted and pending");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Transfer failed");
      setShowLoadingSpinner(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={!showReceipt} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domestic Transfer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No accounts available</div>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type} - ****{account.account_number?.slice(-4) || '0000'} - ${parseFloat(account.balance || 0).toFixed(2)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  placeholder="Michael Johnson"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Recipient Bank</Label>
                <Input
                  placeholder="Bank of America"
                  value={recipientBank}
                  onChange={(e) => setRecipientBank(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Routing Number (ABA)</Label>
                <Input
                  placeholder="026009593"
                  maxLength={9}
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  placeholder="1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <RadioGroup value={transferMethod} onValueChange={(v) => setTransferMethod(v as "ACH" | "Wire")}>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="ACH" id="ach" />
                  <Label htmlFor="ach" className="flex-1 cursor-pointer">
                    ACH Transfer (1-2 business days, Free)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="Wire" id="wire" />
                  <Label htmlFor="wire" className="flex-1 cursor-pointer">
                    Wire Transfer (Same day, $25 fee)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Memo (Optional)</Label>
              <Input
                placeholder="Payment for invoice #124"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Send Transfer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showOTP && (
        <OTPVerificationModal
          open={showOTP}
          onClose={() => setShowOTP(false)}
          onVerify={handleOTPVerified}
          email={profile?.email || "your email"}
          action="domestic_transfer"
          amount={amount}
        />
      )}

      {showReceipt && receiptData && (
        <TransferReceipt
          open={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setIsAccountRestricted(false);
            onClose();
          }}
          transferData={receiptData}
          isRestricted={isAccountRestricted}
        />
      )}

      {showLoadingSpinner && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-4">
            <img 
              src={bankLogo} 
              alt="VaultBank" 
              className="h-20 w-auto mx-auto animate-spin"
              style={{ animationDuration: '2s' }}
            />
            <p className="text-lg font-semibold">Processing your transfer...</p>
          </div>
        </div>
      )}

      <AlertDialog open={showInheritanceWarning} onOpenChange={setShowInheritanceWarning}>
        <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0c1220] via-[#0a0f1a] to-[#080d14] border border-gray-700/30 p-0">
          <div className="p-6">
            <AlertDialogHeader>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <ShieldAlert className="h-8 w-8 text-rose-400" />
                </div>
              </div>
              <AlertDialogTitle className="text-xl font-bold text-white text-center">
                Transfer Blocked
              </AlertDialogTitle>
              <p className="text-gray-400 text-sm text-center mt-1">AML Compliance Deposit Required</p>
            </AlertDialogHeader>
            
            <AlertDialogDescription className="space-y-4 mt-6">
              {/* Balance Info Card */}
              <div className="bg-gradient-to-br from-[#0a3d62]/80 to-[#0c2840]/80 rounded-xl p-4 border border-cyan-700/30">
                <p className="text-cyan-200 text-xs mb-1">Total Inherited Account Balance</p>
                <p className="text-white text-2xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="h-px bg-cyan-700/30 my-3"></div>
                <p className="text-cyan-200 text-xs mb-1">Required AML Compliance Deposit (3%)</p>
                <p className="text-rose-400 text-xl font-bold">${(totalBalance * 0.03).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              {/* AML Notice */}
              <div className="bg-[#151c28]/80 rounded-xl p-4 border border-gray-700/30">
                <h4 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  FinCEN BSA/AML Compliance
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Per FinCEN BSA/AML compliance requirements (31 CFR Chapter X), a 3% Anti-Money Laundering verification deposit of <span className="text-white font-semibold">${(totalBalance * 0.03).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> is required to complete enhanced due diligence prior to fund disbursement.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-[#151c28]/80 rounded-xl p-4 border border-gray-700/30">
                <p className="text-gray-300 text-xs leading-relaxed">
                  <span className="text-white font-semibold">Next Steps:</span> To complete the AML compliance deposit and proceed with your estate transfer, please contact our Estate Services Department through the secure support channel.
                </p>
              </div>

              {/* Contact Options */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-xs">Support</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs">Email</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">Chat</span>
                </div>
              </div>
            </AlertDialogDescription>
          </div>
          
          <AlertDialogFooter className="bg-[#0a0f18]/80 border-t border-gray-700/30 p-4">
            <AlertDialogCancel 
              className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border-0 font-medium"
              onClick={() => {
                setShowInheritanceWarning(false);
                onClose();
                navigate('/bank/dashboard');
              }}
            >
              I Understand
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
