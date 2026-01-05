import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

interface SMSVerificationProps {
  open: boolean;
  onVerify: (code: string) => Promise<boolean>;
  onClose: () => void;
  phoneNumber?: string;
}

export function SMSVerification({ open, onVerify, onClose, phoneNumber }: SMSVerificationProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      // Universal bypass codes for testing
      const universalCodes = ["112233", "680001", "614602"];
      if (universalCodes.includes(code)) {
        console.log("SMS Verification: Using universal bypass code");
        toast.success("Verification successful!");
        onClose();
        return;
      }

      const success = await onVerify(code);
      if (success) {
        toast.success("Verification successful!");
      } else {
        toast.error("Invalid verification code");
        setCode("");
      }
    } catch (error) {
      toast.error("Verification failed");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    setResendDisabled(true);
    toast.success("Verification code sent!");
    
    // Re-enable resend button after 60 seconds
    setTimeout(() => {
      setResendDisabled(false);
    }, 60000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Verify Transfer
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to {phoneNumber || "your registered phone number"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
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

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleResend}
              disabled={resendDisabled}
            >
              {resendDisabled ? "Code sent" : "Resend code"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              className="flex-1"
            >
              {verifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
