import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ArrowUpDown,
  X,
  Building,
  User,
} from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '123-456-7890',
      company: 'Acme Holdings',
      createdBy: 'John Doe',
      timestamp: '2023/01/01',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Global Industries',
      email: 'info@global.com',
      phone: '234-567-8901',
      company: 'Global Ltd',
      createdBy: 'Jane Smith',
      timestamp: '2023/02/15',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Tech Solutions',
      email: 'support@techsol.com',
      phone: '345-678-9012',
      company: 'Tech Inc',
      createdBy: 'Mike Johnson',
      timestamp: '2023/03/20',
      status: 'Inactive',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  // Filter clients based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter((client) =>
        Object.values(client).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const handleAddClient = () => {
    if (
      !newClient.name ||
      !newClient.email ||
      !newClient.phone ||
      !newClient.company
    ) {
      alert('Please fill in all fields');
      return;
    }

    const client = {
      id: clients.length + 1,
      ...newClient,
      createdBy: 'Current User',
      timestamp: new Date().toLocaleDateString(),
      status: 'Active',
    };

    setClients([...clients, client]);
    setNewClient({ name: '', email: '', phone: '', company: '' });
    setShowModal(false);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter((client) => client.id !== clientId));
    }
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const sortClients = (field) => {
    const sorted = [...filteredClients].sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    setFilteredClients(sorted);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Clients
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your client relationships and data
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Clients
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {clients.length}
              </p>
            </div>
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {clients.filter((c) => c.status === 'Active').length}
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
              <Building className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Inactive Clients
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {clients.filter((c) => c.status === 'Inactive').length}
              </p>
            </div>
            <div className="bg-red-500 p-2 sm:p-3 rounded-lg">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Client List</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => sortClients('name')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sort</span>
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {client.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        client.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {client.name}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {client.id}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    client.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Company:</span>
                  <span className="text-gray-900">{client.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{client.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleViewClient(client)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="View Client"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-medium">Add New Client</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newClient.company}
                  onChange={(e) =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  placeholder="Enter company name"
                />
              </div>

              <button
                onClick={handleAddClient}
                className="w-full px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Client
              </button>
            </div>
            <div className="p-4 sm:p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={handleAddClient}
                className="w-full px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-medium">Client Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.name}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.email}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.phone}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Company:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.company}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Created By:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.createdBy}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedClient.timestamp}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedClient.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedClient.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
