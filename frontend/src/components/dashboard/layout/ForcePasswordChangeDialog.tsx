"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChangePassword, useLogout } from "@/services/auth/mutations";
import { useAuthStore } from "@/store/auth-store";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ForcePasswordChangeDialog = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const mustChangePassword = authUser?.mustChangePassword ?? false;
  const changePasswordMutation = useChangePassword();
  const { mutateAsync: logout, isPending: isLogoutPending } = useLogout();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (formData: PasswordFormData) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    reset();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AlertDialog open={mustChangePassword} onOpenChange={() => undefined}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Change your temporary password</AlertDialogTitle>
          <AlertDialogDescription>
            You need to update your default password before you can continue
            using the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={handleSubmit(handlePasswordChange)}
          className="space-y-5"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="forced-current-password">
                Current password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="forced-current-password"
                  type={showPasswords.current ? "text" : "password"}
                  disabled={changePasswordMutation.isPending || isSubmitting}
                  aria-invalid={!!errors.currentPassword}
                  className={cn("pr-10")}
                  {...register("currentPassword")}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      current: !current.current,
                    }))
                  }
                >
                  {showPasswords.current ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="forced-new-password">
                New password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="forced-new-password"
                  type={showPasswords.next ? "text" : "password"}
                  disabled={changePasswordMutation.isPending || isSubmitting}
                  aria-invalid={!!errors.newPassword}
                  className={cn("pr-10")}
                  {...register("newPassword")}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      next: !current.next,
                    }))
                  }
                >
                  {showPasswords.next ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="forced-confirm-password">
                Confirm new password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="forced-confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  disabled={changePasswordMutation.isPending || isSubmitting}
                  aria-invalid={!!errors.confirmPassword}
                  className={cn("pr-10")}
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      confirm: !current.confirm,
                    }))
                  }
                >
                  {showPasswords.confirm ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLogout()}
              disabled={isLogoutPending || changePasswordMutation.isPending}
            >
              {isLogoutPending ? "Signing out..." : "Sign out"}
            </Button>
            <Button
              type="submit"
              disabled={
                !isDirty ||
                changePasswordMutation.isPending ||
                isSubmitting ||
                isLogoutPending
              }
            >
              {changePasswordMutation.isPending
                ? "Updating..."
                : "Update password"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ForcePasswordChangeDialog;
