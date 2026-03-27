// Import Dependencies
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup"; import { useForm, } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "app/contexts/auth/context";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import { showError, addData, createLeadWithCustomer } from "utils/apis";
import FollowUpHistory from './FollowUpHistory';
import CODDocuments from './CODDocuments';
import CarProfiles from 'app/components/car-profile/CarProfiles';

const pageName = "Lead"
const doctype = "Lead"

const fields = [
  'first_name',
  'last_name',
  'email_id',
  'mobile_no'
]

const subFields = [
  'custom_assigned_user',
  'custom_lead_status',
  'custom_next_follow_up_date',
  'source',
  'custom_followup_history'
]

const tableFields = {
  "ignorFields": { status: true, custom_followup_history: true },
}

// ----------------------------------------------------------------------

export default function AddEditFrom() {
  const { user: { username } } = useAuthContext();
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ doctype, fields: JSON.stringify([...fields, ...subFields]) });
  const { data, isFetching: isFetchingData, refetch: refetchData } = useFeachSingle({ doctype, id, fields: JSON.stringify([...fields, ...subFields]) });

  // State to track car profiles when creating new lead
  const [carProfilesToCreate, setCarProfilesToCreate] = useState([]);
  const [isCreating, setIsCreating] = useState(false);


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
    defaultValues: Object.fromEntries(
      [...fields, ...subFields].map(field => [field, ""])
    ),
  });


  const onSubmit = async (formData) => {
    if (id) {
      // Editing existing lead - use normal flow
      const submitData = {
        ...formData
      };
      mutationUpdate.mutate({ doctype, body: { ...submitData, id } });
    } else {

      setIsCreating(true);

      try {
        // Call Python endpoint to create Lead with Customer and Car Profiles
        const result = await createLeadWithCustomer(formData, carProfilesToCreate, username);
        
        if (!result || (!result.lead_id && !result.customer_id)) {
          throw new Error("Failed to create lead");
        }

        // All done - navigate back
        reset();
        setCarProfilesToCreate([]);
        navigate(-1);
      } catch (error) {
        console.error("Error creating lead:", error);
        showError(error);
      } finally {
        setIsCreating(false);
      }
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
              color="primary"
              type="submit"
              form="new-post-form"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Save'}
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
                  readOnlyFields={['custom_lead_status', 'custom_next_follow_up_date']}
                />
              </Card>
            </div>
          </div>

          {/* Car Profiles Section */}
          <div className="mt-6">
            <CarProfiles
              leadId={id}
              customerId={data?.customer}
              leadName={data?.lead_name || data?.name}
              isCreateMode={!id}
              carProfilesToCreate={carProfilesToCreate}
              setCarProfilesToCreate={setCarProfilesToCreate}
            />
          </div>
        </form>

      </div>
    </Page>
  );
};

