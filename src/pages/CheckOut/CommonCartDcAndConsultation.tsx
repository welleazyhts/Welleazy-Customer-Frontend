import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TimeSlotRequest, TimeSlotResponse } from "../../types/Consultation";
import { ConsultationAPI } from '../../api/Consultation';

interface AppointmentItem {
  id: string;
  type: 'appointment';
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
  DCSelection: string;
  DoctorId: number;
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

  useEffect(() => {
    const loadAppointmentData = () => {
      try {
        if (location.state?.cartItems && location.state.cartItems.length > 0) {
          setAppointmentItems(location.state.cartItems);
        } else {
          const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
          const cartKey = `app_cart_${employeeRefId}`;
          const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
          const appointmentItems = storedCart.filter((item: any) => item.type === 'appointment');
          
          if (appointmentItems.length === 0) {
            toast.info("No appointments found in your cart");
          }
          
          setAppointmentItems(appointmentItems);
        }
      } catch (error) {
        toast.error("Failed to load appointment data");
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentData();
  }, [location.state]);

  // Load time slots when modal opens or date changes
  useEffect(() => {
    if (showModal && selectedItemForReschedule) {
      loadTimeSlots();
    }
  }, [showModal, selectedDate, selectedItemForReschedule, selectedTimePeriod]);

  const handleRemoveItem = (id: string) => {
    const updatedItems = appointmentItems.filter(item => item.id !== id);
    setAppointmentItems(updatedItems);
    
    const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
    const cartKey = `app_cart_${employeeRefId}`;
    const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const nonAppointmentItems = storedCart.filter((item: any) => item.type !== 'appointment');
    const updatedCart = [...nonAppointmentItems, ...updatedItems];
    
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProceedToConfirm = () => {
    if (appointmentItems.length === 0) {
      toast.error("No appointments in cart");
      return;
    }
    
    const cartUniqueId = appointmentItems[0]?.cartUniqueId || 
                        parseInt(localStorage.getItem("CartUniqueId") || "0");
    
    const employeeRefId = parseInt(localStorage.getItem("EmployeeRefId") || "0");
    
    navigate("/CheckOut", {
      state: {
        cartUniqueId: cartUniqueId,
        employeeRefId: employeeRefId,
        fromAppointment: true
      }
    });
  };

  const formatTo12Hour = (dateTime: string): string => {
    if (!dateTime) return "Not Scheduled";
    
    try {
      const [datePart, timePart] = dateTime.split(" ");
      if (!datePart || !timePart) return dateTime;
      
      const [year, month, day] = datePart.split("-");
      let [hours, minutes, seconds] = timePart.split(":").map(Number);

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;

      return `${day}/${month}/${year} ${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    } catch (error) {
      return dateTime;
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${price.toFixed(2)}`;
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
      
      switch(selectedTimePeriod) {
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
      
      
      const requestData = {
        DCUniqueName: selectedItemForReschedule.DCSelection || "",
        DoctorId: selectedItemForReschedule.DoctorId || 0,
        TimeZone: timeZoneValue,
      };
      const response = await ConsultationAPI.CRMLoadTimeSlots(requestData);    
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
                <div className="time-slots-side" style={{height:'70%'}}>
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
                        filterTimeSlotsByPeriod(timeSlots).map((timeSlot, index) => {
                          const dateToUse = selectedDate || new Date();
                          const isExpired = isTimeSlotExpired(timeSlot, dateToUse);
                          const isSelected = selectedTimeSlot?.TimeId === timeSlot.TimeId;
                          
                          return (
                            <button
                              key={timeSlot.TimeId || index}
                              className={`time-slot-btn ${
                                isSelected ? 'active' : ''
                              } ${
                                isExpired ? 'expired' : ''
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

      <h2 style={{ color: "#1e88e5", textAlign: "center", marginBottom: "30px" }}>CART</h2>

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
                {appointmentItems[0].PersonName || "Patient Name"}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#1e88e5", fontWeight: 600 }}>
                  Appointment Scheduled For {formatTo12Hour(appointmentItems[0]?.appointmentTime ?? "")}
                </span>
                <span style={{ fontSize: "22px", color: "#1e88e5", fontWeight: 700 }}>
                  {isOpen ? "−" : "+"}
                </span>
              </div>
            </div>
          </div>
        )}

        {isOpen && appointmentItems.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderTop: index === 0 ? "none" : "1px solid #ddd",
              padding: "20px",
              borderRadius: index === appointmentItems.length - 1 ? "0 0 6px 6px" : "0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "16px" }}>
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
                    fontSize: "14px"
                  }}
                >
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.consultationType || 'Tele Consultation'}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {item.PersonName || 'Patient'} ({item.relationship || 'Self'})
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
                    Reschedule: {formatTo12Hour(item.appointmentTime ?? "")}
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
        ))}
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