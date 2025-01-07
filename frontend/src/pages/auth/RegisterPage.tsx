import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/hooks/useAuth";
import { ApiErrorResponse } from "@/types/api";
import { Role } from "@/types/enums";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.nativeEnum(Role),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: Role.PASSENGER,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register.mutateAsync(data);
      notifications.show({
        title: "Success",
        message: "Successfully registered! Please login.",
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      const errorMessage =
        apiError.response?.data?.details?.[0]?.message ||
        apiError.response?.data?.message ||
        "Failed to register";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Create an account
          </h2>
          <p className="mt-2 text-gray-400">Join our transport platform</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium "
              >
                Email
              </label>
              <input
                {...registerField("email")}
                type="email"
                className="input mt-1"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium "
              >
                First Name
              </label>
              <input
                {...registerField("firstName")}
                type="text"
                className="input mt-1"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium "
              >
                Last Name
              </label>
              <input
                {...registerField("lastName")}
                type="text"
                className="input mt-1"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium "
              >
                Role
              </label>
              <select {...registerField("role")} className="input mt-1">
                <option value={Role.PASSENGER}>Passenger</option>
                <option value={Role.DRIVER}>Driver</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium "
              >
                Password
              </label>
              <input
                {...registerField("password")}
                type="password"
                className="input mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
