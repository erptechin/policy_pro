import RenderField from "./renderField";

export default function DynamicForms({ infos, fields, register, control, errors, tables, readOnly, ignorFields = [] }) {
    // If fields is null, use all fields from infos
    const fieldsToRender = fields === null 
        ? (infos?.fields || []).map(f => f.fieldname)
        : fields;

    return (
        <div className="space-y-4">
            {fieldsToRender && fieldsToRender.map((field, index) => {
                const info = infos && infos.fields.find((item) => field == item?.fieldname && !tables?.ignorFields[item?.fieldname])
                if (field && info && !ignorFields.includes(info.fieldname)) {
                    return <div key={index} className="form-group">
                        <div className="space-y-4">
                            <RenderField key={info.fieldname} item={info} control={control} register={register} errors={errors} tables={tables} readOnly={readOnly} />
                        </div>
                    </div>
                }
            })}
        </div>
    );
}