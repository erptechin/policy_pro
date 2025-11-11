import React from 'react';
import { useNavigate } from 'react-router';
import { 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/20/solid';
import { Badge, Button } from 'components/ui';
import clsx from 'clsx';

export function ChapterCard({ chapter, onEdit, onDelete }) {
  const navigate = useNavigate();

  // Mock data mapping - adjust based on your actual data structure
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'danger';
      default:
        return 'primary';
    }
  };



  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-dark-800 dark:border-dark-600">
      {/* Header with icon, title and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-900/20">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 truncate">
              {chapter.name || chapter.item_name || 'Chapter Name'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-dark-300">
              {chapter.parent_organization || chapter.item_group || 'Parent Organization'}
            </p>
          </div>
        </div>
        <Badge 
          color={getStatusColor(chapter.status || 'active')}
          variant="soft"
          className="shrink-0"
        >
          {chapter.status || 'Active'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-dark-200 text-sm mb-4 line-clamp-2">
        {chapter.description || 'Emergency response and disaster relief in central district'}
      </p>

      {/* Location */}
      <div className="flex items-center text-gray-600 dark:text-dark-300 text-sm mb-4">
        <MapPinIcon className="w-4 h-4 mr-2 shrink-0" />
        <span className="truncate">
          {chapter.location || chapter.location_name || 'Downtown, City Center'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {chapter.volunteers_count || chapter.opening_stock || '45'}
          </div>
          <div className="text-xs text-gray-600 dark:text-dark-300">Volunteers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {chapter.events_count || '12'}
          </div>
          <div className="text-xs text-gray-600 dark:text-dark-300">Events</div>
        </div>
      </div>

      {/* Admin and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-dark-300">Admin: </span>
          <span className="font-medium text-gray-900 dark:text-dark-50">
            {chapter.admin_name || chapter.owner || 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="p-2"
            onClick={() => onEdit?.(chapter)}
          >
            <PencilIcon className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-2"
            onClick={() => onDelete?.(chapter)}
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
} 