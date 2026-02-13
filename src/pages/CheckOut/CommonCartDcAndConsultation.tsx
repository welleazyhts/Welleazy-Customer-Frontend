import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TimeSlotRequest, TimeSlotResponse } from "../../types/Consultation";
import { ConsultationAPI } from '../../api/Consultation';
import { labTestsAPI } from "../../api/labtests";

interface AppointmentItem {
  id: string;
  type: string;
  name: string;
  price: number;
  quantity: number;
  consultationType?: string;
  doctorName?: string;
  appointmentTime?: string;
  caseLeadId?: string;
  cartUniqueId?: number;
  PersonName?: string;
  relationship?: string;
  appointmentDate?: string | null;
  doctorCity?: string;
  doctorSpeciality?: string;
  clinicName?: string;
  mobileNo?: string;
  emailId?: string;
  AppointmentDateTime?: string;
  cartDetailsId?: number;
  DCSelection?: string;
  DoctorId?: number;
  testName?: string;
  dcName?: string;
  testId?: string;
  relation?: string;
  dependentName?: string;
}

const CommonCartDcAndConsultation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [appointmentItems, setAppointmentItems] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedItemForReschedule, setSelectedItemForReschedule] = useState<AppointmentItem | null>(null);

  // Calendar and time slot states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('morning');
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotResponse | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadCartData = () => {
      try {
        const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
        const cartKey = `app_cart_${employeeRefId}`;
        const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

        let updatedCart = [...storedCart];

        if (location.state?.cartItems && location.state.cartItems.length > 0) {
          console.log("Processing items from state:", location.state.cartItems);
          const stateItems = location.state.cartItems;

          // Merge state items into stored cart, avoiding duplicates by ID
          stateItems.forEach((newItem: any) => {
            const index = updatedCart.findIndex(existingItem => existingItem.id === newItem.id);
            if (index !== -1) {
              updatedCart[index] = newItem; // Update existing
            } else {
              updatedCart.push(newItem); // Add new
            }
          });

          // Sync back to localStorage
          localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        }

        console.log("Final cart data:", updatedCart);
        setAppointmentItems(updatedCart);

        // Auto-select all items initially if new items were added or if nothing is selected
        setSelectedIds(new Set(updatedCart.map(item => item.id)));

      } catch (error) {
        toast.error("Failed to load cart data");
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, [location.state]);

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === appointmentItems.length && appointmentItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(appointmentItems.map(item => item.id)));
    }
  };

  // Load time slots when modal opens or date changes
  useEffect(() => {
    if (showModal && selectedItemForReschedule) {
      loadTimeSlots();
    }
  }, [showModal, selectedDate, selectedItemForReschedule, selectedTimePeriod]);

  const handleRemoveItem = async (id: string) => {
    console.log("Removing item with ID:", id);
    const itemToRemove = appointmentItems.find(item => item.id === id);

    // Try to remove from backend if it's a synced item
    // Local-only items often have 'appointment_' prefix or very large timestamp IDs
    const backendId = itemToRemove?.cartDetailsId || (itemToRemove as any).CartDetailsId || (itemToRemove as any).CaseRefId;

    if (backendId && !id.includes('appointment_')) {
      try {
        console.log("Attempting to remove item from backend:", backendId);
        await labTestsAPI.removeCartItem(Number(backendId));
      } catch (error) {
        console.error("Failed to remove item from backend:", error);
      }
    }

    setAppointmentItems(prev => {
      const updatedItems = prev.filter(item => item.id !== id);
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const cartKey = `app_cart_${employeeRefId}`;
      localStorage.setItem(cartKey, JSON.stringify(updatedItems));
      return updatedItems;
    });

    toast.success("Item removed from cart");
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProceedToConfirm = () => {
    const selectedItems = appointmentItems.filter(item => selectedIds.has(item.id));

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }

    const cartUniqueId = selectedItems[0]?.cartUniqueId ||
      parseInt(localStorage.getItem("CartUniqueId") || "0");

    const employeeRefId = parseInt(localStorage.getItem("EmployeeRefId") || "0");

    navigate("/CheckOut", {
      state: {
        cartUniqueId: cartUniqueId,
        employeeRefId: employeeRefId,
        fromAppointment: true,
        cartItems: selectedItems
      }
    });
  };

  const formatTo12Hour = (dateTime: any): string => {
    if (!dateTime) return "Not Scheduled";

    // If it's already a Date object, convert to string safely
    if (dateTime instanceof Date) {
      return dateTime.toLocaleString();
    }

    if (typeof dateTime !== 'string') return String(dateTime);

    try {
      const parts = dateTime.split(" ");
      if (parts.length < 2) return dateTime;

      const [datePart, timePart] = parts;
      if (!datePart || !timePart) return dateTime;

      const dateParts = datePart.split("-");
      if (dateParts.length < 3) return dateTime;

      const [year, month, day] = dateParts;
      let [hours, minutes] = timePart.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) return dateTime;

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;

      return `${day}/${month}/${year} ${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    } catch (error) {
      return String(dateTime);
    }
  };

  const formatPrice = (price: any) => {
    const numPrice = typeof price === 'number' ? price : Number(price || 0);
    return `Rs ${numPrice.toFixed(2)}`;
  };

  const loadTimeSlots = async () => {
    if (!selectedItemForReschedule) {
      toast.error("No appointment selected for rescheduling");
      return;
    }

    setLoadingTimeSlots(true);
    setSelectedTimeSlot(null);
    setSelectedTime('');

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Map time period to time zone value
      let timeZoneValue = 1; // Default to morning

      switch (selectedTimePeriod) {
        case 'morning':
          timeZoneValue = 1;
          break;
        case 'afternoon':
          timeZoneValue = 2;
          break;
        case 'evening':
          timeZoneValue = 3;
          break;
        case 'night':
          timeZoneValue = 4;
          break;
        default:
          timeZoneValue = 1;
      }


      let response;

      if (selectedItemForReschedule.type === 'diagnostic') {
        const requestData = {
          diagnostic_center: selectedItemForReschedule.DoctorId || 1, // Defaulting to 1 as per user example if missing
          date: formattedDate,
          visit_type: 2
        };
        console.log('Fetching diagnostic slots:', requestData);
        response = await ConsultationAPI.CRMLoadDiagnosticTimeSlots(requestData);
      } else {
        const requestData: TimeSlotRequest = {
          doctorId: selectedItemForReschedule.DoctorId || 0,
          Date: formattedDate
        };
        response = await ConsultationAPI.CRMLoadTimeSlots(requestData);
      }
      console.log('Time slots response:', response);

      if (Array.isArray(response)) {
        setTimeSlots(response);
        console.log('Time slots loaded:', response.length);
      } else {
        console.warn('No time slots found or unexpected response format:', response);
        setTimeSlots([]);
        toast.info('No available time slots for the selected period');
      }
    } catch (error: any) {
      console.error('Error loading time slots:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load available time slots');
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlotResponse) => {
    console.log('Time slot selected:', timeSlot);
    setSelectedTimeSlot(timeSlot);
    setSelectedTime(timeSlot.Time || '');
  };

  const handleOpenRescheduleModal = (item: AppointmentItem) => {
    setSelectedItemForReschedule(item);

    if (item.appointmentTime) {
      try {
        const date = new Date(item.appointmentTime);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItemForReschedule(null);
    setSelectedTimeSlot(null);
    setSelectedTime('');
  };

  // Function to convert 12-hour time to 24-hour format
  const convert12to24 = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

  const handleConfirmReschedule = async () => {
    if (!selectedTimeSlot || !selectedItemForReschedule) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      // Format date as YYYY-MM-DD
      const dateStr = selectedDate.toISOString().split('T')[0];

      console.log('Selected time slot for reschedule:', selectedTimeSlot);
      console.log('Selected date:', dateStr);

      // Convert the selected time slot to 24-hour format for backend
      const time24Hour = convert12to24(selectedTimeSlot.Time);
      const newDateTime = `${dateStr} ${time24Hour}`;

      // For display, keep the 12-hour format
      const displayDateTime = `${dateStr} ${selectedTimeSlot.Time}`;

      console.log('24-hour time:', time24Hour);
      console.log('New date time (backend):', newDateTime);
      console.log('Display date time:', displayDateTime);

      const employeeRefId = parseInt(localStorage.getItem("EmployeeRefId") || "0");

      // Update localStorage
      const cartKey = `app_cart_${employeeRefId}`;
      const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

      const updatedCart = storedCart.map((item: any) => {
        if (item.id === selectedItemForReschedule.id) {
          const updatedItem = {
            ...item,
            appointmentTime: newDateTime, // Store in 24-hour format
            appointmentDate: dateStr,
            AppointmentDateTime: newDateTime // Store in 24-hour format
          };

          // Try to update backend if we have the necessary IDs
          if (item.caseLeadId || item.CaseRefId) {
            const caseLeadId = item.caseLeadId || item.CaseRefId;
            const cartDetailsId = item.cartDetailsId || item.CartDetailsId || 0;

            const customerCartDetailsPayload = {
              CaseleadId: caseLeadId.toString(),
              AppointmentDateTime: newDateTime,
              DCId: 0,
              CreatedBy: employeeRefId,
              CartDetailsId: cartDetailsId,
              StMId: "",
              DCSelection: "",
              TestPackageCode: ""
            };

            console.log('API Payload for backend update:', customerCartDetailsPayload);

            // Make API call
            ConsultationAPI.CRMSaveCustomerCartDetails(customerCartDetailsPayload)
              .then((response) => {
                console.log('Backend updated successfully:', response);
              })
              .catch(err => {
                console.error('Failed to update backend:', err);
              });
          }

          return updatedItem;
        }
        return item;
      });

      localStorage.setItem(cartKey, JSON.stringify(updatedCart));

      // Update state - store in 24-hour format but display will use formatTo12Hour
      const updatedItems = appointmentItems.map(item =>
        item.id === selectedItemForReschedule.id
          ? {
            ...item,
            appointmentTime: newDateTime, // Store in 24-hour format
            appointmentDate: dateStr,
            AppointmentDateTime: newDateTime
          }
          : item
      );
      setAppointmentItems(updatedItems);

      toast.success("Appointment rescheduled successfully!");
      handleCloseModal();
      window.dispatchEvent(new CustomEvent('cartUpdated'));

    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error("Failed to reschedule appointment");
    }
  };

  const isTimeSlotExpired = (timeSlot: TimeSlotResponse, selectedDate: Date): boolean => {
    try {
      const now = new Date();
      const slotDateTime = new Date(selectedDate);

      if (timeSlot.Time) {
        const time24Hour = convert12to24(timeSlot.Time);
        const [hoursStr, minutesStr] = time24Hour.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        slotDateTime.setHours(hours, minutes, 0, 0);
      }

      return slotDateTime < now;
    } catch (error) {
      console.error('Error checking if time slot expired:', error);
      return false;
    }
  };

  const filterTimeSlotsByPeriod = (slots: TimeSlotResponse[]) => {
    return slots.filter(slot => {
      if (!slot.Time) return false;

      // Convert to 24-hour format for filtering
      const time24Hour = convert12to24(slot.Time);
      const [hoursStr] = time24Hour.split(':');
      const hours = parseInt(hoursStr);

      switch (selectedTimePeriod) {
        case 'morning':
          return hours >= 6 && hours < 12;
        case 'afternoon':
          return hours >= 12 && hours < 17;
        case 'evening':
          return hours >= 17 && hours < 21;
        case 'night':
          return hours >= 21 || hours < 6;
        default:
          return true;
      }
    });
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all items from the cart?")) return;

    setLoading(true);
    try {
      // Create a copy of items to iterate over
      const itemsToClear = [...appointmentItems];

      // Remove each item from backend if it has a backend ID
      for (const item of itemsToClear) {
        const backendId = item.cartDetailsId || (item as any).CartDetailsId || (item as any).CaseRefId;
        if (backendId && !item.id.includes('appointment_')) {
          try {
            await labTestsAPI.removeCartItem(Number(backendId));
          } catch (e) {
            console.error("Error clearing item:", backendId, e);
          }
        }
      }

      // Clear local state and localStorage
      setAppointmentItems([]);
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const cartKey = `app_cart_${employeeRefId}`;
      localStorage.setItem(cartKey, JSON.stringify([]));

      toast.success("Cart cleared successfully");
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart completely");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center", marginTop: "100px" }}>
        <div style={{ fontSize: "20px", color: "#1e88e5" }}>Loading your appointments...</div>
      </div>
    );
  }

  if (appointmentItems.length === 0) {
    return (
      <div style={{ padding: "30px", textAlign: "center", marginTop: "100px" }}>
        <h2 style={{ color: "#1e88e5" }}>CART</h2>
        <div style={{ margin: "40px 0", color: "#666" }}>
          Your appointment cart is empty
        </div>
        <button
          onClick={handleBack}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(to right, #f57c00, #fb8c00)",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    );
  }

  const getHeaderSummary = () => {
    const targetItems = selectedIds.size > 0
      ? appointmentItems.filter(item => selectedIds.has(item.id))
      : appointmentItems;

    const names = Array.from(new Set(targetItems.map(item => item.PersonName || (item as any).dependentName || "Patient")));
    const nameText = names.length > 2
      ? `${names[0]} & ${names.length - 1} others`
      : names.join(" & ") || "No items selected";

    const scheduled = targetItems.filter(item => item.appointmentTime);
    const timeText = scheduled.length === 0
      ? "No Appointments Scheduled"
      : scheduled.length === 1
        ? `Appointment Scheduled For ${formatTo12Hour(scheduled[0].appointmentTime)}`
        : `${scheduled.length} Appointments Scheduled`;

    return { nameText, timeText };
  };

  const headerSummary = getHeaderSummary();

  return (
    <div style={{ padding: "30px", position: 'relative' }}>
      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Reschedule Appointment for {selectedItemForReschedule?.PersonName}
              </h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="calendar-time-layout">
                <div className="calendar-side">
                  <div className="calendar-container">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setSelectedDate(date);
                          setSelectedTimeSlot(null);
                          setSelectedTime('');
                        }
                      }}
                      minDate={new Date()}
                      inline
                      className="tele-calendar"
                      dateFormat="dd/MM/yyyy"
                      highlightDates={[new Date()]}
                    />
                  </div>
                </div>

                {/* Time Slots Side */}
                <div className="time-slots-side" style={{ height: '70%' }}>
                  <div className="time-selection-section">
                    <h4 className="time-section-title">Select Time Slot</h4>

                    {/* Time Period Tabs */}
                    <div className="time-period-tabs">
                      <button
                        className={`time-period-tab ${selectedTimePeriod === 'morning' ? 'active' : ''}`}
                        onClick={() => setSelectedTimePeriod('morning')}
                        data-timezone="1"
                      >
                        🌅 Morning
                      </button>
                      <button
                        className={`time-period-tab ${selectedTimePeriod === 'afternoon' ? 'active' : ''}`}
                        onClick={() => setSelectedTimePeriod('afternoon')}
                        data-timezone="2"
                      >
                        ☀️ Afternoon
                      </button>
                      <button
                        className={`time-period-tab ${selectedTimePeriod === 'evening' ? 'active' : ''}`}
                        onClick={() => setSelectedTimePeriod('evening')}
                        data-timezone="3"
                      >
                        🌆 Evening
                      </button>
                      <button
                        className={`time-period-tab ${selectedTimePeriod === 'night' ? 'active' : ''}`}
                        onClick={() => setSelectedTimePeriod('night')}
                        data-timezone="4"
                      >
                        🌙 Night
                      </button>
                    </div>

                    {/* Time Slots Grid from API */}
                    <div className="time-slots-grid">
                      {loadingTimeSlots ? (
                        <div className="loading-time-slots">
                          <div className="spinner" />
                          <p>Loading available slots...</p>
                        </div>
                      ) : timeSlots && Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                        timeSlots.map((timeSlot, index) => {
                          const dateToUse = selectedDate || new Date();
                          const isExpired = isTimeSlotExpired(timeSlot, dateToUse);
                          const isSelected = selectedTimeSlot?.TimeId === timeSlot.TimeId;

                          return (
                            <button
                              key={timeSlot.TimeId || index}
                              className={`time-slot-btn ${isSelected ? 'active' : ''
                                } ${isExpired ? 'expired' : ''
                                }`}
                              onClick={() => handleTimeSlotSelect(timeSlot)}
                              disabled={isExpired}
                              title={isExpired ? 'This time slot has expired' : `Select ${timeSlot.Time}`}
                            >
                              {timeSlot.Time}
                            </button>
                          );
                        })
                      ) : (
                        <div className="no-time-slots">
                          <p>⏰ No slots available</p>
                          <small>No available slots for the selected time period</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                className="modal-btn cancel-btn"
                onClick={handleCloseModal}
                style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary-confirmbooking-consultation"
                onClick={handleConfirmReschedule}
                disabled={!selectedTimeSlot}
                style={{
                  padding: '10px 20px',
                  background: !selectedTimeSlot ? '#cccccc' : '#f57c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !selectedTimeSlot ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginBottom: "20px",
        marginTop: "10px"
      }}>
        <h2 style={{ color: "#1e88e5", margin: 0 }}>CART</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: "4px 12px",
              background: "#e3f2fd",
              border: "1px solid #1e88e5",
              borderRadius: "4px",
              color: "#1e88e5",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            {selectedIds.size === appointmentItems.length && appointmentItems.length > 0 ? "UNSELECT ALL" : "SELECT ALL"}
          </button>
          <button
            onClick={handleClearAll}
            style={{
              padding: "4px 12px",
              background: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "4px",
              color: "#b91c1c",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            CLEAR ALL
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "20px auto" }}>
        {appointmentItems.length > 0 && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "16px",
              cursor: "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#1e88e5", fontWeight: 600 }}>
                {headerSummary.nameText}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#1e88e5", fontWeight: 600 }}>
                  {headerSummary.timeText}
                </span>
                <span style={{ fontSize: "22px", color: "#1e88e5", fontWeight: 700 }}>
                  {isOpen ? "−" : "+"}
                </span>
              </div>
            </div>
          </div>
        )}

        {isOpen && (
          <>
            {/* Doctor Consultations Section */}
            {appointmentItems.filter(item => item.type === 'appointment').length > 0 && (
              <div style={{ marginBottom: appointmentItems.filter(item => item.type === 'diagnostic').length > 0 ? "25px" : "0" }}>
                <div style={{
                  padding: "10px 20px",
                  background: "#f0f7ff",
                  border: "1px solid #ddd",
                  borderTop: "none",
                  borderLeft: "4px solid #1e88e5",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#1e88e5",
                  letterSpacing: "0.5px"
                }}>
                  DOCTOR CONSULTATIONS
                </div>
                {appointmentItems.filter(item => item.type === 'appointment').map((item, index, filteredArray) => {
                  const displayName = item.consultationType || 'Tele Consultation';
                  const patientName = item.PersonName || (item as any).dependentName || 'Patient';
                  const relationship = (item as any).Relationship || item.relationship || (item as any).relation || 'Self';

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #ddd",
                        borderTop: "none",
                        padding: "20px",
                        borderRadius: index === filteredArray.length - 1 && appointmentItems.filter(item => item.type === 'diagnostic').length === 0 ? "0 0 6px 6px" : "0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: "#e0e0e0",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1e88e5",
                              fontWeight: "bold",
                              fontSize: "14px",
                              textAlign: 'center'
                            }}
                          >
                            DR
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{displayName}</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>
                              {patientName} ({relationship})
                            </div>

                            {item.doctorName && (
                              <div style={{ fontSize: "13px", color: "#1e88e5", marginTop: "4px" }}>
                                {item.doctorName}
                                {item.doctorSpeciality && ` - ${item.doctorSpeciality}`}
                              </div>
                            )}

                            <div
                              style={{
                                fontSize: "13px",
                                color: "#f57c00",
                                marginTop: "4px",
                                cursor: "pointer",
                                textDecoration: "underline"
                              }}
                              onClick={() => handleOpenRescheduleModal(item)}
                            >
                              {item.appointmentTime
                                ? `Reschedule: ${formatTo12Hour(item.appointmentTime)}`
                                : "Click to choose a time slot"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: "18px" }}>
                            {formatPrice(item.price)}
                          </span>
                          <span
                            style={{ fontSize: "20px", cursor: "pointer", color: "#ff4444" }}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            ×
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lab/Diagnostic Tests Section */}
            {appointmentItems.filter(item => item.type === 'diagnostic').length > 0 && (
              <div>
                <div style={{
                  padding: "10px 20px",
                  background: "#f1fdf1",
                  border: "1px solid #ddd",
                  borderTop: appointmentItems.filter(item => item.type === 'appointment').length > 0 ? "1px solid #ddd" : "none",
                  borderLeft: "4px solid #2e7d32",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#2e7d32",
                  letterSpacing: "0.5px"
                }}>
                  LAB / DIAGNOSTIC TESTS
                </div>
                {appointmentItems.filter(item => item.type === 'diagnostic').map((item, index, filteredArray) => {
                  const displayName = (item as any).testName || 'Lab Test';
                  const patientName = item.PersonName || (item as any).dependentName || 'Patient';
                  const relationship = (item as any).Relationship || item.relationship || (item as any).relation || 'Self';

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #ddd",
                        borderTop: "none",
                        padding: "20px",
                        borderRadius: index === filteredArray.length - 1 ? "0 0 6px 6px" : "0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: "#e8f5e9",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2e7d32",
                              fontWeight: "bold",
                              fontSize: "14px",
                              textAlign: 'center'
                            }}
                          >
                            LAB
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{displayName}</div>
                            <div style={{ fontSize: "14px", color: "#666" }}>
                              {patientName} ({relationship})
                            </div>

                            {(item as any).dcName && (
                              <div style={{ fontSize: "13px", color: "#2e7d32", marginTop: "4px" }}>
                                {(item as any).dcName}
                              </div>
                            )}

                            <div
                              style={{
                                fontSize: "13px",
                                color: "#f57c00",
                                marginTop: "4px",
                                cursor: "pointer",
                                textDecoration: "underline"
                              }}
                              onClick={() => handleOpenRescheduleModal(item)}
                            >
                              {item.appointmentTime
                                ? `Reschedule: ${formatTo12Hour(item.appointmentTime)}`
                                : "Click to choose a time slot"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: "18px" }}>
                            {formatPrice(item.price)}
                          </span>
                          <span
                            style={{ fontSize: "20px", cursor: "pointer", color: "#ff4444" }}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            ×
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{
        maxWidth: "1100px",
        margin: "30px auto",
        display: "flex",
        justifyContent: "flex-end",
        gap: "16px",
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(to right, #f57c00, #fb8c00)",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Back
        </button>

        <button
          onClick={handleProceedToConfirm}
          disabled={appointmentItems.length === 0}
          style={{
            padding: "10px 24px",
            background: appointmentItems.length > 0
              ? "linear-gradient(to right, #f57c00, #fb8c00)"
              : "#cccccc",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: appointmentItems.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          Proceed To Confirm
        </button>
      </div>
    </div>
  );
};

export default CommonCartDcAndConsultation;