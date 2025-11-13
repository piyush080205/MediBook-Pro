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
import { AlertTriangle, Phone, Map, BedDouble, Wind } from 'lucide-react';
import { emergencyRooms } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function EmergencyFeature() {
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
      <DialogContent className="sm:max-w-lg md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-destructive">
            <AlertTriangle />
            Emergency Rooms Nearby
          </DialogTitle>
          <DialogDescription>
            This is for informational purposes only. If this is a life-threatening emergency, please call 911 immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          {emergencyRooms.map(er => {
            const erImage = PlaceHolderImages.find(p => p.id === er.imageId);
            return (
              <div key={er.id} className="flex gap-4 items-start p-4 border rounded-lg">
                <div className="relative h-24 w-24 shrink-0">
                    {erImage && 
                        <Image src={erImage.imageUrl} alt={er.name} fill className="rounded-md object-cover" data-ai-hint={erImage.imageHint} />
                    }
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{er.name}</h3>
                  <p className="text-sm text-muted-foreground">{er.location.address}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex items-center gap-1.5" title="Estimated Time of Arrival">
                        <Wind className="h-4 w-4 text-blue-500" />
                        <span>~{er.etaDrivingMinutes} min</span>
                    </div>
                     <div className="flex items-center gap-1.5" title="Available Beds (simulated)">
                        <BedDouble className="h-4 w-4 text-green-500" />
                        <span>{er.bedsAvailable} beds free</span>
                    </div>
                  </div>
                   <div className="flex gap-2 mt-4">
                     <Button size="sm" className="flex-1" asChild>
                        <a href={`tel:${er.callNumber}`}><Phone className="mr-2 h-4 w-4" /> Call Now</a>
                     </Button>
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={er.mapUrl} target="_blank" rel="noopener noreferrer"><Map className="mr-2 h-4 w-4" /> Directions</a>
                      </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
