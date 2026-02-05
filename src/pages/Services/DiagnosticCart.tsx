import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Button, Row, Col, 
  Alert, Form, Table, Spinner, Badge,
  Modal,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import {
  faShoppingCart,
  faRupeeSign,
  faUser,
  faCalendarCheck,
  faChevronLeft,
  faTrash,
  faPlus,
  faMinus,
  faInfoCircle,
  faCheckCircle,
  faUserFriends,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faCalendar,
  faClock,
  faSyringe,
  faStethoscope,
  faNotesMedical,
  faFileMedical,
  faMoneyBillWave,
  faCreditCard,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './DiagnosticCart.css';
import { ConsultationAPI } from '../../api/Consultation';
import { TimeSlotRequest, TimeSlotResponse } from '../../types/Consultation';
import { gymServiceAPI } from '../../api/GymService';
import { labTestsAPI } from '../../api/labtests'; 
import { toast } from "react-toastify";
import 'react-datepicker/dist/react-datepicker.css';
import { OrangeHealthCreateOrderResponse, OrangeHealthCreateOrderRequest, CartItem, DependentFormData, DiagnosticCenter } from '../../types/labtests';

interface TestItem {
  TestId: string;
  TestName: string;
  TestPackageCode?: string;
  CorporatePrice?: number;
  NormalPrice?: number;
}

interface AppointmentData {
  doctorName: string;
  specialization: string;
  date: string | null;
  time: string;
  appointmentType: string;
  consultationType: string;
  patientName: string;
  symptoms: string;
  bookingDateTime: string;
  doctorFee?: string;
  doctorType?: string;
  isWelleazyDoctor?: boolean;
  consultationFee?: number;
}

interface LocationState {
  selectedTests?: TestItem[];
  selectedDC?: DiagnosticCenter;
  totalAmount?: number;
  serviceFor?: DependentFormData;
  appointmentDetails?: AppointmentData;
  customerMobile?: string;
}

const DiagnosticCart: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;
  
  // Check which flow we're in
  const appointmentData: AppointmentData | null = locationState?.appointmentDetails || null;
  const isFromConsultation = !!appointmentData;
  
  // Diagnostic test data
  const selectedTests = locationState?.selectedTests || [];
  const selectedDC = locationState?.selectedDC || null;
  const totalAmount = locationState?.totalAmount || 0;
  const serviceForData: DependentFormData = locationState?.serviceFor || {
    serviceFor: 'self',
    relationshipId: '',
    relationshipPersonId: '',
    name: '',
    phone: '',
    email: '',
    relation: ''
  };
  
  // State for BOTH flows
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [serviceFor, setServiceFor] = useState<'self' | 'dependent'>(serviceForData.serviceFor);
  const [selectedDependent, setSelectedDependent] = useState<DependentFormData>(serviceForData);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Thyrocare states (for diagnostic)
  const [thyrocareConnected, setThyrocareConnected] = useState(false);
  const [thyrocareLoading, setThyrocareLoading] = useState(false);
  const [thyrocareApiKey, setThyrocareApiKey] = useState<string>('');
  const [thyrocareRefCode, setThyrocareRefCode] = useState<string>('');

  // Orange Health states (for diagnostic)
  const [orangeHealthOrderResponse, setOrangeHealthOrderResponse] = useState<OrangeHealthCreateOrderResponse | null>(null);
  const [orangeHealthLoading, setOrangeHealthLoading] = useState(false);

  // SRL states (for diagnostic)
  const [srlLoading, setSrlLoading] = useState(false);
  const [srlOrderResponse, setSrlOrderResponse] = useState<any>(null);

  // Time slots states (for diagnostic)
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotResponse | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Date and time selection states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Payment states
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showThyrocareModal, setShowThyrocareModal] = useState(false);
  const [thyrocareOrderResponse, setThyrocareOrderResponse] = useState<any>(null);

  // Consultation states
  const [consultationFee, setConsultationFee] = useState<number>(250);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  // Sync cart items to localStorage
  useEffect(() => {
    if (!isFromConsultation && cartItems.length > 0) {
      // Save diagnostic cart items to localStorage
      const diagnosticCartItems = cartItems.map(item => ({
        id: `diagnostic_${item.testId}_${Date.now()}`,
        type: 'diagnostic' as const,
        testId: item.testId,
        testName: item.testName,
        price: item.price,
        quantity: item.quantity,
        selectedFor: item.selectedFor,
        dependentName: item.dependentName,
        relation: item.relation,
        dcId: item.dcId,
        dcName: item.dcName,
        packageCode: item.packageCode
      }));
      
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const cartKey = `app_cart_${employeeRefId}`;
      
      // Get existing cart items
      const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      // Filter out old diagnostic items and add new ones
      const filteredCart = existingCart.filter((item: any) => item.type !== 'diagnostic');
      const updatedCart = [...filteredCart, ...diagnosticCartItems];
      
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      
      // Dispatch event to notify header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } else if (!isFromConsultation && cartItems.length === 0) {
      // Clear diagnostic items from cart if cart is empty
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const cartKey = `app_cart_${employeeRefId}`;
      const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const filteredCart = existingCart.filter((item: any) => item.type !== 'diagnostic');
      localStorage.setItem(cartKey, JSON.stringify(filteredCart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems, isFromConsultation]);

  // Initialize based on flow
  useEffect(() => {
    if (appointmentData) {
      // Consultation flow
      if (appointmentData.date) {
        setSelectedDate(new Date(appointmentData.date));
      }
      if (appointmentData.time) {
        setSelectedTime(appointmentData.time);
      }
      
      // Set customer details
      const storedMobile = locationState?.customerMobile || localStorage.getItem("customerMobile") || "";
      const storedName = localStorage.getItem("DisplayName") || appointmentData?.patientName || "";
      setCustomerMobile(storedMobile);
      setCustomerName(storedName);
      
      // Set consultation fee
      if (appointmentData.consultationFee) {
        setConsultationFee(appointmentData.consultationFee);
      } else if (appointmentData.isWelleazyDoctor) {
        setConsultationFee(250);
      } else if (appointmentData.doctorFee) {
        const feeMatch = appointmentData.doctorFee.match(/Rs\.?(\d+)/);
        if (feeMatch) {
          setConsultationFee(parseInt(feeMatch[1]));
        }
      }
    } else if (selectedTests.length > 0 && selectedDC) {
      // Diagnostic test flow
      const isDependent = serviceForData.serviceFor === 'dependent';
      
      const initialCartItems: CartItem[] = selectedTests.map((test: TestItem) => ({
        testId: test.TestId || '',
        testName: test.TestName || '',
        packageCode: test.TestPackageCode || '',
        price: test.CorporatePrice || test.NormalPrice || 0,
        quantity: 1,
        selectedFor: isDependent ? 'dependent' : 'self',
        dependentId: isDependent ? serviceForData.relationshipPersonId : undefined,
        dependentName: isDependent ? serviceForData.name : undefined,
        relation: isDependent ? getRelationshipName(serviceForData.relationshipId) : undefined,
        dcId: selectedDC.dc_id,
        dcName: selectedDC.center_name
      }));
      
      setCartItems(initialCartItems);
      setSelectedDependent(serviceForData);
      setServiceFor(serviceForData.serviceFor);
      
      // Set default selected date
      if (!selectedDate) {
        const today = new Date();
        setSelectedDate(today);
      }
    }
  }, [appointmentData, selectedTests, selectedDC, serviceForData, locationState]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      
      script.onload = () => {
        console.log("Razorpay SDK loaded successfully");
        setRazorpayLoaded(true);
      };
      
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        toast.error("Payment gateway failed to load. Please refresh the page.");
      };
      
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  // Check Thyrocare connection on load (only for diagnostic)
  useEffect(() => {
    if (!isFromConsultation) {
      const checkThyrocareConnection = () => {
        const storedApiKey = localStorage.getItem('thyrocare_api_key');
        const storedRefCode = localStorage.getItem('thyrocare_ref_code');
        
        if (storedApiKey && storedRefCode) {
          setThyrocareApiKey(storedApiKey);
          setThyrocareRefCode(storedRefCode);
          setThyrocareConnected(true);
        }
      };
      checkThyrocareConnection();
    }
  }, [isFromConsultation]);

  // Load time slots when period or date changes and modal is open (for diagnostic)
  useEffect(() => {
    if (!isFromConsultation && selectedDC && selectedDate && showBookingModal) {
      loadTimeSlots();
    }
  }, [selectedPeriod, selectedDate, showBookingModal, isFromConsultation, selectedDC]);

  const getRelationshipName = (relationshipId: string) => {
    const relationshipMap: { [key: string]: string } = {
      '1': 'Spouse',
      '2': 'Child',
      '3': 'Parent',
      '4': 'Sibling',
      '5': 'Other'
    };
    return relationshipMap[relationshipId] || 'Dependent';
  };

  // Calculate totals based on flow
  const calculateSubtotal = () => {
    if (isFromConsultation) {
      return consultationFee;
    }
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    // Example: 10% discount
    return Math.round(subtotal * 0.1);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Handle quantity change (only for diagnostic)
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1 || isFromConsultation) return;
    
    const updatedCartItems = [...cartItems];
    updatedCartItems[index] = { ...updatedCartItems[index], quantity: newQuantity };
    setCartItems(updatedCartItems);
    
    // Update localStorage
    syncCartToLocalStorage(updatedCartItems);
  };

  // Sync cart to localStorage
  const syncCartToLocalStorage = (items: CartItem[]) => {
    const diagnosticCartItems = items.map(item => ({
      id: `diagnostic_${item.testId}_${Date.now()}`,
      type: 'diagnostic' as const,
      testId: item.testId,
      testName: item.testName,
      price: item.price,
      quantity: item.quantity,
      selectedFor: item.selectedFor,
      dependentName: item.dependentName,
      relation: item.relation,
      dcId: item.dcId,
      dcName: item.dcName,
      packageCode: item.packageCode
    }));
    
    const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
    const cartKey = `app_cart_${employeeRefId}`;
    
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const filteredCart = existingCart.filter((item: any) => item.type !== 'diagnostic');
    const updatedCart = [...filteredCart, ...diagnosticCartItems];
    
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  // Handle remove item (only for diagnostic)
  const handleRemoveItem = (index: number) => {
    if (isFromConsultation) return;
    
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);
    
    // Update localStorage
    syncCartToLocalStorage(updatedCartItems);
    
    if (updatedCartItems.length === 0) {
      toast.info("All tests removed from cart");
      setTimeout(() => {
        navigate('/diagnostic-centers', {
          state: { selectedTests: selectedTests }
        });
      }, 1500);
    }
  };
  
  // Handle service for change (only for diagnostic)
  const handleServiceForChange = () => {
    if (isFromConsultation) return;
    navigate('/diagnostic-centers', {
      state: { selectedTests: selectedTests }
    });
  };

  // Load customer profile
  useEffect(() => {
    const loadCustomerProfile = async () => {
      try {
        const employeeRefIdStr = localStorage.getItem("EmployeeRefId");
        if (!employeeRefIdStr) {
          console.error("EmployeeRefId not found in localStorage");
          return;
        }
        const employeeRefId = parseInt(employeeRefIdStr, 10);
        
        if (isNaN(employeeRefId)) {
          console.error("Invalid EmployeeRefId in localStorage");
          return;
        }
        const customerProfile = await gymServiceAPI.CRMLoadCustomerProfileDetails(employeeRefId);
        localStorage.setItem("customerEmail", customerProfile.Emailid || "");
        localStorage.setItem("customerMobile", customerProfile.MobileNo || "");
        localStorage.setItem("customerAddress", customerProfile.Address || "");
        localStorage.setItem("customerPincode", customerProfile.Pincode);
        
        // Update state if not already set
        if (!customerMobile) {
          setCustomerMobile(customerProfile.MobileNo || "");
        }
        if (!customerName) {
          setCustomerName(localStorage.getItem("DisplayName") || customerProfile.EmployeeName || "");
        }
      } catch (error) {
        console.error("Error loading customer profile:", error);
      }
    };
    
    loadCustomerProfile();
  }, []);

  // Thyrocare Login Function using labTestsAPI (for diagnostic)
  const handleThyrocareLogin = async (): Promise<boolean> => {
    setThyrocareLoading(true);
    
    try {
      console.log("Logging in to Thyrocare using labTestsAPI...");      
      const response = await labTestsAPI.ThyrocareLogin({
        username: "9895495477",
        password: "5B2B35",
        portalType: "",
        userType: "DSA"
      });
      
      if (response && response.apiKey) {
        setThyrocareApiKey(response.apiKey);
        setThyrocareRefCode(response.mobile);
        setThyrocareConnected(true);
        
        localStorage.setItem('thyrocare_api_key', response.apiKey);
        localStorage.setItem('thyrocare_ref_code', response.mobile);
        localStorage.setItem('thyrocare_user_info', JSON.stringify({
          name: response.name,
          email: response.email,
          mobile: response.mobile
        }));
        
        return true;
      } else {
        throw new Error("No API key received from Thyrocare");
      }
    } catch (error) {
      console.error("Thyrocare login failed:", error);
      toast.error("Failed to connect to Thyrocare. Please try again.");
      return false;
    } finally {
      setThyrocareLoading(false);
    }
  };

  // Generate BenDataXML for Thyrocare
  const generateBenDataXML = (beneficiaries: any[]): string => {
    if (!beneficiaries || beneficiaries.length === 0) {
      return '<NewDataSet></NewDataSet>';
    }
    const benDetails = beneficiaries.map(ben => {
      const genderCode = ben.Gender === 'Male' || ben.Gender === 'M' ? 'M' : 'F';
      return `<Ben_details>
        <Name>${ben.Name}</Name>
        <Age>${ben.Age}</Age>
        <Gender>${genderCode}</Gender>
      </Ben_details>`;
    }).join('');
    
    return `<NewDataSet>${benDetails}</NewDataSet>`;
  };

  // Book Thyrocare Order - ONLY CALLED AFTER PAYMENT SUCCESS
  const bookThyrocareOrder = async (paymentResponse?: any): Promise<any | null> => {
    try {
      const email = localStorage.getItem("email") || "";
      const mobile = localStorage.getItem("customerMobile") || "";
      const customerAddress = localStorage.getItem("customerAddress") || "";
      const displayName = localStorage.getItem("DisplayName") || "";
      const pincode = localStorage.getItem("customerPincode") || "";

      if (!thyrocareApiKey || !thyrocareRefCode) {
        throw new Error("Thyrocare not connected. Please connect first.");
      }
      
      const getUserName = () => {
        return localStorage.getItem("employeeName") || displayName || "Customer";
      };

      const beneficiaries = [{
        Name: serviceFor === 'dependent' ? selectedDependent?.name || "" : getUserName(),
        Age: '30', 
        Gender: serviceFor === 'dependent' 
          ? selectedDependent?.relation === 'Male' ? 'Male' : 'Female' 
          : 'Male'
      }];
      
      const orderId = `WX${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const productCode = cartItems[0]?.packageCode || 'FBS'; 
      const orderRequest = {
        ApiKey: thyrocareApiKey,
        OrderId: orderId,
        Email: email, 
        Gender: serviceFor === 'dependent' 
          ? selectedDependent?.relation === 'Male' ? 'Male' : 'Female' 
          : 'Male',
        Mobile: mobile,
        Address: customerAddress,
        ApptDate: selectedDate 
          ? `${selectedDate.toISOString().split('T')[0]} 10:30` 
          : `${new Date().toISOString().split('T')[0]} 10:30`,
        OrderBy: displayName,
        Passon: 0,
        PayType: "POSTPAID",
        Pincode: pincode,
        Product: productCode,
        RefCode: thyrocareRefCode,
        ReportCode: "",
        Remarks: paymentResponse 
          ? `Payment ID: ${paymentResponse.razorpay_payment_id}` 
          : "Order via Welleazy",
        Reports: "N",
        ServiceType: "H",
        BenCount: "1",
        BenDataXML: generateBenDataXML(beneficiaries)
      };
      
      const response = await labTestsAPI.ThyrocareOrderBooking(orderRequest);
      if (response) {
        return response;
      } else {
        throw new Error("No response from Thyrocare");
      }
    } catch (error) {
      throw error;
    }
  };

  // Book Orange Health Order
  const bookOrangeHealthOrder = async (paymentResponse?: any): Promise<any | null> => {
    if (!selectedDC || !selectedDate || !selectedTimeSlot) {
      toast.error("Please select date, time and diagnostic center first");
      return null;
    }

    const isOrangeHealthCenter =
      selectedDC.center_name?.toLowerCase().includes("orange") ||
      selectedDC.DCUniqueName?.toLowerCase().includes("orangehealth");

    if (!isOrangeHealthCenter) return null;

    setOrangeHealthLoading(true);

    try {
      const customerName = localStorage.getItem("employeeName") || "Customer";
      const customerMobile = localStorage.getItem("customerMobile") || "";
      const customerEmail = localStorage.getItem("customerEmail") || "";
      const customerAddress = localStorage.getItem("customerAddress") || "";
    
      const timeString = selectedTimeSlot.Time.trim();
      const [timePart, modifier] = timeString.split(' ');
      
      if (!timePart || !modifier) {
        toast.error("Invalid time format selected");
        return null;
      }

      let [hours, minutes] = timePart.split(':').map(num => parseInt(num, 10));
      
      if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      }
      if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hours);
      slotDate.setMinutes(minutes);
      slotDate.setSeconds(0);
      slotDate.setMilliseconds(0);
      
      let slot_datetime = slotDate.toISOString();
      slot_datetime = slot_datetime.split('.')[0];
      if (slot_datetime.endsWith('Z')) {
        slot_datetime = slot_datetime.slice(0, -1);
      }
      
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      const hour = String(hours).padStart(2, '0');
      const minute = String(minutes).padStart(2, '0');
      const slot_datetime_alt = `${year}-${month}-${day}T${hour}:${minute}:00`;
      const final_slot_datetime = slot_datetime_alt;
      
      const orderRequest: OrangeHealthCreateOrderRequest = {
        slot_datetime: final_slot_datetime, 
        latitude: "13.0240",
        longitude: "77.6433",
        address: customerAddress,
        primary_patient_name: customerName,
        primary_patient_number: customerMobile,
        patient_name: customerName,
        patient_phone: customerMobile,
        age: "30",
        gender: "Male",
        payment_status: calculateTotal() === 0 ? "Paid" : "Unpaid",
        email: customerEmail,
        testId: cartItems[0]?.packageCode || "",
        packageId: "",
        partner_notes: "Add additional notes for OH Team only if absolutely necessary"
      };
      
      const raw = await labTestsAPI.OrangeHealthCreateOrder(orderRequest);    
      if (!raw?.Message) {
        toast.success("Your Orange Health order has been placed successfully. Thank you for choosing us!");
        return null;
      }
      
      let parsed;
      try {
        parsed = typeof raw.Message === 'string' 
          ? JSON.parse(raw.Message) 
          : raw.Message;
      } catch (parseError) {
        toast.error("Failed to parse Orange Health response");
        return null;
      }
      
      if (parsed.status?.toLowerCase() !== "success") {
        const errorMsg = parsed.message || parsed.status || "Booking failed";
        console.error("Orange Health booking failed:", errorMsg);
        toast.error(`Orange Health: ${errorMsg}`);
        return null;
      }
      
      toast.success("Orange Health booking successful!");
      setOrangeHealthOrderResponse(parsed);
      return parsed;
    } catch (err: any) {
      toast.error(`Orange Health booking failed: ${err.message || "Unknown error"}`);
      return null;
    } finally {
      setOrangeHealthLoading(false);
    }
  };

  // Book SRL Order
  const bookSRLLOrder = async (paymentResponse?: any): Promise<any | null> => {
    if (!selectedDC || !selectedDate || !selectedTimeSlot) {
      toast.error("Please select date, time and diagnostic center first");
      return null;
    }

    const isSRLCenter = selectedDC.center_name?.toLowerCase().includes("srl") ||
      selectedDC.DCUniqueName?.toLowerCase().includes("srl");

    if (!isSRLCenter) return null;

    setSrlLoading(true);

    try {
      // Get customer details
      const employeeName = localStorage.getItem("employeeName") || "Customer";
      const customerMobile = localStorage.getItem("customerMobile") || "";
      const customerEmail = localStorage.getItem("customerEmail") || "";
      const customerAddress = localStorage.getItem("customerAddress") || "";
      const city = "Bangalore";
      const state = "Karnataka";
      const country = "India";
      const zip = localStorage.getItem("customerPincode") || "560010";
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      
      // Format dates
      const orderDate = new Date();
      const formattedOrderDate = `${orderDate.getDate().toString().padStart(2, '0')}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getFullYear()}`;
      
      // Format collection date and time
      const collectionDate = selectedDate;
      const collectionTime = selectedTimeSlot.Time;
      
      // Parse the collection time
      const [timePart, modifier] = collectionTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(num => parseInt(num, 10));
      
      if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      }
      if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      const collectionDateTime = `${collectionDate?.getDate().toString().padStart(2, '0')}-${((collectionDate?.getMonth() || 0) + 1).toString().padStart(2, '0')}-${collectionDate?.getFullYear()} ${formattedHours}:${formattedMinutes}`;
      
      // Get test codes (assuming first test for now)
      const testCode = cartItems[0]?.packageCode || "8823"; // Default test code if not available
      
      // Determine gender
      let gender: "M" | "F" | "O" = "M"; // Default to Male
      if (serviceFor === 'dependent') {
        if (selectedDependent?.relation?.toLowerCase() === 'female') {
          gender = "F";
        }
      }
      
      // Determine title based on gender
      let title = "Mr.";
      if (gender === "F") {
        title = "Ms.";
      }
      
      // Get patient name
      const patientName = serviceFor === 'dependent' ? selectedDependent?.name || employeeName : employeeName;
      
      // Prepare SRL order request
      const srlRequest = {
        FLAG: "I",
        ORDERID: "",
        HISORDERID: "",
        ORDER_DT: formattedOrderDate,
        PTNT_CD: "",
        HISCLIENTID: "2", // Default client ID
        TITLE: title,
        FIRST_NAME: patientName.split(' ')[0] || patientName,
        LAST_NAME: patientName.split(' ').slice(1).join(' ') || "",
        PTNTNM: patientName,
        DOB: "29-03-1985", // Default DOB - should be fetched from profile
        PTNT_GNDR: gender,
        DOB_ACT_FLG: "Y" as const,
        MOBILE_NO: customerMobile,
        COLL_CONTACT: customerMobile,
        EMAIL_ID: customerEmail,
        ADDRESS: customerAddress,
        LOCATION: customerAddress,
        CITY: city,
        STATE: state,
        COUNTRY: country,
        ZIP: zip,
        COLL_DATE_FROM: collectionDateTime,
        COLL_DATE_TO: collectionDateTime,
        TESTS: testCode,
        COLL_TYPE: "H",
        ORDER_SOURCE: "WE",
        CREATED_BY: "C000000614" 
      };
      
      console.log("SRL Order Request:", srlRequest);
      
      const response = await labTestsAPI.SRLOrderSendTestUpdate(srlRequest);
      
      if (response) {
        if (response.RSP_CODE === 100 && response.RSP_DESC === "Query Successful") {
          toast.success("SRL order placed successfully!");
          setSrlOrderResponse(response);
          return response;
        } else {
          const errorMsg = response.RSP_MSG || "SRL order booking failed";
          console.error("SRL booking failed:", errorMsg);
          toast.error(`SRL: ${errorMsg}`);
          return null;
        }
      } else {
        throw new Error("No response from SRL API");
      }
    } catch (err: any) {
      console.error("SRL order booking failed:", err);
      toast.error(`SRL booking failed: ${err.message || "Unknown error"}`);
      return null;
    } finally {
      setSrlLoading(false);
    }
  };

  // Function to place order after successful payment or for free booking
  const placeDiagnosticOrder = async (paymentResponse?: any): Promise<any> => {
    try {
      // Determine which diagnostic center type
      const isOrangeHealthCenter = selectedDC?.center_name?.toLowerCase().includes("orange") ||
        selectedDC?.DCUniqueName?.toLowerCase().includes("orangehealth");
      
      const isThyrocareCenter = selectedDC?.center_name?.toLowerCase().includes("thyrocare") ||
        selectedDC?.DCUniqueName?.toLowerCase().includes("thyrocare");

      const isSRLCenter = selectedDC?.center_name?.toLowerCase().includes("srl") ||
        selectedDC?.DCUniqueName?.toLowerCase().includes("srl");

      let orderResponse = null;

      if (isOrangeHealthCenter) {
        // Place Orange Health order
        orderResponse = await bookOrangeHealthOrder(paymentResponse);
        if (!orderResponse) {
          throw new Error("Orange Health order placement failed");
        }
      } else if (isSRLCenter) {
        // Place SRL order
        orderResponse = await bookSRLLOrder(paymentResponse);
        if (!orderResponse) {
          throw new Error("SRL order placement failed");
        }
      } else if (isThyrocareCenter || (!isOrangeHealthCenter && !isSRLCenter)) {
        // For Thyrocare or other centers, use Thyrocare API
        // First, ensure we're logged in to Thyrocare
        const connected = await handleThyrocareLogin();
        if (!connected) {
          throw new Error("Failed to connect to Thyrocare");
        }
        
        // Place Thyrocare order
        orderResponse = await bookThyrocareOrder(paymentResponse);
        if (!orderResponse || orderResponse.response !== "Order Placed Successfully") {
          throw new Error(orderResponse?.response || "Thyrocare order placement failed");
        }
      }

      return orderResponse;
    } catch (error) {
      console.error("Error placing diagnostic order:", error);
      throw error;
    }
  };

  // Function to open Razorpay payment modal for DIAGNOSTIC
  const openRazorpayPaymentForDiagnostic = () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Payment gateway not available. Please refresh the page.");
      return;
    }

    const totalAmount = calculateTotal();
    const paymentAmount = totalAmount * 100; // Razorpay expects amount in paise
    
    setPaymentProcessing(true);
    
    try {
      // Get customer details for Razorpay prefilling
      const customerName = serviceFor === 'dependent' ? selectedDependent.name : getUserName();
      const customerEmail = serviceFor === 'dependent' ? selectedDependent.email : localStorage.getItem("customerEmail") || "";
      const customerMobile = serviceFor === 'dependent' ? selectedDependent.phone : localStorage.getItem("customerMobile") || "";

      const options = {
        key: "rzp_live_LWNsKcrWzYLuC7", // Replace with your actual Razorpay key
        amount: paymentAmount,
        currency: "INR",
        name: "Welleazy",
        description: `Diagnostic Tests - ${selectedDC?.center_name || 'Service'}`,
        image: "/logo.png",
        handler: async function (response: any) {
          console.log("Payment successful:", response);
          toast.success("Payment successful! Booking your order...");
          
          try {
            // After successful payment, book the order
            setPaymentProcessing(true);
            
            // Place the diagnostic order (will handle Thyrocare/Orange Health/SRL internally)
            const orderResponse = await placeDiagnosticOrder(response);
            
            if (orderResponse) {
              // Clear diagnostic items from cart after successful booking
              const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
              const cartKey = `app_cart_${employeeRefId}`;
              const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
              const filteredCart = existingCart.filter((item: any) => item.type !== 'diagnostic');
              localStorage.setItem(cartKey, JSON.stringify(filteredCart));
              window.dispatchEvent(new CustomEvent('cartUpdated'));
              
              // Navigate to booking confirmation page
              navigate('/book-appointment', {
                state: {
                  cartItems,
                  subtotal: calculateSubtotal(),
                  discount: calculateDiscount(),
                  total: calculateTotal(),
                  diagnosticCenter: selectedDC,
                  notes,
                  serviceFor: selectedDependent,
                  selectedTests: selectedTests,
                  selectedDate: selectedDate?.toISOString().split('T')[0],
                  selectedTimeSlot,
                  selectedPeriod,
                  bookingDate: new Date().toISOString(),
                  diagnosticOrder: orderResponse,
                  isOrangeHealth: selectedDC?.center_name?.toLowerCase().includes("orange"),
                  isThyrocare: selectedDC?.center_name?.toLowerCase().includes("thyrocare") || 
                    !selectedDC?.center_name?.toLowerCase().includes("orange"),
                  isSRL: selectedDC?.center_name?.toLowerCase().includes("srl"),
                  payment: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    amount: totalAmount,
                    status: 'completed'
                  }
                }
              });
              toast.success("Order booked successfully!");
            } else {
              toast.error("Payment successful but order booking failed. Please contact support.");
              // Optionally, initiate refund here
            }
          } catch (error) {
            console.error("Error booking order after payment:", error);
            toast.error("Payment successful but order booking failed. Please contact support.");
            // Optionally, initiate refund here
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerMobile
        },
        theme: { 
          color: "#0d6efd" 
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed by user");
            setPaymentProcessing(false);
            toast.info("Payment cancelled by user.");
          },
        },
        notes: {
          order_type: "diagnostic_tests",
          test_names: cartItems.map(item => item.testName).join(", "),
          patient_name: customerName
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        setPaymentProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

    } catch (error) {
      console.error("Error opening payment modal:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  // Function to open Razorpay payment modal for CONSULTATION
  const openRazorpayPaymentForConsultation = () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Payment gateway not available. Please refresh the page.");
      return;
    }

    const totalAmount = calculateTotal();
    const paymentAmount = totalAmount * 100; // Razorpay expects amount in paise
    
    setPaymentProcessing(true);
    
    try {
      const options = {
        key: "rzp_live_LWNsKcrWzYLuC7", // Replace with your actual Razorpay key
        amount: paymentAmount,
        currency: "INR",
        name: "Welleazy",
        description: `Consultation Fee - Dr. ${appointmentData?.doctorName || 'Consultation'}`,
        image: "/logo.png",
        handler: function (response: any) {
          console.log("Payment successful:", response);
          toast.success("Payment successful! Your consultation is confirmed.");
          
          // Navigate to confirmation page
          navigate('/consultation-confirmation', {
            state: {
              appointmentData,
              payment: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount,
                status: 'completed'
              },
              paymentMethod: 'online'
            }
          });
          setPaymentProcessing(false);
        },
        prefill: {
          name: customerName,
          email: localStorage.getItem("customerEmail") || "",
          contact: customerMobile
        },
        theme: { 
          color: "#0d6efd" 
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed by user");
            setPaymentProcessing(false);
            toast.info("Payment cancelled by user.");
          },
        },
        notes: {
          appointment_type: "consultation",
          doctor_name: appointmentData?.doctorName || "",
          patient_name: customerName
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        setPaymentProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

    } catch (error) {
      console.error("Error opening payment modal:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };

  // Handle Free Booking for Diagnostic (when total is 0)
  const handleFreeBookingForDiagnostic = async () => {
    setLoading(true);
    
    try {
      // For free booking, place the order directly
      const orderResponse = await placeDiagnosticOrder();
      
      if (orderResponse) {
        // Clear diagnostic items from cart after successful booking
        const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
        const cartKey = `app_cart_${employeeRefId}`;
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const filteredCart = existingCart.filter((item: any) => item.type !== 'diagnostic');
        localStorage.setItem(cartKey, JSON.stringify(filteredCart));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Navigate to booking confirmation page
        navigate('/book-appointment', {
          state: {
            cartItems,
            subtotal: calculateSubtotal(),
            discount: calculateDiscount(),
            total: calculateTotal(),
            diagnosticCenter: selectedDC,
            notes,
            serviceFor: selectedDependent,
            selectedTests,
            selectedDate: selectedDate?.toISOString().split("T")[0],
            selectedTimeSlot,
            selectedPeriod,
            bookingDate: new Date().toISOString(),
            diagnosticOrder: orderResponse,
            isOrangeHealth: selectedDC?.center_name?.toLowerCase().includes("orange"),
            isThyrocare: selectedDC?.center_name?.toLowerCase().includes("thyrocare") || 
              !selectedDC?.center_name?.toLowerCase().includes("orange"),
            isSRL: selectedDC?.center_name?.toLowerCase().includes("srl"),
            payment: {
              status: calculateTotal() === 0 ? "free" : "paid",
              amount: calculateTotal()
            }
          }
        });
        toast.success("Booking confirmed successfully!");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error in free booking:", error);
      toast.error("Failed to process booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle consultation payment
  const handleConsultationPayment = async () => {
    if (!appointmentData) return;
    
    if (paymentMethod === 'online') {
      openRazorpayPaymentForConsultation();
    } else {
      // Cash payment - just confirm booking
      setLoading(true);
      try {
        // Here you would typically save the cash payment to your backend
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        toast.success("Booking confirmed with cash payment!");
        navigate('/consultation-confirmation', {
          state: {
            appointmentData,
            payment: {
              status: 'pending',
              amount: calculateTotal(),
              method: 'cash'
            },
            paymentMethod: 'cash'
          }
        });
      } catch (error) {
        toast.error("Failed to confirm booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle diagnostic test payment
  const handleDiagnosticPayment = async () => {
    const totalAmount = calculateTotal();
    
    if (totalAmount === 0) {
      // Handle free booking (no payment required)
      await handleFreeBookingForDiagnostic();
    } else {
      // Handle paid booking - OPEN RAZORPAY MODAL DIRECTLY
      openRazorpayPaymentForDiagnostic();
    }
  };

  // Main function to handle payment
  const handleProceedToPayment = () => {
    if (isFromConsultation) {
      handleConsultationPayment();
    } else {
      handleDiagnosticPayment();
    }
  };

  // Function to get time zone based on selected time period
  const getTimeZoneFromPeriod = (period: string): number => {
    switch (period) {
      case 'morning': return 1;
      case 'afternoon': return 2;
      case 'evening': return 3;
      case 'night': return 4;
      default: return 1;
    }
  };

  // Function to load time slots from API (for diagnostic)
  const loadTimeSlots = async () => {
    if (!selectedDC || !selectedDate || isFromConsultation) return;
    
    setLoadingTimeSlots(true);
    setSelectedTimeSlot(null);
    setSelectedTime('');
    
    try {
      const timeZone = getTimeZoneFromPeriod(selectedPeriod);
      const requestData: TimeSlotRequest = {
        DCUniqueName: selectedDC.DCUniqueName || '',
        TimeZone: timeZone,
      };
      
      console.log('Loading time slots for:', {
        center: selectedDC.center_name,
        period: selectedPeriod,
        timeZone: timeZone,
        date: selectedDate.toISOString().split('T')[0]
      });
      
      const response = await ConsultationAPI.CRMLoadTimeSlots(requestData);    
      
      if (Array.isArray(response) && response.length > 0) {
        setTimeSlots(response);
        //toast.success(`Loaded ${response.length} time slots for ${selectedPeriod}`);
      } else {
        console.warn('No time slots found:', response);
        setTimeSlots([]);
        //toast.info(`No time slots available for ${selectedPeriod}`);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Failed to load available time slots');
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Handle date change (for diagnostic)
  const handleDateChange = (date: Date | null) => {
    if (isFromConsultation) {
      toast.info("Date is fixed for consultation booking");
      return;
    }
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setSelectedTime('');
  };

  // Handle period change (for diagnostic)
  const handlePeriodChange = (period: 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (isFromConsultation) return;
    setSelectedPeriod(period);
    setSelectedTimeSlot(null);
    setSelectedTime('');
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlotResponse) => {
    if (isFromConsultation) return;
    const dateToUse = selectedDate || new Date();
    if (isTimeSlotExpired(timeSlot, dateToUse)) {
      return; 
    }
    setSelectedTimeSlot(timeSlot);
    setSelectedTime(timeSlot.Time);
  };

  const isTimeSlotExpired = (timeSlot: TimeSlotResponse, selectedDate: Date): boolean => {
    const now = new Date();
    const slotDateTime = new Date(selectedDate);
    
    // Parse the time string (e.g., "8:00 PM")
    const [time, modifier] = timeSlot.Time.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    return slotDateTime < now;
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleOpenBookingModal = () => {
    if (isFromConsultation) {
      toast.info("Date and time are already selected from your consultation booking.");
      return;
    }
    if (!selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const handleContinueShopping = () => {
    if (isFromConsultation) {
      navigate('/consultation');
    } else {
      navigate('/diagnostic-centers', {
        state: { selectedTests: selectedTests }
      });
    }
  };

  const getUserName = () => {
    return localStorage.getItem("DisplayName") || localStorage.getItem("employeeName") || "Self";
  };
  
  const getDisplayName = (item: CartItem) => {
    if (item.selectedFor === 'dependent' && item.dependentName) {
      return `${item.dependentName} (${item.relation || 'Dependent'})`;
    }
    return `${getUserName()} (Self)`;
  };

  // Get consultation type display text
  const getConsultationTypeDisplay = () => {
    if (!appointmentData) return '';
    
    if (appointmentData.appointmentType === 'econsult') {
      return 'E-Consultation';
    } else if (appointmentData.appointmentType === 'in-clinic') {
      return 'In-Clinic Visit';
    }
    return 'Consultation';
  };

  if (!appointmentData && (!selectedTests || selectedTests.length === 0)) {
    return (
      <Container>
        <div className="diagnostic-cart-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} className="me-3" />
            Check Out
          </h1>
        </div>
        
        <Alert variant="danger" className="text-center mt-5">
          <h5>No Services Selected</h5>
          <p>Please book a consultation or select tests before proceeding to cart.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/consultation')}
            className="mt-2"
          >
            Book Consultation
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/diagnostic-tests')}
            className="mt-2 ms-2"
          >
            Browse Tests
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="diagnostic-cart-page">
      <Container>
        {/* Header */}
        <div className="diagnostic-cart-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} className="me-3" />
            {isFromConsultation ? ' CHECKOUT' : ' CHECKOUT'}
          </h1>
        </div>
        
        <Row>
          {/* Left Column - Consultation Cards */}
          <Col lg={8}>
            {isFromConsultation && appointmentData && (
              <>
                {/* Patient Card */}
                <Card className="mb-3 border-primary consultation-patient-card">
                  <Card.Body className="p-3">
                    <div className="row align-items-center">
                      <div className="col-md-7">
                        <div className="appointment-info-item mb-1">
                          <span className="consultation-type-badge" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                            {appointmentData.appointmentType === 'econsult' ? '' : 'In-Clinic'}
                            {appointmentData.consultationType === 'tele' ? ' Tele Consultation' : appointmentData.consultationType === 'video' ? ' (Video)' : ''}
                          </span>
                        </div>
                        
                        <div className="appointment-info-item mb-1">
                          <span style={{ fontSize: '14px' }}>{appointmentData.patientName}</span>
                        </div>
                        
                        <div className="appointment-info-item mb-1">
                          <span style={{ fontSize: '13px' }}>{customerMobile}</span>
                        </div>
                        
                        <div className="appointment-info-item mb-1">
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                            {appointmentData.date && appointmentData.time ? 
                              (() => {
                                const date = new Date(appointmentData.date);
                                const day = date.getDate().toString().padStart(2, '0');
                                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                const year = date.getFullYear();
                                return `${day}-${month}-${year} ${appointmentData.time}`;
                              })()
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-md-5">
                        <div className="d-flex align-items-center justify-content-between">
                          <span
                            className="consultation-fee"
                            style={{ fontSize: '16px', fontWeight: 800, marginLeft: '120px' }}
                          >
                            <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                            {consultationFee}
                          </span>
                          
                          <button 
                            className="close-consultation-btn"
                            style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            onClick={() => navigate('/consultation')}
                            title="Remove consultation"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Doctor Card */}
                <Card className="mb-3 border-success consultation-doctor-card">
                  <Card.Body className="p-3">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="appointment-info-item mb-1">
                          <span className="consultation-type-badge" style={{ fontSize: '12px' }}>
                            {appointmentData.appointmentType === 'econsult' ? '' : 'In-Clinic'}
                            {appointmentData.consultationType === 'tele' ? ' (Tele Consultation)' : appointmentData.consultationType === 'video' ? ' (Video)' : ''}
                          </span>
                        </div>
                        
                        <div className="appointment-info-item mb-1">
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{appointmentData.doctorName}</span>
                        </div>
                        
                        <div className="appointment-info-item mb-0">
                          <span style={{ fontSize: '13px' }}>{appointmentData.specialization}</span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}

            {/* Diagnostic Center Section (only for diagnostic flow) */}
            {!isFromConsultation && selectedDC && (
              <Card className="mb-4">
                <Card.Body>
                  <h5>Selected Diagnostic Center</h5>
                  <div className="dc-info">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <strong>{selectedDC.center_name}</strong>
                        {(selectedDC.center_name?.toLowerCase().includes('orange') || 
                          selectedDC.DCUniqueName?.toLowerCase().includes('orangehealth')) && (
                          <Badge bg="warning" className="ms-2">
                            Orange Health
                          </Badge>
                        )}
                        {selectedDC.center_name?.toLowerCase().includes('thyrocare') && (
                          <Badge bg="info" className="ms-2">
                            Thyrocare
                          </Badge>
                        )}
                        {selectedDC.center_name?.toLowerCase().includes('srl') && (
                          <Badge bg="success" className="ms-2">
                            SRL
                          </Badge>
                        )}
                      </div>
                      <Badge bg="secondary">
                        {selectedDC.VisitType || 'Visit Type'}
                      </Badge>
                    </div>
                    <p className="mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                      <small className="text-muted">
                        {selectedDC.address || selectedDC.Locality || 'Address not available'}
                      </small>
                    </p>
                    {selectedDC.DC_Distance && (
                      <p className="mb-0">
                        <small className="text-muted">
                          <strong>Distance:</strong> {selectedDC.DC_Distance}
                        </small>
                      </p>
                    )}
                  </div>
                  
                  {/* Date and Time Selection Button for diagnostic */}
                  <div className="mt-4">
                    <Button 
                      variant="primary"
                      className="w-100"
                      onClick={handleOpenBookingModal}
                    >
                      <FontAwesomeIcon icon={faCalendar} className="me-2" />
                      {selectedDate && selectedTime 
                        ? `Selected: ${formatDate(selectedDate)} at ${selectedTime}` 
                        : 'Select Date & Time'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
            
            {/* Cart Items Table (only for diagnostic flow) */}
            {!isFromConsultation && cartItems.length > 0 && (
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Selected Tests</h5>
                    <Badge bg="primary" pill>
                      {cartItems.length} test{cartItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover className="cart-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Test Name</th>
                        <th>For Whom</th>
                        <th className="text-center">Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <div>
                              <strong>{item.testName}</strong>
                              {item.packageCode && (
                                <div>
                                  <small className="text-muted">
                                    Code: {item.packageCode}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="for-whom-info">
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon 
                                  icon={item.selectedFor === 'dependent' ? faUserFriends : faUser} 
                                  className={`me-2 ${item.selectedFor === 'dependent' ? 'text-info' : 'text-primary'}`}
                                />
                                <div>
                                  <strong>{getDisplayName(item)}</strong>
                                  <div>
                                    <small className={`badge ${item.selectedFor === 'dependent' ? 'bg-info' : 'bg-primary'}`}>
                                      {item.selectedFor === 'dependent' ? 'Dependent' : 'Self'}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center text-success fw-bold">
                            <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                            {(item.price * item.quantity).toFixed(2)}
                          </td>
                         
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              title="Remove test"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Col>
          
          {/* Right Column - Order Summary Card */}
          <Col lg={4}>
            <Card className="sticky-top consultation-order-card" style={{ top: '20px' }}>
              <Card.Header className="bg-light">
                <h5 className="mb-0">Place Order</h5>
              </Card.Header>
              <Card.Body>
                <div className="price-breakdown mb-4">
                  <div className="price-row d-flex justify-content-between mb-2">
                    <span>
                      {isFromConsultation ? 'Amount:' : `Subtotal (${cartItems.reduce((total, item) => total + item.quantity, 0)} tests):`}
                    </span>
                    <span className="fw-bold">
                      <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                      {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="price-row d-flex justify-content-between mb-2 ">
                    <span>Discount:</span>
                    <span className="fw-bold">
                      <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                      0.00
                    </span>
                  </div>
                  
                  <hr />
                  
                  <div className="total-row d-flex justify-content-between mt-3">
                    <h5>Total Amount:</h5>
                    <h4 className="">
                      <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                      {calculateSubtotal().toFixed(2)}
                    </h4>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3 consultation-pay-button"
                    onClick={handleProceedToPayment}
                    disabled={loading || paymentProcessing || orangeHealthLoading || srlLoading || (!isFromConsultation && (!selectedDate || !selectedTimeSlot))}
                  >
                    {(loading || paymentProcessing || orangeHealthLoading || srlLoading) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {paymentProcessing ? 'Processing Payment...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                        {isFromConsultation 
                          ? paymentMethod === 'online' ? 'Pay Now' : 'Confirm Booking'
                          : calculateTotal() === 0 ? 'Book Now (Free)' : 'Pay Now'
                        }
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Booking Modal for Date/Time Selection (only for diagnostic) */}
      {!isFromConsultation && (
        <Modal
          show={showBookingModal}
          onHide={handleCloseBookingModal}
          size="xl"
          centered
          className="DiagnosticCart-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faCalendar} className="me-2" />
              Select Appointment Date & Time
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="DiagnosticCart-layout">
              {/* LEFT – Calendar */}
              <div className="DiagnosticCart-calendar">
                <h5 className="DiagnosticCart-title">Select Date</h5>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  inline
                  dateFormat="dd/MM/yyyy"
                  className="DiagnosticCart-datepicker"
                />
              </div>

              {/* RIGHT – Time Slots */}
              <div className="DiagnosticCart-slots">
                <h5 className="DiagnosticCart-title">Select Time Slot</h5>

                {/* Time Period Buttons */}
                <div className="DiagnosticCart-period-row">
                  {[
                    { key: 'morning', label: '🌅 Morning', icon: '☀️' },
                    { key: 'afternoon', label: '☀️ Afternoon', icon: '⛅' },
                    { key: 'evening', label: '🌆 Evening', icon: '🌇' },
                    { key: 'night', label: '🌙 Night', icon: '🌜' }
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      className={`DiagnosticCart-period-btn ${
                        selectedPeriod === key ? "active" : ""
                      }`}
                      onClick={() => handlePeriodChange(key as 'morning' | 'afternoon' | 'evening' | 'night')}
                      title={`${key.charAt(0).toUpperCase() + key.slice(1)} slots`}
                    >
                      <span className="period-icon">{icon}</span>
                      <span className="period-text">{label.split(' ')[1] || label}</span>
                    </button>
                  ))}
                </div>

                {/* Slots Grid */}
                <div className="DiagnosticCart-slots-grid">
                  {loadingTimeSlots ? (
                    <div className="DiagnosticCart-loading">
                      <div className="spinner-border text-primary" />
                      <p>Loading slots...</p>
                    </div>
                  ) : timeSlots?.length > 0 ? (
                    timeSlots.map(slot => {
                      const dateToUse = selectedDate || new Date();
                      const isExpired = isTimeSlotExpired(slot, dateToUse);
                      const isSelected = selectedTimeSlot?.TimeId === slot.TimeId;
                      
                      return (
                        <button
                          key={slot.TimeId}
                          className={`DiagnosticCart-slot-btn ${
                            isSelected ? "active" : ""
                          } ${
                            isExpired ? "expired" : ""
                          }`}
                          onClick={() => !isExpired && handleTimeSlotSelect(slot)}
                          disabled={isExpired}
                          title={isExpired ? "This slot has expired" : `Select ${slot.Time}`}
                        >
                          {slot.Time}
                        </button>
                      );
                    })
                  ) : (
                    <div className="DiagnosticCart-no-slots">
                      <div className="no-slots-icon">⏰</div>
                      <p>No slots available</p>
                      <small className="text-muted">
                        Try selecting a different time period or date
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseBookingModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedDate || !selectedTimeSlot}
              onClick={() => {
                if (!selectedDate) {
                  toast.error("Please select a date");
                  return;
                }
                if (!selectedTimeSlot) {
                  toast.error("Please select a time slot");
                  return;
                }
                handleCloseBookingModal();
              }}
            >
              Confirm Selection
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DiagnosticCart;