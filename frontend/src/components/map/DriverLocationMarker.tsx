import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { socket } from '@/lib/socket';

const driverIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DriverLocationMarkerProps {
  tripId: number;
  driverName: string;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function DriverLocationMarker({ tripId, driverName }: DriverLocationMarkerProps) {
  const [location, setLocation] = useState<DriverLocation | null>(null);

  useEffect(() => {
    const handleDriverLocation = (data: { tripId: number; location: DriverLocation }) => {
      if (data.tripId === tripId) {
        setLocation(data.location);
      }
    };

    socket.on('driverLocation', handleDriverLocation);

    return () => {
      socket.off('driverLocation', handleDriverLocation);
    };
  }, [tripId]);

  if (!location) return null;

  return (
    <Marker position={[location.latitude, location.longitude]} icon={driverIcon}>
      <Popup>
        <div className="p-2">
          <p className="font-semibold">{driverName}</p>
          <p className="text-sm text-gray-600">
            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}