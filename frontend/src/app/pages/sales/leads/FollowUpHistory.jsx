import React, { useState } from "react";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useUpdateData } from "hooks/useApiHook";

export default function FollowUpHistory({ id, data, setValue, refetchData }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    description: "",
    next_date: "",
    created_date: new Date().toISOString().split("T")[0]
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      if (showAddModal) {
        setShowAddModal(false);
        refetchData();
      }
    }
  });

  const handleAddFollowUp = () => {
    if (newRecord.description && newRecord.description.trim() && newRecord.next_date) {
      const currentRecords = data?.custom_followup_history || [];
      const updatedRecords = [...currentRecords, {
        ...newRecord,
        idx: currentRecords.length + 1
      }];
      mutationUpdate.mutate({ 
        doctype: "Lead", 
        body: { 
          id, 
          custom_followup_history: updatedRecords, 
          custom_next_follow_up_date: newRecord.next_date, 
          custom_lead_status: "Call Back" 
        } 
      });
      setValue("custom_followup_history", updatedRecords);
      setNewRecord({
        description: "",
        next_date: "",
        created_date: new Date().toISOString().split("T")[0]
      });
    }
  };

  if (!id) return null;

  return (
    <>
      <div className="col-span-12 lg:col-span-12">
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
      </div>

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
    </>
  );
}

