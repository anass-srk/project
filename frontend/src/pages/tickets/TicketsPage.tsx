import { useState } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { notifications } from '@mantine/notifications';
import { useTickets, useCancelTicket } from '@/hooks/useTickets';
import { useTripsByIds } from '@/hooks/useTrips';
import { useDriversByIds } from '@/hooks/useDrivers';
import { Button } from '@/components/ui/Button';
import { Ticket } from '@/types/models';

export function TicketsPage() {
  const { data: tickets, isLoading: isLoadingTickets } = useTickets();
  const { data: trips, isLoading: isLoadingTrips } = useTripsByIds(
    tickets?.flatMap(ticket => ticket.tripIds)
  );
  const { data: drivers } = useDriversByIds(
    trips?.map(trip => trip.driverId)
  );
  const cancelTicket = useCancelTicket();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelTicket = async () => {
    if (!selectedTicket || !cancellationReason) return;

    try {
      await cancelTicket.mutateAsync({
        ticketId: selectedTicket.id,
        reason: cancellationReason,
      });

      notifications.show({
        title: 'Success',
        message: 'Ticket cancelled successfully',
        color: 'green',
      });
      setShowCancelModal(false);
      setSelectedTicket(null);
      setCancellationReason('');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel ticket',
        color: 'red',
      });
    }
  };

  const openCancelModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowCancelModal(true);
  };

  const getTicketTrips = (ticket: Ticket) => {
    if (!trips) return [];
    const ticketTrips = trips.filter(trip => ticket.tripIds.includes(trip.id));
    return ticketTrips.sort((a, b) => 
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
  };

  const getDriver = (driverId: string) => {
    return drivers?.find(driver => driver.id === driverId);
  };

  if (isLoadingTickets || isLoadingTrips) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        My Tickets
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {tickets?.map((ticket) => {
          const ticketTrips = getTicketTrips(ticket);
          const outboundTrip = ticketTrips[0];
          const returnTrip = ticket.roundTrip ? ticketTrips[1] : null;
          const canCancel = !ticket.cancelled && outboundTrip && !isPast(parseISO(outboundTrip.departureTime));

          return (
            <div key={ticket.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">
                      {outboundTrip?.route.name}
                    </h3>
                    {ticket.roundTrip && (
                      <span className="px-2 py-1 text-xs bg-neon-blue/10 text-neon-blue rounded-full">
                        Round trip
                      </span>
                    )}
                  </div>

                  {/* Outbound Trip */}
                  {outboundTrip && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Outbound Journey</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Date: {format(parseISO(outboundTrip.departureTime), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Time: {format(parseISO(outboundTrip.departureTime), 'p')}
                        </p>
                        {getDriver(outboundTrip.driverId) && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Driver: {getDriver(outboundTrip.driverId)?.firstName} {getDriver(outboundTrip.driverId)?.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Return Trip */}
                  {returnTrip && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Return Journey</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Date: {format(parseISO(returnTrip.departureTime), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Time: {format(parseISO(returnTrip.departureTime), 'p')}
                        </p>
                        {getDriver(returnTrip.driverId) && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Driver: {getDriver(returnTrip.driverId)?.firstName} {getDriver(returnTrip.driverId)?.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {ticket.cancelled && (
                    <p className="text-sm text-red-500 mt-4">
                      Cancelled: {ticket.cancellation?.reason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    €{ticket.price.toFixed(2)}
                  </p>
                  {canCancel && (
                    <Button
                      variant="secondary"
                      onClick={() => openCancelModal(ticket)}
                      className="mt-2"
                    >
                      Cancel ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel ticket</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for cancellation:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="input mb-4"
              rows={3}
              placeholder="Enter cancellation reason..."
            />
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCancelTicket}
                disabled={!cancellationReason}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}