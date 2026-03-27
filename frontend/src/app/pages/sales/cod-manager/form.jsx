import React from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import { useDisclosure } from "hooks";
import { ChangePasswordModal } from "../../../components/ChangePasswordModal";

const pageName = "COD Manager"
const doctype = "User"

const fields = [
  'first_name',
  'last_name',
  'email',
  'mobile_no',
  'custom_sales_target',
]

const subFields = [ 'enabled','user_image']

const tableFields = {
  "ignorFields": {},
}

// ----------------------------------------------------------------------

export default function AddEditFrom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPasswordModalOpen, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

  const { data: info, isLoading: infoLoading } = useInfo({ doctype, fields: JSON.stringify([...fields, ...subFields]) });
  const { data, isLoading: dataLoading, refetch: refetchData } = useFeachSingle({ doctype, id, fields: JSON.stringify([...fields, ...subFields]) });

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(Schema(info?.fields)),
    defaultValues: {}
  });

  const mutationAdd = useAddData((data) => {
    if (data) {
      navigate(-1);
    }
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      navigate(-1);
    }
  });

  const onSubmit = (formData) => {
    if (id) {
      mutationUpdate.mutate({ doctype, body: { ...formData, id, role_profile_name: "Lead Manager" } });
    } else {
      mutationAdd.mutate({ doctype, body: { ...formData, role_profile_name: "Lead Manager" } });
    }
  };

  React.useEffect(() => {
    if (data && id) {
      Object.keys(data).forEach((key) => {
        setValue(key, data[key]);
      });
    }
  }, [data, id, setValue]);

  if (infoLoading || (id && dataLoading)) {
    return (
      <Page title={(id ? 'Edit ' : "New ") + pageName}>
        <div className="transition-content px-(--margin-x) pb-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </Page>
    );
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
            {id && (
              <Button
                className="min-w-[7rem]"
                variant="outlined"
                onClick={openPasswordModal}
              >
                Change Password
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
              form="new-post-form"
              type="submit"
            >
              {id ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
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

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={closePasswordModal}
          userId={id}
          doctype={doctype}
        />
      </div>
    </Page>
  );
}

