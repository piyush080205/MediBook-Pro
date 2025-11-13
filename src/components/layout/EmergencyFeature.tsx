"use client";

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Map, BedDouble, Wind, Loader2 } from 'lucide-react';
import { emergencyRooms as allEmergencyRooms } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import MapView from './Map';
import type { EmergencyRoom } from '@/lib/types';
import { useGeolocation } from '@/hooks/use-geolocation';

// Function to calculate distance between two lat/lng points in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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


export default function EmergencyFeature() {
    const { coordinates, isLoading: isLocationLoading, error: locationError } = useGeolocation();
    
    const sortedEmergencyRooms = useMemo(() => {
        if (!coordinates) {
            return allEmergencyRooms;
        }

        return [...allEmergencyRooms]
            .map(er => {
                const distance = getDistance(coordinates.lat, coordinates.lng, er.location.lat, er.location.lng);
                // Assume average speed of 40km/h to calculate ETA
                const eta = Math.round((distance / 40) * 60); 
                return { ...er, distance, etaDrivingMinutes: eta };
            })
            .sort((a, b) => a.distance - b.distance);
    }, [coordinates]);
    
    const [selectedER, setSelectedER] = useState<EmergencyRoom | null>(sortedEmergencyRooms[0] || null);


    return (
        <Dialog>
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
                    {isLocationLoading && (
                        <div className="z-10 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="font-semibold">Fetching your location...</p>
                        </div>
                    )}
                    {locationError && !isLocationLoading && (
                         <div className="z-10 text-center p-4">
                            <p className="font-semibold text-destructive">Could not get your location.</p>
                            <p className="text-sm text-muted-foreground">{locationError}. Please enable location services in your browser.</p>
                        </div>
                    )}
                    {coordinates && (
                         <MapView 
                            locations={sortedEmergencyRooms} 
                            onSelectER={setSelectedER} 
                            selectedER={selectedER}
                            userLocation={coordinates}
                        />
                    )}
                     {!coordinates && !isLocationLoading && !locationError && (
                         <MapView 
                            locations={sortedEmergencyRooms} 
                            onSelectER={setSelectedER} 
                            selectedER={selectedER}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    <h3 className="font-bold text-lg">Hospitals List</h3>
                    {sortedEmergencyRooms.map(er => {
                        const erImage = PlaceHolderImages.find(p => p.id === er.imageId);
                        const isSelected = selectedER?.id === er.id;
                        return (
                        <div 
                            key={er.id} 
                            className={`flex gap-4 items-start p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-secondary ring-2 ring-primary' : 'hover:bg-secondary/50'}`}
                            onClick={() => setSelectedER(er)}
                        >
                            <div className="relative h-20 w-20 shrink-0">
                                {erImage && 
                                    <Image src={erImage.imageUrl} alt={er.name} fill className="rounded-md object-cover" data-ai-hint={erImage.imageHint} />
                                }
                            </div>
                            <div className="flex-1">
                            <h3 className="font-bold text-sm">{er.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{er.location.address}</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
                                <div className="flex items-center gap-1.5" title="Estimated Time of Arrival">
                                    <Wind className="h-3 w-3 text-blue-500" />
                                    <span>~{er.etaDrivingMinutes} min</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Available Beds (simulated)">
                                    <BedDouble className="h-3 w-3 text-green-500" />
                                    <span>{er.bedsAvailable} beds</span>
                                </div>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </DialogContent>
        </Dialog>
    );
}
