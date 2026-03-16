"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ConfirmAlertDialog from "@/components/common/modals/ConfirmAlertDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getDashboardByRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import {
  useChangePassword,
  useLogout,
  useSendEmailVerification,
  useUpdateProfile,
} from "@/services/auth/mutations";
import { useAuthUserQuery } from "@/services/auth/queries";
import { useAuthStore } from "@/store/auth-store";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().optional(),
});

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

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfileSettingsContent = () => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const { data } = useAuthUserQuery();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const sendEmailVerificationMutation = useSendEmailVerification();
  const { mutateAsync: logout, isPending: isLogoutPending } = useLogout();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const user = data?.user ?? authUser;

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: {
      errors: profileErrors,
      isDirty: isProfileDirty,
      isSubmitting: isProfileSubmitting,
    },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: {
      errors: passwordErrors,
      isDirty: isPasswordDirty,
      isSubmitting: isPasswordSubmitting,
    },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    resetProfile({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
    });
  }, [resetProfile, user]);

  const handleProfileSave = async (formData: ProfileFormData) => {
    await updateProfileMutation.mutateAsync({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() ? formData.phone.trim() : "",
    });
  };

  const handlePasswordChange = async (formData: PasswordFormData) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    resetPassword();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal details and account security.
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="self-start">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update the name, email, and phone number associated with your
                account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleProfileSubmit(handleProfileSave)}
                className="space-y-5"
              >
                <FieldGroup>
                  <Field data-invalid={!!profileErrors.name}>
                    <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                    <Input
                      id="profile-name"
                      disabled={
                        updateProfileMutation.isPending || isProfileSubmitting
                      }
                      aria-invalid={!!profileErrors.name}
                      {...registerProfile("name")}
                    />
                    <FieldError errors={[profileErrors.name]} />
                  </Field>

                  <Field data-invalid={!!profileErrors.email}>
                    <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                    <Input
                      id="profile-email"
                      type="email"
                      disabled={
                        updateProfileMutation.isPending || isProfileSubmitting
                      }
                      aria-invalid={!!profileErrors.email}
                      {...registerProfile("email")}
                    />
                    <FieldError errors={[profileErrors.email]} />
                  </Field>

                  <Field data-invalid={!!profileErrors.phone}>
                    <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                    <Input
                      id="profile-phone"
                      disabled={
                        updateProfileMutation.isPending || isProfileSubmitting
                      }
                      aria-invalid={!!profileErrors.phone}
                      {...registerProfile("phone")}
                    />
                    <FieldError errors={[profileErrors.phone]} />
                  </Field>
                </FieldGroup>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      !isProfileDirty ||
                      updateProfileMutation.isPending ||
                      isProfileSubmitting
                    }
                  >
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Review the current details for this signed-in account.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-1 text-sm">
                    {user.role.replaceAll("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 text-sm">{user.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email verification
                  </p>
                  <p className="mt-1 text-sm">
                    {user.emailVerified ? "Verified" : "Pending"}
                  </p>
                  {!user.emailVerified ? (
                    <Button
                      type="button"
                      variant="link"
                      className="mt-1 h-auto px-0"
                      onClick={() => sendEmailVerificationMutation.mutate()}
                      disabled={sendEmailVerificationMutation.isPending}
                    >
                      {sendEmailVerificationMutation.isPending
                        ? "Sending..."
                        : "Resend verification email"}
                    </Button>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dashboard
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-1 h-auto px-0"
                    onClick={() => router.push(getDashboardByRole(user.role))}
                  >
                    Return to dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePasswordSubmit(handlePasswordChange)}
                  className="space-y-5"
                >
                  <FieldGroup>
                    <Field data-invalid={!!passwordErrors.currentPassword}>
                      <FieldLabel htmlFor="current-password">
                        Current password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? "text" : "password"}
                          disabled={
                            changePasswordMutation.isPending ||
                            isPasswordSubmitting
                          }
                          aria-invalid={!!passwordErrors.currentPassword}
                          className={cn("pr-10")}
                          {...registerPassword("currentPassword")}
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
                      <FieldError errors={[passwordErrors.currentPassword]} />
                    </Field>

                    <Field data-invalid={!!passwordErrors.newPassword}>
                      <FieldLabel htmlFor="new-password">
                        New password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.next ? "text" : "password"}
                          disabled={
                            changePasswordMutation.isPending ||
                            isPasswordSubmitting
                          }
                          aria-invalid={!!passwordErrors.newPassword}
                          className={cn("pr-10")}
                          {...registerPassword("newPassword")}
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
                      <FieldError errors={[passwordErrors.newPassword]} />
                    </Field>

                    <Field data-invalid={!!passwordErrors.confirmPassword}>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm new password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          disabled={
                            changePasswordMutation.isPending ||
                            isPasswordSubmitting
                          }
                          aria-invalid={!!passwordErrors.confirmPassword}
                          className={cn("pr-10")}
                          {...registerPassword("confirmPassword")}
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
                      <FieldError errors={[passwordErrors.confirmPassword]} />
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !isPasswordDirty ||
                        changePasswordMutation.isPending ||
                        isPasswordSubmitting
                      }
                    >
                      {changePasswordMutation.isPending
                        ? "Updating..."
                        : "Update password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>
                  Sign out of your current session when you are done.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsLogoutDialogOpen(true)}
                  >
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <ConfirmAlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of your current session?"
        onConfirm={handleLogout}
        confirmLabel="Sign out"
        confirmVariant="destructive"
        isConfirming={isLogoutPending}
      />
    </>
  );
};

export default ProfileSettingsContent;
