import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Button } from '@/components/ui/Button';
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from '@/hooks/useDrivers';
import { Role } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/user';

const driverSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DeleteModalProps {
  driver: User;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ driver, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Delete Driver</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete driver{' '}
            <span className="font-semibold">{driver.firstName} {driver.lastName}</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DriversPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<User | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  if (!user || user.role !== Role.ADMIN) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: DriverFormData) => {
    try {
      if (editMode && selectedDriver) {
        await updateDriver.mutateAsync({
          id: selectedDriver.id,
          ...data,
        });
        notifications.show({
          title: 'Success',
          message: 'Driver updated successfully',
          color: 'green',
        });
      } else {
        await createDriver.mutateAsync({
          ...data,
          password: data.password!,
        });
        notifications.show({
          title: 'Success',
          message: 'Driver created successfully',
          color: 'green',
        });
      }
      setShowForm(false);
      setEditMode(false);
      setSelectedDriver(null);
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: editMode ? 'Failed to update driver' : 'Failed to create driver',
        color: 'red',
      });
    }
  };

  const handleEdit = (driver: User) => {
    setSelectedDriver(driver);
    setEditMode(true);
    setShowForm(true);
    reset({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
    });
  };

  const handleDeleteClick = (driver: User) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      await deleteDriver.mutateAsync(driverToDelete.id);
      notifications.show({
        title: 'Success',
        message: 'Driver deleted successfully',
        color: 'green',
      });
      setShowDeleteModal(false);
      setDriverToDelete(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete driver',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading drivers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Manage Drivers
        </h1>
        {!showForm && (
          <Button onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setSelectedDriver(null);
            reset();
          }}>
            Add Driver
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? 'Edit Driver' : 'New Driver'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  className="input"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  className="input"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {!editMode && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="input"
                  placeholder="••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditMode(false);
                  setSelectedDriver(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers?.map((driver) => (
          <div key={driver.id} className="card p-6 hover:border-neon-blue/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {driver.firstName} {driver.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {driver.email}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Joined {new Date(driver.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(driver)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteClick(driver)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && driverToDelete && (
        <DeleteModal
          driver={driverToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDriverToDelete(null);
          }}
        />
      )}
    </div>
  );
}