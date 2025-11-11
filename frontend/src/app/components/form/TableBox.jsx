// Import Dependencies
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useDisclosure } from "hooks";
import { Button, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { forwardRef, Fragment, useEffect, useState } from "react";
import { TiDelete, TiEdit } from "react-icons/ti";
import { ConfirmModal } from "components/shared/ConfirmModal";

// Local Imports
import SubValues from "./subValues";

// ----------------------------------------------------------------------

const TableBox = forwardRef(({ onChange, values, label, rootItem, tableFields, error, readOnly }, ref) => {
  const [listData, setListData] = useState([]);
  const [newValues, setNewValues] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [state, setState] = useState({ status: "pending" });
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    if (values) {
      setNewValues(values)
    }
  }, [values])


  const [isOpen, { open, close }] = useDisclosure(false);

  const openAddModal = () => {
    setEditingItem(null);
    setEditingIndex(-1);
    open();
  };

  const openEditModal = (item, index) => {
    setEditingItem(item);
    setEditingIndex(index);
    open();
  };

  const closePopup = async (data) => {
    if (data) {
      let updatedValues = [...newValues];

      if (editingIndex >= 0) {
        // Edit existing item
        updatedValues[editingIndex] = data;
      } else {
        // Add new item
        const seen = new Set();
        const uniqueLists = [];

        if (rootItem.sub_fields) {
          for (const item of [...newValues, data]) {
            const key = rootItem.sub_fields.map(k => item[k.fieldname]).join("|");
            if (!seen.has(key)) {
              seen.add(key);
              uniqueLists.push(item);
            }
          }
          updatedValues = uniqueLists;
        } else {
          updatedValues.push(data);
        }
      }

      setNewValues(updatedValues);
      onChange(updatedValues);

      // Fetch display data for new/updated items
      // await fetchDisplayData(updatedValues);
    }
    close();
    setEditingItem(null);
    setEditingIndex(-1);
  }

  const handleDelete = () => {
    if (state) {
      const new_values = [...newValues];
      if (state.key > -1) {
        new_values.splice(state.key, 1);
      }
      setNewValues(new_values);
      onChange(new_values);
      setState({ status: "success" });
      // fetchDisplayData(new_values);
    }
  }

  const confirmMessages = {
    pending: {
      description:
        `Are you sure you want to delete this, it cannot be restored.`,
    },
    success: {
      title: `Item Deleted`,
    },
  };

  // Improved getDisplayValue helper function
  const getDisplayValue = (item, field) => {
    const rawValue = item[field.fieldname];

    if (field.fieldtype === "Link" && listData[field.fieldname]) {
      const linkedData = listData[field.fieldname].find(linkedItem => linkedItem.name === rawValue);
      if (linkedData) {
        // Try to find a display field, otherwise use name
        const displayFields = tableFields[field.fieldname] || [];
        // Ensure displayFields is an array before calling find
        const fieldsArray = Array.isArray(displayFields) ? displayFields : [];
        const displayField = fieldsArray.find(f => f !== 'name') || 'name';
        return linkedData[displayField] || linkedData.name || rawValue;
      }
    }

    return rawValue;
  };

  return (
    <>
      <div>
        <div className="flex items-center">
          <label className="input-label"><span className="input-label">{label}</span></label>
          {!readOnly && <Button onClick={openAddModal} color="secondary" className="ml-auto">ADD NEW</Button>}
        </div>

        <div className="relative mt-1.5">
          <div className="hide-scrollbar w-full max-w-[300px] sm:max-w-[400px] md:max-w-full overflow-x-auto overflow-y-hidden scroll-smooth">
            <Table hoverable className="w-full text-left rtl:text-right">
              <THead>
                <Tr>
                  <Th className="w-16 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">#</Th>
                  {rootItem?.sub_fields?.map((field, index) => {
                    if (field.fieldname in tableFields) {
                      return <Th
                        key={field.fieldname}
                        className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100"
                      >
                        {field.label || field.fieldname}
                      </Th>
                    }
                  })}
                  <Th className="w-24 bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">Action</Th>
                </Tr>
              </THead>
              <TBody>
                {newValues.map((item, index) => (
                  <Tr key={index} className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                    <Td>{index + 1}</Td>
                    {rootItem?.sub_fields?.map((field) => {
                      if (field.fieldname in tableFields) {
                        return <Td key={field.fieldname}>
                          {getDisplayValue(item, field)}
                        </Td>
                      }
                    })}
                    <Td>
                      <div className="flex gap-1">
                        {!readOnly && (
                          <>
                            <Button
                              onClick={() => openEditModal(item, index)}
                              color="primary"
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <TiEdit className="size-4" />
                            </Button>
                            <Button
                              onClick={() => { setDeleteModalOpen(true); setState({ status: "pending", key: index }) }}
                              color="error"
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <TiDelete className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          <span className="input-text-error mt-1 text-xs text-error dark:text-error-lighter">{error}</span>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={close}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed right-0 top-0 flex h-full sm:w-[95%] md:w-[600px] transform-gpu flex-col bg-white transition-transform duration-200 dark:bg-dark-700">
              {isOpen && !readOnly && (
                <SubValues
                  onClose={(data) => closePopup(data)}
                  id={editingItem?.name || null}
                  doctype={rootItem.options}
                  readOnly={readOnly}
                  initialData={editingItem}
                />
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        messages={confirmMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={state.status}
      />

    </>
  );
});

TableBox.displayName = "TableBox";

export { TableBox };
