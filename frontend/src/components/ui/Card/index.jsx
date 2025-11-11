// Import Dependencies
import PropTypes from "prop-types";
import { forwardRef } from "react";
import clsx from 'clsx'

// Local Imports
import { Box } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

// -------------------------------------------------------------

const Card = forwardRef((props, ref) => {
  const { cardSkin } = useThemeContext();

  const { skin = cardSkin, children, className, ...rest } = props;

  return (
    <Box
      ref={ref}
      className={clsx(
        "card rounded-lg",
        skin &&
        skin !== "none" && [
          skin === "bordered" &&
          "border border-gray-200 dark:border-dark-600 print:border-0",
          skin === "shadow-sm" &&
          "bg-white shadow-soft dark:bg-dark-700 dark:shadow-none print:shadow-none",
        ],
        className,
      )}
      {...rest}
    >
      {children}
    </Box>
  );
});

Card.displayName = "Card";

const CardHeader = forwardRef((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <Box
      ref={ref}
      className={clsx("flex flex-col space-y-1.5 p-6", className)}
      {...rest}
    >
      {children}
    </Box>
  );
});

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <h3
      ref={ref}
      className={clsx(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...rest}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <p
      ref={ref}
      className={clsx("text-sm text-gray-500 dark:text-gray-400", className)}
      {...rest}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <Box
      ref={ref}
      className={clsx("p-6", className)}
      {...rest}
    >
      {children}
    </Box>
  );
});

CardContent.displayName = "CardContent";

const CardFooter = forwardRef((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <Box
      ref={ref}
      className={clsx("flex items-center p-6 pt-0", className)}
      {...rest}
    >
      {children}
    </Box>
  );
});

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
