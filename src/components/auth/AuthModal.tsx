"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, Phone, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useAuth } from "@/firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const auth = useAuth();

  const setupRecaptcha = useCallback(() => {
    if (auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          setIsSending(false);
        },
      });
    }
  }, [auth]);

  useEffect(() => {
    if (open) {
      // Delay setup to ensure modal is visible and DOM element exists
      setTimeout(() => {
         if (document.getElementById("recaptcha-container")) {
            setupRecaptcha();
         }
      }, 100);
    }
  }, [open, setupRecaptcha]);

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (!window.recaptchaVerifier) {
        toast({ title: "reCAPTCHA not initialized", description: "Please try again in a moment.", variant: "destructive" });
        return;
    }
    
    setIsSending(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      setStep("otp");
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${phoneNumber}.` });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please check the phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "OTP is required", variant: "destructive" });
      return;
    }
    if (!window.confirmationResult) {
      toast({ title: "Verification session expired", description: "Please request a new OTP.", variant: "destructive" });
      setStep("phone");
      return;
    }

    setIsVerifying(true);
    try {
      await window.confirmationResult.confirm(otp);
      toast({ title: "Login Successful!", description: "You are now logged in." });
      setOpen(false); // Close modal on success
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetState = () => {
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    setIsSending(false);
    setIsVerifying(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button>
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {step === "phone" ? "Login with Phone" : "Enter OTP"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "We'll send a one-time password to your phone number."
              : `Enter the OTP sent to ${phoneNumber}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password</Label>
               <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2">
          {step === "phone" ? (
            <Button onClick={handleSendOtp} disabled={isSending}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send OTP
            </Button>
          ) : (
            <>
              <Button onClick={handleVerifyOtp} disabled={isVerifying}>
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify OTP & Login
              </Button>
               <Button variant="link" size="sm" onClick={() => setStep('phone')}>
                Change phone number
              </Button>
            </>
          )}
        </DialogFooter>
         <div id="recaptcha-container"></div>
      </DialogContent>
    </Dialog>
  );
}
