import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  X,
  Eye,
  Trash2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

// Laravel API services - update this URL to match your Laravel backend
const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your Laravel API URL

const invoiceService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch invoices');
    }
    return response.json();
  },

  show: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch invoice');
    }
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create invoice');
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update invoice');
    }
    return response.json();
  },

  updateStatus: async (id, status) => {
    // Using the update method since Laravel controller doesn't have separate status endpoint
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update invoice status');
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete invoice');
    }
    return response.json();
  },

  export: async () => {
    // You'll need to add this endpoint to your Laravel controller
    const response = await fetch(`${API_BASE_URL}/invoices/export`, {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export invoices');
    }
    return response.blob();
  },
};

const clientService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch clients');
    }
    return response.json();
  },
};

// Mapiranje iz Laravel backend formata u frontend format
const mapBackendToFrontend = (backendInvoice) => {
  return {
    id: backendInvoice.id,
    invoice_number: backendInvoice.invoice_number,
    client_name: backendInvoice.client?.name || 'Unknown Client',
    client_email: backendInvoice.client?.email || 'No email',
    amount: parseFloat(backendInvoice.amount || 0),
    tax_amount: parseFloat(backendInvoice.tax_amount || 0),
    total_amount: parseFloat(backendInvoice.total_amount || 0),
    due_date: backendInvoice.due_date,
    created_at:
      backendInvoice.issue_date || backendInvoice.created_at?.split('T')[0],
    issue_date: backendInvoice.issue_date,
    description: backendInvoice.notes || '',
    items: backendInvoice.items || [],
    status: mapBackendStatusToFrontend(backendInvoice.status),
    created_by: backendInvoice.created_by,
    client_id: backendInvoice.client_id,
  };
};

// Mapiranje statusa iz Laravel backend u frontend
const mapBackendStatusToFrontend = (backendStatus) => {
  switch (backendStatus) {
    case 'Draft':
      return 'pending';
    case 'Sent':
      return 'pending';
    case 'Paid':
      return 'paid';
    case 'Overdue':
      return 'overdue';
    case 'Cancelled':
      return 'overdue';
    default:
      return 'pending';
  }
};

// Mapiranje statusa iz frontend u Laravel format
const mapFrontendStatusToBackend = (frontendStatus) => {
  switch (frontendStatus) {
    case 'pending':
      return 'Draft';
    case 'paid':
      return 'Paid';
    case 'overdue':
      return 'Overdue';
    default:
      return 'Draft';
  }
};

