import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUpcomingTrips } from '@/hooks/useTrips';
import { useDriversByIds } from '@/hooks/useDrivers';

export function SchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: trips, isLoading } = useUpcomingTrips(selectedDate);
  const { data: drivers } = useDriversByIds(
    trips?.map(trip => trip.driverId)
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  const getDriver = (driverId: string) => {
    return drivers?.find(driver => driver.id === driverId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        Schedule
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {trips?.map((trip) => (
          <div 
            key={trip.id} 
            className="card p-6 hover:border-neon-blue/30 transition-all cursor-pointer"
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {trip.route.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Departure: {format(parseISO(trip.departureTime), 'PPP p')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Duration: {trip.duration}
                  </p>
                  {trip.bus && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Bus: {trip.bus.registrationNumber} ({trip.bus.seats} seats)
                    </p>
                  )}
                  {getDriver(trip.driverId) && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Driver: {getDriver(trip.driverId)?.firstName} {getDriver(trip.driverId)?.lastName}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stops:</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {trip.route.stops.map((stop) => (
                      <span
                        key={stop.id}
                        className="px-2 py-1 bg-light-700 dark:bg-dark-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neon-blue/20"
                      >
                        {stop.name} ({stop.arrivalTime})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  €{trip.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {(!trips || trips.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No upcoming trips found
          </div>
        )}
      </div>
    </div>
  );
}