// Import Dependencies
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { getListData } from 'utils/apis';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useAddData, useFeachSingle, useUpdateData, useFeachData } from "hooks/useApiHook";
import { getCustomData } from "utils/apis";

const pageName = "Installation Note List"
const doctype = "Installation Note"
const fields_list = ['inst_date', 'customer', 'custom_site', 'custom_delivery_note', 'items']
const subFields = ['custom_vehicle_no', 'custom_driver_name', 'custom_recipe_name', 'custom_recipe_code', 'inst_time', 'custom_start_time', 'status']

const tableFields = {
  "items": { "item_code": true, "uom": true, "qty": true, "custom_bom_no": true, "custom_sales_order_no": true },
}

// ----------------------------------------------------------------------

function DeliveryNoteSelectionModal({ isOpen, onClose, onSelect, customer }) {
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [search, setSearch] = useState({
    doctype: "Delivery Note",
    page: 1,
    page_length: 10,
    filters: JSON.stringify([["Delivery Note", "status", "!=", "Draft"], ["Delivery Note", "customer", "=", customer], ["Delivery Note", "docstatus", "=", 1]]),
    fields: JSON.stringify(['name', 'customer', 'custom_site', 'posting_date'])
  });

  const { data } = useFeachData(search);

  useEffect(() => {
    setSearch({ ...search, filters: JSON.stringify([["Delivery Note", "status", "!=", "Draft"], ["Delivery Note", "customer", "=", customer], ["Delivery Note", "docstatus", "=", 1]]) })
  }, [customer])

  useEffect(() => {
    if (data?.data) {
      setDeliveryNotes(data.data);
    }
  }, [data]);

  const handleDeliveryNoteSelect = async (deliveryNote) => {
    // Fetch the delivery note details with items
    const deliveryNoteData = await getListData({
      doctype: "Delivery Note",
      filters: JSON.stringify([["Delivery Note", "name", "=", deliveryNote.name]]),
      fields: JSON.stringify(['*']),
      page_length: 1
    });
    
    if (deliveryNoteData?.data?.[0]) {
      onSelect(deliveryNoteData.data[0]);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40" />
        </TransitionChild>

        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-2xl flex-col overflow-y-auto rounded-lg bg-white p-4 transition-opacity duration-300 dark:bg-dark-700">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Select Delivery Note
              </h3>
            </div>

            <Table>
              <THead>
                <Tr>
                  <Th>Delivery Note</Th>
                  <Th>Date</Th>
                  <Th>Site</Th>
                  <Th>Action</Th>
                </Tr>
              </THead>
              <TBody>
                {deliveryNotes.map((note) => (
                  <Tr key={note.name}>
                    <Td>{note.name}</Td>
                    <Td>{note.posting_date}</Td>
                    <Td>{note.custom_site}</Td>
                    <Td>
                      <Button
                        size="sm"
                        onClick={() => handleDeliveryNoteSelect(note)}
                      >
                        Select
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

export default function AddEditFrom() {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [fields, setFields] = useState(null);
  const [initialState, setInitialState] = useState({});
  const [isDeliveryNoteModalOpen, setIsDeliveryNoteModalOpen] = useState(false);

  const { data: info, isFetching: isFetchingInfo } = useInfo({ doctype, fields: JSON.stringify([...fields_list, ...subFields]) });
  const { data, isFetching: isFetchingData } = useFeachSingle({ doctype, id, fields: JSON.stringify(fields) });

  useEffect(() => {
    if (info?.fields) {
      let fields = info?.fields.map(item => item.fieldname)
      setFields(fields);
      setInitialState(Object.fromEntries(fields.map(field => [field, ""])))
    }
  }, [info?.fields])

  const mutationAdd = useAddData((data) => {
    if (data) {
      reset();
      navigate(-1)
    }
  });

  const mutationUpdate = useUpdateData(async (data) => {
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
    watch
  } = useForm({
    resolver: yupResolver(Schema(info?.fields)),
    values: id ? data : initialState,
  });

  const onSubmit = async (formData) => {
    if (id) {
      const response = await getCustomData({
        url: `my_rmc.api.doctype.update_data?doctype=${doctype}&name=${id}&update_fields=${JSON.stringify([{ 'docstatus': 0 }])}`
      });
      if (response.success) {
        delete formData.creation
        delete formData.modified
        mutationUpdate.mutate({ doctype, body: { ...formData, 'docstatus': 1, id } })
      }
    } else {
      mutationAdd.mutate({ doctype, body: { ...formData, docstatus: 1 } })
    }
  };

  const handleDeliveryNoteSelect = (deliveryNote) => {
    const today = new Date();
    const formattedDate = today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, '0') + "-" +
      String(today.getDate()).padStart(2, '0');
    
    setValue('inst_date', formattedDate);
    setValue('customer', deliveryNote.customer);
    setValue('custom_site', deliveryNote.custom_site);
    setValue('custom_delivery_note', deliveryNote.name);
    setValue('custom_vehicle_no', deliveryNote.custom_vehicle);
    setValue('custom_driver_name', deliveryNote.driver_name);
    
    if (deliveryNote.items && deliveryNote.items.length > 0) {
      const firstItem = deliveryNote.items[0];
      setValue('custom_recipe_name', firstItem.item_code);
      setValue('items', deliveryNote.items.map(item => ({
        item_code: item.item_code,
        qty: item.qty,
        uom: item.uom,
        custom_bom_no: item.custom_bom_no,
        custom_sales_order_no: item.against_sales_order
      })));
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
              color={"success"}
              type="submit"
              form="new-post-form"
            >
              {"Submit"}
            </Button>
          </div>
        </div>

        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card className="p-4 sm:px-5">
                <div className="mt-5 space-y-5">
                  {(!id && !watch('custom_delivery_note')) ? (
                    <>
                      <DynamicForms
                        infos={info}
                        fields={['customer']}
                        register={register}
                        control={control}
                        errors={errors}
                      />
                      {watch('customer') && (
                        <Button
                          onClick={() => setIsDeliveryNoteModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          Select Delivery Note
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <DynamicForms
                        infos={info}
                        fields={fields_list}
                        tables={tableFields}
                        register={register}
                        control={control}
                        errors={errors}
                        readOnly={info?.is_submittable && data?.docstatus}
                      />
                    </>
                  )}
                </div>
              </Card>
            </div>
            {(id || watch('custom_delivery_note')) && (
              <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
                <Card className="space-y-5 p-4 sm:px-5">
                  <DynamicForms
                    infos={info}
                    fields={subFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                    readOnly={info?.is_submittable && data?.docstatus}
                  />
                </Card>
              </div>
            )}
          </div>
        </form>
      </div>
      {watch('customer') && (
        <DeliveryNoteSelectionModal
          isOpen={isDeliveryNoteModalOpen}
          onClose={() => setIsDeliveryNoteModalOpen(false)}
          onSelect={handleDeliveryNoteSelect}
          customer={watch('customer')}
        />
      )}
    </Page>
  );
}

