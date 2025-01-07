import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore } from 'date-fns';
import { notifications } from '@mantine/notifications';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/components/tickets/TripCard';
import { useTrips } from '@/hooks/useTrips';
import { useBookTicket } from '@/hooks/useTickets';
import { useUserSubscription } from '@/hooks/useSubscriptions';
import { useAuthStore } from '@/store/authStore';
import { Trip } from '@/types/models';
import { VoyageState } from '@/types/enums';

export function BookTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedOutboundDate, setSelectedOutboundDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [selectedOutboundTrip, setSelectedOutboundTrip] = useState<Trip | null>(
    null
  );
  const [selectedReturnTrip, setSelectedReturnTrip] = useState<Trip | null>(
    null
  );

  const { data: outboundTrips, isLoading: isLoadingOutbound } =
    useTrips(selectedOutboundDate);
  const { data: returnTrips, isLoading: isLoadingReturn } = useTrips(
    isRoundTrip ? selectedReturnDate : undefined
  );
  const { data: userSubscription } = useUserSubscription(user?.id);
  const bookTicket = useBookTicket();

  const handleOutboundDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = event.target.value;
    setSelectedOutboundDate(newDate);
    setSelectedOutboundTrip(null);

    if (isBefore(new Date(selectedReturnDate), new Date(newDate))) {
      setSelectedReturnDate(newDate);
      setSelectedReturnTrip(null);
    }
  };

  const handleReturnDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedReturnDate(event.target.value);
    setSelectedReturnTrip(null);
  };

  const calculateDiscountedPrice = (price: number) => {
    if (!userSubscription) return price;

    const discount = userSubscription.subscriptionType.discount;
    return price * (1 - discount / 100);
  };

  const handleBooking = async () => {
    if (!selectedOutboundTrip) return;

    const tripIds = [selectedOutboundTrip.id];
    if (isRoundTrip && selectedReturnTrip) {
      tripIds.push(selectedReturnTrip.id);
    }

    try {
      await bookTicket.mutateAsync({
        roundTrip: isRoundTrip,
        price: totalPrice,
        tripIds,
      });

      notifications.show({
        title: 'Success',
        message: 'Ticket booking initiated !',
        color: 'yellow',
      });
      navigate('/tickets');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to book ticket',
        color: 'red',
      });
    }
  };

  const rawTotalPrice =
    (selectedOutboundTrip?.price ?? 0) +
    (isRoundTrip ? selectedReturnTrip?.price ?? 0 : 0);

  const totalPrice = calculateDiscountedPrice(rawTotalPrice);

  const isLoading = isLoadingOutbound || (isRoundTrip && isLoadingReturn);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Book a Ticket
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isRoundTrip}
              onChange={(e) => {
                setIsRoundTrip(e.target.checked);
                setSelectedReturnTrip(null);
              }}
              className="form-checkbox h-4 w-4 text-neon-blue rounded border-gray-300"
            />
            <span className="text-sm font-medium">Round Trip</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="outboundDate"
            className="text-sm font-medium whitespace-nowrap"
          >
            Outbound Date
          </label>
          <input
            type="date"
            id="outboundDate"
            value={selectedOutboundDate}
            onChange={handleOutboundDateChange}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="input w-auto"
          />
        </div>

        {isRoundTrip && (
          <div className="flex items-center space-x-2">
            <label
              htmlFor="returnDate"
              className="text-sm font-medium whitespace-nowrap"
            >
              Return Date
            </label>
            <input
              type="date"
              id="returnDate"
              value={selectedReturnDate}
              onChange={handleReturnDateChange}
              min={selectedOutboundDate}
              className="input w-auto"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading trips...</div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Outbound Journey</h2>
            <div className="grid grid-cols-1 gap-4">
              {outboundTrips?.filter((trip) => trip.status != VoyageState.CANCELLED).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isSelected={selectedOutboundTrip?.id === trip.id}
                  onSelect={() => setSelectedOutboundTrip(trip)}
                  discountedPrice={calculateDiscountedPrice(trip.price)}
                  discount={userSubscription?.subscriptionType.discount}
                />
              ))}
            </div>
          </div>

          {isRoundTrip && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Return Journey</h2>
              <div className="grid grid-cols-1 gap-4">
                {returnTrips?.filter((trip) => trip.status != VoyageState.CANCELLED).map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    isSelected={selectedReturnTrip?.id === trip.id}
                    onSelect={() => setSelectedReturnTrip(trip)}
                    discountedPrice={calculateDiscountedPrice(trip.price)}
                    discount={userSubscription?.subscriptionType.discount}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-lg font-semibold">Total Price</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRoundTrip ? 'Round trip' : 'One way'}
                </p>
              </div>
              <div className="text-right">
                {userSubscription ? (
                  <>
                    <p className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                      €{totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="line-through">
                        €{rawTotalPrice.toFixed(2)}
                      </span>
                      <span className="text-green-500 ml-2">
                        Save {userSubscription.subscriptionType.discount}%
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    €{totalPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleBooking}
              className="w-full mt-4"
              disabled={
                !selectedOutboundTrip || (isRoundTrip && !selectedReturnTrip)
              }
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}