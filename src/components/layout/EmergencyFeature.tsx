
"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, BedDouble, Wind, Loader2, Ambulance, Share2, ShieldCheck, Siren } from 'lucide-react';
import { emergencyRooms as allEmergencyRooms } from '@/lib/data';
import MapView from './Map';
import type { EmergencyRoom } from '@/lib/types';
import { useGeolocation } from '@/hooks/use-geolocation';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

// Function to calculate distance between two lat/lng points in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

type EmergencyRoomWithDistance = EmergencyRoom & { distance?: number };

const ICE_CONTACT = "911"; // Placeholder for In Case of Emergency contact
const WAITING_INSTRUCTIONS = [
    "If it's safe, stay where you are.",
    "Try to remain calm and breathe slowly.",
    "If you are bleeding, apply firm pressure to the wound with a clean cloth.",
    "Keep your phone line open for responders to call back.",
    "Gather any personal identification or medical information if easily accessible."
];

export default function EmergencyFeature() {
    const { coordinates, isLoading: isLocationLoading, error: locationError } = useGeolocation();
    const [selectedER, setSelectedER] = useState<EmergencyRoomWithDistance | null>(null);
    const [isEmergencyModeActive, setIsEmergencyModeActive] = useState(false);
    const [open, setOpen] = useState(false);

    const sortedEmergencyRooms = useMemo(() => {
        if (!coordinates) {
            return allEmergencyRooms.map(er => ({...er}));
        }

        return [...allEmergencyRooms]
            .map(er => {
                const distance = getDistance(coordinates.lat, coordinates.lng, er.location.lat, er.location.lng);
                const eta = Math.round((distance / 40) * 60); 
                return { ...er, distance, etaDrivingMinutes: eta };
            })
            .sort((a, b) => a.distance! - b.distance!);
    }, [coordinates]);
    
    useEffect(() => {
        if (sortedEmergencyRooms.length > 0 && !selectedER) {
            setSelectedER(sortedEmergencyRooms[0]);
        }
    }, [sortedEmergencyRooms, selectedER]);

    const handleShareLocation = () => {
        if (!coordinates) {
            toast({ title: "Cannot share location", description: "Your location is not available.", variant: "destructive" });
            return;
        }
        const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
        navigator.clipboard.writeText(`I'm having an emergency. My current location is: ${url}`);
        toast({ title: "Location Link Copied!", description: "The link to your location has been copied to your clipboard." });
    }

    const handleModalOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setIsEmergencyModeActive(false); // Reset mode when dialog is closed
        }
    }

    const renderInitialView = () => (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-destructive">
                    <AlertTriangle />
                    Emergency Rooms Nearby
                </DialogTitle>
                <DialogDescription>
                    This is for informational purposes only. If this is a life-threatening emergency, please call your local emergency number immediately.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
                <div className="md:col-span-2 h-full rounded-lg overflow-hidden relative bg-muted flex items-center justify-center">
                    {isLocationLoading && <Loader2 className="h-8 w-8 animate-spin" />}
                    {locationError && !isLocationLoading && (
                        <div className="z-10 text-center p-4">
                            <p className="font-semibold text-destructive">Could not get your location.</p>
                            <p className="text-sm text-muted-foreground">{locationError}. Please enable location services.</p>
                        </div>
                    )}
                    <MapView 
                        locations={sortedEmergencyRooms} 
                        onSelectER={setSelectedER} 
                        selectedER={selectedER}
                        userLocation={coordinates}
                    />
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    <Button size="lg" variant="destructive" onClick={() => setIsEmergencyModeActive(true)} className="w-full">
                        <Siren className="mr-2 h-5 w-5" /> Activate Emergency Mode
                    </Button>
                    <Separator />
                    <h3 className="font-bold text-lg">Hospitals List</h3>
                    {sortedEmergencyRooms.map(er => (
                        <Card 
                            key={er.id}
                            className={`cursor-pointer transition-all ${selectedER?.id === er.id ? 'bg-secondary ring-2 ring-primary' : 'hover:bg-secondary/50'}`}
                            onClick={() => setSelectedER(er)}
                        >
                            <CardContent className="p-3 flex gap-3 items-center">
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm">{er.name}</h3>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
                                        {er.distance !== undefined && (
                                            <div className="flex items-center gap-1.5" title="Distance">
                                                <Wind className="h-3 w-3 text-blue-500" />
                                                <span>~{er.distance.toFixed(1)} km</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5" title="Available Beds (simulated)">
                                            <BedDouble className="h-3 w-3 text-green-500" />
                                            <span>{er.bedsAvailable} beds</span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="icon" variant="outline" asChild>
                                    <a href={`tel:${er.callNumber}`}><Phone /></a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
    
    const renderEmergencyModeView = () => (
        <div className="flex flex-col h-full">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-destructive-foreground bg-destructive -m-6 p-6 rounded-t-lg">
                    <Siren className="animate-ping" />
                    Emergency Mode Activated
                </DialogTitle>
            </DialogHeader>
            <div className="py-6 grid md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
                <div className='space-y-4'>
                    <h3 className='font-bold text-lg'>Critical Actions</h3>
                    <div className='grid grid-cols-1 gap-3'>
                        <Button size="lg" className='h-16 text-lg' asChild>
                            <a href={`tel:${ICE_CONTACT}`}><Phone className="mr-2 h-6 w-6"/> Call Emergency Contact</a>
                        </Button>
                        <Button size="lg" className='h-16 text-lg' variant="secondary" onClick={handleShareLocation} disabled={!coordinates}>
                            <Share2 className="mr-2 h-6 w-6"/> Share Live Location
                        </Button>
                         {selectedER && (
                            <Button size="lg" className='h-16 text-lg' variant="outline" asChild>
                                <a href={`tel:${selectedER.ambulanceNumber}`}><Ambulance className="mr-2 h-6 w-6"/> Call {selectedER.name} Ambulance</a>
                            </Button>
                        )}
                    </div>
                </div>
                 <div className='space-y-4'>
                    <h3 className='font-bold text-lg'>While You Wait...</h3>
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4 space-y-3">
                            {WAITING_INSTRUCTIONS.map((instruction, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                    <span>{instruction}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsEmergencyModeActive(false)}>Deactivate Emergency Mode</Button>
            </div>
        </div>
    );


    return (
        <Dialog open={open} onOpenChange={handleModalOpenChange}>
        <DialogTrigger asChild>
            <Button
            variant="destructive"
            size="lg"
            className="fixed bottom-6 right-6 rounded-full shadow-2xl z-50 h-16 w-16 animate-pulse"
            aria-label="Emergency"
            >
            <AlertTriangle className="h-8 w-8" />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg md:max-w-4xl lg:max-w-6xl h-[80vh]">
            {isEmergencyModeActive ? renderEmergencyModeView() : renderInitialView()}
        </DialogContent>
        </Dialog>
    );
}
