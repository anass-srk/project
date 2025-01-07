import { format, parseISO } from 'date-fns';
import { Trip } from '@/types/models';
// import { VoyageState } from '@/types/enums';
import { useDriversByIds } from '@/hooks/useDrivers';

interface TripCardProps {
  trip: Trip;
  isSelected?: boolean;
  onSelect: () => void;
  discountedPrice?: number;
  discount?: number;
}

export function TripCard({ trip, isSelected, onSelect, discountedPrice, discount }: TripCardProps) {
  const { data: drivers } = useDriversByIds([trip.driverId]);
  const driver = drivers?.[0];
  // const isAvailable = trip.status === VoyageState.PENDING || trip.status === VoyageState.IN_PROGRESS;

  return (
    <div 
      className={`card p-6 hover:border-neon-blue/30 transition-all cursor-pointer ${
        isSelected ? 'border-neon-blue shadow-neon' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            {trip.route.name}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Departure: {format(parseISO(trip.departureTime), 'h:mm a')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Duration: {trip.duration}
            </p>
            {driver && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Driver: {driver.firstName} {driver.lastName}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {discountedPrice && discountedPrice !== trip.price ? (
            <>
              <p className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                €{discountedPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="line-through">€{trip.price.toFixed(2)}</span>
                <span className="text-green-500 ml-2">Save {discount}%</span>
              </p>
            </>
          ) : (
            <p className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              €{trip.price.toFixed(2)}
            </p>
          )}
          {trip.bus && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Available seats: {trip.bus.seats}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Bus: {trip.bus?.registrationNumber}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">Stops:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {trip.route.stops.map((stop) => (
            <span
              key={stop.id}
              className="px-2 py-1 bg-light-700 dark:bg-dark-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neon-blue/20"
            >
              {stop.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}