import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotificationPreferences';
import { NotificationChannel, NotificationType } from '@/types/notification';

const notificationSchema = z.object({
  channel: z.nativeEnum(NotificationChannel),
  enabledNotificationTypes: z
    .array(z.nativeEnum(NotificationType))
    .min(1, 'Select at least one notification type'),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const notificationTypes = [
  { value: NotificationType.TICKET_PURCHASE, label: 'Ticket Purchases' },
  { value: NotificationType.TRIP_CANCELLATION, label: 'Trip Cancellations' },
];

const channels = [
  { value: NotificationChannel.EMAIL, label: 'Email' },
  { value: NotificationChannel.SMS, label: 'SMS' },
];

export function NotificationPreferenceForm() {
  const { user } = useAuthStore();
  const { data: preferences, isLoading } = useNotificationPreferences(user?.id);
  const updatePreferences = useUpdateNotificationPreferences();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      channel: preferences?.channel || NotificationChannel.EMAIL,
      enabledNotificationTypes: preferences?.enabledNotificationTypes || [],
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    if (!user) return;

    try {
      await updatePreferences.mutateAsync({
        id: preferences?.id,
        userId: user.id,
        ...data,
      });

      notifications.show({
        title: 'Success',
        message: 'Notification preferences updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update notification preferences',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Notification Channel
        </label>
        <div className="space-y-2">
          {channels.map((channel) => (
            <label key={channel.value} className="flex items-center space-x-2">
              <input
                type="radio"
                value={channel.value}
                {...register('channel')}
                className="form-radio text-neon-blue"
              />
              <span>{channel.label}</span>
            </label>
          ))}
        </div>
        {errors.channel && (
          <p className="mt-1 text-sm text-red-500">{errors.channel.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Notification Types
        </label>
        <div className="space-y-2">
          {notificationTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={type.value}
                {...register('enabledNotificationTypes')}
                className="form-checkbox text-neon-blue rounded"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
        {errors.enabledNotificationTypes && (
          <p className="mt-1 text-sm text-red-500">
            {errors.enabledNotificationTypes.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={updatePreferences.isPending}>
        {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
      </Button>
    </form>
  );
}
