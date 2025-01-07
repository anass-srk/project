import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useTrips, useCreateTrip, useUpdateTrip, useAvailableResources } from '@/hooks/useTrips';
import { useRoutes } from '@/hooks/useRoutes';
import { useDrivers } from '@/hooks/useDrivers';
import { Role, VoyageState } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';

const tripSchema = z.object({
  routeId: z.number().min(1, 'Please select a route'),
  driverId: z.string().min(1, 'Please select a driver'),
  busId: z.number().min(1, 'Please select a bus'),
  departureTime: z.string().min(1, 'Please select departure time'),
  duration: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid duration format (HH:mm)'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
});

type TripFormData = z.infer<typeof tripSchema>;

export function TripsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: trips, isLoading: isLoadingTrips } = useTrips(selectedDate);
  const { data: routes } = useRoutes();
  const { data: drivers } = useDrivers();
  const { data: resources } = useAvailableResources(selectedDate);
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  });

  if (!user || user.role !== Role.ADMIN) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: TripFormData) => {
    try {
      const departureDateTime = `${selectedDate}T${data.departureTime}:00.000Z`;
      
      await createTrip.mutateAsync({
        ...data,
        departureTime: departureDateTime,
      });

      notifications.show({
        title: 'Success',
        message: 'Trip created successfully',
        color: 'green',
      });
      setShowForm(false);
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create trip',
        color: 'red',
      });
    }
  };

  const handleCancel = async (tripId: number) => {
    try {
      await updateTrip.mutateAsync({
        id: tripId,
        status: VoyageState.CANCELLED,
      });
      notifications.show({
        title: 'Success',
        message: 'Trip cancelled successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel trip',
        color: 'red',
      });
    }
  };

  const getAvailableDrivers = () => {
    if (!drivers || !resources) return [];
    return drivers.filter(driver => !resources.busyDriverIds.includes(driver.id));
  };

  if (isLoadingTrips) {
    return <div className="text-center py-8">Loading trips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Manage Trips
        </h1>
        {!showForm && (
          <Button onClick={() => {
            setShowForm(true);
            reset();
          }}>
            Create Trip
          </Button>
        )}
      </div>

      <div className="flex justify-end">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto"
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">New Trip</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Route
              </label>
              <select
                {...register('routeId', { valueAsNumber: true })}
                className="input"
              >
                <option value="">Select a route</option>
                {routes?.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              {errors.routeId && (
                <p className="text-sm text-red-500 mt-1">{errors.routeId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Departure Time
                </label>
                <input
                  {...register('departureTime')}
                  type="time"
                  className="input"
                />
                {errors.departureTime && (
                  <p className="text-sm text-red-500 mt-1">{errors.departureTime.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (HH:mm)
                </label>
                <input
                  {...register('duration')}
                  type="text"
                  className="input"
                  placeholder="02:30"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Driver
              </label>
              <select
                {...register('driverId')}
                className="input"
              >
                <option value="">Select a driver</option>
                {getAvailableDrivers().map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.firstName} {driver.lastName}
                  </option>
                ))}
              </select>
              {errors.driverId && (
                <p className="text-sm text-red-500 mt-1">{errors.driverId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Bus
              </label>
              <select
                {...register('busId', { valueAsNumber: true })}
                className="input"
              >
                <option value="">Select a bus</option>
                {resources?.availableBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.registrationNumber} ({bus.seats} seats)
                  </option>
                ))}
              </select>
              {errors.busId && (
                <p className="text-sm text-red-500 mt-1">{errors.busId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {trips?.map((trip) => (
          <div key={trip.id} className="card p-6">
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Bus: {trip.bus?.registrationNumber} ({trip.bus?.seats} seats)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Price: €{trip.price.toFixed(2)}
                  </p>
                  {trip.status === VoyageState.CANCELLED && (
                    <p className="text-sm text-red-500 font-semibold">
                      CANCELLED
                    </p>
                  )}
                </div>
              </div>
              {trip.status !== VoyageState.CANCELLED && (
                <Button
                  variant="secondary"
                  onClick={() => handleCancel(trip.id)}
                >
                  Cancel Trip
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}