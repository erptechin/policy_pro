// Import Dependencies
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup"; import { useForm, } from "react-hook-form";
import { DocumentPlusIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "app/contexts/auth/context";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import FollowUpHistory from './FollowUpHistory';
import CODDocuments from './CODDocuments';
import { getListData } from 'utils/apis';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Input } from "components/ui";
import clsx from "clsx";

const pageName = "Lead"
const doctype = "Lead"

const fields = [
  'first_name',
  'email',
  'mobile_no',
  'custom_car_year',
  'custom_car_brand_new',
  'custom_car_make',
  'custom_car_model',
  'custom_car_emirate',
  'custom_car_registration_date',
  'custom_policy_start_date',
  'custom_date_of_birth',
  'custom_license_country',
  'custom_driving_experience',
  'custom_nationality'
]

const subFields = [
  'custom_lead_status',
  'custom_next_follow_up_date',
  'source',
  'custom_call_back_date',
  'custom_call_back_time',
  'custom_call_back_notes',
  'custom_claims_last_12_months',
  'custom_gcc_specification',
  'custom_current_policy_active',
  'custom_no_claims_years',
  'custom_personal_use_only',
  'custom_policy_fully_comprehensive',
  'custom_followup_history',
  'cod_documents'
]

const tableFields = {
  "ignorFields": { status: true, custom_followup_history: true, cod_documents: true },
}

// ----------------------------------------------------------------------

