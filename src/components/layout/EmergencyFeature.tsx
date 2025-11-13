"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Map, BedDouble, Wind, X } from 'lucide-react';
import { emergencyRooms } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import MapView from './Map';
import type { EmergencyRoom } from '@/lib/types';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function EmergencyFeature() {
    const [selectedER, setSelectedER] = useState<EmergencyRoom | null>(emergencyRooms[0] || null);

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
                <div className="md:col-span-2 h-full rounded-lg overflow-hidden relative">
                    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                        <MapView locations={emergencyRooms} onSelectER={setSelectedER} selectedER={selectedER} />
                    </APIProvider>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    <h3 className="font-bold text-lg">Hospitals List</h3>
                    {emergencyRooms.map(er => {
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
