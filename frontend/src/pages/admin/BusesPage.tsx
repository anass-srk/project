import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Button } from '@/components/ui/Button';
import { useBuses, useCreateBus, useUpdateBus, useDeleteBus } from '@/hooks/useBuses';
import { Role } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import { Bus } from '@/types/models';

interface DeleteModalProps {
  bus: Bus;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ bus, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Delete Bus</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Are you sure you want to delete bus{' '}
            <span className="font-semibold">{bus.registrationNumber}</span>?
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

const busSchema = z.object({
  registrationNumber: z.string().min(3, "Registration number must contain at least 3 characters"),
  seats: z.number().min(1, 'Number of seats must be greater than 0'),
});

type BusFormData = z.infer<typeof busSchema>;

export function BusesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: buses, isLoading } = useBuses();
  const createBus = useCreateBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
  });

  if (!user || user.role !== Role.ADMIN) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: BusFormData) => {
    try {
      if (editMode && selectedBus) {
        await updateBus.mutateAsync({
          id: selectedBus.id,
          ...data,
        });
        notifications.show({
          title: 'Success',
          message: 'Bus updated successfully',
          color: 'green',
        });
      } else {
        await createBus.mutateAsync(data);
        notifications.show({
          title: 'Success',
          message: 'Bus created successfully',
          color: 'green',
        });
      }
      setShowForm(false);
      setEditMode(false);
      setSelectedBus(null);
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: editMode ? 'Failed to update bus' : 'Failed to create bus',
        color: 'red',
      });
    }
  };

  const handleEdit = (bus: Bus) => {
    setSelectedBus(bus);
    setEditMode(true);
    setShowForm(true);
    reset({
      registrationNumber: bus.registrationNumber,
      seats: bus.seats,
    });
  };

  const handleDeleteClick = (bus: Bus) => {
    setBusToDelete(bus);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!busToDelete) return;

    try {
      await deleteBus.mutateAsync(busToDelete.id);
      notifications.show({
        title: 'Success',
        message: 'Bus deleted successfully',
        color: 'green',
      });
      setShowDeleteModal(false);
      setBusToDelete(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete bus',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading buses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Manage Buses
        </h1>
        {!showForm && (
          <Button onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setSelectedBus(null);
            reset();
          }}>
            Add Bus
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? 'Edit Bus' : 'New Bus'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration Number
              </label>
              <input
                {...register('registrationNumber')}
                className="input"
                placeholder="e.g., BUS-001"
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Seats
              </label>
              <input
                {...register('seats', { valueAsNumber: true })}
                type="number"
                className="input"
                min={1}
              />
              {errors.seats && (
                <p className="text-sm text-red-500 mt-1">{errors.seats.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditMode(false);
                  setSelectedBus(null);
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
        {buses?.map((bus) => (
          <div key={bus.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {bus.registrationNumber}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {bus.seats} seats
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(bus)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDeleteClick(bus)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && busToDelete && (
        <DeleteModal
          bus={busToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setBusToDelete(null);
          }}
        />
      )}
    </div>
  );
}