"use client";

import { CheckCircle2, Calendar, Clock, User, Stethoscope, MapPin, Hash } from "lucide-react";
import type { Doctor, Clinic } from "@/lib/types";

interface BookingConfirmationProps {
    slot: { start: string; end: string };
    doctor: Doctor;
    clinic: Clinic;
}

export default function BookingConfirmation({ slot, doctor, clinic }: BookingConfirmationProps) {
    const bookingId = `MB-${Date.now().toString().slice(-6)}`;
    const startTime = new Date(slot.start);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="text-center space-y-2">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold font-headline">Appointment Confirmed!</h2>
                <p className="text-muted-foreground">
                    Your appointment has been successfully booked. A confirmation has been sent via SMS.
                </p>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-4">
                 <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Booking ID</p>
                        <p className="font-mono font-semibold">{bookingId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{startTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-semibold">{startTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Doctor</p>
                        <p className="font-semibold">{doctor.name}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Clinic</p>
                        <p className="font-semibold">{clinic.name}</p>
                        <p className="text-xs text-muted-foreground">{clinic.location.address}</p>
                    </div>
                </div>
            </div>

             <div className="text-center text-sm text-muted-foreground">
                <p>Please arrive 15 minutes early. You can manage your appointments from your dashboard.</p>
            </div>
        </div>
    );
}
