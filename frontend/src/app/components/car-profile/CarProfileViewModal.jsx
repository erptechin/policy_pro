import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { Button } from "components/ui";
import { useInfo, useFeachSingle } from "hooks/useApiHook";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

const doctype = "Car Profile";
const fields = [
  'status',
  'car_make',
  'car_model',
  'car_year',
  'car_brand_new',
  'car_emirate',
  'car_registration_date'
];
const subFields = [
  'date_of_birth',
  'nationality',
  'license_country',
  'driving_experience',
  'policy_start_date',
  'current_policy_active',
  'claims_last_12_months',
  'no_claims_years',
  'gcc_specification',
  'personal_use_only',
  'policy_fully_comprehensive'
];

// Helper function to get field label
const getFieldLabel = (info, fieldname) => {
  const field = info?.fields?.find(f => f.fieldname === fieldname);
  return field?.label || fieldname;
};

// Helper function to format field value
const formatFieldValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return value;
};

export default function CarProfileViewModal({ 
  isOpen, 
  onClose, 
  carProfileId
}) {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ 
    doctype, 
    fields: JSON.stringify([...fields, ...subFields]) 
  });
  
  const { data, isFetching: isFetchingData, refetch } = useFeachSingle({ 
    doctype, 
    id: isOpen && carProfileId ? carProfileId : null, 
    fields: JSON.stringify([...fields, ...subFields])
  });
  
  // Refetch data when modal opens
  useEffect(() => {
    if (isOpen && carProfileId) {
      refetch();
    }
  }, [isOpen, carProfileId, refetch]);

  if (isFetchingInfo || (isOpen && carProfileId && isFetchingData)) {
    return (
      <Transition show={isOpen}>
        <Dialog 
          open={isOpen} 
          onClose={onClose} 
          className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        >
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
            onClick={onClose}
          />
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-dark-700"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                View Car Profile
              </h2>
            </div>
            <div className="mt-4">
              <Skeleton
                style={{
                  "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
                }}
              />
            </div>
          </TransitionChild>
        </Dialog>
      </Transition>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Transition show={isOpen}>
      <Dialog 
        open={isOpen} 
        onClose={onClose} 
        className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
          onClick={onClose}
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="scrollbar-sm relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-dark-700"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
              View Car Profile
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Main Fields */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-100">
                  Car Information
                </h3>
                <div className="space-y-3">
                  {fields.map((fieldname) => (
                    <div key={fieldname} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-dark-300">
                        {getFieldLabel(info, fieldname)}
                      </span>
                      <span className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                        {formatFieldValue(data[fieldname])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub Fields */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-100">
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {subFields.map((fieldname) => (
                    <div key={fieldname} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-dark-300">
                        {getFieldLabel(info, fieldname)}
                      </span>
                      <span className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                        {formatFieldValue(data[fieldname])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-dark-500">
            <Button
              color="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
