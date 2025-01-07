import prisma from '../lib/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { addDays } from 'date-fns';

/**
 * Get all subscriptions
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        subscriptionType: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single subscription by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: {
        subscriptionType: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getUserSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: {
        subscriptionType: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { userId, subscriptionTypeId } = req.validatedData;

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        startDate: {
          lte: new Date(),
        },
        AND: {
          OR: [
            {
              subscriptionType: {
                duration: {
                  gt: 0,
                },
              },
            },
          ],
        },
      },
      include: {
        subscriptionType: true,
      },
    });

    if (existingSubscription) {
      const endDate = addDays(new Date(existingSubscription.startDate), existingSubscription.subscriptionType.duration);
      if (endDate > new Date()) {
        throw new ValidationError([{
          field: 'userId',
          message: 'User already has an active subscription',
        }]);
      }
    }

    // Check if subscription type exists and is available
    const subscriptionType = await prisma.subscriptionType.findUnique({
      where: { id: subscriptionTypeId },
    });

    if (!subscriptionType) {
      throw new NotFoundError('Subscription type not found');
    }

    const now = new Date();
    if (now < subscriptionType.availabilityStartDate || now > subscriptionType.availabilityEndDate) {
      throw new ValidationError([{
        field: 'subscriptionTypeId',
        message: 'Subscription type is not available at this time',
      }]);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        subscriptionTypeId,
        startDate: new Date(),
      },
      include: {
        subscriptionType: true,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: {
        subscriptionType: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Delete the subscription
    await prisma.subscription.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};