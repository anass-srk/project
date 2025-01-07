import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NotificationPreferenceForm } from '@/components/notifications/NotificationPreferenceForm';

export function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-6">
          Notification Preferences
        </h1>
        <NotificationPreferenceForm />
      </div>
    </div>
  );
}