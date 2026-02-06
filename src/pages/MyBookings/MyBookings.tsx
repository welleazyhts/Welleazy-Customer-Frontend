import React, { useEffect, useState } from 'react';
import './MyBookings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faFilePrescription,
  faFileInvoiceDollar,
  faFileMedical,
  faEye,
  faAngleDown,
  faAngleUp,
  faCalendarCheck,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { Container } from 'react-bootstrap';
import { MyBookingsAPI } from '../../api/MyBookings';
import { CustomerAppointment, PharmacyOrder } from '../../types/MyBookings';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

// Define interface for Pharmacy Coupon Address
export interface PharmacyCouponAddress {
  ApolloId: number;
  ApolloSKU: string;
  Relation: number;
  Name: string;
  ContactNo: string;
  Email: string;
  State: number;
  City: number;
  DistrictName: string;
  StateName: string;
  Address: string;
  CouponName: string;
  CreatedOn: string;   // DD/MM/YYYY
  CreatedBy: number;
}

const BOOKINGS_CARDS_PER_PAGE = 10;
const LOCATIONS_VISIBLE = 4;

const locationData = [
  { name: 'New Delhi', img: '/DELHI-8.png' },
  { name: 'Chandigarh', img: '/Chandigarh.png' },
  { name: 'Srinagar', img: '/srinagr.png' },
  { name: 'Cochin', img: '/kochi.png' },
  { name: 'Bangalore', img: '/BANGALORE-8.png' },
  { name: 'Mumbai', img: '/mumbai.png' },
  { name: 'Kolkata', img: '/KOLKATA-8.png' },
  { name: 'Ahmedabad', img: '/AHEMDABAD-8.png' },
  { name: 'Jaipur', img: '/JAIPUR-8.png' },
  { name: 'Lucknow', img: '/LUCKNOW-8.png' },
];

// Parse DD-MM-YYYY to Date
const parseDDMMYYYY = (dateStr: string) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};


