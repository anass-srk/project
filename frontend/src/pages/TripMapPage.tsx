import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useTripById } from '@/hooks/useTrips';
import { useDriversByIds } from '@/hooks/useDrivers';
import { Button } from '@/components/ui/Button';
import { format, parseISO } from 'date-fns';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { DriverLocationMarker } from '@/components/map/DriverLocationMarker';
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const polylineOptions = {
  color: '#00f3ff',
  weight: 3,
  opacity: 0.7,
};

export function TripMapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: trip, isLoading } = useTripById(Number(id));
  const { data: drivers } = useDriversByIds(trip ? [trip.driverId] : []);
  const driver = drivers?.[0];
  const isDriverOfTrip = user?.role === 'DRIVER' && trip?.driverId === user?.id;

  // Initialize driver location tracking
  useDriverLocation(trip);

  // Connect to socket when component mounts
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading trip details...</div>;
  }

  if (!trip) {
    return <div className="text-center py-8">Trip not found</div>;
  }

  const firstStop = trip.route.stops[0];
  const center = [firstStop.latitude, firstStop.longitude];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center p-4 bg-light-800 dark:bg-dark-800 border-b border-gray-200 dark:border-neon-blue/20">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            {trip.route.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Departure: {format(parseISO(trip.departureTime), 'PPP p')}
          </p>
          {driver && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Driver: {driver.firstName} {driver.lastName}
              {isDriverOfTrip && <span className="ml-2 text-neon-blue">(You)</span>}
            </p>
          )}
          {isDriverOfTrip && (
            <p className="text-sm text-neon-blue mt-1">
              Your location is being shared in real-time
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back to Schedule
        </Button>
      </div>

      <div className="flex-1">
        <MapContainer
          center={center as [number, number]}
          zoom={12}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {trip.route.stops.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{stop.name}</p>
                  <p className="text-sm text-gray-600">
                    Arrival: {stop.arrivalTime}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          <Polyline
            positions={trip.route.stops.map(stop => [stop.latitude, stop.longitude])}
            {...polylineOptions}
          />
          {driver && (
            <DriverLocationMarker 
              tripId={trip.id} 
              driverName={`${driver.firstName} ${driver.lastName}`} 
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}