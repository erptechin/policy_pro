// Import Dependencies
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup"; import { useForm, } from "react-hook-form";
import { DocumentPlusIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";

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
      if (showAddModal) {
        setShowAddModal(false)
        refetchData()
      } else {
        reset();
        navigate(-1)
      }
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCODModal, setShowAddCODModal] = useState(false);
  const [showCEOApprovalModal, setShowCEOApprovalModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    description: "",
    next_date: "",
    created_date: new Date().toISOString().split("T")[0]
  });
  const [newCODDocument, setNewCODDocument] = useState({
    document_type: "",
    file_attachment: "",
    status: "Pending",
    comments: ""
  });
  const [ceoApprovalData, setCeoApprovalData] = useState({
    comments: "",
    priority: "",
    requested_date: new Date().toISOString().split("T")[0]
  });

  const handleAddFollowUp = () => {
    if (newRecord.description && newRecord.description.trim() && newRecord.next_date) {
      const currentRecords = data?.custom_followup_history || [];
      const updatedRecords = [...currentRecords, {
        ...newRecord,
        idx: currentRecords.length + 1
      }];
      mutationUpdate.mutate({ doctype, body: { id, custom_followup_history: updatedRecords, custom_next_follow_up_date: newRecord.next_date, custom_lead_status: "Call Back" } })
      setValue("custom_followup_history", updatedRecords);
      setNewRecord({
        description: "",
        next_date: "",
        created_date: new Date().toISOString().split("T")[0]
      });
    }
  };

  const handleAddCODDocument = () => {
    if (newCODDocument.document_type && newCODDocument.file_attachment) {
      const currentDocuments = data?.cod_documents || [];
      const updatedDocuments = [...currentDocuments, {
        ...newCODDocument,
        upload_date: new Date().toISOString(),
        idx: currentDocuments.length + 1
      }];
      mutationUpdate.mutate({ doctype, body: { id, cod_documents: updatedDocuments } });
      setValue("cod_documents", updatedDocuments);
      setNewCODDocument({
        document_type: "",
        file_attachment: "",
        status: "Pending",
        comments: ""
      });
      setShowAddCODModal(false);
    }
  };

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

            {id && <div className="col-span-12 lg:col-span-12">
              <Card className="p-4 sm:px-5">
                <div className="mt-5 space-y-5">
                  {/* Display COD Documents */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                      COD Documents
                    </h3>
                    <Button
                      onClick={() => setShowAddCODModal(true)}
                      color="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="size-4" />
                      Add New Record
                    </Button>
                  </div>
                  {data?.cod_documents && data?.cod_documents?.length > 0 ? (
                    <div className="mt-6">
                      <div className="hide-scrollbar overflow-x-auto">
                        <Table hoverable className="w-full min-w-[700px] text-left rtl:text-right">
                          <THead>
                            <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                #
                              </Th>
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                Document Type
                              </Th>
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                File Attachment
                              </Th>
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                Upload Date
                              </Th>
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                Status
                              </Th>
                              <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                                Comments
                              </Th>
                            </Tr>
                          </THead>
                          <TBody>
                            {data?.cod_documents.map((doc, index) => (
                              <Tr
                                key={index}
                                className="border-b border-gray-200 dark:border-dark-500"
                              >
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {index + 1}
                                </Td>
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {doc.document_type || '-'}
                                </Td>
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {doc.file_attachment ? (
                                    <a
                                      href={doc.file_attachment}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                      View File
                                    </a>
                                  ) : '-'}
                                </Td>
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {doc.upload_date
                                    ? new Date(doc.upload_date).toLocaleDateString()
                                    : '-'}
                                </Td>
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {doc.status || '-'}
                                </Td>
                                <Td className="text-gray-700 dark:text-dark-200">
                                  {doc.comments || '-'}
                                </Td>
                              </Tr>
                            ))}
                          </TBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 dark:text-dark-300">
                        No COD documents yet. Click &quot;Add New Record&quot; to add one.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>}

            {id && <div className="col-span-12 lg:col-span-12">
              <Card className="p-4 sm:px-5">
                <div className="mt-5 space-y-5">
                  {/* Display Follow-up History Records */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                      Follow-up History Records
                    </h3>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      color="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="size-4" />
                      Add New Record
                    </Button>
                  </div>
                  {data?.custom_followup_history && data?.custom_followup_history?.length > 0 ? (
                    <div className="hide-scrollbar overflow-x-auto">
                      <Table hoverable className="w-full min-w-[600px] text-left rtl:text-right">
                        <THead>
                          <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                              #
                            </Th>
                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                              Created Date
                            </Th>
                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                              Description
                            </Th>
                            <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                              Next Follow-up Date
                            </Th>
                          </Tr>
                        </THead>
                        <TBody>
                          {data?.custom_followup_history.map((record, index) => (
                            <Tr
                              key={index}
                              className="border-b border-gray-200 dark:border-dark-500"
                            >
                              <Td className="text-gray-700 dark:text-dark-200">
                                {index + 1}
                              </Td>
                              <Td className="text-gray-700 dark:text-dark-200">
                                {record.created_date
                                  ? new Date(record.created_date).toLocaleDateString()
                                  : '-'}
                              </Td>
                              <Td className="text-gray-700 dark:text-dark-200">
                                {record.description || '-'}
                              </Td>
                              <Td className="text-gray-700 dark:text-dark-200">
                                {record.next_date
                                  ? new Date(record.next_date).toLocaleDateString()
                                  : '-'}
                              </Td>
                            </Tr>
                          ))}
                        </TBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 dark:text-dark-300">
                        No follow-up records yet. Click &quot;Add New Record&quot; to add one.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>}

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

        {/* Add Follow-up History Modal */}
        <Transition appear show={showAddModal} as={Dialog} onClose={() => setShowAddModal(false)}>
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
                  Add Follow-up History
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
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
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                      placeholder="Enter follow-up description..."
                      rows="4"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Created Date
                    </label>
                    <input
                      type="date"
                      value={newRecord.created_date}
                      onChange={(e) => setNewRecord({ ...newRecord, created_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Next Follow-up Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newRecord.next_date}
                      onChange={(e) => setNewRecord({ ...newRecord, next_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRecord({
                      description: "",
                      next_date: "",
                      created_date: new Date().toISOString().split("T")[0]
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddFollowUp}
                  disabled={!newRecord.description || !newRecord.description.trim() || !newRecord.next_date}
                >
                  Add Record
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>

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

        {/* Add COD Document Modal */}
        <Transition appear show={showAddCODModal} as={Dialog} onClose={() => setShowAddCODModal(false)}>
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
                  Add COD Document
                </h2>
                <button
                  onClick={() => setShowAddCODModal(false)}
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
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newCODDocument.document_type}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, document_type: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                      required
                    >
                      <option value="">Select Document Type</option>
                      <option value="Car Mulkiya">Car Mulkiya</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Emirates ID">Emirates ID</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Credit Note">Credit Note</option>
                      <option value="Debit Note">Debit Note</option>
                      <option value="Car Passing">Car Passing</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      File Attachment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // In a real implementation, you would upload the file first and get the URL
                          // For now, we'll use a placeholder
                          setNewCODDocument({ ...newCODDocument, file_attachment: file.name });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Comments
                    </label>
                    <textarea
                      value={newCODDocument.comments}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, comments: e.target.value })}
                      placeholder="Enter comments..."
                      rows="3"
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
                    setShowAddCODModal(false);
                    setNewCODDocument({
                      document_type: "",
                      file_attachment: "",
                      status: "Pending",
                      comments: ""
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddCODDocument}
                  disabled={!newCODDocument.document_type || !newCODDocument.file_attachment}
                >
                  Add Document
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Transition>
      </div>
    </Page>
  );
};

