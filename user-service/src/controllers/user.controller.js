import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Get the authenticated user's profile
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new ValidationError([{
        field: 'user',
        message: 'User not found'
      }]);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's email by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getUserEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ email: user.email });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the authenticated user's profile
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;

    if (newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new ValidationError([{
          field: 'currentPassword',
          message: 'Invalid current password'
        }]);
      }
    }

    const updateData = {
      firstName,
      lastName,
      email,
      ...(newPassword && {
        password: await bcrypt.hash(newPassword, 10)
      })
    };

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drivers
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: 'DRIVER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    res.json(drivers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get drivers by IDs
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getDriversByIds = async (req, res, next) => {
  try {
    const { ids } = req.query;
    const driverIds = ids.split(',');

    const drivers = await prisma.user.findMany({
      where: {
        id: { in: driverIds },
        role: 'DRIVER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    res.json(drivers);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new driver
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createDriver = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ValidationError([{
        field: 'email',
        message: 'Email already registered'
      }]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'DRIVER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing driver
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, password } = req.body;

    const updateData = {
      email,
      firstName,
      lastName,
      ...(password && {
        password: await bcrypt.hash(password, 10)
      })
    };

    const driver = await prisma.user.update({
      where: { 
        id,
        role: 'DRIVER'
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(driver);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a driver
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: {
        id,
        role: 'DRIVER'
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};