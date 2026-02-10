import React, { useState, useEffect } from 'react';
import './EyeCareDentalCare.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  faChevronLeft,
  faChevronRight,
  faTimes,
  faAngleLeft,
  faAngleRight,
  faSun,
  faCloudSun,
  faMoon,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Col, Button, Modal, Form, Badge } from 'react-bootstrap';
import { EyeDentalCareAPI } from '../../api/EyeDentalCare';
import { EyeDentalCare, VendorListDetailsForEye, Emaildata } from '../../types/EyeDentalCare';
import { CustomerProfile, State, District, Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const locations = [
  'Bangalore/Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

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

const LOCATIONS_VISIBLE = 4;
const TREATMENTS_PER_PAGE = 8;

const cards = [
  {
    title: 'Eye Care',
    img: '/EyeCare.jpeg',
    fullText: 'Our Eye Care services provide comprehensive solutions to protect and enhance your vision. We offer routine eye exams, vision testing, and early detection of conditions like glaucoma, cataracts, and diabetic retinopathy. Our expert ophthalmologists and optometrists ensure accurate diagnoses and personalized treatment plans. Services include prescription glasses, contact lenses, pediatric eye care, dry eye management, and post-operative support. We also offer consultations for LASIK and other corrective procedures. With advanced diagnostic tools and a patient-focused approach, we are committed to preserving your eye health and delivering clear, comfortable vision for every stage of life. Our aim is to provide accessible, high-quality eye care with a focus on early diagnosis, personalized treatment, and long-term vision preservation.'
  },
  {
    title: 'Dental Care',
    img: '/Dental_Care.png',
    fullText: 'Our Dental Care services offer complete oral health solutions for individuals and families. We provide routine dental check-ups, professional cleaning, cavity fillings, and advanced treatments like root canals, crowns, and bridges. Our skilled dentists also specialize in cosmetic procedures such as teeth whitening and smile correction. Pediatric dentistry ensures gentle care for children, while orthodontic services like braces and aligners address alignment issues. We prioritize hygiene, comfort, and patient education to promote long-term dental wellness. With modern equipment and a compassionate approach, our goal is to preserve your natural smile and support your overall oral health at every stage.'
  },
];



const EyeCareDentalCare: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState([false, false]);
  const [location, setLocation] = useState('Bangalore/Bengaluru');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [eyeTreatments, setEyeTreatments] = useState<EyeDentalCare[]>([]);
  const [dentalTreatments, setDentalTreatments] = useState<EyeDentalCare[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<EyeDentalCare | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTreatments, setShowTreatments] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [activeService, setActiveService] = useState<'eye' | 'dental'>('eye');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dynamic states and districts
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Time slot states
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Helper function to categorize time into periods
  const getTimePeriod = (timeString: string | undefined): 'morning' | 'afternoon' | 'evening' | 'night' => {
    if (!timeString) return 'morning';
    const startTime = timeString.includes('-') ? timeString.split('-')[0].trim() : timeString.trim();

    // Support 12-hour format
    if (startTime.includes('AM') || startTime.includes('PM')) {
      const parts = startTime.split(/\s+/);
      const time = parts[0];
      const modifier = parts[1];
      let [hours] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      if (hours >= 6 && hours < 12) return 'morning';
      if (hours >= 12 && hours < 16) return 'afternoon';
      if (hours >= 16 && hours < 20) return 'evening';
      return 'night';
    }

    // Support 24-hour format
    const [hoursStr] = startTime.split(':');
    const hours = parseInt(hoursStr, 10);
    if (hours >= 6 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 16) return 'afternoon';
    if (hours >= 16 && hours < 20) return 'evening';
    return 'night';
  };

  // Relationship states
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showVendorDetailsModal, setShowVendorDetailsModal] = useState(false);

  const [vendors, setVendors] = useState<VendorListDetailsForEye[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorListDetailsForEye | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    membershipType: 'self',
    patientType: 'Self',
    name: '',
    contactNumber: '',
    email: '',
    state: '',
    city: '',
    address: '',
    vendorName: '',
    comment: '',
    stateId: '',
    district: '',
    districtId: '',
    gymCenter: '',
    landmark: '',
    pincode: '',
    relationshipId: '',
    relationshipPersonId: ''
  });

  // Loading state for form submission
  const [submitting, setSubmitting] = useState(false);

  // Fetch eye treatments when component mounts
  useEffect(() => {
    fetchEyeTreatments();
    loadStates();
    loadRelationships();
    fetchDentalTreatments();
  }, []);

  // Calculate total pages when eyeTreatments or dentalTreatments changes
  useEffect(() => {
    const treatments = activeService === 'eye' ? eyeTreatments : dentalTreatments;
    if (treatments.length > 0) {
      const total = Math.ceil(treatments.length / TREATMENTS_PER_PAGE);
      setTotalPages(total);
      setCurrentPage(1);
    }
  }, [eyeTreatments, dentalTreatments, activeService]);

  // Initialization effects complete

  // End of initialization section

  const fetchEyeTreatments = async () => {
    try {
      setLoading(true);
      const response = await EyeDentalCareAPI.EDLoadEyeTreatmentDetails();
      // Handle the case where API returns results in a wrapper or directly as an array
      const treatments = Array.isArray(response) ? response : (response?.results || response?.data || []);
      setEyeTreatments(treatments);
    } catch (error) {
      console.error('Error loading eye treatment details:', error);
      toast.error('Failed to load treatments. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const fetchDentalTreatments = async () => {
    try {
      setLoading(true);
      const response = await EyeDentalCareAPI.EDLoadDentalTreatmentDetails();
      // Handle the case where API returns results in a wrapper or directly as an array
      const treatments = Array.isArray(response) ? response : (response?.results || response?.data || []);
      setDentalTreatments(treatments);
    } catch (error) {
      console.error('Error loading dental treatment details:', error);
      toast.error('Failed to load dental treatments. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const statesData = await EyeDentalCareAPI.getStates();
      setStates(statesData);
    } catch (error) {
      console.error("Failed to load states:", error);
      toast.error("Failed to load states. Please try again.");
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDistricts = async (stateId: number) => {
    setLoadingDistricts(true);
    try {
      const districtsData = await EyeDentalCareAPI.getCities(stateId);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Failed to load cities:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadRelationshipPersons = async (relationshipId: number) => {
    setLoadingRelationshipPersons(true);
    try {
      const personsData = await EyeDentalCareAPI.getDependents(relationshipId);
      setRelationshipPersons(personsData);

      // Auto-select if there's only one dependent
      if (personsData.length === 1) {
        setFormData(prev => ({
          ...prev,
          relationshipPersonId: personsData[0].EmployeeDependentDetailsId.toString(),
          name: personsData[0].DependentName
        }));
      } else {
        // Reset if multiple or none, force user to select
        setFormData(prev => ({
          ...prev,
          relationshipPersonId: '',
          name: ''
        }));
      }
    } catch (error) {
      console.error("Failed to load dependents:", error);
    } finally {
      setLoadingRelationshipPersons(false);
    }
  };

  // Effects for dynamic loading
  useEffect(() => {
    if (formData.stateId) {
      loadDistricts(parseInt(formData.stateId));
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.relationshipId && formData.membershipType === 'dependent') {
      loadRelationshipPersons(parseInt(formData.relationshipId));
    }
  }, [formData.relationshipId, formData.membershipType]);

  const loadRelationships = async () => {
    setLoadingRelationships(true);
    try {
      const relationshipsData = await EyeDentalCareAPI.getRelationships();
      setRelationships(relationshipsData);
    } catch (error) {
      console.error("Failed to load relationships:", error);
      toast.error("Failed to load relationships. Please try again.");
    } finally {
      setLoadingRelationships(false);
    }
  };

  const loadTimeSlots = async (date: Date, vendorId: number | string) => {
    if (!vendorId) return;
    setLoadingTimeSlots(true);
    setSelectedTimeSlot('');
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await EyeDentalCareAPI.getDoctorAvailability({
        doctor_id: vendorId,
        date: formattedDate
      });

      // Handle different response structures
      let slots = [];
      const responseData = response?.data || response;
      if (Array.isArray(responseData)) {
        slots = responseData;
      } else if (responseData?.results && Array.isArray(responseData.results)) {
        slots = responseData.results;
      } else if (responseData?.slots && Array.isArray(responseData.slots)) {
        slots = responseData.slots;
      }

      // Deduplicate slots by time string to prevent multiple identical slots from showing
      const uniqueSlotsMap = new Map();
      slots.forEach((slot: any) => {
        const timeValue = slot.start_time || slot.time || slot.Time;
        if (timeValue && !uniqueSlotsMap.has(timeValue)) {
          uniqueSlotsMap.set(timeValue, slot);
        }
      });

      setTimeSlots(Array.from(uniqueSlotsMap.values()));
    } catch (error) {
      console.error("Failed to load time slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Effect to load time slots when date or vendor changes
  useEffect(() => {
    if (showExpertModal && selectedDate && selectedVendor?.vendor_id) {
      loadTimeSlots(selectedDate, selectedVendor.vendor_id);
    }
  }, [selectedDate, selectedVendor, showExpertModal]);

  const loadCustomerProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      if (!employeeRefId) {
        setProfileError("No employee reference found");
        return null;
      }

      const profile = await EyeDentalCareAPI.getCustomerProfile(Number(employeeRefId));
      setCustomerProfile(profile);
      return profile;
    } catch (error) {
      console.error("Failed to load customer profile:", error);
      setProfileError("Failed to load profile details");
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  const applyProfileData = (profile: any, membershipType: string = 'self') => {
    if (!profile) return;

    console.log("🚀 [PROFILE_AUTOFILL] Applying profile data:", profile);

    const stateId = (profile.StateId && profile.StateId !== '0' && profile.StateId !== 0) ? profile.StateId.toString() : '';
    const districtId = (profile.CityId && profile.CityId !== '0' && profile.CityId !== 0) ? profile.CityId.toString() : '';

    setFormData(prev => ({
      ...prev,
      membershipType: membershipType,
      patientType: membershipType === 'self' ? 'Self' : 'Dependant',
      name: profile.EmployeeName || '',
      contactNumber: profile.MobileNo || '',
      email: profile.Emailid || '',
      address: profile.Address || '',
      stateId: stateId,
      districtId: districtId,
      relationshipId: membershipType === 'self' ? '' : prev.relationshipId,
      relationshipPersonId: membershipType === 'self' ? '' : prev.relationshipPersonId
    }));

    // Trigger district load manually to ensure dropdown options exist
    if (stateId) {
      loadDistricts(parseInt(stateId));
    }
  };

  const handleToggle = (idx: number) => {
    setModalContent({
      title: cards[idx].title,
      content: cards[idx].fullText
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTreatmentClick = (service: 'eye' | 'dental' = 'eye') => {
    setActiveService(service);
    setShowTreatments(!showTreatments);
    if (!showTreatments) {
      setCurrentPage(1);
    }
  };

  const handleSelectTreatment = (treatment: EyeDentalCare) => {
    setSelectedTreatment(treatment);
    setShowExpertModal(true);

    // Auto-fill if it's already set to self
    if (formData.membershipType === 'self') {
      const fillProfile = async () => {
        const profile = customerProfile || await loadCustomerProfile();
        applyProfileData(profile, 'self');
      };
      fillProfile();
    }
  };

  const handleCloseExpertModal = () => {
    setShowExpertModal(false);
    setSelectedTreatment(null);
    setCustomerProfile(null);
    // Reset form data
    setFormData({
      membershipType: 'self',
      patientType: 'Self',
      name: '',
      contactNumber: '',
      email: '',
      state: '',
      city: '',
      address: '',
      vendorName: '',
      comment: '',
      stateId: '',
      district: '',
      districtId: '',
      gymCenter: '',
      landmark: '',
      pincode: '',
      relationshipId: '',
      relationshipPersonId: ''
    });
    setSubmitting(false);
    setSelectedDate(new Date());
    setTimeSlots([]);
    setSelectedTimeSlot('');
    setSelectedTimePeriod('morning');
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle relationship person selection - auto-fill name
    if (name === 'relationshipPersonId' && value) {
      const selectedPerson = relationshipPersons.find(p => p.EmployeeDependentDetailsId.toString() === value.toString());
      if (selectedPerson) {
        setFormData(prev => ({
          ...prev,
          name: selectedPerson.DependentName
        }));
      }
    }

    // Handle membership type change
    if (name === 'membershipType') {
      if (value === 'self') {
        const fillProfile = async () => {
          const profile = customerProfile || await loadCustomerProfile();
          applyProfileData(profile, 'self');
        };
        fillProfile();
      } else {
        setFormData(prev => ({
          ...prev,
          membershipType: value,
          patientType: 'Dependant',
          name: '',
          contactNumber: '',
          email: '',
          address: '',
          stateId: '',
          districtId: ''
        }));
      }
    }
    // Handle patient type change
    if (name === 'patientType') {
      setFormData(prev => ({
        ...prev,
        patientType: value,
        membershipType: value === 'Self' ? 'self' : 'dependent'
      }));
    }
  };

  // Handle Save Treatment Case Details
  const handelSaveEyeTreatmentCaseDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation (same as before)
      if (!formData.vendorName || formData.vendorName.trim() === '') {
        toast.error('Please select a vendor');
        return;
      }

      const requiredFields = [
        { field: formData.name, name: 'Name' },
        { field: formData.contactNumber, name: 'Contact Number' },
        { field: formData.email, name: 'Email' },
        { field: formData.stateId, name: 'State' },
        { field: formData.districtId, name: 'City/District' },
        { field: formData.address, name: 'Address' }
      ];

      const missingField = requiredFields.find(item => !item.field || item.field.trim() === '');
      if (missingField) {
        toast.error(`Please fill ${missingField.name} field`);
        return;
      }

      if (formData.patientType === 'Dependant') {
        if (!formData.relationshipId) {
          toast.error('Please select a relationship');
          setSubmitting(false); // Reset loading state
          return;
        }
        if (!formData.relationshipPersonId) {
          toast.error('Please select a dependent person');
          setSubmitting(false); // Reset loading state
          return;
        }
      }

      // Get user data from localStorage
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      const corporateId = localStorage.getItem("CorporateId") || "0";
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      if (!employeeRefId) {
        toast.error('Please log in to book an appointment');
        return;
      }

      // Define service type for voucher and email
      const serviceType = activeService === 'eye' ? "Eye Care" : "Dental Care";

      // Step 1: Select booking type
      const bookingTypeData = {
        care_program_type: activeService, // 'eye' or 'dental'
        booking_type: "book_appointment"
      };

      // Check for auth token before making requests
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      console.log("Step 1: Selecting booking type:", bookingTypeData);
      let bookingInitResponse;
      try {
        bookingInitResponse = await EyeDentalCareAPI.selectBookingType(bookingTypeData);
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw error;
      }
      console.log("Step 1 Response:", bookingInitResponse);

      // Robust ID extraction
      const bookingId = bookingInitResponse.id ||
        bookingInitResponse.booking_id ||
        bookingInitResponse.case_id ||
        bookingInitResponse.CaseLead_Id || 1;

      // Step 2: Select service type
      try {
        await EyeDentalCareAPI.selectServiceType(bookingId, { service_type: "in_clinic" });
      } catch (err: any) {
        console.error("Step 2 Failed. Error details:", err.response?.data);
        // We continue anyway as some backends might not require this step anymore
      }

      if (!selectedTimeSlot) {
        toast.error('Please select a time slot');
        setSubmitting(false);
        return;
      }

      // Step 3: Final submit
      const finalPayload: any = {
        for_whom: formData.patientType === 'Self' ? 'self' : 'dependant',
        state: parseInt(formData.stateId),
        city: parseInt(formData.districtId),
        address_text: formData.address,
        requirements: formData.comment || `Booking for ${selectedTreatment?.EyeDentalCareTreatmentName || (selectedTreatment as any)?.name || 'General Treatment'}`,
        appointment_date: selectedDate?.toISOString().split('T')[0],
        appointment_time: selectedTimeSlot
      };

      if (finalPayload.for_whom === 'dependant' && formData.relationshipPersonId) {
        finalPayload.dependant = parseInt(formData.relationshipPersonId);
      }

      console.log(`Step 3: Final submission for booking ${bookingId}:`, finalPayload);
      let response;
      try {
        response = await EyeDentalCareAPI.finalSubmit(bookingId, finalPayload);
      } catch (err: any) {
        console.error("Step 3 Failed. Error details:", err.response?.data);
        throw err;
      }

      // Check if response is successful (usually returns the booking object)
      if (!response || response.status === 'error') {
        throw new Error(response.message || 'Submission failed');
      }

      // Since the new API doesn't return CaseDetailsId in a 'Voucher' format directly,
      // we use the booking ID for the voucher
      const voucherData = {
        requestId: bookingId,
        name: formData.name,
        vendorName: formData.vendorName,
        centerAddress: selectedVendor?.vendor_address || "",
        serviceName: serviceType,
        treatmentName: selectedTreatment?.EyeDentalCareTreatmentName || (selectedTreatment as any)?.name || "General Consultation",
        contactNumber: formData.contactNumber,
        email: formData.email,
        caseDetailsId: bookingId
      };

      // Email notification is now handled by the backend during the final-submit step.
      // The manual call has been removed to prevent 404 errors from deprecated endpoints.

      // Show success and navigate
      toast.success('Appointment request submitted successfully!');
      handleCloseExpertModal();

      // Navigate to appropriate voucher page
      navigate("/Eye-voucher", { state: { voucherData } });

    } catch (error) {
      console.error('Error submitting appointment:', error);

      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (error.message.includes('CaseDetailsId')) {
          toast.error('Appointment saved but there was an issue generating your voucher. Please contact support.');
        } else {
          toast.error('Failed to submit appointment. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination functions
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getCurrentTreatments = () => {
    const treatments = activeService === 'eye' ? eyeTreatments : dentalTreatments;
    if (!Array.isArray(treatments)) return [];
    const startIndex = (currentPage - 1) * TREATMENTS_PER_PAGE;
    const endIndex = startIndex + TREATMENTS_PER_PAGE;
    return treatments.slice(startIndex, endIndex);
  };
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  // Function to get image URL from TreatmentImagePath
  const getImageUrl = (treatmentImagePath: string) => {
    if (!treatmentImagePath) return '/default_doctor.png';
    const baseUrl = 'https://live.welleazy.com';
    try {
      const imagePath = treatmentImagePath.replace('C:\\inetpub\\Welleazy_Prod\\Welleazy\\', '');
      return `${baseUrl}/${imagePath}`;
    } catch (e) {
      return '/default_doctor.png';
    }
  };

  const handelloadVendors = async (serviceType: 'eye' | 'dental' = 'eye') => {
    try {
      setLoadingVendors(true);
      let vendorData;

      if (serviceType === 'eye') {
        vendorData = await EyeDentalCareAPI.LoadVendorListForEye();
      } else {
        vendorData = await EyeDentalCareAPI.LoadVendorListForDental();
      }

      setVendors(vendorData);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors. Please try again.');
    } finally {
      setLoadingVendors(false);
    }
  };

  // Update the useEffect for vendor loading
  useEffect(() => {
    if (showVendorDetailsModal) {
      handelloadVendors(activeService);
    }
  }, [showVendorDetailsModal, activeService]);

  useEffect(() => {
    if (showVendorDetailsModal) {
      handelloadVendors();
    }
  }, [showVendorDetailsModal]);

  const handleVendorSelect = (vendor: VendorListDetailsForEye) => {
    setSelectedVendor(vendor);
    setFormData((prev) => ({
      ...prev,
      vendorName: `${vendor.vendor_name} (${vendor.vendor_Type})`,
    }));
    setShowVendorDetailsModal(false);
    setShowVendorModal(false);
    toast.success(`Selected: ${vendor.vendor_name}`);


  };

  const handleConfirmVendorSelection = () => {
    if (selectedVendor) {
      setFormData((prev) => ({
        ...prev,
        vendorName: `${selectedVendor.vendor_name} (${selectedVendor.vendor_Type})`,
      }));
      setShowVendorDetailsModal(false);
      setShowVendorModal(false);
      toast.success(`Selected: ${selectedVendor.vendor_name}`);
    } else {
      toast.error("Please select a vendor first");
    }
  };

  return (
    <div className="eye-care-dental-care-page">
      {/* Location Dropdown Section */}


      <div className="eye-care-dental-care-row">
        {cards.map((card, idx) => {
          const truncatedText = card.fullText.slice(0, 100) + (card.fullText.length > 120 ? '...' : '');
          const serviceType = idx === 0 ? 'eye' : 'dental'; // 0 for Eye Care, 1 for Dental Care

          return (
            <div className="eye-care-dental-care-card medium" key={idx}>
              <h2>{card.title}</h2>
              <img src={card.img} alt={card.title} className="eye-care-dental-care-image" />
              <div className="eye-care-dental-care-content">
                <p>
                  {truncatedText}
                  <span
                    onClick={() => handleToggle(idx)}
                    className="read-more-toggle"
                  >
                    See More..
                  </span>
                </p>
                <div className="card-btn-row">
                  <button
                    className="book-appointment-btn"
                    onClick={() => handleTreatmentClick(serviceType)}
                  >
                    Treatment
                  </button>
                  <button className="book-appointment-btn" onClick={() => navigate('/consultation', { state: { serviceType } })} >BOOK APPOINTMENT</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Treatments Section - Displayed directly on main page */}
      {showTreatments && (
        <Container>
          <section className="treatments-section">
            <h2 className="treatments-heading">
              {activeService === 'eye' ? 'Eye Care' : 'Dental Care'} Treatments
            </h2>
            {loading ? (
              <div className="loading-spinner">Loading treatments...</div>
            ) : (
              <>
                <div className="treatments-grid">
                  {getCurrentTreatments().map((treatment: any) => {
                    const treatmentId = treatment.id || treatment.EyeDentalCareTreatmentId;
                    const treatmentName = treatment.EyeDentalCareTreatmentName || treatment.name || treatment.treatment_name;
                    const isSelected = (selectedTreatment?.id || selectedTreatment?.EyeDentalCareTreatmentId) === treatmentId;

                    return (
                      <div
                        key={treatmentId}
                        className={`treatment-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="treatment-image-container">
                          <img
                            src={getImageUrl(treatment.TreatmentImagePath || treatment.treatment_image_path || treatment.image_path || treatment.image)}
                            alt={treatmentName}
                            className="treatment-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default_doctor.png';
                            }}
                          />
                        </div>
                        <div className="treatment-name">
                          {treatmentName}
                        </div>
                        <button
                          className={`select-treatment-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectTreatment(treatment)}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Showing {((currentPage - 1) * TREATMENTS_PER_PAGE) + 1} to {Math.min(currentPage * TREATMENTS_PER_PAGE, (activeService === 'eye' ? eyeTreatments.length : dentalTreatments.length))} of {activeService === 'eye' ? eyeTreatments.length : dentalTreatments.length} treatments
                    </div>
                    <div className="pagination-controls">
                      <button
                        className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <FontAwesomeIcon icon={faAngleLeft} />
                      </button>

                      {getPageNumbers().map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={`pagination-page ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => handlePageClick(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <FontAwesomeIcon icon={faAngleRight} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </Container>
      )}
      {/* Our Locations Section */}
      <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px' }}>
          <h2 className="our-location-headings">Our Locations</h2>
          <div className="location-carousel-wrappers">
            <button className="carousel-arrow left" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} className="location-img large-location-img" />
                  <div className="location-name large-location-name">{loc.name}</div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>

      {/* Modal for showing full content */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header className="modal-header-custom">
          <Modal.Title>{modalContent.title}</Modal.Title>
          <button className="close-button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>{modalContent.content}</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <button className="treatment-btn" onClick={handleCloseModal}>Close</button>
        </Modal.Footer>
      </Modal>

      {/* Talk to an Expert Modal */}
      <Modal show={showExpertModal} onHide={handleCloseExpertModal} centered size="lg">
        <Modal.Header className="modal-header-custom">
          <Modal.Title>
            Talk to an Expert - {selectedTreatment?.EyeDentalCareTreatmentName}
            <small className="text-muted d-block mt-1">
              ({activeService === 'eye' ? 'Eye Care' : 'Dental Care'})
            </small>
          </Modal.Title>
          <button className="close-button" onClick={handleCloseExpertModal}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {loadingProfile ? (
            <div className="loading-spinner">Loading your profile information...</div>
          ) : profileError ? (
            <div className="alert alert-warning">
              <strong>Note:</strong> {profileError}
            </div>
          ) : null}

          <Form onSubmit={handelSaveEyeTreatmentCaseDetails}>
            {/* Patient Type */}
            <Form.Group className="mb-3">
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Self"
                  name="patientType"
                  value="Self"
                  checked={formData.patientType === 'Self'}
                  onChange={handleInputChange}
                  disabled={loadingProfile}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Dependant"
                  name="patientType"
                  value="Dependant"
                  checked={formData.patientType === 'Dependant'}
                  onChange={handleInputChange}
                  disabled={loadingProfile}
                />
              </div>
              {customerProfile && formData.patientType === 'Self' && (
                <small className="text-success">✓ Your profile data has been auto-filled</small>
              )}
            </Form.Group>

            {/* Name and Contact Number */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  {formData.patientType === 'Self' ? (
                    <>
                      <Form.Label>Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your name"
                        disabled={loadingProfile}
                      />
                    </>
                  ) : (
                    <>
                      {/* Relationship dropdown for Dependant */}
                      <Form.Group className="mb-3">
                        <Form.Label>Relationship *</Form.Label>
                        <Form.Select
                          name="relationshipId"
                          value={formData.relationshipId}
                          onChange={handleInputChange}
                          required
                          disabled={loadingProfile || loadingRelationships}
                        >
                          <option value="">Select Relationship</option>
                          {relationships
                            .map((relationship) => (
                              <option key={relationship.RelationshipId} value={relationship.RelationshipId}>
                                {relationship.Relationship}
                              </option>
                            ))
                          }
                        </Form.Select>
                        {loadingRelationships && <small className="text-muted">Loading relationships...</small>}
                      </Form.Group>
                    </>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contact Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter contact number"
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Dependent Name - Full Width */}
            {formData.patientType === 'Dependant' && formData.relationshipId && (
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Dependent Name *</Form.Label>
                    {relationshipPersons.length > 1 ? (
                      <Form.Select
                        name="relationshipPersonId"
                        value={formData.relationshipPersonId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Dependent</option>
                        {relationshipPersons.map((person) => (
                          <option key={person.EmployeeDependentDetailsId} value={person.EmployeeDependentDetailsId}>
                            {person.DependentName}
                          </option>
                        ))}
                      </Form.Select>
                    ) : relationshipPersons.length === 1 ? (
                      <Form.Control
                        type="text"
                        value={formData.name}
                        readOnly
                        placeholder="Dependent name will auto-fill"
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter dependent name"
                        disabled={loadingProfile}
                      />
                    )}
                    {loadingRelationshipPersons && <small className="text-muted">Loading dependents...</small>}
                    {!loadingRelationshipPersons && relationshipPersons.length === 0 && formData.relationshipId && (
                      <small className="text-warning">No dependents found for this relationship. Please enter name manually.</small>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            )}

            {/* Email and State */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State *</Form.Label>
                  <Form.Select
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleInputChange}
                    required
                    disabled={loadingProfile || loadingStates}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.StateId} value={state.StateId}>
                        {state.StateName}
                      </option>
                    ))}
                  </Form.Select>
                  {loadingStates && <small className="text-muted">Loading states...</small>}
                </Form.Group>
              </Col>
            </Row>

            {/* City and Address */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City/District *</Form.Label>
                  <Form.Select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.stateId || loadingDistricts || loadingProfile}
                  >
                    <option value="">Select City/District</option>
                    {districts.map(district => (
                      <option key={district.DistrictId} value={district.DistrictId}>
                        {district.DistrictName}
                      </option>
                    ))}
                  </Form.Select>
                  {loadingDistricts && <small className="text-muted">Loading districts...</small>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter complete address"
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Vendor Name and Comment */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vendor Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onClick={() => setShowVendorModal(true)}
                    readOnly
                    required
                    placeholder="Click to select vendor"
                    disabled={loadingProfile}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa',
                      border: !formData.vendorName ? '1px solid #dc3545' : '1px solid #ced4da' // Red border if no vendor
                    }}
                  />
                  {!formData.vendorName && (
                    <Form.Text className="text-danger">
                      Please select a vendor
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Any additional comments..."
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h5 className="mb-3">Select Time Slot</h5>
            <Row className="mb-4">
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Date *</Form.Label>
                  <div className="datepicker-container">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      minDate={new Date()}
                      inline
                      className="form-control"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={7}>
                <div className="time-slot-picker">
                  <div className="session-tabs d-flex mb-3">
                    <Button
                      variant={selectedTimePeriod === 'morning' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedTimePeriod('morning')}
                      className="session-tab flex-grow-1 me-1"
                    >
                      <FontAwesomeIcon icon={faCloudSun} className="me-2" /> Morning
                    </Button>
                    <Button
                      variant={selectedTimePeriod === 'afternoon' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedTimePeriod('afternoon')}
                      className="session-tab flex-grow-1 me-1"
                    >
                      <FontAwesomeIcon icon={faSun} className="me-2" /> Afternoon
                    </Button>
                    <Button
                      variant={selectedTimePeriod === 'evening' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedTimePeriod('evening')}
                      className="session-tab flex-grow-1 me-1"
                    >
                      <FontAwesomeIcon icon={faMoon} className="me-2" /> Evening
                    </Button>
                    <Button
                      variant={selectedTimePeriod === 'night' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedTimePeriod('night')}
                      className="session-tab flex-grow-1"
                    >
                      <FontAwesomeIcon icon={faStar} className="me-2" /> Night
                    </Button>
                  </div>

                  <div className="time-slots-container p-3 border rounded bg-light" style={{ minHeight: '150px' }}>
                    {loadingTimeSlots ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        <p className="small mb-0 mt-2">Fetching slots...</p>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex flex-wrap gap-2">
                          {timeSlots
                            .filter(slot => getTimePeriod(slot.start_time || slot.time || slot.Time) === selectedTimePeriod)
                            .map((slot, index) => {
                              const timeStr = slot.start_time || slot.time || slot.Time;
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  className={`btn btn-sm time-slot-btn ${selectedTimeSlot === timeStr ? 'btn-success' : 'btn-outline-secondary'}`}
                                  onClick={() => setSelectedTimeSlot(timeStr)}
                                >
                                  {timeStr}
                                </button>
                              );
                            })
                          }
                        </div>
                        {timeSlots.filter(slot => getTimePeriod(slot.start_time || slot.time || slot.Time) === selectedTimePeriod).length === 0 && (
                          <div className="text-center py-4 text-muted">
                            <FontAwesomeIcon icon={faTimes} className="mb-2" />
                            <p className="small mb-0">No slots available for {selectedTimePeriod}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <div className="modal-footer-custom">
              <button type="button" className="book-appointment-btn" onClick={handleCloseExpertModal} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="book-appointment-btn" disabled={submitting || !formData.vendorName || formData.vendorName === ''}>
                {submitting ? 'Submitting...' : 'Book Appointment'}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Vendor Selection Modal */}
      <Modal show={showVendorModal} onHide={() => setShowVendorModal(false)} centered size="lg">
        <Modal.Header className="modal-header-custom">
          <Modal.Title>Select the card to proceed with details</Modal.Title>
          <button className="close-button" onClick={() => setShowVendorModal(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <div className="vendor-selection-text">
            <p className="text-center mb-4">Choose your preferred service provider</p>
          </div>

          <Row className="vendor-grid justify-content-center">
            {/* Show only Eye Care vendor when activeService is 'eye' */}
            {activeService === 'eye' && (
              <Col md={6} className="mb-4">
                <div
                  className={`vendor-card ${formData.vendorName.includes('Dr. Agarwal') ? 'selected' : ''}`}
                  style={{
                    border: formData.vendorName.includes('Dr. Agarwal') ? '3px solid #0d6efd' : '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.vendorName.includes('Dr. Agarwal') ? '#f8f9ff' : 'white'
                  }}
                  onClick={() => {
                    setShowVendorDetailsModal(true);
                    handelloadVendors('eye');
                  }}
                >
                  <div className="vendor-card-content text-center">
                    <div className="vendor-image-container mb-3">
                      <img
                        src="/DrAgarwal.png"
                        alt="Dr. Agarwal - Eye Care"
                        style={{
                          width: '200px',
                          height: '80px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          margin: '0 auto',
                          transition: 'all 0.3s ease',
                          transform: formData.vendorName.includes('Dr. Agarwal') ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!formData.vendorName.includes('Dr. Agarwal')) {
                            target.style.transform = 'scale(1.05)';
                            target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!formData.vendorName.includes('Dr. Agarwal')) {
                            target.style.transform = 'scale(1)';
                            target.style.boxShadow = 'none';
                          }
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-hospital.png';
                        }}
                      />
                    </div>
                    <h6 className="vendor-title mb-2">Dr. Agarwal's Eye Hospital</h6>
                    <p className="vendor-description text-muted small mb-0">
                      Specialized in Eye Care treatments and surgeries
                    </p>
                    {formData.vendorName.includes('Dr. Agarwal') && (
                      <div className="selected-badge mt-2">
                        <small className="text-primary">✓ Selected</small>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            )}

            {/* Show only Dental Care vendor when activeService is 'dental' */}
            {activeService === 'dental' && (
              <Col md={6} className="mb-4">
                <div
                  className={`vendor-card ${formData.vendorName.includes('Clove') ? 'selected' : ''}`}
                  style={{
                    border: formData.vendorName.includes('Clove') ? '3px solid #0d6efd' : '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: formData.vendorName.includes('Clove') ? '#f8f9ff' : 'white'
                  }}
                  onClick={() => {
                    setShowVendorDetailsModal(true);
                    handelloadVendors('dental');
                  }}
                >
                  <div className="vendor-card-content text-center">
                    <div className="vendor-image-container mb-3">
                      <img
                        src="/Clove.jpg"
                        alt="Clove Dental"
                        style={{
                          width: '200px',
                          height: '80px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          margin: '0 auto',
                          transition: 'all 0.3s ease',
                          transform: formData.vendorName.includes('Clove') ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!formData.vendorName.includes('Clove')) {
                            target.style.transform = 'scale(1.05)';
                            target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                          }
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!formData.vendorName.includes('Clove')) {
                            target.style.transform = 'scale(1)';
                            target.style.boxShadow = 'none';
                          }
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-hospital.png';
                        }}
                      />
                    </div>
                    <h6 className="vendor-title mb-2">Clove Dental</h6>
                    <p className="vendor-description text-muted small mb-0">
                      Premium Dental Care services and treatments
                    </p>
                    {formData.vendorName.includes('Clove') && (
                      <div className="selected-badge mt-2">
                        <small className="text-primary">✓ Selected</small>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            )}
          </Row>

          {/* Service Type Indicator */}
          <div className="text-center mt-4">
            <div className="service-indicator">
              <span
                className={`badge ${activeService === 'eye' ? 'bg-primary' : 'bg-secondary'} me-2`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {activeService === 'eye' ? '👁️ Eye Care' : '🦷 Dental Care'}
              </span>
              <small className="text-muted">
                Currently viewing {activeService === 'eye' ? 'Eye Care' : 'Dental Care'} vendors
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <button
            type="button"
            className="book-appointment-btn"
            onClick={() => setShowVendorModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>





      {/* Vendor Details Modal */}
      <Modal
        show={showVendorDetailsModal}
        onHide={() => setShowVendorDetailsModal(false)}
        centered
        size="lg"
        className="vendor-modal"
      >
        <Modal.Header className="modal-header-custom">
          <Modal.Title>
            {activeService === 'eye' ? 'Eye Care' : 'Dental Care'} - Vendor Details
          </Modal.Title>
          <button
            className="btn-close"
            onClick={() => setShowVendorDetailsModal(false)}
          ></button>
        </Modal.Header>

        <Modal.Body className="px-4">
          {loadingVendors ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading {activeService === 'eye' ? 'Eye Care' : 'Dental Care'} vendor details...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-info-circle fa-2x mb-3"></i>
                <p>No {activeService === 'eye' ? 'Eye Care' : 'Dental Care'} vendors available at the moment.</p>
              </div>
            </div>
          ) : (
            <div className="vendor-list">
              <Row className="justify-content-center">
                {vendors.map((vendor) => {
                  const isSelected = selectedVendor?.vendor_id === vendor.vendor_id;
                  return (
                    <Col md={10} key={vendor.vendor_id} className="mb-4">
                      <div
                        className={`vendor-card shadow-sm p-4 rounded-4 position-relative ${isSelected ? "selected-card" : "bg-white"
                          }`}
                        style={{
                          border: isSelected ? "2px solid #0d6efd" : "1px solid #e0e0e0",
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => handleVendorSelect(vendor)}
                      >
                        <div className="d-flex align-items-start">
                          <div className="vendor-icon me-3">
                            <i
                              className={`fas ${activeService === 'eye' ? 'fa-eye' : 'fa-tooth'} text-primary`}
                              style={{ fontSize: "2rem" }}
                            ></i>
                          </div>
                          <div className="text-start flex-grow-1">
                            <h5 className="fw-semibold mb-1 text-dark">
                              {vendor.vendor_name}{" "}
                              <span className="text-muted fs-6">
                                ({vendor.vendor_Type})
                              </span>
                            </h5>
                            <p className="mb-2 text-secondary small">
                              {vendor.vendor_address}
                            </p>
                            <p className="text-muted mb-1">
                              <strong>Working Hours:</strong>{" "}
                              {vendor.operatingHours || "N/A"}
                            </p>
                            {vendor.conMobile_no && (
                              <p className="text-muted mb-1">
                                <strong>Contact:</strong> {vendor.conMobile_no}
                              </p>
                            )}
                            {vendor.emailid && (
                              <p className="text-muted mb-0">
                                <strong>Email:</strong> {vendor.emailid}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-center mt-3">
                          <button
                            className={`btn ${isSelected
                              ? "btn-light text-primary border-primary"
                              : "btn-primary"
                              } px-4`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVendorSelect(vendor);
                            }}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 justify-content-between px-4">
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => setShowVendorDetailsModal(false)}
          >
            Close
          </button>
          <button
            className="btn btn-primary px-4"
            onClick={handleConfirmVendorSelection}
            disabled={!selectedVendor}
          >
            Confirm Selection
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EyeCareDentalCare;