const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<CustomerAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [pharmacyCoupons, setPharmacyCoupons] = useState<PharmacyCouponAddress[]>([]);
  const [pharmacyPage, setPharmacyPage] = useState(1);
  const [pharmacyCouponPage, setPharmacyCouponPage] = useState(1);
  const [expandedAddressId, setExpandedAddressId] = useState<number | null>(null);

  // Fetch pharmacy orders
  useEffect(() => {
    const fetchPharmacyOrders = async () => {
      try {
        const data = await MyBookingsAPI.FetchPharmacyListDetails();
        setPharmacyOrders(data);
      } catch (err) {
        console.error('Error fetching pharmacy orders:', err);
      }
    };

    fetchPharmacyOrders();
  }, []);

  // Fetch pharmacy coupons (SECOND API)
  useEffect(() => {
    const fetchPharmacyCoupons = async () => {
      try {
        const data = await MyBookingsAPI.FetchPharmacyCouponListDetails();
        setPharmacyCoupons(data);
      } catch (err) {
        console.error('Error fetching pharmacy coupons:', err);
      }
    };

    fetchPharmacyCoupons();
  }, []);

  // Filter pharmacy orders based on active tab
  const filteredPharmacyOrders = activeTab === 'All'
    ? pharmacyOrders
    : pharmacyOrders.filter(o => {
      const status = o.status?.toLowerCase() || '';
      if (activeTab === 'Scheduled') {
        return ['confirmed', 'processing', 'dispatched', 'in progress', 'pending'].includes(status);
      }
      if (activeTab === 'Completed') {
        return ['delivered', 'completed', 'used'].includes(status);
      }
      if (activeTab === 'Cancelled') {
        return ['cancelled', 'rejected', 'expired'].includes(status);
      }
      return false;
    });

  // Filter pharmacy coupons - without status, we show them in All and Scheduled (active)
  const filteredPharmacyCoupons = activeTab === 'All' || activeTab === 'Scheduled'
    ? pharmacyCoupons
    : [];

  const PHARMACY_CARDS_PER_PAGE = 5;
  const PHARMACY_ROWS_PER_PAGE = 2;
  const totalPharmacyPages = Math.ceil(filteredPharmacyOrders.length / (PHARMACY_CARDS_PER_PAGE * PHARMACY_ROWS_PER_PAGE));

  const getPaginatedPharmacyOrders = (page: number) => {
    const startIndex = (page - 1) * (PHARMACY_CARDS_PER_PAGE * PHARMACY_ROWS_PER_PAGE);
    const endIndex = Math.min(startIndex + (PHARMACY_CARDS_PER_PAGE * PHARMACY_ROWS_PER_PAGE), filteredPharmacyOrders.length);
    return filteredPharmacyOrders.slice(startIndex, endIndex);
  };

  const PHARMACY_COUPON_CARDS_PER_PAGE = 5;
  const PHARMACY_COUPON_ROWS_PER_PAGE = 2;
  const totalPharmacyCouponPages = Math.ceil(filteredPharmacyCoupons.length / (PHARMACY_COUPON_CARDS_PER_PAGE * PHARMACY_COUPON_ROWS_PER_PAGE));

  const getPaginatedPharmacyCoupons = (page: number) => {
    const startIndex = (page - 1) * (PHARMACY_COUPON_CARDS_PER_PAGE * PHARMACY_COUPON_ROWS_PER_PAGE);
    const endIndex = Math.min(startIndex + (PHARMACY_COUPON_CARDS_PER_PAGE * PHARMACY_COUPON_ROWS_PER_PAGE), filteredPharmacyCoupons.length);
    return filteredPharmacyCoupons.slice(startIndex, endIndex);
  };

  // Fetch appointments
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const fromDateObj = new Date(today);
        fromDateObj.setFullYear(today.getFullYear() - 1);
        const toDateObj = new Date(today);
        toDateObj.setFullYear(today.getFullYear() + 1);

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const data = await MyBookingsAPI.CRMGetCustomerAppointmentDetails({
          fromDate: formatDate(fromDateObj),
          toDate: formatDate(toDateObj)
        });
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Sort bookings by date
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = parseDDMMYYYY(a.AppointmentDate);
    const dateB = parseDDMMYYYY(b.AppointmentDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Filter bookings
  // Replace the current filtering logic with this:
  // Filter appointments by active tab
  const filteredBookings = activeTab === 'All'
    ? sortedBookings
    : sortedBookings.filter(b => {
      const status = b.AppointmentDescription?.toLowerCase() || '';

      if (activeTab.toLowerCase() === 'scheduled') {
        // Handle both "Scheduled" and "Re-Scheduled"
        return status === 'scheduled' ||
          status.includes('scheduled') ||
          status === 're-scheduled' ||
          status === 'rescheduled';
      }

      if (activeTab.toLowerCase() === 'completed') {
        return status === 'completed' || status.includes('complete');
      }

      if (activeTab.toLowerCase() === 'cancelled') {
        return status === 'cancelled' ||
          status === 'canceled' ||
          status.includes('cancel');
      }

      return false;
    });


  // Pagination for appointments
  const totalPages = Math.ceil(filteredBookings.length / BOOKINGS_CARDS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * BOOKINGS_CARDS_PER_PAGE,
    currentPage * BOOKINGS_CARDS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePharmacyPageChange = (page: number) => {
    if (page >= 1 && page <= totalPharmacyPages) {
      setPharmacyPage(page);
    }
  };

  const handlePharmacyCouponPageChange = (page: number) => {
    if (page >= 1 && page <= totalPharmacyCouponPages) {
      setPharmacyCouponPage(page);
    }
  };

  // Location carousel
  const handleLocationPrev = () => {
    setLocationCarouselIndex(prev =>
      prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1
    );
  };

  const handleLocationNext = () => {
    setLocationCarouselIndex(prev =>
      prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
    );
  };

  const getVisibleLocations = () =>
    Array.from({ length: LOCATIONS_VISIBLE }, (_, i) =>
      locationData[(locationCarouselIndex + i) % locationData.length]
    );

  // Truncate text with show more/less
  const AddressDisplay = ({ text, id }: { text: string; id: number }) => {
    const isExpanded = expandedAddressId === id;
    const maxLength = 60;

    if (!text) return <span className="value">N/A</span>;

    if (text.length <= maxLength || isExpanded) {
      return (
        <div className="address-content">
          <span className="value full-address">{text}</span>
          {text.length > maxLength && (
            <button
              className="show-more-btn"
              onClick={() => setExpandedAddressId(null)}
            >
              Show Less <FontAwesomeIcon icon={faAngleUp} />
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="address-content">
        <span className="value truncated-address">
          {text.substring(0, maxLength)}...
        </span>
        <button
          className="show-more-btn"
          onClick={() => setExpandedAddressId(id)}
        >
          Show More <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
      case 'pending':
      case 'active':
      case 'confirmed':
        return '#1976d2';
      case 'completed':
      case 'delivered':
      case 'used':
        return '#4caf50';
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return '#f44336';
      case 'processing':
        return '#ff9800';
      case 'approved':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  // Helper actions
  const handleViewAppointmentVoucher = async (id: string) => {
    try {
      const data = await MyBookingsAPI.getAppointmentVoucher(Number(id));
      if (data.voucher_url) {
        window.open(data.voucher_url, '_blank');
      } else {
        toast.info("Voucher not available yet");
      }
    } catch (err) {
      console.error("Error viewing voucher:", err);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      const blob = await MyBookingsAPI.downloadInvoice(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
    }
  };

  const handleViewPharmacyVoucher = async (id: number) => {
    try {
      const data = await MyBookingsAPI.getPharmacyOrderVoucher(id);
      if (data.voucher_url) {
        window.open(data.voucher_url, '_blank');
      } else {
        toast.info("Voucher not available yet");
      }
    } catch (err) {
      console.error("Error viewing pharmacy voucher:", err);
    }
  };

  const handleViewPharmacyCouponVoucher = async (id: number) => {
    try {
      const data = await MyBookingsAPI.getPharmacyCouponVoucher(id);
      if (data.voucher_url) {
        window.open(data.voucher_url, '_blank');
      } else {
        toast.info("Voucher not available yet");
      }
    } catch (err) {
      console.error("Error viewing pharmacy coupon voucher:", err);
    }
  };

  const downloadPharmacyOrderVoucher = async (orderId: string, url: string) => {
    try {
      // url might be local or full, api.get handles it if it starts with /api
      const response = await api.get<Blob>(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Voucher-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading pharmacy voucher:", err);
      toast.error("Failed to download voucher");
    }
  };

  // Generate page numbers
  const generatePageNumbers = (totalPages: number, currentPage: number) => {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) pageNumbers.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };



  return (
    <div className="my-bookings-page">
      <div className="page-container">
        <h2>My Bookings</h2>
        <div className="subtitle">Booking details, status and history</div>

        {/* TABS */}
        <div className="tabs">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map(tab => (
            <div
              key={tab}
              className={`tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(tab as any);
                setCurrentPage(1);
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div>Loading bookings...</div>
          </div>
        )}

        {/* NO BOOKINGS MESSAGE */}
        {!loading && paginatedBookings.length === 0 && filteredPharmacyOrders.length === 0 && filteredPharmacyCoupons.length === 0 && (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings at the moment.</p>
          </div>
        )}

        {/* APPOINTMENT BOOKINGS */}
        {filteredBookings.length > 0 && (
          <>
            <div className="section-title">
              <FontAwesomeIcon icon={faCalendarCheck} className="section-icon" />
              Appointments
            </div>
            <div className="bookings-grid">
              {paginatedBookings.map(booking => (
                <div className="booking-card compact" key={booking.AppointmentId}>
                  <div className="booking-header">
                    <div className="case-id">
                      <span className="label">Case ID:</span>
                      <span className="value">{booking.CaseId || 'N/A'}</span>
                    </div>
                    <div className="status-badge" style={{
                      backgroundColor: getStatusColor(booking.AppointmentDescription) + '15',
                      color: getStatusColor(booking.AppointmentDescription)
                    }}>
                      {booking.AppointmentDescription || 'Unknown'}
                    </div>
                  </div>

                  <hr className="divider" />

                  <div className="booking-details compact">
                    <div className="detail-row">
                      <span className="label">Patient:</span>
                      <span className="value">{booking.EmployeeName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Service:</span>
                      <span className="value">{booking.TypeOfService || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="value">{booking.AppointmentType || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Date:</span>
                      <span className="value">{booking.AppointmentDate || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Time:</span>
                      <span className="value">{booking.AppointmentTime || 'N/A'}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="booking-actions compact">
                    <button
                      className="Mybookings-action-btn"
                      title="View Voucher"
                      onClick={() => handleViewAppointmentVoucher(booking.AppointmentId)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Voucher</span>
                    </button>
                    <button className="Mybookings-action-btn" title="Health Records">
                      <FontAwesomeIcon icon={faFileMedical} />
                      <span>Records</span>
                    </button>
                    <button className="Mybookings-action-btn" title="Download Prescription">
                      <FontAwesomeIcon icon={faFilePrescription} />
                      <span>Rx</span>
                    </button>
                    <button
                      className="Mybookings-action-btn"
                      title="Download Invoice"
                      onClick={() => handleDownloadInvoice(booking.AppointmentId)}
                    >
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* APPOINTMENTS PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(currentPage - 1) * BOOKINGS_CARDS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * BOOKINGS_CARDS_PER_PAGE, filteredBookings.length)} of{' '}
                  {filteredBookings.length} appointments
                </div>

                <div className="pagination-controls">
                  <button
                    className="pagination-btn prev-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span>Previous</span>
                  </button>

                  <div className="page-numbers">
                    {generatePageNumbers(totalPages, currentPage).map((pageNum: number) => (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="ellipsis">...</span>
                        <button
                          className="page-btn"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    className="pagination-btn next-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* PHARMACY ORDERS */}
        {filteredPharmacyOrders.length > 0 && (
          <>
            <div className="section-title">
              <FontAwesomeIcon icon={faFilePrescription} className="section-icon" />
              Pharmacy Orders
            </div>
            <div className="bookings-grid five-per-row">
              {getPaginatedPharmacyOrders(pharmacyPage).map(order => (
                <div className="MyBookings-PH-booking-card compact" key={order.order_id}>
                  <div className="booking-header">
                    <div className="case-id">
                      <span className="label">Order ID:</span>
                      <span className="value">{order.order_id || 'N/A'}</span>
                    </div>
                    <div className="status-badge" style={{
                      backgroundColor: getStatusColor(order.status) + '15',
                      color: getStatusColor(order.status)
                    }}>
                      {order.status || 'Unknown'}
                    </div>
                  </div>

                  <hr className="divider" />

                  <div className="booking-details compact">
                    <div className="detail-row">
                      <span className="label">Patient:</span>
                      <span className="value">{order.patient_name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Service:</span>
                      <span className="value">{order.type_of_service || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Order Type:</span>
                      <span className="value">{order.order_type || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Ordered:</span>
                      <span className="value">{order.ordered_date || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Delivery:</span>
                      <span className="value">{order.expected_delivery || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Amount:</span>
                      <span className="value">₹{order.order_amount || '0'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Address:</span>
                      <AddressDisplay
                        text={order.address ? `${order.address.address}, ${order.address.city} - ${order.address.pincode}` : 'N/A'}
                        id={order.address?.id || 0}
                      />
                    </div>
                  </div>

                  <div className="booking-actions compact mt-2">
                    <button
                      className="Mybookings-action-btn"
                      title="View Voucher"
                      onClick={() => downloadPharmacyOrderVoucher(order.order_id, order.actions.view_voucher_url)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Voucher</span>
                    </button>
                    <button
                      className="Mybookings-action-btn"
                      title="View Medicine Details"
                      onClick={() => window.open(order.actions.view_medicine_details_url, '_blank')}
                    >
                      <FontAwesomeIcon icon={faFileMedical} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PHARMACY ORDERS PAGINATION */}
            {totalPharmacyPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(pharmacyPage - 1) * (PHARMACY_CARDS_PER_PAGE * PHARMACY_ROWS_PER_PAGE) + 1} to{' '}
                  {Math.min(pharmacyPage * (PHARMACY_CARDS_PER_PAGE * PHARMACY_ROWS_PER_PAGE), filteredPharmacyOrders.length)} of{' '}
                  {filteredPharmacyOrders.length} pharmacy orders
                </div>

                <div className="pagination-controls">
                  <button
                    className="pagination-btn prev-btn"
                    disabled={pharmacyPage === 1}
                    onClick={() => handlePharmacyPageChange(pharmacyPage - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span>Previous</span>
                  </button>

                  <div className="page-numbers">
                    {generatePageNumbers(totalPharmacyPages, pharmacyPage).map((pageNum: number) => (
                      <button
                        key={pageNum}
                        className={`page-btn ${pharmacyPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePharmacyPageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {totalPharmacyPages > 5 && pharmacyPage < totalPharmacyPages - 2 && (
                      <>
                        <span className="ellipsis">...</span>
                        <button
                          className="page-btn"
                          onClick={() => handlePharmacyPageChange(totalPharmacyPages)}
                        >
                          {totalPharmacyPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    className="pagination-btn next-btn"
                    disabled={pharmacyPage === totalPharmacyPages}
                    onClick={() => handlePharmacyPageChange(pharmacyPage + 1)}
                  >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* PHARMACY COUPONS (SECOND API) */}
        {filteredPharmacyCoupons.length > 0 && (
          <>
            <div className="section-title">
              <FontAwesomeIcon icon={faTag} className="section-icon" />
              Pharmacy Coupons
            </div>
            <div className="bookings-grid five-per-row">
              {getPaginatedPharmacyCoupons(pharmacyCouponPage).map(coupon => (
                <div className="MyBookings-PH-coupon-card compact" key={coupon.ApolloId}>
                  <div className="booking-header">
                    <div className="case-id">
                      <span className="label">Order ID:</span>
                      <span className="value">{coupon.ApolloSKU || 'N/A'}</span>
                    </div>

                  </div>

                  <hr className="divider" />

                  <div className="booking-details compact">
                    <div className="detail-row">
                      <span className="label">
                        Patient:
                      </span>
                      <span className="value">{coupon.Name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        Type Of Service :
                      </span>
                      <span className="value">{'	Pharmacy Coupon'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        Coupon:
                      </span>
                      <span className="value coupon-code">{coupon.CouponName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        Order Type :
                      </span>
                      <span className="value">{'Store PickUp'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        Ordered Date :
                      </span>
                      <span className="value">{coupon.CreatedOn || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">
                        Vendor:
                      </span>
                      <span className="value">{'Apollo'}</span>
                    </div>

                  </div>

                  <div className="booking-actions compact">
                    <button
                      className="Mybookings-action-btn"
                      title="View Voucher"
                      onClick={() => handleViewPharmacyCouponVoucher(coupon.ApolloId)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Voucher</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PHARMACY COUPONS PAGINATION */}
            {totalPharmacyCouponPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(pharmacyCouponPage - 1) * (PHARMACY_COUPON_CARDS_PER_PAGE * PHARMACY_COUPON_ROWS_PER_PAGE) + 1} to{' '}
                  {Math.min(pharmacyCouponPage * (PHARMACY_COUPON_CARDS_PER_PAGE * PHARMACY_COUPON_ROWS_PER_PAGE), filteredPharmacyCoupons.length)} of{' '}
                  {filteredPharmacyCoupons.length} pharmacy coupons
                </div>

                <div className="pagination-controls">
                  <button
                    className="pagination-btn prev-btn"
                    disabled={pharmacyCouponPage === 1}
                    onClick={() => handlePharmacyCouponPageChange(pharmacyCouponPage - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span>Previous</span>
                  </button>

                  <div className="page-numbers">
                    {generatePageNumbers(totalPharmacyCouponPages, pharmacyCouponPage).map((pageNum: number) => (
                      <button
                        key={pageNum}
                        className={`page-btn ${pharmacyCouponPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePharmacyCouponPageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {totalPharmacyCouponPages > 5 && pharmacyCouponPage < totalPharmacyCouponPages - 2 && (
                      <>
                        <span className="ellipsis">...</span>
                        <button
                          className="page-btn"
                          onClick={() => handlePharmacyCouponPageChange(totalPharmacyCouponPages)}
                        >
                          {totalPharmacyCouponPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    className="pagination-btn next-btn"
                    disabled={pharmacyCouponPage === totalPharmacyCouponPages}
                    onClick={() => handlePharmacyCouponPageChange(pharmacyCouponPage + 1)}
                  >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* LOCATIONS SECTION */}
      <Container>
        <section className="our-location-section">
          <h2 className="our-location-heading">Our Locations</h2>

          <div className="location-carousel-wrapper">
            <button className="carousel-arrow left" onClick={handleLocationPrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} />
                  <div className="location-name">{loc.name}</div>
                </div>
              ))}
            </div>

            <button className="carousel-arrow right" onClick={handleLocationNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default MyBookings;