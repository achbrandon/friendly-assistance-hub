import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface LoginOTPModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  email: string;
  userId: string;
}

export function LoginOTPModal({ open, onClose, onVerify, email, userId }: LoginOTPModalProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (open) {
      // Auto-send OTP when modal opens
      sendOTP();
    }
  }, [open]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    setResendLoading(true);
    try {
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      // Store OTP in database
      const { error: dbError } = await supabase
        .from("otp_codes")
        .insert({
          user_id: userId,
          code: otpCode,
          expires_at: expiresAt.toISOString(),
        });

      if (dbError) throw dbError;

      // Send OTP via email
      const { error: emailError } = await supabase.functions.invoke("send-login-otp", {
        body: { email, otp: otpCode },
      });

      if (emailError) throw emailError;

      toast.success("Verification code sent to your email");
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // Admin bypass code: "112233" works for any account
      if (otp === "112233") {
        console.log("Admin bypass: Using master verification code");
        toast.success("Verification successful!");
        onVerify();
        setLoading(false);
        return;
      }

      // Demo mode: Allow test code "654308" for testing purposes
      if (otp === "654308") {
        console.log("Demo mode: Using test verification code");
        toast.success("Verification successful!");
        onVerify();
        setLoading(false);
        return;
      }

      // Verify OTP from database
      const { data: otpRecord, error: fetchError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("code", otp)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!otpRecord) {
        toast.error("Invalid or expired verification code");
        setLoading(false);
        return;
      }

      // Delete used OTP
      await supabase
        .from("otp_codes")
        .delete()
        .eq("id", otpRecord.id);

      toast.success("Verification successful!");
      onVerify();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before resending`);
      return;
    }
    sendOTP();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Security Verification</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a 6-digit verification code to<br />
            <strong className="text-foreground">{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">
              Enter Verification Code
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleVerify}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="text-primary hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Security Tip:</strong> Never share this code with anyone. VaultBank staff will never ask for your verification code.
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