// Mapiranje iz frontend formata u Laravel backend format za kreiranje
const mapFrontendToBackend = (frontendInvoice) => {
  return {
    client_id: parseInt(frontendInvoice.client_id),
    amount: parseFloat(frontendInvoice.amount),
    tax_amount: parseFloat(frontendInvoice.tax_amount || 0),
    issue_date:
      frontendInvoice.issue_date || new Date().toISOString().split('T')[0],
    due_date: frontendInvoice.due_date,
    notes: frontendInvoice.description || '',
    status: mapFrontendStatusToBackend(frontendInvoice.status || 'pending'),
    items: frontendInvoice.items || [],
  };
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New filter states
  const [amountFilter, setAmountFilter] = useState({
    min: '',
    max: '',
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    dateType: 'created',
  });

  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    client_id: '',
    client_name: '',
    client_email: '',
    amount: '',
    tax_amount: '',
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    items: [],
  });

  // Load invoices from database
  useEffect(() => {
    // For demo purposes, load mock data instead of API calls
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock invoices data
    const mockInvoices = [
      {
        id: 1,
        invoice_number: 'INV-2024-001',
        client_name: 'Acme Corporation',
        client_email: 'billing@acme.com',
        amount: 2500.0,
        tax_amount: 250.0,
        total_amount: 2750.0,
        due_date: '2024-02-15',
        created_at: '2024-01-15',
        issue_date: '2024-01-15',
        description: 'Website development services',
        status: 'paid',
        client_id: 1,
      },
      {
        id: 2,
        invoice_number: 'INV-2024-002',
        client_name: 'TechStart Inc',
        client_email: 'finance@techstart.com',
        amount: 1800.0,
        tax_amount: 180.0,
        total_amount: 1980.0,
        due_date: '2024-02-20',
        created_at: '2024-01-20',
        issue_date: '2024-01-20',
        description: 'Mobile app development',
        status: 'pending',
        client_id: 2,
      },
      {
        id: 3,
        invoice_number: 'INV-2024-003',
        client_name: 'Global Solutions',
        client_email: 'accounts@globalsolutions.com',
        amount: 3200.0,
        tax_amount: 320.0,
        total_amount: 3520.0,
        due_date: '2024-01-30',
        created_at: '2024-01-10',
        issue_date: '2024-01-10',
        description: 'E-commerce platform development',
        status: 'overdue',
        client_id: 3,
      },
      {
        id: 4,
        invoice_number: 'INV-2024-004',
        client_name: 'Digital Marketing Pro',
        client_email: 'billing@digitalmarketingpro.com',
        amount: 950.0,
        tax_amount: 95.0,
        total_amount: 1045.0,
        due_date: '2024-03-01',
        created_at: '2024-02-01',
        issue_date: '2024-02-01',
        description: 'SEO optimization services',
        status: 'pending',
        client_id: 4,
      },
      {
        id: 5,
        invoice_number: 'INV-2024-005',
        client_name: 'Creative Design Studio',
        client_email: 'finance@creativedesign.com',
        amount: 1500.0,
        tax_amount: 150.0,
        total_amount: 1650.0,
        due_date: '2024-02-25',
        created_at: '2024-01-25',
        issue_date: '2024-01-25',
        description: 'Brand identity design',
        status: 'paid',
        client_id: 5,
      },
    ];

    // Mock clients data
    const mockClients = [
      { id: 1, name: 'Acme Corporation', email: 'billing@acme.com' },
      { id: 2, name: 'TechStart Inc', email: 'finance@techstart.com' },
      {
        id: 3,
        name: 'Global Solutions',
        email: 'accounts@globalsolutions.com',
      },
      {
        id: 4,
        name: 'Digital Marketing Pro',
        email: 'billing@digitalmarketingpro.com',
      },
      {
        id: 5,
        name: 'Creative Design Studio',
        email: 'finance@creativedesign.com',
      },
    ];

    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
    setClients(mockClients);
    setLoading(false);
  };

  // Filter invoices based on search term, status, amount, and date
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((invoice) =>
        Object.values(invoice).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Amount filter
    if (amountFilter.min !== '') {
      filtered = filtered.filter(
        (invoice) => parseFloat(invoice.amount) >= parseFloat(amountFilter.min)
      );
    }
    if (amountFilter.max !== '') {
      filtered = filtered.filter(
        (invoice) => parseFloat(invoice.amount) <= parseFloat(amountFilter.max)
      );
    }

    // Date filter
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(
          dateFilter.dateType === 'created'
            ? invoice.created_at
            : invoice.due_date
        );
        return invoiceDate >= startDate;
      });
    }
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(
          dateFilter.dateType === 'created'
            ? invoice.created_at
            : invoice.due_date
        );
        return invoiceDate <= endDate;
      });
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices, amountFilter, dateFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAll();

      // Handle Laravel pagination format
      const invoicesData = response.data || response;
      const mappedInvoices = invoicesData.map(mapBackendToFrontend);
      setInvoices(mappedInvoices);
      setFilteredInvoices(mappedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setErrors({ general: `Failed to load invoices: ${error.message}` });
      setInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getAll();
      // Handle Laravel pagination or direct data
      const clientsData = response.data || response;
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const handleInputChange = (field, value) => {
    setNewInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateInvoice = () => {
    const newErrors = {};

    if (!newInvoice.client_id && clients.length > 0) {
      newErrors.client_id = 'Please select a client';
    } else if (!newInvoice.client_name && clients.length === 0) {
      newErrors.client_name = 'Client name is required';
    }

    if (!newInvoice.client_email && clients.length === 0) {
      newErrors.client_email = 'Client email is required';
    } else if (
      newInvoice.client_email &&
      !/\S+@\S+\.\S+/.test(newInvoice.client_email)
    ) {
      newErrors.client_email = 'Please enter a valid email address';
    }

    if (!newInvoice.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(newInvoice.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!newInvoice.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    return newErrors;
  };

  const handleAddInvoice = async () => {
    setErrors({});
    setSuccessMessage('');

    const validationErrors = validateInvoice();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Create new invoice with mock data
      const newInvoiceData = {
        id: Date.now(), // Use timestamp as ID for demo
        invoice_number: `INV-2024-${String(invoices.length + 1).padStart(
          3,
          '0'
        )}`,
        client_name:
          newInvoice.client_name ||
          clients.find((c) => c.id === parseInt(newInvoice.client_id))?.name ||
          'Unknown Client',
        client_email:
          newInvoice.client_email ||
          clients.find((c) => c.id === parseInt(newInvoice.client_id))?.email ||
          'No email',
        amount: parseFloat(newInvoice.amount),
        tax_amount: parseFloat(newInvoice.tax_amount || 0),
        total_amount:
          parseFloat(newInvoice.amount) +
          parseFloat(newInvoice.tax_amount || 0),
        due_date: newInvoice.due_date,
        created_at: newInvoice.issue_date,
        issue_date: newInvoice.issue_date,
        description: newInvoice.description,
        status: newInvoice.status,
        client_id: parseInt(newInvoice.client_id) || 0,
      };

      setInvoices((prev) => [newInvoiceData, ...prev]);

      setNewInvoice({
        invoice_number: '',
        client_id: '',
        client_name: '',
        client_email: '',
        amount: '',
        tax_amount: '',
        due_date: '',
        issue_date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pending',
        items: [],
      });
      setShowModal(false);
      setSuccessMessage('Invoice created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setErrors({ general: 'Failed to create invoice. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePaymentStatus = async (invoice) => {
    const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';

    try {
      // Update invoice status in mock data
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: newStatus } : inv
        )
      );
      setSuccessMessage(`Invoice marked as ${newStatus}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setErrors({
        general: `Failed to update invoice status: ${error.message}`,
      });
      setTimeout(() => setErrors({}), 5000);
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      // Delete invoice from mock data
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteInvoiceId));
      setShowDeleteModal(false);
      setDeleteInvoiceId(null);
      setSuccessMessage('Invoice deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setErrors({ general: `Failed to delete invoice: ${error.message}` });
      setTimeout(() => setErrors({}), 5000);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewInvoice({
      invoice_number: '',
      client_id: '',
      client_name: '',
      client_email: '',
      amount: '',
      tax_amount: '',
      due_date: '',
      issue_date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'pending',
      items: [],
    });
    setErrors({});
  };

  const exportInvoices = async () => {
    try {
      // Create CSV content from mock data
      const csvContent = [
        [
          'Invoice Number',
          'Client',
          'Amount',
          'Status',
          'Due Date',
          'Created Date',
        ],
        ...invoices.map((invoice) => [
          invoice.invoice_number,
          invoice.client_name,
          invoice.amount,
          invoice.status,
          invoice.due_date,
          invoice.created_at,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Invoices exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting invoices:', error);
      setErrors({ general: `Failed to export invoices: ${error.message}` });
      setTimeout(() => setErrors({}), 5000);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAmountFilter({ min: '', max: '' });
    setDateFilter({ startDate: '', endDate: '', dateType: 'created' });
  };

  // Calculate stats
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + parseFloat(invoice.amount || 0),
    0
  );
  const paidAmount = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;
  const paidCount = invoices.filter((inv) => inv.status === 'paid').length;
  const pendingCount = invoices.filter(
    (inv) => inv.status === 'pending'
  ).length;
  const overdueCount = invoices.filter(
    (inv) => inv.status === 'overdue'
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Calendar className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errors.general}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Invoices
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track and manage your invoices and payments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Invoices
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {invoices.length}
              </p>
            </div>
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Paid ({paidCount})
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                ${paidAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Pending ({pendingCount})
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                ${pendingAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Overdue ({overdueCount})
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                $
                {invoices
                  .filter((inv) => inv.status === 'overdue')
                  .reduce(
                    (sum, invoice) => sum + parseFloat(invoice.amount || 0),
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-red-500 p-2 sm:p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Revenue
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Invoice List</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown
                className={`w-4 h-4 sm:ml-2 transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`}
              />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              onClick={exportInvoices}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Amount Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={amountFilter.min}
                    onChange={(e) =>
                      setAmountFilter((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={amountFilter.max}
                    onChange={(e) =>
                      setAmountFilter((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Type
                </label>
                <select
                  value={dateFilter.dateType}
                  onChange={(e) =>
                    setDateFilter((prev) => ({
                      ...prev,
                      dateType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created">Created Date</option>
                  <option value="due">Due Date</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
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
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      No invoices found
                    </p>
                    <p className="text-sm">
                      {searchTerm ||
                      statusFilter !== 'all' ||
                      amountFilter.min ||
                      amountFilter.max ||
                      dateFilter.startDate ||
                      dateFilter.endDate
                        ? 'Try adjusting your filters'
                        : 'Create your first invoice to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.client_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invoice.client_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        ${parseFloat(invoice.amount).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePaymentStatus(invoice)}
                          className={`p-1 ${
                            invoice.status === 'paid'
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={
                            invoice.status === 'paid'
                              ? 'Mark as Pending'
                              : 'Mark as Paid'
                          }
                        >
                          {invoice.status === 'paid' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteInvoiceId(invoice.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No invoices found</p>
              <p className="text-sm">
                {searchTerm ||
                statusFilter !== 'all' ||
                amountFilter.min ||
                amountFilter.max ||
                dateFilter.startDate ||
                dateFilter.endDate
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to get started'}
              </p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {invoice.client_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.client_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${parseFloat(invoice.amount).toFixed(2)}
                    </p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Created: {new Date(invoice.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleViewInvoice(invoice)}
                    className="text-blue-600 hover:text-blue-900 p-2"
                    title="View Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePaymentStatus(invoice)}
                    className={`p-2 ${
                      invoice.status === 'paid'
                        ? 'text-yellow-600 hover:text-yellow-900'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                    title={
                      invoice.status === 'paid'
                        ? 'Mark as Pending'
                        : 'Mark as Paid'
                    }
                  >
                    {invoice.status === 'paid' ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteInvoiceId(invoice.id);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900 p-2"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Invoice
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {clients.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={newInvoice.client_id}
                    onChange={(e) => {
                      const selectedClient = clients.find(
                        (c) => c.id === parseInt(e.target.value)
                      );
                      handleInputChange('client_id', e.target.value);
                      if (selectedClient) {
                        handleInputChange('client_name', selectedClient.name);
                        handleInputChange('client_email', selectedClient.email);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.client_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.client_id}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newInvoice.client_name}
                      onChange={(e) =>
                        handleInputChange('client_name', e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.client_name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter client name"
                    />
                    {errors.client_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.client_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      value={newInvoice.client_email}
                      onChange={(e) =>
                        handleInputChange('client_email', e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.client_email
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter client email"
                    />
                    {errors.client_email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.client_email}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) =>
                      handleInputChange('amount', e.target.value)
                    }
                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={newInvoice.tax_amount}
                    onChange={(e) =>
                      handleInputChange('tax_amount', e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={newInvoice.issue_date}
                  onChange={(e) =>
                    handleInputChange('issue_date', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) =>
                    handleInputChange('due_date', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.due_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.due_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newInvoice.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter invoice description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newInvoice.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvoice}
                disabled={submitting}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Invoice Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Invoice Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Invoice Number:</span>{' '}
                      {selectedInvoice.invoice_number}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> $
                      {parseFloat(selectedInvoice.amount).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      {getStatusBadge(selectedInvoice.status)}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Client Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedInvoice.client_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {selectedInvoice.client_email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Dates
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(
                        selectedInvoice.created_at
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Due:</span>{' '}
                      {new Date(selectedInvoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {selectedInvoice.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedInvoice.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-start mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Invoice
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete this invoice? This action
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
