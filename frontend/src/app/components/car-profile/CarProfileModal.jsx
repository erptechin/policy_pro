import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { Button } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { Schema } from "app/components/form/schema";
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import { getListData } from "utils/apis";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

const doctype = "Car Profile";
const fields = [
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

const tableFields = {
  "ignorFields": {}
};

const initialState = Object.fromEntries(
  [...fields, ...subFields].map(field => [field, ""])
);

export default function CarProfileModal({ 
  isOpen, 
  onClose, 
  carProfileId,
  carProfileData = null,
  customerId, 
  customerName,
  leadId,
  leadName,
  isCreateMode = false,
  onSuccess 
}) {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ 
    doctype, 
    fields: JSON.stringify([...fields, ...subFields]) 
  });

  // State to store model options based on selected make (must be declared before filteredInfo)
  const [modelOptions, setModelOptions] = useState([]);
  
  // Update car_model options based on selected car_make
  const filteredInfo = useMemo(() => {
    if (!info) return info;
    
    return {
      ...info,
      fields: info.fields.map(field => {
        // Update car_model options based on selected car_make
        if (field.fieldname === 'car_model') {
          return {
            ...field,
            options_list: modelOptions // Set options_list to filtered models
          };
        }
        
        return field;
      })
    };
  }, [info, modelOptions]);
  
  const { data, isFetching: isFetchingData, refetch } = useFeachSingle({ 
    doctype, 
    id: isOpen && carProfileId && !isCreateMode ? carProfileId : null, 
    fields: JSON.stringify([...fields, ...subFields])
  });
  
  // Refetch data when modal opens for editing/viewing (only in normal mode)
  useEffect(() => {
    if (isOpen && carProfileId && !isCreateMode) {
      refetch();
    }
  }, [isOpen, carProfileId, isCreateMode, refetch]);

  const mutationAdd = useAddData(() => {
    reset();
    if (onSuccess) onSuccess();
    onClose();
  });

  const mutationUpdate = useUpdateData(() => {
    reset();
    if (onSuccess) onSuccess();
    onClose();
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(Schema(filteredInfo?.fields || info?.fields)),
    defaultValues: initialState,
    mode: 'onChange',
  });

  // Watch car_make field to filter car_model options
  const selectedCarMake = useWatch({
    control,
    name: 'car_make',
  });

  // Store previous car_make to detect changes
  const prevCarMakeRef = useRef(selectedCarMake);

  // Fetch models when car_make changes
  useEffect(() => {
    if (selectedCarMake) {
      // If car_make changed (not initial load), clear car_model first
      if (prevCarMakeRef.current && prevCarMakeRef.current !== selectedCarMake) {
        setValue('car_model', '');
      }
      
      // Fetch models filtered by the selected make
      getListData({
        doctype: 'Model',
        fields: JSON.stringify(['name', 'title', 'make']),
        filters: JSON.stringify([['make', '=', selectedCarMake]]),
      }).then((res) => {
        if (res?.data) {
          const options = res.data.map(item => ({
            label: item.title || item.name,
            value: item.name
          }));
          setModelOptions(options);
        } else {
          setModelOptions([]);
        }
      }).catch(() => {
        setModelOptions([]);
      });
    } else {
      // Clear model options when no make is selected
      setModelOptions([]);
      // Clear car_model value when car_make is cleared
      setValue('car_model', '');
    }
    
    // Update ref
    prevCarMakeRef.current = selectedCarMake;
  }, [selectedCarMake, setValue]);

  // Update form values when data is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode && carProfileData) {
        // Editing in create mode - use carProfileData prop
        reset(carProfileData);
        // If car_make exists, fetch models for that make
        if (carProfileData.car_make) {
          getListData({
            doctype: 'Model',
            fields: JSON.stringify(['name', 'title', 'make']),
            filters: JSON.stringify([['make', '=', carProfileData.car_make]]),
          }).then((res) => {
            if (res?.data) {
              const options = res.data.map(item => ({
                label: item.title || item.name,
                value: item.name
              }));
              setModelOptions(options);
            }
          }).catch(() => {
            setModelOptions([]);
          });
        } else {
          setModelOptions([]);
        }
      } else if (carProfileId && !isCreateMode) {
        // Editing/Viewing mode - wait for data to load
        if (data) {
          reset(data);
          // If editing and car_make exists, fetch models for that make
          if (data.car_make) {
            getListData({
              doctype: 'Model',
              fields: JSON.stringify(['name', 'title', 'make']),
              filters: JSON.stringify([['make', '=', data.car_make]]),
            }).then((res) => {
              if (res?.data) {
                const options = res.data.map(item => ({
                  label: item.title || item.name,
                  value: item.name
                }));
                setModelOptions(options);
              }
            }).catch(() => {
              setModelOptions([]);
            });
          }
        }
      } else {
        // Creating new profile
        reset(initialState);
        // Clear model options for new profile
        setModelOptions([]);
        // In create mode, don't set customer/lead (they'll be set later)
        // In normal mode, set customer and lead from props
        if (!isCreateMode) {
          if (customerId) {
            setValue('customer', customerId);
          }
          if (leadId) {
            setValue('lead', leadId);
          } else if (leadName) {
            setValue('lead', leadName);
          }
        }
      }
    } else {
      // Reset form when modal closes
      reset(initialState);
      setModelOptions([]);
    }
  }, [isOpen, carProfileId, carProfileData, isCreateMode, data, customerId, customerName, leadId, leadName, reset, setValue]);

  const onSubmit = (formData) => {
    // Form validation is handled by react-hook-form
    // This function only runs if validation passes
    
    console.log('Form submitted with data:', formData);
    
    // In create mode, just return the data to parent component
    if (isCreateMode) {
      const submitData = { ...formData };
      // Set status based on context - from Lead it should be "New"
      if (leadId || leadName) {
        submitData.status = "New";
      }
      // Don't set customer/lead in create mode - they'll be set when lead is created
      if (onSuccess) {
        onSuccess(submitData);
      }
      return;
    }
    
    // Ensure lead, customer, and status are set when creating new profile (normal mode)
    const submitData = { ...formData };

    submitData.lead = leadId;
    submitData.customer = customerId;
    
    console.log('Submitting with data:', submitData);
    
    if (carProfileId) {
      console.log('Calling mutationUpdate...');
      mutationUpdate.mutate({ doctype, body: { ...submitData, id: carProfileId } });
    } else {
      submitData.status = "New";
      console.log('Calling mutationAdd...');
      mutationAdd.mutate({ doctype, body: submitData });
    }
    
    // IMPORTANT: Don't close modal here - wait for mutation success callback
    // The modal will only close when the API call succeeds
  };

  // Handle form submission errors
  const onError = (errors) => {
    console.log('Form validation errors:', errors);
    // Form validation errors are already displayed by DynamicForms component
  };

  if (isFetchingInfo || (isOpen && carProfileId && !isCreateMode && isFetchingData)) {
    return (
      <Transition show={isOpen}>
        <Dialog open={isOpen} onClose={onClose} static={false} autoFocus>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 z-60 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
            onClick={() => {
              // Don't close if form is submitting
              if (!mutationAdd.isPending && !mutationUpdate.isPending) {
                onClose();
              }
            }}
          />
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed inset-y-0 right-0 z-61 flex w-screen max-w-3xl transform-gpu flex-col bg-white transition-transform duration-300 dark:bg-dark-700 sm:max-w-4xl lg:max-w-5xl"
        >
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                {carProfileId ? 'Edit' : 'New'} Car Profile
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <Skeleton
                style={{
                  "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
                }}
              />
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
    );
  }

  return (
    <Transition show={isOpen}>
      <Dialog 
        open={isOpen} 
        onClose={(value) => {
          // Only allow closing if form is not submitting
          if (!mutationAdd.isPending && !mutationUpdate.isPending) {
            onClose();
          }
        }} 
        static={mutationAdd.isPending || mutationUpdate.isPending}
        autoFocus
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 z-60 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
          onClick={() => {
            // Only allow closing if form is not submitting
            if (!mutationAdd.isPending && !mutationUpdate.isPending) {
              onClose();
            }
          }}
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed inset-y-0 right-0 z-61 flex w-screen max-w-3xl transform-gpu flex-col bg-white transition-transform duration-300 dark:bg-dark-700 sm:max-w-4xl lg:max-w-5xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
              {carProfileId ? 'Edit' : 'New'} Car Profile
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Content */}
          <form 
            onSubmit={handleSubmit(onSubmit, onError)} 
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            noValidate
          >
            <div className="scrollbar-sm flex-1 overflow-y-auto">
              <div className="grid grid-cols-12 place-content-start gap-4 p-5 sm:gap-5 lg:gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <DynamicForms
                      infos={filteredInfo || info}
                      fields={fields}
                      register={register}
                      tables={tableFields}
                      control={control}
                      errors={errors}
                    />
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <DynamicForms
                    infos={filteredInfo || info}
                    tables={tableFields}
                    fields={subFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button
                variant="outlined"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="button"
                onClick={handleSubmit(onSubmit, onError)}
                disabled={isSubmitting || mutationAdd.isPending || mutationUpdate.isPending}
              >
                {isSubmitting || mutationAdd.isPending || mutationUpdate.isPending
                  ? 'Saving...' 
                  : (carProfileId ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

