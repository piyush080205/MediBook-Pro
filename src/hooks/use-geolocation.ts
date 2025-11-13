"use client";

import { useState, useEffect } from 'react';

interface GeolocationState {
  isLoading: boolean;
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    isLoading: true,
    coordinates: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        isLoading: false,
        coordinates: null,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        isLoading: false,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission was denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
      }
      setState({
        isLoading: false,
        coordinates: null,
        error: errorMessage,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
    
  }, []);

  return state;
};
