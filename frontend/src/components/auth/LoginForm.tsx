import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/useAuth";
import { ApiErrorResponse } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      notifications.show({
        title: "Success",
        message: "Successfully logged in",
        color: "green",
      });
      navigate("/");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      notifications.show({
        title: "Error",
        message: apiError.response?.data?.message || "Failed to login",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium "
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          className="input mt-1"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
          {...register("password")}
          type="password"
          className="input mt-1"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
