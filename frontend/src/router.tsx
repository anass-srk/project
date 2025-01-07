import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookTicketPage } from './pages/tickets/BookTicketPage';
import { TicketsPage } from './pages/tickets/TicketsPage';
import { SchedulePage } from './pages/SchedulePage';
import { TripMapPage } from './pages/TripMapPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotificationPreferencesPage } from './pages/profile/NotificationPreferencesPage';
import { RoutesPage } from './pages/admin/RoutesPage';
import { DriversPage } from './pages/admin/DriversPage';
import { BusesPage } from './pages/admin/BusesPage';
import { TripsPage } from './pages/admin/TripsPage';
import { SubscriptionTypesPage } from './pages/admin/SubscriptionTypesPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/book-ticket',
        element: <BookTicketPage />,
      },
      {
        path: '/tickets',
        element: <TicketsPage />,
      },
      {
        path: '/schedule',
        element: <SchedulePage />,
      },
      {
        path: '/trips/:id',
        element: <TripMapPage />,
      },
      {
        path: '/subscriptions',
        element: <SubscriptionsPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/notifications',
        element: <NotificationPreferencesPage />,
      },
      {
        path: '/admin/routes',
        element: <RoutesPage />,
      },
      {
        path: '/admin/drivers',
        element: <DriversPage />,
      },
      {
        path: '/admin/buses',
        element: <BusesPage />,
      },
      {
        path: '/admin/trips',
        element: <TripsPage />,
      },
      {
        path: '/admin/subscription-types',
        element: <SubscriptionTypesPage />,
      },
    ],
  },
]);