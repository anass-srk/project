import { VoyageState } from './enums';

export interface Route {
  id: number;
  name: string;
  duration: string; // ISO duration
  stops: Stop[];
}

export interface Trip {
  id: number;
  departureTime: string; // ISO datetime
  status: VoyageState;
  duration: string; // ISO duration
  route: Route;
  driverId: string;
  bus?: Bus;
  price: number;
}

export interface Stop {
  id: number;
  order: number;
  name: string;
  latitude: number;
  longitude: number;
  arrivalTime: string; // ISO time
}

export interface Ticket {
  id: number;
  roundTrip: boolean;
  price: number;
  purchaseDate: string; // ISO datetime
  validationDate?: string; // ISO datetime
  cancelled: boolean;
  tripIds: number[];
  cancellation?: Cancellation;
}

export interface Cancellation {
  id: number;
  date: string; // ISO datetime
  reason: string;
}

export interface Bus {
  id: number;
  registrationNumber: string;
  seats: number;
}