export default function AddEditFrom() {
  const { user: { role_profile_name } } = useAuthContext();
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ doctype, fields: JSON.stringify([...fields, ...subFields]) });
  const { data, isFetching: isFetchingData, refetch: refetchData } = useFeachSingle({ doctype, id, fields: JSON.stringify([...fields, ...subFields]) });

  const mutationAdd = useAddData((data) => {
    if (data) {
      reset();
      navigate(-1)
    }
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      reset();
      navigate(-1)
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(Schema(info?.fields, ['status'])),
    values: id ? data : {},
  });

  const [showCEOApprovalModal, setShowCEOApprovalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ceoApprovalData, setCeoApprovalData] = useState({
    custom_assigned_user: "",
  });
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Required document types
  const requiredDocumentTypes = [
    "Car Mulkiya",
    "Driving License",
    "Emirates ID",
    "Invoice",
    "Credit Note",
    "Debit Note",
    "Car Passing"
  ];

  // Check if all required document types are uploaded
  const checkAllDocumentsUploaded = () => {
    if (!data?.cod_documents || data.cod_documents.length === 0) {
      return false;
    }
    const uploadedTypes = data.cod_documents
      .map(doc => doc.document_type)
      .filter(type => type && type.trim() !== "");
    return requiredDocumentTypes.every(type => uploadedTypes.includes(type));
  };

  const allDocumentsUploaded = checkAllDocumentsUploaded();

  // Fetch users when modal opens
  useEffect(() => {
    if (showCEOApprovalModal) {
      getListData({
        doctype: "User",
        fields: JSON.stringify(["name", "full_name", "email"]),
        filters: JSON.stringify([["role_profile_name", "=", "Lead Manager"]]),
        page_length: 100
      }).then((res) => {
        if (res?.data) {
          setUsers(res.data.map(user => ({
            label: user.full_name || user.name,
            value: user.name,
            email: user.email
          })));
        }
      });
    }
  }, [showCEOApprovalModal]);

  const filteredUsers = userQuery === ""
    ? users
    : users.filter((user) =>
      user.label.toLowerCase().replace(/\s+/g, "").includes(userQuery.toLowerCase().replace(/\s+/g, "")) ||
      user.email?.toLowerCase().includes(userQuery.toLowerCase())
    );

  const handleCEOApprovalSubmit = () => {
    if (id && allDocumentsUploaded) {
      const submitData = {
        id,
        custom_assigned_user: ceoApprovalData.custom_assigned_user,
        custom_lead_status: "CEO Approval"
      };
      mutationUpdate.mutate({ doctype, body: submitData });
      setShowCEOApprovalModal(false);
      setCeoApprovalData({
        custom_assigned_user: "",
      });
      setSelectedUser(null);
      setUserQuery("");
    }
  };

  const handleMakeApproved = () => {
    setShowConfirmModal(true);
  };

  const confirmApproval = () => {
    if (id) {
      const submitData = {
        id,
        custom_lead_status: "Approved"
      };
      mutationUpdate.mutate({ doctype, body: submitData }, {
        onSuccess: () => {
          setShowConfirmModal(false);
          setShowSuccessModal(true);
          refetchData();
        }
      });
    }
  };

  const onSubmit = (data) => {
    const submitData = {
      ...data,
      status: id ? data.status : "Open"
    };
    if (id) {
      mutationUpdate.mutate({ doctype, body: { ...submitData, id } })
    } else {
      mutationAdd.mutate({ doctype, body: submitData })
    }
  };

  if (isFetchingInfo || isFetchingData) {
    return <Skeleton
      style={{
        "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
      }}
    />
  }


  return (
    <Page title={(id ? 'Edit ' : "New ") + pageName}>
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              {id ? 'Edit' : "New"} {pageName}
            </h2>
          </div>
          <div className="flex gap-2">
            {id && role_profile_name === "Lead Manager" && data?.custom_lead_status === "CEO Approval" && (
              <Button
                className="min-w-[7rem]"
                variant="outlined"
                color="primary"
                onClick={handleMakeApproved}
              >
                Make Approved
              </Button>
            )}
            {id && role_profile_name === "Lead User" && data?.custom_lead_status !== "Approved" && (
              <Button
                className="min-w-[7rem]"
                variant="outlined"
                color="primary"
                onClick={() => setShowCEOApprovalModal(true)}
                disabled={data?.custom_lead_status === "CEO Approval"}
              >
                {data?.custom_lead_status === "CEO Approval" ? "Waiting For Approval" : " Submit For CEO Approval"}
              </Button>
            )}
            <Button
              className="min-w-[7rem]"
              variant="outlined"
              color="error"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              type="submit"
              form="new-post-form"
            >
              Save
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <CODDocuments
              id={id}
              data={data}
              setValue={setValue}
              refetchData={refetchData}
            />
            <FollowUpHistory
              id={id}
              data={data}
              setValue={setValue}
              refetchData={refetchData}
            />

            <div className="col-span-12 lg:col-span-7">
              <Card className="p-4 sm:px-5">
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={fields}
                    register={register}
                    tables={tableFields}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>
            </div>
            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-5 lg:space-y-6">
              <Card className="p-4 sm:px-5">
                <DynamicForms
                  infos={info}
                  tables={tableFields}
                  fields={subFields}
                  register={register}
                  control={control}
                  errors={errors}
                />
              </Card>
            </div>
          </div>
        </form>

        {/* CEO Approval Modal */}
        <Transition appear show={showCEOApprovalModal} as={Dialog} onClose={() => setShowCEOApprovalModal(false)}>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
          />

          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          >
            <div className="scrollbar-sm relative flex w-full max-w-lg flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Submit For CEO Approval
                </h2>
                <button
                  onClick={() => setShowCEOApprovalModal(false)}
                  className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-4">

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Assign User
                    </label>
                    <Combobox
                      value={selectedUser}
                      onChange={(user) => {
                        setSelectedUser(user);
                        setCeoApprovalData({ ...ceoApprovalData, custom_assigned_user: user?.value || "" });
                      }}
                    >
                      {({ open }) => (
                        <div className="relative">
                          <div className="relative w-full cursor-pointer overflow-hidden">
                            <ComboboxInput
                              as={Input}
                              autoComplete="off"
                              displayValue={(user) => user?.label || ""}
                              onChange={(event) => setUserQuery(event.target.value)}
                              placeholder="Select User"
                              suffix={
                                <ComboboxButton>
                                  <ChevronDownIcon
                                    className={clsx(
                                      "size-5 transition-transform",
                                      open && "rotate-180",
                                    )}
                                    aria-hidden="true"
                                  />
                                </ComboboxButton>
                              }
                            />
                          </div>
                          <Transition
                            as="div"
                            enter="transition ease-out"
                            enterFrom="opacity-0 translate-y-2"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-2"
                            afterLeave={() => setUserQuery("")}
                          >
                            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none">
                              {filteredUsers.length === 0 && userQuery !== "" ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-800 dark:text-dark-100">
                                  Nothing found
                                </div>
                              ) : (
                                filteredUsers.map((user) => (
                                  <ComboboxOption
                                    key={user.value}
                                    className={({ selected, active }) =>
                                      clsx(
                                        "relative cursor-pointer select-none px-4 py-2 outline-hidden transition-colors",
                                        active && !selected && "bg-gray-100 dark:bg-dark-600",
                                        selected
                                          ? "bg-primary-600 text-white dark:bg-primary-500"
                                          : "text-gray-800 dark:text-dark-100",
                                      )
                                    }
                                    value={user}
                                  >
                                    {({ selected }) => (
                                      <div className="flex flex-col">
                                        <span>{user.label}</span>
                                        {user.email && (
                                          <span className={clsx(
                                            "text-xs",
                                            selected
                                              ? "text-primary-100"
                                              : "text-gray-500 dark:text-dark-300"
                                          )}>
                                            {user.email}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </ComboboxOption>
                                ))
                              )}
                            </ComboboxOptions>
                          </Transition>
                        </div>
                      )}
                    </Combobox>
                  </div>

                  {!allDocumentsUploaded && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Warning:</strong> All required document types must be uploaded before submitting for CEO approval.
                      </p>
                      <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                        Missing: {requiredDocumentTypes.filter(type =>
                          !data?.cod_documents?.some(doc => doc.document_type === type)
                        ).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCEOApprovalModal(false);
                    setCeoApprovalData({
                      custom_assigned_user: "",
                    });
                    setSelectedUser(null);
                    setUserQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleCEOApprovalSubmit}
                  disabled={!allDocumentsUploaded}
                >
                  Submit For Approval
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>

        {/* Confirmation Modal */}
        <Transition appear show={showConfirmModal} as={Dialog} onClose={() => setShowConfirmModal(false)}>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
          />

          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          >
            <div className="scrollbar-sm relative flex w-full max-w-md flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Confirm Approval
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="text-center">
                  <p className="text-base text-gray-700 dark:text-dark-200">
                    Are you sure you want to approve this lead?
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                    This action will change the lead status to &quot;Approved&quot;.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button
                  variant="outlined"
                  onClick={() => setShowConfirmModal(false)}
                >
                  No
                </Button>
                <Button
                  color="primary"
                  onClick={confirmApproval}
                >
                  Yes
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>

        {/* Success Modal */}
        <Transition appear show={showSuccessModal} as={Dialog} onClose={() => setShowSuccessModal(false)}>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
          />

          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          >
            <div className="scrollbar-sm relative flex w-full max-w-md flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                  Success
                </h2>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                      Lead Approved Successfully
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                      The lead status has been updated to &quot;Approved&quot;.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button
                  color="primary"
                  onClick={() => {
                    setShowSuccessModal(false);
                    refetchData();
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>

      </div>
    </Page>
  );
};

