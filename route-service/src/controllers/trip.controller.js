import prisma from '../lib/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { TripService } from '../services/trip.service.js';

const tripService = new TripService();

/**
 * Get all trips, optionally filtered by date
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllTrips = async (req, res, next) => {
  try {
    const { date } = req.query;
    
    const whereClause = date ? {
      departureTime: {
        gte: startOfDay(parseISO(date)),
        lte: endOfDay(parseISO(date)),
      },
    } : {};

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

/**
 * Get trips by IDs
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getTripsByIds = async (req, res, next) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      throw new ValidationError([{
        field: 'ids',
        message: 'Trip IDs are required',
      }]);
    }

    const tripIds = ids.split(',').map(Number);
    const trips = await prisma.trip.findMany({
      where: {
        id: { in: tripIds },
      },
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single trip by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id: Number(id) },
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available drivers and buses for a specific date
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAvailableResources = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      throw new ValidationError([{
        field: 'date',
        message: 'Date is required',
      }]);
    }

    const startDate = startOfDay(parseISO(date));
    const endDate = endOfDay(parseISO(date));

    // Find all trips on the given date
    const busyTrips = await prisma.trip.findMany({
      where: {
        departureTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        driverId: true,
        busId: true,
      },
    });

    const busyDriverIds = busyTrips.map(trip => trip.driverId);
    const busyBusIds = busyTrips.map(trip => trip.busId).filter(Boolean);

    // Get available buses
    const availableBuses = await prisma.bus.findMany({
      where: {
        id: {
          notIn: busyBusIds,
        },
      },
    });

    res.json({
      busyDriverIds,
      busyBusIds,
      availableBuses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new trip
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createTrip = async (req, res, next) => {
  try {
    const { routeId, departureTime, duration, price, driverId, busId } = req.validatedData;

    // Get the bus to set initial available places
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      select: { seats: true },
    });

    if (!bus) {
      throw new NotFoundError('Bus not found');
    }

    const trip = await prisma.trip.create({
      data: {
        routeId,
        departureTime,
        duration,
        price,
        driverId,
        busId,
        availablePlaces: bus.seats,
      },
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing trip
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // If busId is being updated, set available places to new bus capacity
    if (updateData.busId) {
      const bus = await prisma.bus.findUnique({
        where: { id: updateData.busId },
        select: { seats: true },
      });

      if (!bus) {
        throw new NotFoundError('Bus not found');
      }

      updateData.availablePlaces = bus.seats;
    }

    // If status is being updated to CANCELLED, notify payment service
    if (updateData.status === 'CANCELLED') {
      await tripService.cancelTrip(Number(id));
    }

    const trip = await prisma.trip.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
    });

    res.json(trip);
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Trip not found'));
    } else {
      next(error);
    }
  }
};

/**
 * Delete a trip
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.trip.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Trip not found'));
    } else {
      next(error);
    }
  }
};

/**
 * Get upcoming trips from a specific date
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getUpcomingTrips = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    
    if (!startDate) {
      throw new ValidationError([{
        field: 'startDate',
        message: 'Start date is required'
      }]);
    }

    const trips = await prisma.trip.findMany({
      where: {
        departureTime: {
          gte: new Date(startDate)
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        route: {
          include: {
            stops: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        bus: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};