// Import Dependencies
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup"; import { useForm, } from "react-hook-form";
import { DocumentPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  "ignorFields": { custom_followup_history: true, cod_documents: true },
}

// ----------------------------------------------------------------------

export default function AddEditFrom() {
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
    resolver: yupResolver(Schema(info?.fields)),
    values: id ? data : {},
  });

  const [showCEOApprovalModal, setShowCEOApprovalModal] = useState(false);
  const [ceoApprovalData, setCeoApprovalData] = useState({
    comments: "",
    priority: "",
    requested_date: new Date().toISOString().split("T")[0]
  });

  const handleCEOApprovalSubmit = () => {
    if (id && ceoApprovalData.comments && ceoApprovalData.comments.trim()) {
      const submitData = {
        id,
        status: "CEO Approval",
        custom_ceo_approval_comments: ceoApprovalData.comments,
        custom_ceo_approval_priority: ceoApprovalData.priority,
        custom_ceo_approval_requested_date: ceoApprovalData.requested_date
      };
      mutationUpdate.mutate({ doctype, body: submitData });
      setShowCEOApprovalModal(false);
      setCeoApprovalData({
        comments: "",
        priority: "",
        requested_date: new Date().toISOString().split("T")[0]
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
            {id && data?.custom_lead_status !== "CEO Approval" && (
              <Button
                className="min-w-[7rem]"
                variant="outlined"
                color="secondary"
                onClick={() => setShowCEOApprovalModal(true)}
              >
                Submit For CEO Approval
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
                      Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={ceoApprovalData.comments}
                      onChange={(e) => setCeoApprovalData({ ...ceoApprovalData, comments: e.target.value })}
                      placeholder="Enter comments for CEO approval..."
                      rows="4"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Priority
                    </label>
                    <select
                      value={ceoApprovalData.priority}
                      onChange={(e) => setCeoApprovalData({ ...ceoApprovalData, priority: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Requested Date
                    </label>
                    <input
                      type="date"
                      value={ceoApprovalData.requested_date}
                      onChange={(e) => setCeoApprovalData({ ...ceoApprovalData, requested_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCEOApprovalModal(false);
                    setCeoApprovalData({
                      comments: "",
                      priority: "",
                      requested_date: new Date().toISOString().split("T")[0]
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleCEOApprovalSubmit}
                  disabled={!ceoApprovalData.comments || !ceoApprovalData.comments.trim()}
                >
                  Submit For Approval
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>

      </div>
    </Page>
  );
};

