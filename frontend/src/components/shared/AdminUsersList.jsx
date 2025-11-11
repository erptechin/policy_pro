import React from 'react';
import { useMembers } from 'hooks/useApiHook';
import { Card, Skeleton } from 'components/ui';

/**
 * Component to display all users with "Non-Profit Admin" role profile
 */
export const AdminUsersList = () => {
  const { data: members, isLoading, error } = useMembers();

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-600">
          Error loading admin users: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Non-Profit Admin Users</h3>
      {members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((user) => (
            <div
              key={user.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-dark-600"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.full_name || 'No Name'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID: {user.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-center py-4">
          No admin users found
        </div>
      )}
    </Card>
  );
};

export default AdminUsersList;
