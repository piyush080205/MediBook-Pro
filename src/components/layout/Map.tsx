"use client"

import React, { useState } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { EmergencyRoom } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Phone, Map as MapIcon } from 'lucide-react';

interface MapViewProps {
    locations: EmergencyRoom[];
    onSelectER: (er: EmergencyRoom) => void;
    selectedER: EmergencyRoom | null;
}

export default function MapView({ locations, onSelectER, selectedER }: MapViewProps) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(true);

    const handleMarkerClick = (er: EmergencyRoom) => {
        onSelectER(er);
        setInfoWindowOpen(true);
    }
    
    const initialCenter = locations[0] ? { lat: locations[0].location.lat, lng: locations[0].location.lng } : { lat: 20.5937, lng: 78.9629 };

    return (
        <Map
            defaultZoom={11}
            defaultCenter={initialCenter}
            center={selectedER ? { lat: selectedER.location.lat, lng: selectedER.location.lng } : initialCenter}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
            className="w-full h-full"
        >
            {locations.map(er => (
                <AdvancedMarker 
                    key={er.id} 
                    position={{ lat: er.location.lat, lng: er.location.lng }}
                    onClick={() => handleMarkerClick(er)}
                >
                     <Pin 
                        background={selectedER?.id === er.id ? '#DB2777' : '#0F172A'}
                        borderColor={selectedER?.id === er.id ? '#831843' : '#ffffff'}
                        glyphColor={selectedER?.id === er.id ? '#ffffff' : '#ffffff'}
                     />
                </AdvancedMarker>
            ))}

            {selectedER && infoWindowOpen && (
                <InfoWindow 
                    position={{ lat: selectedER.location.lat, lng: selectedER.location.lng }}
                    onCloseClick={() => setInfoWindowOpen(false)}
                    minWidth={250}
                >
                    <div className="p-2 space-y-2">
                        <h4 className="font-bold text-md">{selectedER.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedER.location.address}</p>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" className="flex-1" asChild>
                               <a href={`tel:${selectedER.callNumber}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
                            </Button>
                             <Button size="sm" variant="outline" className="flex-1" asChild>
                               <a href={selectedER.mapUrl} target="_blank" rel="noopener noreferrer"><MapIcon className="mr-2 h-4 w-4" /> Directions</a>
                             </Button>
                         </div>
                    </div>
                </InfoWindow>
            )}
        </Map>
    )
}
