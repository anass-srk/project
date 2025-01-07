import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useSubscriptionTypes, useCreateSubscriptionType, useUpdateSubscriptionType } from '@/hooks/useSubscriptions';
import { Role } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionType, subscriptionTypeSchema, SubscriptionTypeFormData } from '@/types/subscription';

export function SubscriptionTypesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: subscriptionTypes, isLoading } = useSubscriptionTypes();
  const createSubscriptionType = useCreateSubscriptionType();
  const updateSubscriptionType = useUpdateSubscriptionType();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedType, setSelectedType] = useState<SubscriptionType | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubscriptionTypeFormData>({
    resolver: zodResolver(subscriptionTypeSchema),
  });

  if (!user || user.role !== Role.ADMIN) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: SubscriptionTypeFormData) => {
    try {
      const formattedData = {
        ...data,
        availabilityStartDate: new Date(data.availabilityStartDate).toISOString(),
        availabilityEndDate: new Date(data.availabilityEndDate).toISOString(),
      };

      if (editMode && selectedType) {
        await updateSubscriptionType.mutateAsync({
          id: selectedType.id,
          ...formattedData,
        });
        notifications.show({
          title: 'Success',
          message: 'Subscription type updated successfully',
          color: 'green',
        });
      } else {
        await createSubscriptionType.mutateAsync(formattedData);
        notifications.show({
          title: 'Success',
          message: 'Subscription type created successfully',
          color: 'green',
        });
      }
      setShowForm(false);
      setEditMode(false);
      setSelectedType(null);
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: editMode ? 'Failed to update subscription type' : 'Failed to create subscription type',
        color: 'red',
      });
    }
  };

  const handleEdit = (type: SubscriptionType) => {
    setSelectedType(type);
    setEditMode(true);
    setShowForm(true);
    reset({
      name: type.name,
      duration: type.duration,
      availabilityStartDate: format(new Date(type.availabilityStartDate), "yyyy-MM-dd'T'HH:mm"),
      availabilityEndDate: format(new Date(type.availabilityEndDate), "yyyy-MM-dd'T'HH:mm"),
      price: type.price,
      discount: type.discount,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading subscription types...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Manage Subscription Types
        </h1>
        {!showForm && (
          <Button onClick={() => {
            setShowForm(true);
            setEditMode(false);
            setSelectedType(null);
            reset();
          }}>
            Add Subscription Type
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? 'Edit Subscription Type' : 'New Subscription Type'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                {...register('name')}
                className="input"
                placeholder="e.g., Monthly Pass"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (days)
              </label>
              <input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                className="input"
                min={1}
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Available From
                </label>
                <input
                  {...register('availabilityStartDate')}
                  type="datetime-local"
                  className="input"
                />
                {errors.availabilityStartDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.availabilityStartDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Available Until
                </label>
                <input
                  {...register('availabilityEndDate')}
                  type="datetime-local"
                  className="input"
                />
                {errors.availabilityEndDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.availabilityEndDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (€)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="input"
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount (%)
                </label>
                <input
                  {...register('discount', { valueAsNumber: true })}
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  className="input"
                />
                {errors.discount && (
                  <p className="text-sm text-red-500 mt-1">{errors.discount.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditMode(false);
                  setSelectedType(null);
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

      <div className="grid grid-cols-1 gap-4">
        {subscriptionTypes?.map((type) => (
          <div key={type.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{type.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>Duration: {type.duration} days</p>
                  <p>Price: €{type.price.toFixed(2)}</p>
                  <p>Discount: {type.discount}%</p>
                  <p>Available from: {format(parseISO(type.availabilityStartDate), 'PPP p')}</p>
                  <p>Available until: {format(parseISO(type.availabilityEndDate), 'PPP p')}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleEdit(type)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}