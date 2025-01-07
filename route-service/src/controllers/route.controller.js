import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * @typedef {import('@prisma/client').Route} Route
 * @typedef {import('@prisma/client').Stop} Stop
 */

/**
 * Get all routes with their stops
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        stops: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(routes);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single route by ID with its stops
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getRouteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        stops: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundError('Route not found');
    }

    res.json(route);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new route with stops
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createRoute = async (req, res, next) => {
  try {
    const { name, duration, stops } = req.validatedData;

    const route = await prisma.route.create({
      data: {
        name,
        duration,
        stops: {
          create: stops,
        },
      },
      include: {
        stops: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing route and its stops
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, stops } = req.validatedData;

    // Delete existing stops and create new ones
    await prisma.$transaction([
      prisma.stop.deleteMany({
        where: { routeId: Number(id) },
      }),
      prisma.route.update({
        where: { id: Number(id) },
        data: {
          name,
          duration,
          stops: {
            create: stops,
          },
        },
      }),
    ]);

    const updatedRoute = await prisma.route.findUnique({
      where: { id: Number(id) },
      include: {
        stops: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.json(updatedRoute);
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Route not found'));
    } else {
      next(error);
    }
  }
};

/**
 * Delete a route and its associated stops
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.route.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Route not found'));
    } else {
      next(error);
    }
  }
};