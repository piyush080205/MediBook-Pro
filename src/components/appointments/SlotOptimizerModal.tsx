
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { runSlotOptimization, runSendSms } from "@/app/actions";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import type { OptimizeSlotsOutput } from "@/ai/flows/slot-optimization-engine";
import { getDoctorById } from "@/lib/data";
import BookingConfirmation from "./BookingConfirmation";
import type { Doctor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function SlotOptimizerModal({ doctorId }: { doctorId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [optimizedSlots, setOptimizedSlots] = useState<OptimizeSlotsOutput['bestSlots']>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{start: string, end: string} | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  
  const handleFindSlots = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setOptimizedSlots([]);
    
    const fromDate = new Date(date);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(date);
    toDate.setHours(23, 59, 59, 999);

    try {
      const result = await runSlotOptimization({
        doctorId,
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      });
      
      if (result && result.bestSlots.length > 0) {
        setOptimizedSlots(result.bestSlots);
      } else {
        toast({
          title: "No slots found",
          description: "Please try another date.",
        });
      }
    } catch (error) {
      console.error("Slot optimization failed:", error);
      toast({
        title: "Error finding slots",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (slot: { start: string; end: string }) => {
    setIsBooking(true);
    
    const doc = await getDoctorById(doctorId);
    if (!doc) {
        toast({ title: "Doctor not found", variant: "destructive" });
        setIsBooking(false);
        return;
    }

    setDoctor(doc);
    setSelectedSlot(slot);
    
    try {
        // In a real app, you'd get the patient's phone number from their profile
        const patientPhoneNumber = '+919876543210'; // Using a placeholder for now
        const startTime = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const onDate = new Date(slot.start).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        const messageBody = `Hi! Your appointment with ${doc.name} at ${doc.clinics[0].name} is confirmed for ${onDate} at ${startTime}. See you soon! - MediBook Pro`;

        // We'll attempt to send, but proceed to confirmation even if it fails for the demo.
        await runSendSms(patientPhoneNumber, messageBody);
        
    } catch(error) {
        console.error("SMS sending failed, but proceeding with confirmation for demo purposes:", error);
        // We can optionally show a small, non-blocking toast.
        toast({
            title: "SMS not sent",
            description: "Could not send SMS confirmation (demo mode).",
        });
    } finally {
        // Always confirm the booking visually in the UI for the demo.
        setBookingConfirmed(true);
        setIsBooking(false);
    }
  };

  const resetState = () => {
    setDate(new Date());
    setOptimizedSlots([]);
    setBookingConfirmed(false);
    setSelectedSlot(null);
    setDoctor(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetState();
        }
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {bookingConfirmed ? "Confirmation" : "Find an Appointment"}
          </DialogTitle>
        </DialogHeader>

        {bookingConfirmed && doctor && selectedSlot ? (
            <BookingConfirmation slot={selectedSlot} doctor={doctor} clinic={doctor.clinics[0]} />
        ) : (
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <h3 className="font-semibold mb-2">1. Select a Date</h3>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                    </div>
                    <Button onClick={handleFindSlots} disabled={isLoading || !date} className="w-full mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Find Best Slots
                    </Button>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">2. Choose a Time</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {isLoading && optimizedSlots.length === 0 ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-full rounded-md bg-muted animate-pulse" />)}
                            </div>
                        ) : optimizedSlots.length > 0 ? (
                            optimizedSlots.map((slot, index) => (
                                <Button 
                                    key={index} 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => handleBooking(slot)}
                                    disabled={isBooking}
                                >
                                    <div className="flex justify-between w-full items-center">
                                      <span>
                                          {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {isBooking && selectedSlot?.start === slot.start ? <Loader2 className="h-4 w-4 animate-spin" /> : <Badge variant={slot.score > 8 ? "default" : "secondary"}>{slot.reason}</Badge>}
                                    </div>
                                </Button>
                            ))
                        ) : (
                            <div className="text-center text-sm text-muted-foreground pt-10">
                                <p>Select a date and click "Find Best Slots" to see availability.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        <DialogFooter>
            <Button variant="outline" onClick={resetState}>
              {bookingConfirmed ? 'Done' : 'Cancel'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
