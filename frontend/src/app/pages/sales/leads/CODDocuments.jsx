import React, { useState, useEffect } from "react";
import { Button, Upload, Card, Table, THead, TBody, Th, Tr, Td, Avatar, Select, Input } from "components/ui";
import { PlusIcon, XMarkIcon, CloudArrowUpIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useAddData, useUpdateData, useFeachData, useDeleteData } from "hooks/useApiHook";
import { JWT_HOST_API } from 'configs/auth.config';
import { SearchSelect } from "app/components/form/SearchSelect";
import { getListData, createCODManagement, updateCODManagement, showError } from 'utils/apis';
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function CODDocuments({ id, data }) {
  const [showAddCODModal, setShowAddCODModal] = useState(false);
  const [showEditCODModal, setShowEditCODModal] = useState(false);
  const [selectedCODId, setSelectedCODId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codToDelete, setCodToDelete] = useState(null);
  const [carProfiles, setCarProfiles] = useState([]);
  const [approvalManages, setApprovalManages] = useState([]);

  const [newCODDocument, setNewCODDocument] = useState({
    lead: id || "",
    customer: data?.customer || "",
    car_profile: "",
    approval_manager: "",
    policy_name: "",
    policy_amount: "",
    status: "Waiting",
    type: "New",
    file_attachment: "",
    comments: ""
  });

  // Fetch COD Management records filtered by lead
  const [search, setSearch] = useState({
    doctype: "COD Management",
    page: 1,
    page_length: 100,
    fields: JSON.stringify(["name", "lead", "customer", "car_profile", "approval_manager", "policy_name", "policy_amount", "status", "file_attachment", "comments", "creation", "modified"]),
    filters: id ? JSON.stringify([["lead", "=", id], ["type", "=", "New"]]) : null
  });

  const { data: codData, isFetching: isLoadingCOD, refetch: refetchCOD } = useFeachData(search);

  // Fetch car profiles for dropdown
  useEffect(() => {
    if (id) {
      getListData({
        doctype: "Car Profile",
        fields: JSON.stringify(["name", "car_make", "car_model", "car_year"]),
        filters: JSON.stringify([["lead", "=", id], ["status", "=", "New"]]),
        page_length: 100
      }).then((res) => {
        if (res?.data) {
          const options = res.data.map(item => ({
            label: `${item.car_make || ''} ${item.car_model || ''} ${item.car_year || ''}`.trim() || item.name,
            value: item.name
          }));
          setCarProfiles(options);
        }
      });
      getListData({
        doctype: "User",
        fields: JSON.stringify(["name", "full_name"]),
        filters: JSON.stringify([["User Role Profile", "role_profile", "=", "Lead Manager"]]),
        page_length: 100
      }).then((res) => {
        if (res?.data) {
          const options = res.data.map(item => ({
            label: `${item.full_name || ''}`.trim() || item.name,
            value: item.name
          }));
          setApprovalManages(options);
        }
      });
    }
  }, [id]);

  // Update search when id changes
  useEffect(() => {
    if (id) {
      setSearch(prev => ({
        ...prev,
        filters: JSON.stringify([["lead", "=", id], ["type", "=", "New"]])
      }));
    }
  }, [id]);

  // Update codDocuments state
  useEffect(() => {
    if (codData?.data) {
      setCodDocuments(codData.data);
    } else {
      setCodDocuments([]);
    }
  }, [codData]);

  const [codDocuments, setCodDocuments] = useState([]);
  const [isAddingCOD, setIsAddingCOD] = useState(false);
  const [isUpdatingCOD, setIsUpdatingCOD] = useState(false);

  const mutationAdd = useAddData((data) => {
    if (data) {
      setShowAddCODModal(false);
      resetForm();
      refetchCOD();
    }
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      setShowEditCODModal(false);
      setSelectedCODId(null);
      resetForm();
      refetchCOD();
    }
  });

  const mutationDelete = useDeleteData((data) => {
    if (data && data.success) {
      setShowDeleteModal(false);
      setCodToDelete(null);
      refetchCOD();
    }
  });

  const resetForm = () => {
    setNewCODDocument({
      lead: id || "",
      customer: data?.customer || "",
      car_profile: "",
      approval_manager: "",
      policy_name: "",
      policy_amount: "",
      status: "Waiting",
      type: "New",
      file_attachment: "",
      comments: ""
    });
  };

  const handleAddCOD = async () => {
    if (!newCODDocument.file_attachment) {
      showError({ message: "File attachment is required" });
      return;
    }

    setIsAddingCOD(true);
    try {
      const result = await createCODManagement(newCODDocument);
      if (result && result.cod_id) {
        setShowAddCODModal(false);
        resetForm();
        refetchCOD();
      } else {
        showError({ message: "Failed to create COD Management" });
      }
    } catch (error) {
      console.error("Error creating COD Management:", error);
      showError(error);
    } finally {
      setIsAddingCOD(false);
    }
  };

  const handleEditClick = (codId) => {
    const codDoc = codDocuments.find(doc => doc.name === codId);
    if (codDoc) {
      setNewCODDocument({
        lead: codDoc.lead || id || "",
        customer: codDoc.customer || data?.customer || "",
        car_profile: codDoc.car_profile || "",
        approval_manager: codDoc.approval_manager || "",
        policy_name: codDoc.policy_name || "",
        policy_amount: codDoc.policy_amount || "",
        status: codDoc.status || "Waiting",
        file_attachment: codDoc.file_attachment || "",
        comments: codDoc.comments || ""
      });
      setSelectedCODId(codId);
      setShowEditCODModal(true);
    }
  };

  const handleUpdateCOD = async () => {
    if (!selectedCODId) {
      showError({ message: "COD Management ID is required" });
      return;
    }

    if (!newCODDocument.file_attachment) {
      showError({ message: "File attachment is required" });
      return;
    }

    setIsUpdatingCOD(true);
    try {
      const result = await updateCODManagement(selectedCODId, newCODDocument);
      if (result && result.cod_id) {
        setShowEditCODModal(false);
        setSelectedCODId(null);
        resetForm();
        refetchCOD();
      } else {
        showError({ message: "Failed to update COD Management" });
      }
    } catch (error) {
      console.error("Error updating COD Management:", error);
      showError(error);
    } finally {
      setIsUpdatingCOD(false);
    }
  };

  const handleDeleteClick = (codId) => {
    setCodToDelete(codId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (codToDelete) {
      mutationDelete.mutate({ doctype: "COD Management", ids: [codToDelete] });
    }
  };

  // Update customer when data changes
  useEffect(() => {
    if (data?.customer) {
      setNewCODDocument(prev => ({
        ...prev,
        customer: data.customer
      }));
    }
  }, [data?.customer]);

  if (!id) return null;

  return (
    <>
      <div className="col-span-12 lg:col-span-12">
        <Card className="p-4 sm:px-5">
          <div className="mt-5 space-y-5">
            {/* Display COD Documents */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                COD Document Approvals
              </h3>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddCODModal(true);
                }}
                color="primary"
                className="flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                Approvals Request
              </Button>
            </div>
            {isLoadingCOD ? (
              <div className="py-4 text-center text-sm text-gray-500">
                Loading COD documents...
              </div>
            ) : codDocuments && codDocuments.length > 0 ? (
              <div className="mt-6">
                <div className="hide-scrollbar overflow-x-auto">
                  <Table hoverable className="w-full min-w-[900px] text-left rtl:text-right">
                    <THead>
                      <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Customer
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Car Profile
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Policy Name
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Policy Amount
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Status
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Approval Manager
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          File Attachment
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Comments
                        </Th>
                        <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                          Actions
                        </Th>
                      </Tr>
                    </THead>
                    <TBody>
                      {codDocuments.map((doc) => (
                        <Tr
                          key={doc.name}
                          className="border-b border-gray-200 dark:border-dark-500"
                        >
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.customer || '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.car_profile || '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.policy_name || '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.policy_amount ? `AED ${parseFloat(doc.policy_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            <span className={clsx(
                              "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                              doc.status === "Approve" && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                              doc.status === "Decline" && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                              doc.status === "Waiting" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            )}>
                              {doc.status || '-'}
                            </span>
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.approval_manager || '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.file_attachment ? (
                              <a
                                href={`${JWT_HOST_API}${doc.file_attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                View File
                              </a>
                            ) : '-'}
                          </Td>
                          <Td className="text-gray-700 dark:text-dark-200">
                            {doc.comments || '-'}
                          </Td>
                          <Td>
                            {doc.status !== "Approve" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  onClick={() => handleEditClick(doc.name)}
                                  className="p-1.5"
                                >
                                  <PencilIcon className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleDeleteClick(doc.name)}
                                  className="p-1.5"
                                  disabled={mutationDelete.isPending}
                                >
                                  <TrashIcon className="size-4" />
                                </Button>
                              </div>
                            )}
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
      </div>

      {/* Add COD Document Modal */}
      <Transition appear show={showAddCODModal} as={Dialog} onClose={() => {
        setShowAddCODModal(false);
        resetForm();
      }}>
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
          <div className="scrollbar-sm relative flex w-full max-w-2xl flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Add Approvals Request
              </h2>
              <button
                onClick={() => {
                  setShowAddCODModal(false);
                  resetForm();
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SearchSelect
                      label="Car Profile"
                      lists={carProfiles}
                      value={newCODDocument.car_profile}
                      onChange={(value) => setNewCODDocument({ ...newCODDocument, car_profile: value || "" })}
                      placeholder="Select Car Profile"
                      req={true}
                    />
                  </div>
                  <div>
                    <SearchSelect
                      label="Approval Manager"
                      lists={approvalManages}
                      value={newCODDocument.approval_manager}
                      onChange={(value) => setNewCODDocument({ ...newCODDocument, approval_manager: value || "" })}
                      placeholder="Select Approval Manager"
                      req={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newCODDocument.policy_name}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, policy_name: e.target.value })}
                      placeholder="Enter Policy Name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Policy Amount
                    </label>
                    <Input
                      type="number"
                      value={newCODDocument.policy_amount}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, policy_amount: e.target.value })}
                      placeholder="Enter Policy Amount"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    File Attachment <span className="text-red-500">*</span>
                  </label>
                  <Upload
                    onChange={(fileUrl) => {
                      if (fileUrl) {
                        setNewCODDocument({ ...newCODDocument, file_attachment: fileUrl });
                      }
                    }}
                  >
                    {({ ...props }) => (
                      <Button
                        {...props}
                        unstyled
                        className={clsx(
                          "mt-3 w-full shrink-0 flex-col rounded-lg border-2 border-dashed py-10 border-gray-300 dark:border-dark-450"
                        )}
                      >
                        <CloudArrowUpIcon className="size-12" />
                        <span className={clsx("pointer-events-none mt-2 text-gray-600 dark:text-dark-200")}>
                          <span className="text-primary-600 dark:text-primary-400">Browse</span>
                          <span> or drop your files here</span>
                        </span>
                        {newCODDocument.file_attachment && (
                          <span className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                            File selected
                          </span>
                        )}
                      </Button>
                    )}
                  </Upload>
                  {newCODDocument.file_attachment && (
                    <div className="mt-2 flex flex-col space-y-4">
                      <div className="relative inline-block">
                        <Avatar
                          size={24}
                          src={`${JWT_HOST_API}${newCODDocument.file_attachment}`}
                          classNames={{ display: "rounded-lg" }}
                        />
                      </div>
                    </div>
                  )}
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
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleAddCOD}
                disabled={!newCODDocument.file_attachment || isAddingCOD}
              >
                {isAddingCOD ? 'Adding...' : 'Add Document'}
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Transition>

      {/* Edit COD Document Modal */}
      <Transition appear show={showEditCODModal} as={Dialog} onClose={() => {
        setShowEditCODModal(false);
        setSelectedCODId(null);
        resetForm();
      }}>
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
          <div className="scrollbar-sm relative flex w-full max-w-2xl flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Edit COD Document
              </h2>
              <button
                onClick={() => {
                  setShowEditCODModal(false);
                  setSelectedCODId(null);
                  resetForm();
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SearchSelect
                      label="Car Profile"
                      lists={carProfiles}
                      value={newCODDocument.car_profile}
                      onChange={(value) => setNewCODDocument({ ...newCODDocument, car_profile: value || "" })}
                      placeholder="Select Car Profile"
                    />
                  </div>
                  <div>
                    <SearchSelect
                      label="Approval Manager"
                      lists={approvalManages}
                      value={newCODDocument.approval_manager}
                      onChange={(value) => setNewCODDocument({ ...newCODDocument, approval_manager: value || "" })}
                      placeholder="Select Approval Manager"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Policy Name
                    </label>
                    <Input
                      value={newCODDocument.policy_name}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, policy_name: e.target.value })}
                      placeholder="Enter Policy Name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                      Policy Amount
                    </label>
                    <Input
                      type="number"
                      value={newCODDocument.policy_amount}
                      onChange={(e) => setNewCODDocument({ ...newCODDocument, policy_amount: e.target.value })}
                      placeholder="Enter Policy Amount"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    File Attachment <span className="text-red-500">*</span>
                  </label>
                  <Upload
                    onChange={(fileUrl) => {
                      if (fileUrl) {
                        setNewCODDocument({ ...newCODDocument, file_attachment: fileUrl });
                      }
                    }}
                  >
                    {({ ...props }) => (
                      <Button
                        {...props}
                        unstyled
                        className={clsx(
                          "mt-3 w-full shrink-0 flex-col rounded-lg border-2 border-dashed py-10 border-gray-300 dark:border-dark-450"
                        )}
                      >
                        <CloudArrowUpIcon className="size-12" />
                        <span className={clsx("pointer-events-none mt-2 text-gray-600 dark:text-dark-200")}>
                          <span className="text-primary-600 dark:text-primary-400">Browse</span>
                          <span> or drop your files here</span>
                        </span>
                        {newCODDocument.file_attachment && (
                          <span className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                            File selected
                          </span>
                        )}
                      </Button>
                    )}
                  </Upload>
                  {newCODDocument.file_attachment && (
                    <div className="mt-2 flex flex-col space-y-4">
                      <div className="relative inline-block">
                        <Avatar
                          size={24}
                          src={`${JWT_HOST_API}${newCODDocument.file_attachment}`}
                          classNames={{ display: "rounded-lg" }}
                        />
                      </div>
                    </div>
                  )}
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
                  setShowEditCODModal(false);
                  setSelectedCODId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleUpdateCOD}
                disabled={!newCODDocument.file_attachment || isUpdatingCOD}
              >
                {isUpdatingCOD ? 'Updating...' : 'Update Document'}
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Transition>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCodToDelete(null);
        }}
        onOk={handleConfirmDelete}
        confirmLoading={mutationDelete.isPending}
        state={mutationDelete.isError ? "error" : "pending"}
        messages={{
          pending: {
            title: "Delete COD Document?",
            description: "Are you sure you want to delete this COD document? This action cannot be undone.",
            actionText: "Delete"
          }
        }}
      />
    </>
  );
}
