// Import Dependencies
import PropTypes from "prop-types";
import { forwardRef } from "react";
import clsx from "clsx";
import { Skeleton } from "../Skeleton";
import { Card } from "../Card";

// ----------------------------------------------------------------------

const SkeletonBox = forwardRef((props, ref) => {
  const { animate = true, className, ...rest } = props;
  return (
    <div className="flex h-full flex-col">
      {/* Header Loading */}
      <header className="flex h-14 items-center justify-between bg-gray-100 px-4 dark:bg-dark-800">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </header>

      {/* Content Loading */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="space-y-4">
                {/* Form Fields Loading */}
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar Loading */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />

                {/* Additional Fields Loading */}
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}

                {/* Role Select Loading */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Chapters Select Loading */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Loading */}
      <div className="flex justify-end gap-4 border-t border-gray-200 p-4 dark:border-dark-500">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
});

SkeletonBox.propTypes = {
  animate: PropTypes.bool,
  className: PropTypes.string,
};

SkeletonBox.displayName = "SkeletonBox";

export { SkeletonBox };
