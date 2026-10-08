"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Shield,
  Hash,
  Calendar,
  CheckCircle2,
  Edit3,
  KeyRound,
  Lock,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAppSelector } from "@/redux/hooks";
import { formatDate } from "@/lib/utils";
import { useUpdateEmployeeMutation } from "@/redux/services/employeeApi";
import { useChangePasswordMutation } from "@/redux/services/authApi";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [updateEmployee, { isLoading: isUpdatingProfile }] =
    useUpdateEmployeeMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [editError, setEditError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    designation?: string;
  }>({});

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Initialize edit form when opening modal or user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setDesignation(user.designation || "");
      setEditError("");
      setFieldErrors({});
    }
  }, [user, isEditProfileOpen]);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "User";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.email?.[0] || "U").toUpperCase();

  const formattedRole = user?.role ? user.role.replace(/_/g, " ") : "EMPLOYEE";
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "HR_ADMIN";

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "danger";
      case "HR_ADMIN":
        return "purple";
      case "MANAGER":
        return "info";
      default:
        return "neutral";
    }
  };

  // Handle Edit Profile Submission - Validates ALL fields simultaneously
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    const errors: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      department?: string;
      designation?: string;
    } = {};

    if (!firstName.trim()) {
      errors.firstName = "First Name is required";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First Name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last Name is required";
    }

    if (isAdmin) {
      if (!department.trim()) {
        errors.department = "Department is required";
      } else if (department.trim().length < 2) {
        errors.department = "Department must be at least 2 characters";
      }

      if (!designation.trim()) {
        errors.designation = "Designation is required";
      } else if (designation.trim().length < 2) {
        errors.designation = "Designation must be at least 2 characters";
      }
    }

    // If any validation failed, highlight all fields at once
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      if (isAdmin) {
        if (department.trim()) payload.department = department.trim();
        if (designation.trim()) payload.designation = designation.trim();
      }

      const targetId = user?.employeeId || user?.empId || "me";

      await updateEmployee({
        id: targetId,
        body: payload,
      }).unwrap();

      toast.success("Profile details updated successfully.");
      setIsEditProfileOpen(false);
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const newFieldErrors: Record<string, string> = {};
        apiErrors.forEach((issue: any) => {
          if (issue.field) {
            newFieldErrors[issue.field] = issue.message;
          }
        });
        setFieldErrors(newFieldErrors);
      } else {
        const errorMessage =
          err?.data?.message || "Failed to update profile. Please try again.";
        setEditError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  // Handle Change Password Submission - Validates ALL fields simultaneously
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        await updateEmployee({
          id: "me",
          body: { profileImage: base64 },
        }).unwrap();
        toast.success("Profile image updated successfully");
      } catch (err) {
        toast.error("Failed to update profile image");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current Password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New Password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "New Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = "New Password and Confirm Password do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordFieldErrors(errors);
      return;
    }

    setPasswordFieldErrors({});

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      toast.success("Password changed successfully.");
      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err?.data?.message || "Incorrect current password. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View and manage your personal details and account credentials.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & Core Info */}
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdatingProfile}
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {user?.empId || "EMP001"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                    {formattedRole}
                  </Badge>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Change Password */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-none"
            >
              Edit Profile
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPasswordError("");
                setIsChangePasswordOpen(true);
              }}
              leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
              className="flex-1 sm:flex-none"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Personal Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">First Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.firstName || "Not provided"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Last Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.lastName || "Not provided"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Corporate Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.email}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Contact Phone</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.phone || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Employment & Organization */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Organizational Details
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Employee Code</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {user?.empId || "EMP001"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.department || "Corporate"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Designation</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.designation || formattedRole}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Date Joined</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.joinedAt ? formatDate(user.joinedAt) : "Oct 04, 2026"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile Details"
        description="Update your personal contact information"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateProfile} noValidate className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              error={fieldErrors.firstName}
              required
            />
            <Input
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              error={fieldErrors.lastName}
              required
            />
          </div>

          <Input
            label="Contact Phone Number"
            type="number"
            placeholder="Contact Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (fieldErrors.phone) {
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            error={fieldErrors.phone}
          />

          {isAdmin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department"
                placeholder="Department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (fieldErrors.department) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      department: undefined,
                    }));
                  }
                }}
                error={fieldErrors.department}
                required
              />
              <Input
                label="Designation"
                placeholder="Designation"
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  if (fieldErrors.designation) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      designation: undefined,
                    }));
                  }
                }}
                error={fieldErrors.designation}
                required
              />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Department (<span className="font-medium text-slate-700 dark:text-slate-300">{user?.department || "Corporate"}</span>) and Designation (<span className="font-medium text-slate-700 dark:text-slate-300">{user?.designation || formattedRole}</span>) are managed by HR Administration.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingProfile}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Account Password"
        description="Update your corporate login credentials"
        maxWidth="md"
      >
        <form onSubmit={handleChangePassword} noValidate className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {passwordError}
            </div>
          )}

          <Input
            type="password"
            label="Current Password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (passwordFieldErrors.currentPassword) {
                setPasswordFieldErrors((prev) => ({
                  ...prev,
                  currentPassword: undefined,
                }));
              }
            }}
            error={passwordFieldErrors.currentPassword}
            required
          />

          <Input
            type="password"
            label="New Password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passwordFieldErrors.newPassword) {
                setPasswordFieldErrors((prev) => ({
                  ...prev,
                  newPassword: undefined,
                }));
              }
            }}
            error={passwordFieldErrors.newPassword}
            helperText="Minimum 8 characters"
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordFieldErrors.confirmPassword) {
                setPasswordFieldErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
              }
            }}
            error={passwordFieldErrors.confirmPassword}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingPassword}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
