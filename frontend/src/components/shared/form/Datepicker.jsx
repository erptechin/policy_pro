/* eslint-disable no-unused-vars */
// Import Dependencies
import { CalendarIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import flatpickrCSS from "flatpickr/dist/themes/light.css?inline";

// Local Imports
import { Input } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { useMergedRef } from "hooks";
import { locales } from "i18n/langs";
import { Flatpickr } from "./Flatpickr";
import {
  injectStyles,
  insertStylesToHead,
  makeStyleTag,
} from "utils/dom/injectStylesToHead";

// ----------------------------------------------------------------------

const styles = `@layer vendor {
  ${flatpickrCSS}
}`;

const sheet = makeStyleTag();

injectStyles(sheet, styles);
insertStylesToHead(sheet);

const DatePicker = forwardRef(
  (
    {
      options: userOptions,
      className,
      isCalendar = false,
      readOnly = false,
      hasCalenderIcon = true,
      ...props
    },
    ref,
  ) => {
    const fp = useRef(null);
    const { locale } = useLocaleContext();
    const [localeData, setLocaleData] = useState(null);

    useEffect(() => {
      const loadLocale = async () => {
        const load = locales[locale].flatpickr;
        if (load) {
          const loadedLocale = await load();
          setLocaleData(loadedLocale);
        } else {
          setLocaleData(null); // Fallback if no locale is found
        }
      };

      loadLocale();
    }, [locale]);

    const options = {
      inline: isCalendar,
      locale: localeData,
      clickOpens: !readOnly, // Disable opening calendar when readOnly
      ...userOptions,
    };

    useEffect(() => {
      const calendarContainer = fp.current?.flatpickr?.calendarContainer;

      if (calendarContainer) {
        calendarContainer.classList.toggle("is-calendar", isCalendar);
      }
    }, [isCalendar]);

    useImperativeHandle(ref, () => {
      return {
        focus() {
          if (fp.current?.flatpickr?.input) {
            fp.current.flatpickr.input.focus();
          }
        },
        blur() {
          if (fp.current?.flatpickr?.input) {
            fp.current.flatpickr.input.blur();
          }
        },
      };
    }, []);

    const mergedRef = useMergedRef(fp, ref);

    // Disable/enable flatpickr when readOnly changes
    useEffect(() => {
      if (fp.current?.flatpickr) {
        try {
          // Use flatpickr's disable/enable methods if available
          if (readOnly) {
            // Disable the input
            if (fp.current.flatpickr.input) {
              fp.current.flatpickr.input.disabled = true;
            }
            // Close calendar if open
            if (fp.current.flatpickr.isOpen) {
              fp.current.flatpickr.close();
            }
          } else {
            // Enable the input
            if (fp.current.flatpickr.input) {
              fp.current.flatpickr.input.disabled = false;
            }
          }
        } catch (error) {
          console.warn('Error toggling flatpickr readOnly state:', error);
        }
      }
    }, [readOnly]);

    return (
      <Flatpickr
        className={clsx(!readOnly && "cursor-pointer", isCalendar && "hidden", className)}
        options={options}
        ref={mergedRef}
        {...props}
        render={({ ...props }, ref) => {
          return isCalendar ? (
            <input ref={ref} {...props} readOnly={readOnly} />
          ) : (
            <Input
              ref={ref}
              prefix={
                !userOptions?.inline &&
                hasCalenderIcon && !readOnly && <CalendarIcon className="size-5" />
              }
              {...props}
              readOnly={readOnly}
            />
          );
        }}
      />
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
