import React, { useState } from "react";
import { Button, Upload, Card, Table, THead, TBody, Th, Tr, Td, Avatar } from "components/ui";
import { PlusIcon, XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { SearchSelect } from "app/components/form/SearchSelect";
import clsx from "clsx";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useUpdateData } from "hooks/useApiHook";
import { JWT_HOST_API } from 'configs/auth.config';

export default function CODDocuments({ id, data, setValue, refetchData }) {
  const [showAddCODModal, setShowAddCODModal] = useState(false);
  const [newCODDocument, setNewCODDocument] = useState({
    document_type: "",
    file_attachment: "",
    comments: ""
  });

  // Document type options for SearchSelect
  const documentTypeOptions = [
    { label: "Car Mulkiya", value: "Car Mulkiya" },
    { label: "Driving License", value: "Driving License" },
    { label: "Emirates ID", value: "Emirates ID" },
    { label: "Invoice", value: "Invoice" },
    { label: "Credit Note", value: "Credit Note" },
    { label: "Debit Note", value: "Debit Note" },
    { label: "Car Passing", value: "Car Passing" }
  ];

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      if (showAddCODModal) {
        setShowAddCODModal(false);
        refetchData();
      }
    }
  });

  const formatDateTimeForMySQL = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleAddCODDocument = () => {
    if (newCODDocument.document_type && newCODDocument.file_attachment) {
      const currentDocuments = data?.cod_documents || [];
      const updatedDocuments = [...currentDocuments, {
        ...newCODDocument,
        upload_date: formatDateTimeForMySQL(new Date()),
        idx: currentDocuments.length + 1
      }];
      mutationUpdate.mutate({ doctype: "Lead", body: { id, cod_documents: updatedDocuments } });
      setValue("cod_documents", updatedDocuments);
      setNewCODDocument({
        document_type: "",
        file_attachment: "",
        comments: ""
      });
    }
  };

  if (!id) return null;

  return (
    <>
      <div className="col-span-12 lg:col-span-12">
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
      </div>

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
                  <SearchSelect
                    label={
                      <>
                        Document Type <span className="text-red-500">*</span>
                      </>
                    }
                    lists={documentTypeOptions}
                    value={newCODDocument.document_type}
                    onChange={(value) => setNewCODDocument({ ...newCODDocument, document_type: value || "" })}
                    placeholder="Select Document Type"
                  />
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
                  setNewCODDocument({
                    document_type: "",
                    file_attachment: "",
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
    </>
  );
}

