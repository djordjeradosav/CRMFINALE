import React from 'react';
import {
  User,
  Users,
  Filter,
  Download,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Target,
} from 'lucide-react';

const Dashboard = () => {
  // Mock data for demo
  const stats = [
    {
      label: 'Total Customers',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Deals',
      value: '156',
      change: '+8%',
      icon: Target,
      color: 'bg-green-500',
    },
    {
      label: 'Revenue',
      value: '$847K',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Conversion Rate',
      value: '68%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const recentCustomers = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@email.com',
      company: 'ABC Corp',
      status: 'Active',
      value: '$15,000',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@email.com',
      company: 'XYZ Ltd',
      status: 'Pending',
      value: '$8,500',
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol@email.com',
      company: 'Tech Inc',
      status: 'Active',
      value: '$22,000',
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@email.com',
      company: 'Start Co',
      status: 'Inactive',
      value: '$5,200',
    },
    {
      id: 5,
      name: 'Eva Brown',
      email: 'eva@email.com',
      company: 'Design Hub',
      status: 'Active',
      value: '$12,800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Customers
            </h3>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : customer.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
