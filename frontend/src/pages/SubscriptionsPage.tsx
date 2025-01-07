import { useNavigate } from "react-router-dom";
import { format, addDays, parseISO } from "date-fns";
import { notifications } from "@mantine/notifications";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import {
  useSubscriptionTypes,
  useUserSubscription,
  useCreateSubscription,
  useCancelSubscription,
} from "@/hooks/useSubscriptions";
import { SubscriptionType } from "@/types/subscription";
import { useState } from "react";

interface CancelModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function CancelModal({ onConfirm, onCancel }: CancelModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Cancel Subscription</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to cancel your subscription? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onCancel}>
            Keep Subscription
          </Button>
          <Button onClick={onConfirm} className="!bg-red-600 hover:!bg-red-700">
            Cancel Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data: subscriptionTypes, isLoading: isLoadingTypes } = useSubscriptionTypes();
  const { data: userSubscription, isLoading: isLoadingSubscription } = useUserSubscription(user?.id);
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSubscribe = async (type: SubscriptionType) => {
    try {
      await createSubscription.mutateAsync({
        userId: user.id,
        subscriptionTypeId: type.id,
      });
      notifications.show({
        title: "Success",
        message: "Successfully subscribed!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to subscribe",
        color: "red",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription) return;

    try {
      await cancelSubscription.mutateAsync(userSubscription.id);
      notifications.show({
        title: "Success",
        message: "Subscription cancelled successfully",
        color: "green",
      });
      setShowCancelModal(false);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to cancel subscription",
        color: "red",
      });
    }
  };

  const isSubscriptionActive =
    userSubscription &&
    addDays(
      parseISO(userSubscription.startDate),
      userSubscription.subscriptionType.duration
    ) > new Date();

  if (isLoadingTypes || isLoadingSubscription) {
    return <div className="text-center py-8">Loading subscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        Subscriptions
      </h1>

      {isSubscriptionActive && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Active Subscription</h2>
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {userSubscription.subscriptionType.name}
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              €{userSubscription.subscriptionType.price}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-500 ml-2">Save {userSubscription.subscriptionType.discount}% on all tickets!</span>
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Start Date: {format(parseISO(userSubscription.startDate), "PPP")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              End Date:{" "}
              {format(
                addDays(
                  parseISO(userSubscription.startDate),
                  userSubscription.subscriptionType.duration
                ),
                "PPP"
              )}
            </p>

            <div className="pt-4">
              <Button
                variant="secondary"
                className="!bg-red-600 hover:!bg-red-700 text-white"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTypes?.map((type) => {
          const isAvailable =
            new Date() >= new Date(type.availabilityStartDate) &&
            new Date() <= new Date(type.availabilityEndDate);

          return (
            <div key={type.id} className="card p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{type.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.duration} days
                  </p>
                </div>

                <div>
                  {type.discount > 0 ? (
                    <div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                        €{type.price}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-green-500 ml-2">
                          Save {type.discount}% on all tickets!
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                      €{type.price.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    Available from:{" "}
                    {format(parseISO(type.availabilityStartDate), "PPP")}
                  </p>
                  <p>
                    Available until:{" "}
                    {format(parseISO(type.availabilityEndDate), "PPP")}
                  </p>
                </div>

                <Button
                  className="w-full"
                  disabled={!isAvailable || (isSubscriptionActive == true)}
                  onClick={() => handleSubscribe(type)}
                >
                  {isSubscriptionActive
                    ? "Already Subscribed"
                    : isAvailable
                    ? "Subscribe"
                    : "Not Available"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelSubscription}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}