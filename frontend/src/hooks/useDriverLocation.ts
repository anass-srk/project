import { useEffect, useCallback } from 'react';
import { socket, connectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { VoyageState } from '@/types/enums';
import { Trip } from '@/types/models';

export function useDriverLocation(trip?: Trip) {

  console.info("HMMMMM1");

  const { user } = useAuthStore();
  const isDriver = user?.role === 'DRIVER';
  const isDriverOfTrip = isDriver && trip?.driverId === user?.id;
  const isTripActive = trip?.status === VoyageState.IN_PROGRESS;

  const sendLocation = useCallback((position: GeolocationPosition) => {
    console.info("HMMMMM2");
    if (!trip?.id) return;

    socket.emit('updateDriverLocation', {
      tripId: trip.id,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString(),
      },
    });

    console.log({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

  }, [trip?.id]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.info("HMMMMM3");
    console.error('Error getting location:', error);
  }, []);

  useEffect(() => {
    console.info(isTripActive);

    // if (!isDriverOfTrip || !isTripActive) return;
    if (!isDriverOfTrip) return;


    connectSocket();

    const watchId = navigator.geolocation.watchPosition(sendLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    console.info("WATCHID : ",watchId)

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isDriverOfTrip, isTripActive, sendLocation, handleError]);
}