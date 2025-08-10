import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BarChart3, Settings, FileText } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  // Mock user data since we removed authentication
  const user = {
    name: 'Demo User',
    role: 'admin',
    company: 'Demo Company',
  };

  const canAccess = () => true; // Allow access to everything
  const isUser = () => false; // Not a limited user

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: BarChart3,
      path: '/dashboard',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      path: '/clients',
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: FileText,
      path: '/invoice',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  const getVisibleMenuItems = () => {
    if (!user) return [];

    // If user is "User" role, only show dashboard
    if (isUser()) {
      return menuItems.filter((item) => item.id === 'dashboard');
    }

    // For Admin and Client roles, show items based on permissions
    return menuItems.filter((item) => {
      // Always show dashboard
      if (item.id === 'dashboard') return true;

      // Check permission for other items
      if (item.permission) {
        return canAccess(item.permission);
      }

      return true;
    });
  };

  const visibleMenuItems = getVisibleMenuItems();

  // Don't render sidebar if no user is logged in
  if (!user) {
    return null;
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        {/* User info section */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.role}</div>
          {user.company && (
            <div className="text-xs text-gray-500">{user.company}</div>
          )}
        </div>

        {/* Navigation menu */}
        <div className="space-y-2">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onClose} // Close sidebar on mobile when clicking a link
              className={({ isActive }) =>
                `w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Role-based message for User role */}
        {isUser() && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              Your access is limited to the dashboard. Contact your
              administrator for additional permissions.
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
