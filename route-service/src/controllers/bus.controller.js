import prisma from '../lib/prisma.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Get all buses
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getAllBuses = async (req, res, next) => {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { registrationNumber: 'asc' },
    });
    res.json(buses);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single bus by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const getBusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = await prisma.bus.findUnique({
      where: { id: Number(id) },
    });

    if (!bus) {
      throw new NotFoundError('Bus not found');
    }

    res.json(bus);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new bus
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const createBus = async (req, res, next) => {
  try {
    const { registrationNumber, seats } = req.validatedData;

    const existingBus = await prisma.bus.findUnique({
      where: { registrationNumber },
    });

    if (existingBus) {
      throw new ValidationError([{
        field: 'registrationNumber',
        message: 'Registration number already exists',
      }]);
    }

    const bus = await prisma.bus.create({
      data: {
        registrationNumber,
        seats,
      },
    });

    res.status(201).json(bus);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing bus
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const updateBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { registrationNumber, seats } = req.validatedData;

    const existingBus = await prisma.bus.findUnique({
      where: { registrationNumber },
    });

    if (existingBus && existingBus.id !== Number(id)) {
      throw new ValidationError([{
        field: 'registrationNumber',
        message: 'Registration number already exists',
      }]);
    }

    const bus = await prisma.bus.update({
      where: { id: Number(id) },
      data: {
        registrationNumber,
        seats,
      },
    });

    res.json(bus);
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Bus not found'));
    } else {
      next(error);
    }
  }
};

/**
 * Delete a bus
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const deleteBus = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.bus.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Bus not found'));
    } else {
      next(error);
    }
  }
};