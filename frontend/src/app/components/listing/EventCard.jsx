import React from 'react';
import { useNavigate } from 'react-router';
import { 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ShareIcon
} from '@heroicons/react/20/solid';
import { Badge, Button } from 'components/ui';
import clsx from 'clsx';

export function EventCard({ chapter, onEdit, onDelete }) {
  const navigate = useNavigate();

  // Event-specific data mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'postponed':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusBadgeText = (status) => {
    return status || 'Upcoming';
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'volunteer':
        return 'bg-green-500';
      case 'training':
        return 'bg-purple-500';
      case 'fundraising':
        return 'bg-yellow-500';
      case 'community':
        return 'bg-blue-500';
      default:
        return 'bg-orange-500';
    }
  };

  // Mock dates for demonstration - replace with actual date fields
  const eventDate = chapter.event_date || '2025-06-15';
  const eventTime = chapter.event_time || '09:00 AM';
  const eventEndTime = chapter.event_end_time || '12:00 PM';

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get volunteer counts
  const volunteersRegistered = chapter.volunteers_registered || chapter.opening_stock || 32;
  const volunteersNeeded = chapter.volunteers_needed || 50;
  const volunteerPercentage = Math.round((volunteersRegistered / volunteersNeeded) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 dark:bg-dark-800 dark:border-dark-600 overflow-hidden group">
      {/* Event Type Indicator */}
      <div className={clsx(
        "h-1.5 w-full",
        getEventTypeColor(chapter.item_group || 'volunteer')
      )}></div>

      <div className="p-6">
        {/* Header with title, organization and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 truncate">
                {chapter.item_name || chapter.name || 'Community Food Drive'}
              </h3>
              <Badge 
                color={getStatusColor(chapter.status)}
                variant="soft"
                className="shrink-0 text-xs"
              >
                {getStatusBadgeText(chapter.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-300">
              {chapter.organization || chapter.item_group || 'Food Bank North'}
            </p>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="p-1.5"
              onClick={() => onEdit?.(chapter)}
            >
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-1.5"
              onClick={() => onDelete?.(chapter)}
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-dark-200 text-sm mb-4 line-clamp-2">
          {chapter.description || 'Collecting and distributing food to families in need'}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-gray-600 dark:text-dark-300 text-sm">
            <CalendarDaysIcon className="w-4 h-4 mr-3 shrink-0 text-gray-500" />
            <span className="font-medium">{formatDate(eventDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-dark-300 text-sm">
            <ClockIcon className="w-4 h-4 mr-3 shrink-0 text-gray-500" />
            <span>{eventTime} - {eventEndTime}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 dark:text-dark-300 text-sm">
            <MapPinIcon className="w-4 h-4 mr-3 shrink-0 text-gray-500" />
            <span className="truncate">
              {chapter.location || 'Central Community Center'}
            </span>
          </div>
        </div>

        {/* Volunteer Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-dark-300">Volunteer Positions</span>
            <span className="font-medium text-gray-900 dark:text-dark-50">
              {volunteersRegistered}/{volunteersNeeded}
            </span>
          </div>
          
          {/* Progress sections */}
          <div className="space-y-2">
            {/* Food Sorter */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-dark-300">Food Sorter</span>
              <span className="text-gray-900 dark:text-dark-50">8/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-dark-600">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
            </div>

            {/* Distribution Helper */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-dark-300">Distribution Helper</span>
              <span className="text-gray-900 dark:text-dark-50">6/8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-dark-600">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>

            {/* Registration Desk */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-dark-300">Registration Desk</span>
              <span className="text-gray-900 dark:text-dark-50">2/2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-dark-600">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-dark-50">
              {volunteersRegistered}/50
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="p-1.5"
            >
              <ShareIcon className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              size="sm"
              color="primary"
              className="px-3 py-1.5 text-xs"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 