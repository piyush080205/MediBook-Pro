
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/firebase";
import { toast } from "@/hooks/use-toast";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously,
} from "firebase/auth";
import { Loader2, Phone, KeyRound, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// Make sure window.recaptchaVerifier is accessible
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function AuthModal({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("initial"); // 'initial', 'otp', 'loading'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Effect to set up reCAPTCHA
  useEffect(() => {
    if (!open || !auth || step !== "phone" || window.recaptchaVerifier) return;

    if (recaptchaContainerRef.current) {
        // Ensure the container is empty before rendering
        recaptchaContainerRef.current.innerHTML = '';
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "normal",
          callback: () => {
             // reCAPTCHA solved, allow user to proceed
          },
          "expired-callback": () => {
            toast({
                title: "reCAPTCHA Expired",
                description: "Please solve the reCAPTCHA again.",
                variant: "destructive",
            });
          },
        });
        window.recaptchaVerifier = verifier;
        verifier.render();
    }
  }, [open, auth, step]);


  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);

    if (!window.recaptchaVerifier) {
      toast({
        title: "reCAPTCHA Error",
        description: "Verifier not initialized. Please wait a moment and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const formattedPhoneNumber = `+${phoneNumber.replace(/[^0-9]/g, '')}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      setStep("otp");
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      let description = "An unexpected error occurred. Please try again.";
      if (err.code === 'auth/invalid-phone-number') {
        description = "The phone number you entered is not valid. Please check and try again.";
      } else if (err.code === 'auth/too-many-requests') {
        description = "You've sent too many requests. Please wait a while before trying again.";
      } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/billing-not-enabled') {
        description = "Phone sign-in is not enabled for this project. The project admin needs to enable it in the Firebase console and ensure billing is active."
      }
      setError(description);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    if (!window.confirmationResult) {
      setError("Verification session expired. Please request a new OTP.");
      setIsLoading(false);
      return;
    }
    try {
      await window.confirmationResult.confirm(otp);
      toast({ title: "Successfully Logged In!" });
      resetStateAndClose();
    } catch (err: any) {
       console.error("OTP Verify Error:", err);
       let description = "An unexpected error occurred. Please try again.";
       if (err.code === 'auth/invalid-verification-code') {
         description = "The code you entered is invalid. Please check and try again.";
       } else if (err.code === 'auth/code-expired') {
          description = "The code has expired. Please request a new one."
       }
       setError(description);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnonymousSignIn = async () => {
      setIsLoading(true);
      setError(null);
      try {
          await signInAnonymously(auth);
          toast({ title: "Logged In as Guest" });
          resetStateAndClose();
      } catch (err) {
          console.error("Anonymous Sign-In Error:", err);
          setError("Could not sign in as a guest. Please try again.");
      } finally {
          setIsLoading(false);
      }
  }

  const resetStateAndClose = () => {
    setOpen(false);
  };
  
  // Cleanup on modal close
  useEffect(() => {
    if (!open) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      setStep("initial");
      setPhoneNumber("");
      setOtp("");
      setError(null);
      setIsLoading(false);
    }
  }, [open]);


  const renderStep = () => {
    switch (step) {
      case "phone":
        return (
          <div className="space-y-4">
            <DialogDescription>
              Enter your phone number to receive a one-time password (OTP).
            </DialogDescription>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 919876543210"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
             <div ref={recaptchaContainerRef} className="flex justify-center" id="recaptcha-container"></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStep('initial')}>Back</Button>
                <Button onClick={handleSendOtp} disabled={isLoading || phoneNumber.length < 10}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Send OTP
                </Button>
            </DialogFooter>
          </div>
        );
      case "otp":
        return (
          <div className="space-y-4">
            <DialogDescription>
              We've sent an OTP to {phoneNumber}. Please enter it below.
            </DialogDescription>
            <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="pl-10 text-center tracking-[0.5em]"
                    maxLength={6}
                    disabled={isLoading}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setStep('phone')} disabled={isLoading}>Change Number</Button>
              <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify & Login
              </Button>
            </DialogFooter>
          </div>
        );
      default: // 'initial' step
        return (
            <div className="space-y-4 pt-4">
                 <Button size="lg" className="w-full" onClick={() => setStep('phone')} disabled={isLoading}>
                    <Phone className="mr-2 h-5 w-5" /> Sign in with Phone
                 </Button>
                 <Button size="lg" variant="secondary" className="w-full" onClick={handleAnonymousSignIn} disabled={isLoading}>
                    {isLoading && step !== 'phone' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-5 w-5" />}
                    Continue as Guest
                 </Button>
                 {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
        )
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-sm", {'sm:max-w-md': step === 'phone'})}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-headline">
            {step === "otp" ? "Enter OTP" : "Welcome to MediBook Pro"}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

