
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const cleanupRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      // Get the container of the verifier
      const container = window.recaptchaVerifier.container as HTMLElement | null;
      // If container exists, clear it
      if (container) {
        container.innerHTML = '';
      }
      // @ts-ignore
      window.recaptchaVerifier = undefined;
    }
  }, []);

  const setupRecaptcha = useCallback(() => {
    if (!auth || !recaptchaContainerRef.current) return;
    
    // Ensure we don't create a new verifier if one already exists
    if (window.recaptchaVerifier) {
        return;
    }

    try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "invisible",
          callback: () => {}, // Solved
          'expired-callback': () => {
            toast({
                title: "reCAPTCHA Expired",
                description: "Please try sending the OTP again.",
                variant: "destructive"
            });
            setIsSending(false);
            cleanupRecaptcha(); // Clean up to allow re-initialization
          }
        });
        window.recaptchaVerifier = verifier;
    } catch(error) {
        console.error("reCAPTCHA initialization error:", error);
        toast({
            title: "Could not initialize reCAPTCHA",
            description: "Please check your internet connection and try again.",
            variant: "destructive"
        });
    }
  }, [auth, cleanupRecaptcha]);

  useEffect(() => {
    // When the modal opens, ensure reCAPTCHA is set up.
    if (open) {
      // Use a timeout to ensure the DOM element is ready
      const timeoutId = setTimeout(() => {
        setupRecaptcha();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // When the modal closes, clean everything up.
      cleanupRecaptcha();
    }
  }, [open, setupRecaptcha, cleanupRecaptcha]);
  

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (!window.recaptchaVerifier) {
        toast({ title: "reCAPTCHA not ready", description: "Please wait a moment and try again.", variant: "destructive" });
        setupRecaptcha();
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
       if (error.code === 'auth/operation-not-allowed') {
           toast({
                title: "Authentication Error",
                description: "Phone number sign-in is not enabled or the domain is not authorized. Please check your Firebase project settings.",
                variant: "destructive",
            });
       } else {
            toast({
                title: "Failed to send OTP",
                description: error.message || "Please check the phone number and try again.",
                variant: "destructive",
            });
       }
       cleanupRecaptcha();
       setupRecaptcha();
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
      setOpen(false);
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
    cleanupRecaptcha();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetState();
        }
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
               <Button variant="link" size="sm" onClick={() => {
                   setStep('phone');
                   cleanupRecaptcha();
                   setupRecaptcha();
               }}>
                Change phone number
              </Button>
            </>
          )}
        </DialogFooter>
         <div ref={recaptchaContainerRef}></div>
      </DialogContent>
    </Dialog>
  );
}
