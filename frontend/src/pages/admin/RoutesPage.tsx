import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Button } from '@/components/ui/Button';
import { useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/hooks/useRoutes';
import { Role } from '@/types/enums';
import { useAuthStore } from '@/store/authStore';
import { Route, Stop } from '@/types/models';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const routeSchema = z.object({
  name: z.string().min(3, 'Route name must be at least 3 characters'),
  duration: z.string().regex(timeRegex, 'Invalid duration format (HH:MM)'),
});

const stopSchema = z.object({
  name: z.string().min(1, 'Stop name is required'),
  arrivalTime: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
});

type RouteFormData = z.infer<typeof routeSchema>;
type StopFormData = z.infer<typeof stopSchema>;

interface MapEventsProps {
  onLocationSelect: (latlng: LatLng) => void;
}

interface DeleteModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface StopModalProps {
  isOpen: boolean;
  stop?: Stop;
  onClose: () => void;
  onSubmit: (data: StopFormData) => void;
}

function MapEvents({ onLocationSelect }: MapEventsProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function DeleteModal({ title, message, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="card p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="!bg-red-600 hover:!bg-red-700">Delete</Button>
        </div>
      </div>
    </div>
  );
}

function StopModal({ isOpen, stop, onClose, onSubmit }: StopModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<StopFormData>({
    resolver: zodResolver(stopSchema),
    defaultValues: stop ? {
      name: stop.name,
      arrivalTime: stop.arrivalTime,
    } : undefined,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="card p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{stop ? 'Edit Stop' : 'New Stop'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stop Name</label>
            <input
              {...register('name')}
              className="input"
              placeholder="e.g., Central Station"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Arrival Time (HH:MM)</label>
            <input
              {...register('arrivalTime')}
              className="input"
              placeholder="00:00"
            />
            {errors.arrivalTime && (
              <p className="text-sm text-red-500 mt-1">{errors.arrivalTime.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {stop ? 'Update' : 'Add'} Stop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const polylineOptions = {
  color: '#00f3ff',
  weight: 3,
  opacity: 0.7,
};

export function RoutesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: routes, isLoading } = useRoutes();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const [selectedStops, setSelectedStops] = useState<Array<Stop & { lat: number; lng: number }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [pendingLocation, setPendingLocation] = useState<LatLng | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
  });

  if (!user || user.role !== Role.ADMIN) {
    navigate('/');
    return null;
  }

  const handleLocationSelect = (latlng: LatLng) => {
    setPendingLocation(latlng);
    setShowStopModal(true);
  };

  const handleStopSubmit = (data: StopFormData) => {
    if (!pendingLocation && !selectedStop) return;

    if (selectedStop) {
      // Edit existing stop
      setSelectedStops(stops =>
        stops.map(stop =>
          stop.id === selectedStop.id
            ? { ...stop, name: data.name, arrivalTime: data.arrivalTime }
            : stop
        )
      );
    } else if (pendingLocation) {
      // Add new stop
      setSelectedStops([
        ...selectedStops,
        {
          id: Date.now(),
          order: selectedStops.length,
          name: data.name,
          latitude: pendingLocation.lat,
          longitude: pendingLocation.lng,
          lat: pendingLocation.lat,
          lng: pendingLocation.lng,
          arrivalTime: data.arrivalTime,
          // routeId: selectedRoute?.id || 0,
        },
      ]);
    }

    setShowStopModal(false);
    setSelectedStop(null);
    setPendingLocation(null);
  };

  const handleEditStop = (stop: Stop) => {
    setSelectedStop(stop);
    setShowStopModal(true);
  };

  const handleDeleteStop = (stopToDelete: Stop) => {
    setSelectedStops(stops => stops.filter(stop => stop.id !== stopToDelete.id));
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setEditMode(true);
    setShowForm(true);
    reset({
      name: route.name,
      duration: route.duration,
    });
    setSelectedStops(
      route.stops.map(stop => ({
        ...stop,
        lat: stop.latitude,
        lng: stop.longitude,
      }))
    );
  };

  const onSubmit = async (data: RouteFormData) => {
    if (selectedStops.length < 2) {
      notifications.show({
        title: 'Error',
        message: 'A route must have at least 2 stops',
        color: 'red',
      });
      return;
    }

    try {
      const routeData = {
        name: data.name,
        duration: data.duration,
        stops: selectedStops.map((stop, index) => ({
          name: stop.name,
          order: index,
          latitude: stop.latitude,
          longitude: stop.longitude,
          arrivalTime: stop.arrivalTime,
        })),
      };

      if (editMode && selectedRoute) {
        await updateRoute.mutateAsync({
          id: selectedRoute.id,
          ...routeData,
        });
        notifications.show({
          title: 'Success',
          message: 'Route updated successfully',
          color: 'green',
        });
      } else {
        await createRoute.mutateAsync(routeData);
        notifications.show({
          title: 'Success',
          message: 'Route created successfully',
          color: 'green',
        });
      }
      setShowForm(false);
      setSelectedStops([]);
      setEditMode(false);
      setSelectedRoute(null);
      reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: editMode ? 'Failed to update route' : 'Failed to create route',
        color: 'red',
      });
    }
  };

  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;

    try {
      await deleteRoute.mutateAsync(selectedRoute.id);
      notifications.show({
        title: 'Success',
        message: 'Route deleted successfully',
        color: 'green',
      });
      setShowDeleteModal(false);
      setSelectedRoute(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete route',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading routes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Manage Routes
        </h1>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              setSelectedRoute(null);
              reset();
              setSelectedStops([]);
            }}
          >
            Add Route
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? "Edit Route" : "New Route"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Route Name
              </label>
              <input
                {...register("name")}
                className="input"
                placeholder="e.g., Downtown → Airport"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (HH:MM)
              </label>
              <input
                {...register("duration")}
                className="input"
                placeholder="01:30"
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stops ({selectedStops.length})
              </label>
              <div className="h-[400px] mb-4">
                <MapContainer
                  center={[34.020882, -6.84165]}
                  zoom={13}
                  className="h-full rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapEvents onLocationSelect={handleLocationSelect} />
                  {selectedStops.map((stop) => (
                    <Marker
                      key={stop.id}
                      position={[stop.latitude, stop.longitude]}
                      icon={defaultIcon}
                    >
                      <Popup>
                        <div className="space-y-2">
                          <p className="font-semibold">{stop.name}</p>
                          <p className="text-sm">Arrival: {stop.arrivalTime}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditStop(stop)}
                              className="text-sm text-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStop(stop)}
                              className="text-sm text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {selectedStops.length > 1 && (
                    <Polyline
                      positions={selectedStops.map((stop) => [
                        stop.latitude,
                        stop.longitude,
                      ])}
                      {...polylineOptions}
                    />
                  )}
                </MapContainer>
              </div>
              <p className="text-sm text-gray-500">
                Click on the map to add stops
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedStops([]);
                  setEditMode(false);
                  setSelectedRoute(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={selectedStops.length < 2}>
                {editMode ? "Update" : "Create"} Route
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {routes?.map((route) => (
          <div
            key={route.id}
            className={`card p-6 cursor-pointer transition-all duration-300 ${
              selectedRoute?.id === route.id
                ? "border-neon-blue shadow-neon"
                : "hover:border-neon-blue/30"
            }`}
            onClick={() =>
              setSelectedRoute(selectedRoute?.id === route.id ? null : route)
            }
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{route.name}</h3>
                <p className="text-sm text-gray-500">
                  Duration: {route.duration}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRoute(route);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoute(route);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Stops:</h4>
              <div className="flex flex-wrap gap-2">
                {route.stops.map((stop) => (
                  <span
                    key={stop.id}
                    className="px-2 py-1 bg-light-700 dark:bg-dark-700 rounded-full text-xs"
                  >
                    {stop.name} ({stop.arrivalTime})
                  </span>
                ))}
              </div>
            </div>
            {selectedRoute?.id === route.id && (
              <div className="mt-4 h-[300px]">
                <MapContainer
                  center={[route.stops[0].latitude, route.stops[0].longitude]}
                  zoom={12}
                  className="h-full rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {route.stops.map((stop) => (
                    <Marker
                      key={stop.id}
                      position={[stop.latitude, stop.longitude]}
                      icon={defaultIcon}
                    >
                      <Popup>
                        <div>
                          <p className="font-semibold">{stop.name}</p>
                          <p className="text-sm text-gray-500">
                            Arrival: {stop.arrivalTime}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Polyline
                    positions={route.stops.map((stop) => [
                      stop.latitude,
                      stop.longitude,
                    ])}
                    {...polylineOptions}
                  />
                </MapContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDeleteModal && selectedRoute && (
        <DeleteModal
          title="Delete Route"
          message={`Are you sure you want to delete the route "${selectedRoute.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteRoute}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedRoute(null);
          }}
        />
      )}

      <StopModal
        isOpen={showStopModal}
        stop={selectedStop ? selectedStop : undefined}
        onClose={() => {
          setShowStopModal(false);
          setSelectedStop(null);
          setPendingLocation(null);
        }}
        onSubmit={handleStopSubmit}
      />
    </div>
  );
}