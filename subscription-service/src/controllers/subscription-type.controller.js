import prisma from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Get all subscription types
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllSubscriptionTypes = async (req, res, next) => {
  try {
    const subscriptionTypes = await prisma.subscriptionType.findMany({
      orderBy: {
        price: 'asc',
      },
    });
    res.json(subscriptionTypes);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single subscription type by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getSubscriptionTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscriptionType = await prisma.subscriptionType.findUnique({
      where: { id: Number(id) },
    });

    if (!subscriptionType) {
      throw new NotFoundError('Subscription type not found');
    }

    res.json(subscriptionType);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new subscription type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createSubscriptionType = async (req, res, next) => {
  try {
    const { name, duration, availabilityStartDate, availabilityEndDate, price, discount } = req.validatedData;

    const subscriptionType = await prisma.subscriptionType.create({
      data: {
        name,
        duration,
        availabilityStartDate,
        availabilityEndDate,
        price,
        discount,
      },
    });

    res.status(201).json(subscriptionType);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing subscription type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updateSubscriptionType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, duration, availabilityStartDate, availabilityEndDate, price, discount } = req.validatedData;

    const subscriptionType = await prisma.subscriptionType.update({
      where: { id: Number(id) },
      data: {
        name,
        duration,
        availabilityStartDate,
        availabilityEndDate,
        price,
        discount,
      },
    });

    res.json(subscriptionType);
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Subscription type not found'));
    } else {
      next(error);
    }
  }
};

/**
 * Delete a subscription type
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const deleteSubscriptionType = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.subscriptionType.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Subscription type not found'));
    } else {
      next(error);
    }
  }
};