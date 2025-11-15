import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { LockClosedIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, GhostSpinner } from "components/ui";
import { useUpdateData } from "hooks/useApiHook";

// ----------------------------------------------------------------------

// Password validation schema
const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirm_password: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export function ChangePasswordModal({ isOpen, onClose, userId, doctype }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const mutationPasswordUpdate = useUpdateData((data) => {
    if (data) {
      onClose();
      reset();
    }
  });

  const onPasswordSubmit = (passwordData) => {
    if (userId) {
      mutationPasswordUpdate.mutate({
        doctype,
        body: {
          id: userId,
          new_password: passwordData.password,
        },
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={handleClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="scrollbar-sm relative flex max-w-md w-full flex-col overflow-y-auto rounded-lg bg-white px-4 py-6 transition-opacity duration-300 dark:bg-dark-700 sm:px-5">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Change Password
              </DialogTitle>
              <Button
                variant="flat"
                isIcon
                className="size-7 rounded-full"
                onClick={handleClose}
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onPasswordSubmit)} autoComplete="off">
              <div className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("confirm_password")}
                  error={errors?.confirm_password?.message}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="space-x-2"
                  disabled={mutationPasswordUpdate.isPending}
                >
                  {mutationPasswordUpdate.isPending && (
                    <GhostSpinner variant="soft" className="size-4 border-2" />
                  )}
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string,
  doctype: PropTypes.string.isRequired,
};

