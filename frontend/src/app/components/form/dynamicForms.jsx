import RenderField from "./renderField";

export default function DynamicForms({ infos, fields, register, control, errors, tables, readOnly, readOnlyFields = [], ignorFields = [] }) {

    // Add safety checks
    if (!infos || !infos.fields || !Array.isArray(infos.fields)) {
        console.warn('DynamicForms: infos or infos.fields is not properly defined');
        return null;
    }

    if (!fields || !Array.isArray(fields)) {
        console.warn('DynamicForms: fields is not properly defined');
        return null;
    }

    return (
        <div className="space-y-4">
            {fields.map((field, index) => {
                const info = infos.fields.find((item) => {
                    if (!item || !item.fieldname) return false;
                    if (item.fieldname === "last_name") {
                        item.reqd = 1
                    }
                    return field === item.fieldname && !(tables?.ignorFields?.[item.fieldname]);
                });

                if (field && info && !ignorFields.includes(info.fieldname)) {
                    const isFieldReadOnly = readOnly || readOnlyFields.includes(info.fieldname);
                    return <div key={index} className="form-group">
                        <div className="space-y-4">
                            <RenderField key={info.fieldname} item={info} control={control} register={register} errors={errors} tables={tables} readOnly={isFieldReadOnly} />
                        </div>
                    </div>
                }
                return null;
            })}
        </div>
    );
}