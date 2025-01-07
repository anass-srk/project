import { useAuthStore } from '@/store/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { format, parseISO, addDays } from 'date-fns';
import { useTickets } from '@/hooks/useTickets';
import { useTripsByIds } from '@/hooks/useTrips';
import { useUserSubscription } from '@/hooks/useSubscriptions';

export function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const { data: tickets } = useTickets();
  const { data: userSubscription } = useUserSubscription(user?.id);
  
  // Get the most recent ticket
  const mostRecentTicket = tickets?.[0];
  const { data: trips } = useTripsByIds(mostRecentTicket?.tripIds);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getTicketTrips = () => {
    if (!trips || !mostRecentTicket) return [];
    return trips
      .filter(trip => mostRecentTicket.tripIds.includes(trip.id))
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
  };

  const ticketTrips = getTicketTrips();
  const outboundTrip = ticketTrips[0];
  const returnTrip = mostRecentTicket?.roundTrip ? ticketTrips[1] : null;

  const isSubscriptionActive = userSubscription && (
    addDays(
      parseISO(userSubscription.startDate),
      userSubscription.subscriptionType.duration
    ) > new Date()
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover:border-neon-blue/30 transition-all hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              className="w-full btn btn-primary"
              onClick={() => navigate('/book-ticket')}
            >
              Book a Ticket
            </button>
            <button 
              className="w-full btn btn-secondary"
              onClick={() => navigate('/schedule')}
            >
              View Schedule
            </button>
          </div>
        </div>
        
        <div className="card p-6 hover:border-neon-blue/30 transition-all hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Recent Ticket</h2>
          {mostRecentTicket && outboundTrip ? (
            <div className="space-y-3">
              <div className="flex items-center justify-evenly space-x-2">
                <h3 className="font-medium">{outboundTrip.route.name}</h3>
                {mostRecentTicket.roundTrip && (
                  <span className="px-2 py-1 text-xs bg-neon-blue/10 text-neon-blue rounded-full">
                    Round trip
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Outbound: {format(parseISO(outboundTrip.departureTime), 'PPP p')}</p>
                {returnTrip && (
                  <p>Return: {format(parseISO(returnTrip.departureTime), 'PPP p')}</p>
                )}
                <p>Price: €{mostRecentTicket.price.toFixed(2)}</p>
                {mostRecentTicket.cancelled && (
                  <p className="text-red-500">Cancelled</p>
                )}
              </div>
              <button 
                className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                onClick={() => navigate('/tickets')}
              >
                View all tickets →
              </button>
            </div>
          ) : (
            <p className="text-gray-400">No recent tickets</p>
          )}
        </div>
        
        <div className="card p-6 hover:border-neon-blue/30 transition-all hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Subscription Status</h2>
          {userSubscription && isSubscriptionActive ? (
            <div className="space-y-3">
              <h3 className="font-medium">{userSubscription.subscriptionType.name}</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Start Date: {format(parseISO(userSubscription.startDate), 'PPP')}</p>
                <p>End Date: {format(
                  addDays(
                    parseISO(userSubscription.startDate),
                    userSubscription.subscriptionType.duration
                  ),
                  'PPP'
                )}</p>
                <p>Discount: {userSubscription.subscriptionType.discount}% off all tickets</p>
              </div>
              <button 
                className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                onClick={() => navigate('/subscriptions')}
              >
                View subscription details →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-400">No active subscription</p>
              <button 
                className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                onClick={() => navigate('/subscriptions')}
              >
                Browse subscription plans →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}