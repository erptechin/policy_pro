import { useRef } from "react";
import { Controller } from 'react-hook-form';
import { SketchPicker } from 'react-color';
import Cleave from "cleave.js/react";
import TextareaAutosize from "react-textarea-autosize";
import { ContextualHelp } from "components/shared/ContextualHelp";
import { Input, Textarea, Checkbox, Button, Upload, Avatar, Select } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { TextEditor } from "components/shared/form/TextEditor";
import { htmlToDelta } from "utils/quillUtils";
import { JWT_HOST_API } from 'configs/auth.config';
import { SearchSelect } from "./SearchSelect";
import { SearchSelectDynamic } from "./SearchSelectDynamic";
import { TableBox } from "./TableBox";
import clsx from "clsx";

const editorModules = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }, "image"],
        ["clean"],
    ],
};


export default function RenderField({ item, control, register, errors, tables, readOnly }) {
    const uploadRef = useRef();
    if (!item) return null;

    const getLabelNode = (fieldItem) => {
        const baseLabel = fieldItem?.label;
        const recFields = tables?.recFields ? tables?.recFields : {}
        if (!baseLabel) return baseLabel;
        const required = Boolean(fieldItem?.reqd) || (fieldItem.fieldname in recFields);
        return required ? (<><span>{baseLabel}</span><span className="text-red-500"> *</span></>) : baseLabel;
    }

    return (
        <div key={item.fieldname} className="form-group my-2" id={item.fieldname}>
            {(() => {
                switch (item.fieldtype) {
                    case 'Attach':
                    case 'Attach Image':
                        return (
                            <Controller
                                render={({ field: { value, onChange } }) => {
                                    const isAttachImage = item.fieldtype === 'Attach Image';
                                    const accept = isAttachImage ? 'image/*' : undefined;
                                    const imageUrl = value ? `${JWT_HOST_API}${value}` : '';
                                    return (
                                        <div>
                                            {item.label && (
                                                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-dark-200">
                                                    {getLabelNode(item)}
                                                </label>
                                            )}
                                            <Upload onChange={onChange} ref={uploadRef} accept={accept}>
                                                {({ onClick, disabled, ...rest }) => (
                                                    <div
                                                        onClick={disabled ? undefined : onClick}
                                                        role="button"
                                                        {...rest}
                                                        className={clsx(
                                                            "relative aspect-[4/3] overflow-hidden rounded-lg border group",
                                                            "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300",
                                                            "dark:from-gray-700 dark:to-gray-800 dark:border-gray-600"
                                                        )}
                                                        style={{ minHeight: '100px' }}
                                                    >
                                                        {value ? (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                                                                        if (fallback) fallback.setAttribute('style', 'display: flex');
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 transition-all duration-200 flex items-center justify-center bg-black/70 group-hover:bg-black/50">
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                                                                        <CloudArrowUpIcon className="h-8 w-8 mx-auto mb-2" />
                                                                        <p className="text-sm">Change image</p>
                                                                    </div>
                                                                </div>
                                                                <div className="image-fallback absolute inset-0 hidden items-center justify-center rounded-lg text-gray-500 dark:text-gray-400">
                                                                    <div className="text-center">
                                                                        <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-2" />
                                                                        <p className="text-sm">Image not available</p>
                                                                        <p className="text-xs">Click to upload new image</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(ev) => { ev.stopPropagation(); onChange(null); }}
                                                                    className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer ring-2 ring-white dark:ring-dark-700"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                                                <CloudArrowUpIcon className="h-12 w-12 mb-2" />
                                                                <p className="text-sm font-medium">Upload image</p>
                                                                <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Click to select image</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Upload>
                                            {errors[item.fieldname]?.message && (
                                                <p className="text-red-400 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                                                    <span className="text-red-500">⚠</span>
                                                    {errors[item.fieldname]?.message}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Color':
                        return (
                            <Controller
                                render={({ field: { value, onChange } }) => (
                                    <SketchPicker
                                        color={value}
                                        onChange={(val) => onChange(val.hex)}
                                        placeholder={`Enter the ${item.label}`}
                                        error={errors[item.fieldname]?.message}
                                    />
                                )}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Data':
                    case 'Text':
                    case 'Int':
                    case 'Float':
                        return (
                            <Controller
                                render={({ field: { onChange, value } }) => {
                                    if ((item.label && (item.label.toLowerCase().endsWith('mobile') || item.label.toLowerCase().endsWith('phone') || item.label.toLowerCase().startsWith('mobile') || item.label.toLowerCase().startsWith('phone')))) {
                                        return <Input
                                            value={value}
                                            onChange={onChange}
                                            label={getLabelNode(item)}
                                            placeholder={`Enter the ${item.label}`}
                                            component={Cleave}
                                            // options={{
                                            //     numericOnly: true,
                                            //     blocks: [0, 3, 3, 4],
                                            //     delimiters: [' ', ' ', '-']
                                            // }}
                                            error={errors[item.fieldname]?.message}
                                            readOnly={readOnly}
                                        />
                                    } else {
                                        return <div className="items-center w-full relative">
                                            <Input
                                                type={item.fieldtype === 'Int' || item.fieldtype === 'Float' ? "number" : "text"}
                                                value={value}
                                                onChange={onChange}
                                                label={getLabelNode(item)}
                                                component={item.fieldtype === 'Int' || item.fieldtype === 'Float' ? Cleave : undefined}
                                                options={
                                                    item.fieldtype === 'Int'
                                                        ? {
                                                            numeral: true,
                                                            numeralThousandsGroupStyle: 'thousand',
                                                            numeralDecimalScale: 0,
                                                            numeralPositiveOnly: true
                                                        }
                                                        : item.fieldtype === 'Float'
                                                            ? {
                                                                numeral: true,
                                                                numeralThousandsGroupStyle: 'thousand',
                                                                numeralDecimalScale: 2,
                                                                numeralPositiveOnly: true,
                                                                delimiter: ','
                                                            }
                                                            : undefined
                                                }
                                                error={errors[item.fieldname]?.message}
                                                readOnly={readOnly}
                                            />
                                            <div className="absolute top-0 right-0">
                                                {item.description && <ContextualHelp
                                                    content={item.description}
                                                />}
                                            </div>
                                        </div>
                                    }
                                }}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Autocomplete':
                        return (
                            <Controller
                                render={({ field: { onChange, value } }) => {
                                    return <Input
                                        value={value}
                                        onChange={onChange}
                                        label={getLabelNode(item)}
                                        placeholder={`Enter the ${item.label}`}
                                        error={errors[item.fieldname]?.message}
                                    />

                                }}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Read Only':
                        return (
                            <Controller
                                render={({ field: { value } }) => {
                                    return <Input
                                        value={value}
                                        readOnly={true}
                                        label={getLabelNode(item)}
                                        placeholder={`Enter the ${item.label}`}
                                        error={errors[item.fieldname]?.message}
                                    />

                                }}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Duration':
                    case 'Percent':
                    case 'Currency':
                        return (
                            <Controller
                                render={({ field: { value } }) => (
                                    <Input
                                        type="number"
                                        value={value}
                                        label={getLabelNode(item)}
                                        placeholder={`Enter the ${item.label}`}
                                        {...register(item.fieldname)}
                                        error={errors[item.fieldname]?.message}
                                    />
                                )}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Check':
                        return (
                            <Checkbox
                                variant="outlined"
                                label={getLabelNode(item)}
                                {...register(item.fieldname)}
                                error={errors[item.fieldname]?.message}
                            />
                        );

                    case 'Button':
                        return (
                            <Button
                                color="warning"
                                {...register(item.fieldname)}
                                error={errors[item.fieldname]?.message}
                            >{item.label}</Button>
                        );

                    case 'Small Text':
                    case 'Long Text':
                        return (
                            <Textarea
                                rows={4}
                                label={getLabelNode(item)}
                                placeholder={`Enter the ${item.label}`}
                                component={TextareaAutosize}
                                minRows={4}
                                maxRows={12}
                                {...register(item.fieldname)}
                                error={errors[item.fieldname]?.message}
                            />
                        );

                    case 'Text Editor':
                    case 'HTML':
                        return (
                            <Controller
                                render={({ field: { value, onChange, ...rest } }) => {
                                    let newValue = (value && typeof value === 'object') ? value.ops[0].insert : (value ? value : '')
                                    const html = `${newValue}`;
                                    return <TextEditor
                                        label={getLabelNode(item)}
                                        value={htmlToDelta(html ? html : '<p></p>')}
                                        placeholder={`Enter ${item.label}`}
                                        className="mt-1.5 [&_.ql-editor]:max-h-80 [&_.ql-editor]:min-h-[12rem]"
                                        modules={editorModules}
                                        error={errors[item.fieldname]?.message}
                                        {...rest}
                                    />
                                }}
                                control={control}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Select':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => {
                                    const options = item.options ? (item.options).split("\n").map(item => ({ label: item, value: item })) : [];
                                    return <div className="max-w-full">
                                        <SearchSelect
                                            readOnly={readOnly}
                                            onChange={onChange}
                                            value={value}
                                            label={getLabelNode(item)}
                                            lists={options}
                                            placeholder={`${item.label}`}
                                            error={errors[item.fieldname]?.message}
                                            {...rest}
                                        />
                                    </div>
                                }}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Table MultiSelect':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => {
                                    return <div className="max-w-full">
                                        <Select
                                            onChange={(obj) => {
                                                const newValue = obj.target.value;
                                                if (value.includes(newValue)) {
                                                    onChange(value.filter(v => v !== newValue));
                                                } else {
                                                    onChange([...value, newValue]);
                                                }
                                            }}
                                            value={value}
                                            label={getLabelNode(item)}
                                            multiple={true}
                                            data={item?.options_list || []}
                                            placeholder={`${item.label}`}
                                            isAddNew={true}
                                            rootItem={item}
                                            error={errors[item.fieldname]?.message}
                                            {...rest}
                                        />
                                    </div>
                                }}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Link':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => (
                                    <div className="max-w-full">
                                        <SearchSelect
                                            onChange={onChange}
                                            value={value}
                                            label={getLabelNode(item)}
                                            lists={item.options_list}
                                            placeholder={`${item.label}`}
                                            isAddNew={item.isAddNew == "no" ? false : true}
                                            rootItem={item}
                                            error={errors[item.fieldname]?.message}
                                            {...rest}
                                        />
                                    </div>
                                )}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Dynamic Link':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => (
                                    <div className="max-w-full">
                                        <SearchSelectDynamic
                                            onChange={onChange}
                                            value={value}
                                            label={getLabelNode(item)}
                                            option={item.options}
                                            control={control}
                                            placeholder={`${item.label}`}
                                            isAddNew={true}
                                            rootItem={item}
                                            error={errors[item.fieldname]?.message}
                                            {...rest}
                                        />
                                    </div>
                                )}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Table':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => {
                                    return <>
                                        <TableBox
                                            onChange={onChange}
                                            values={value}
                                            label={getLabelNode(item)}
                                            isAddNew={true}
                                            rootItem={item}
                                            tableFields={tables ? tables[item.fieldname] : {}}
                                            error={errors[item.fieldname]?.message}
                                            {...rest}
                                        />
                                    </>
                                }}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Date':
                    case 'Time':
                    case 'Datetime':
                        return (
                            <Controller
                                render={({ field: { onChange, value, ...rest } }) => {
                                    const onChangeDate = (obj) => {
                             
                                        const date = new Date(obj[0]);

                                        let formatted;
                                        if (item.fieldtype === 'Time') {
                                            // For Time fields, format as HH:MM:SS
                                            formatted = date.toTimeString().split(' ')[0];
                                        } else if (item.fieldtype === 'Datetime') {
                                            // For Datetime fields, format as full ISO string
                                            formatted = date.toISOString();
                                        } else {
                                            // For Date fields, format as YYYY-MM-DD
                                            date.setDate(date.getDate() + 1);
                                            formatted = new Date(date).toISOString().split('T')[0];
                                        }

                                        onChange(formatted)
                                    }
                                    return <div className="items-center w-full relative">
                                        <DatePicker
                                            readOnly={readOnly}
                                            onChange={onChangeDate}
                                            value={value || ""}
                                            label={getLabelNode(item)}
                                            error={errors[item.fieldname]?.message}
                                            options={
                                                item.fieldtype === 'Time'
                                                    ? {
                                                        enableTime: true,
                                                        noCalendar: true,
                                                    }
                                                    : item.fieldtype === 'Datetime'
                                                        ? {
                                                            enableTime: true,
                                                            disableMobile: true
                                                        }
                                                        : {
                                                            disableMobile: true
                                                        }
                                            }
                                            placeholder={`Enter the ${item.label}`}
                                            {...rest}
                                        />
                                        <div className="absolute top-0 right-0">
                                            {item.description && <ContextualHelp content={item.description} />}
                                        </div>
                                    </div>
                                }}
                                control={control}
                                name={item.fieldname}
                                {...register(item.fieldname)}
                            />
                        );

                    case 'Tab Break':
                    case 'Section Break':
                    case 'Column Break':
                        return (
                            <></>
                        );

                    default:
                        return (
                            <>new ... {item.fieldname} {item.fieldtype}</>
                            // <></>
                        );
                }
            })()}
        </div>
    );
};