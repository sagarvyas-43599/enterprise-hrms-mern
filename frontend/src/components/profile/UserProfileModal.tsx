"use client";

import React from "react";
import {
  Mail,
  Building,
  Briefcase,
  Shield,
  Hash,
  CheckCircle2,
  LogOut,
  X,
  ExternalLink,
  Phone,
  Camera,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";
import { useLogoutUserMutation } from "@/redux/services/authApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateEmployeeMutation } from "@/redux/services/employeeApi";

export const UserProfileModal: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [logoutUser] = useLogoutUserMutation();
  const [updateEmployee, { isLoading: isUpdatingImage }] = useUpdateEmployeeMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isOpen = activeModal === "USER_PROFILE";

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logoutUser().unwrap();
      toast.success("Signed out successfully");
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  const handleViewFullProfile = () => {
    handleClose();
    router.push("/profile");
  };

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

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "User";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user?.email?.[0] || "U").toUpperCase();

  const formattedRole = user?.role ? user.role.replace(/_/g, " ") : "EMPLOYEE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Employee Profile"
      description="Your corporate credentials and organizational assignment"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          <div className="relative group w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0 overflow-hidden">
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
              disabled={isUpdatingImage}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              {isUpdatingImage ? (
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
          <div className="overflow-hidden space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {displayName}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              <Shield className="w-3 h-3" />
              <span>{formattedRole}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Email */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              Email
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.email || "N/A"}
            </p>
          </div>

          {/* Employee ID */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-500" />
              Employee ID
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {user?.empId || user?.employeeId || "EMP001"}
            </p>
          </div>

          {/* Department */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              Department
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.department || "Corporate"}
            </p>
          </div>

          {/* Designation */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              Designation
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.designation || formattedRole}
            </p>
          </div>

          {/* Role */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              System Role
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {formattedRole}
            </p>
          </div>

          {/* Phone */}
          <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              Phone Number
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.phone || "Not provided"}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleViewFullProfile}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Full Profile
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
