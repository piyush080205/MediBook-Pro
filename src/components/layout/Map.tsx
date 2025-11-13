"use client"

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { EmergencyRoom } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Phone, Map as MapIcon, Pin, LocateFixed } from 'lucide-react';


interface MapViewProps {
    locations: EmergencyRoom[];
    onSelectER: (er: EmergencyRoom) => void;
    selectedER: EmergencyRoom | null;
    userLocation?: { lat: number, lng: number };
}

export default function MapView({ locations, onSelectER, selectedER, userLocation }: MapViewProps) {
    const mapRef = useRef<MapRef>(null);

    const initialCenter = userLocation
        ? { latitude: userLocation.lat, longitude: userLocation.lng }
        : (locations[0] 
            ? { latitude: locations[0].location.lat, longitude: locations[0].location.lng } 
            : { latitude: 20.5937, longitude: 78.9629 });

    useEffect(() => {
        if (selectedER && mapRef.current) {
            mapRef.current.flyTo({
                center: [selectedER.location.lng, selectedER.location.lat],
                zoom: 13,
                duration: 1500
            });
        }
    }, [selectedER]);
    
    useEffect(() => {
        if(userLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 12,
                duration: 1500
            });
        }
    }, [userLocation])

    const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

    if (!mapTilerApiKey) {
        return (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-destructive text-center p-4">
                    MapTiler API key is not configured. Please add<br/>
                    <code className="bg-destructive/20 px-1 rounded-sm">NEXT_PUBLIC_MAPTILER_API_KEY</code><br/>
                     to your .env file.
                </p>
            </div>
        );
    }
    
    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerApiKey}`;
    
    return (
        <Map
            ref={mapRef}
            initialViewState={{
                ...initialCenter,
                zoom: userLocation ? 12 : 11
            }}
            style={{width: '100%', height: '100%'}}
            mapStyle={mapStyle}
        >
            {userLocation && (
                <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
                     <div className="relative">
                        <LocateFixed className="h-6 w-6 text-blue-600 animate-pulse" />
                        <span className="absolute h-6 w-6 rounded-full bg-blue-500/20 animate-ping -z-10"></span>
                    </div>
                </Marker>
            )}

            {locations.map(er => (
                <Marker
                    key={er.id}
                    longitude={er.location.lng}
                    latitude={er.location.lat}
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        onSelectER(er);
                    }}
                >
                    <Pin className={`h-8 w-8 cursor-pointer transition-transform hover:scale-110 ${selectedER?.id === er.id ? 'text-destructive fill-destructive/50' : 'text-primary fill-primary/30'}`} />
                </Marker>
            ))}

            {selectedER && (
                <Popup
                    longitude={selectedER.location.lng}
                    latitude={selectedER.location.lat}
                    onClose={() => onSelectER(null)}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={35}
                >
                     <div className="p-1 space-y-2 max-w-xs">
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
                </Popup>
            )}
        </Map>
    )
}
