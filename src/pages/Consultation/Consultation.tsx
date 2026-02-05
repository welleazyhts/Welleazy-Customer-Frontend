import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Consultation.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { components } from 'react-select';
import { ConsultationAPI } from '../../api/Consultation';
import {
  CRMFetchDoctorSpecializationDetails,
  CRMConsultationDoctorDetailsResponse,
  Appointment,
  TimeSlotRequest,
  TimeSlotResponse,
  BookAppointmentRequest,
  CRMSaveBookAppointmentResponse,
  InsertCartResponse,
  DependentRequest,
  ApolloClinic,
  ApolloDoctorsSlotRequest,
  ApolloDoctorSlotsApiResponse,
  ApolloDoctorSlot
} from '../../types/Consultation';
import { DependantsAPI } from '../../api/dependants';
import Input from '../../components/Input';
import { red } from '@mui/material/colors';
import { gymServiceAPI } from '../../api/GymService';
import { Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const DoctorDefaultimage = 'default_doctor.png';

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

interface SelectedFile {
  name: string;
  size: number;
  type: string;
}

interface DependentFormData {
  dependentName: string;
  relationshipId: string;
  dateOfBirth: string;
  contactNumber: string;
  gender: string;
  email: string;
}

// Helper function to format 24-hour time to 12-hour format
const format24HourTo12Hour = (time24: string): string => {
  if (!time24) return '';

  // Handle time range like "18:30-18:35"
  if (time24.includes('-')) {
    const [startTime, endTime] = time24.split('-');
    const formattedStart = formatSingleTime(startTime.trim());
    const formattedEnd = formatSingleTime(endTime.trim());
    return `${formattedStart} - ${formattedEnd}`;
  }

  // Handle single time
  return formatSingleTime(time24);
};

const formatSingleTime = (time24: string): string => {
  if (!time24) return '';

  // Check if already in 12-hour format (contains AM/PM)
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24;
  }

  // Parse 24-hour format
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const minutesFormatted = minutes.toString().padStart(2, '0');

  return `${hours12}:${minutesFormatted} ${period}`;
};

// Helper function to categorize time into periods
const getTimePeriod = (timeString: string): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (!timeString) return 'morning';

  // Extract start time (e.g., "18:30-18:35" -> "18:30")
  const startTime = timeString.includes('-') ? timeString.split('-')[0] : timeString;

  // If time has AM/PM format (e.g., "6:30 PM")
  if (startTime.includes('AM') || startTime.includes('PM')) {
    const time = startTime.split(' ')[0];
    const modifier = startTime.split(' ')[1];
    let [hours] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    if (hours >= 6 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 16) return 'afternoon';
    if (hours >= 16 && hours < 20) return 'evening';
    return 'night';
  }

  // If time is in 24-hour format (e.g., "18:30")
  const [hoursStr] = startTime.split(':');
  const hours = parseInt(hoursStr, 10);

  if (hours >= 6 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 16) return 'afternoon';
  if (hours >= 16 && hours < 20) return 'evening';
  return 'night';
};

const Consultation: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [apolloClinics, setApolloClinics] = useState<ApolloClinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<CRMConsultationDoctorDetailsResponse | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [personType, setPersonType] = useState<'Self' | 'Dependent'>('Self');
  const [showDependentForm, setShowDependentForm] = useState(false);

  // Search and filter states
  const [searchDoctorName, setSearchDoctorName] = useState<string>('');
  const [selectedPincode, setSelectedPincode] = useState<any>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<any>(null);
  const [selectedDoctorType, setSelectedDoctorType] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [doctorsPerPage] = useState<number>(8);

  const doctorSectionRef = useRef<HTMLDivElement>(null);

  // Separate states for each dropdown
  const [specializations, setSpecializations] = useState<CRMFetchDoctorSpecializationDetails[]>([]);
  const [doctorTypes, setDoctorTypes] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingDoctorTypes, setLoadingDoctorTypes] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);

  // Doctors state from API
  const [doctors, setDoctors] = useState<CRMConsultationDoctorDetailsResponse[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<CRMConsultationDoctorDetailsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for expanded specializations and doctor names
  const [expandedSpecializations, setExpandedSpecializations] = useState<{ [key: string]: boolean }>({});
  const [expandedDoctorNames, setExpandedDoctorNames] = useState<{ [key: string]: boolean }>({});
  const [expandedQual, setExpandedQual] = useState<{ [key: string]: boolean }>({});

  // Relationship states
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);

  const [selectedConsultationType, setSelectedConsultationType] = useState<'video' | 'tele' | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // New state for time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlotResponse[]>([]);
  const [allApolloTimeSlots, setAllApolloTimeSlots] = useState<ApolloDoctorSlot[]>([]);
  const [filteredApolloTimeSlots, setFilteredApolloTimeSlots] = useState<ApolloDoctorSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotResponse | null>(null);
  const [selectedApolloTimeSlot, setSelectedApolloTimeSlot] = useState<ApolloDoctorSlot | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  // New state to track which appointment type was clicked
  const [appointmentType, setAppointmentType] = useState<'econsult' | 'in-clinic' | null>(null);

  // New state for dependent modal
  const [showDependentModal, setShowDependentModal] = useState(false);

  // Dependent form state
  const [dependentFormData, setDependentFormData] = useState<DependentFormData>({
    dependentName: '',
    relationshipId: '',
    dateOfBirth: '',
    contactNumber: '',
    gender: '',
    email: ''
  });

  const [loadingSaveDependent, setLoadingSaveDependent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // State to track current district
  const [currentDistrictId, setCurrentDistrictId] = useState<number | undefined>();

  // Function to load Apollo clinics
  const loadApolloClinics = async (doctorId: number, DoctorTypeDescription: string) => {
    setLoadingClinics(true);
    setSelectedClinic('');
    try {
      const clinics = await ConsultationAPI.CRMLoadApolloClinics(doctorId, DoctorTypeDescription);
      setApolloClinics(clinics);
      if (clinics.length > 0) {
        setSelectedClinic(clinics[0].ClinicId.toString());
      }
    } catch (error) {
      console.error('Error loading Apollo clinics:', error);
      toast.error('Failed to load clinic information');
      setApolloClinics([]);
    } finally {
      setLoadingClinics(false);
    }
  };

  // Load clinics when Apollo doctor is selected for in-clinic appointment
  useEffect(() => {
    if ((selectedDoctor?.DoctorTypeDescription === 'Apollo' || selectedDoctor?.DoctorTypeDescription === 'Appolo') &&
      appointmentType === 'in-clinic' &&
      selectedDoctor?.DoctorId) {
      loadApolloClinics(selectedDoctor.DoctorId, selectedDoctor.DoctorTypeDescription);
    } else {
      setApolloClinics([]);
      setSelectedClinic('');
    }
  }, [selectedDoctor, appointmentType]);

  // Load district from localStorage on component mount and listen for changes
  useEffect(() => {
    const loadDistrict = () => {
      const storedDistrictId = localStorage.getItem("DistrictId");
      const districtId = storedDistrictId ? parseInt(storedDistrictId, 10) : 630;
      setCurrentDistrictId(districtId);
    };

    // Load initially
    loadDistrict();

    // Listen for district changes from Header
    const handleDistrictChange = (event: CustomEvent) => {
      const { districtId } = event.detail;
      setCurrentDistrictId(districtId);
      toast.info(`Location changed to ${event.detail.districtName}. Reloading doctors...`);
      // Refresh doctors with new district
      fetchDoctors(districtId);
    };

    // Also listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "DistrictId" || e.key === "SelectedDistrictId") {
        loadDistrict();
        fetchDoctors();
      }
    };

    window.addEventListener('districtChanged', handleDistrictChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('districtChanged', handleDistrictChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (location.state?.openBookingModal) {
      if (location.state?.selectedDoctor) {
        setSelectedDoctor(location.state.selectedDoctor);
        const cartItem = location.state.cartData?.[0];
        if (cartItem) {
          if (cartItem.ItemName?.includes('Tele') || cartItem.ItemName?.includes('Video')) {
            setAppointmentType('econsult');
            if (cartItem.ItemName?.includes('Video')) {
              setSelectedConsultationType('video');
            } else if (cartItem.ItemName?.includes('Tele')) {
              setSelectedConsultationType('tele');
            }
          } else if (cartItem.ItemName?.includes('In-Clinic')) {
            setAppointmentType('in-clinic');
          }
          if (cartItem.PersonName) {
            setFormData(prev => ({
              ...prev,
              patientName: cartItem.PersonName
            }));
          }
        }
      }
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getTimeZoneFromPeriod = (period: string): number => {
    switch (period) {
      case 'morning': return 1;
      case 'afternoon': return 2;
      case 'evening': return 3;
      case 'night': return 4;
      default: return 1;
    }
  };

  const formatDateForApolloAPI = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadApolloTimeSlots = async (clinicId: string, doctorId: number, selectedDate: Date) => {
    setLoadingTimeSlots(true);
    setSelectedApolloTimeSlot(null);
    setSelectedTime('');
    try {
      const requestData: ApolloDoctorsSlotRequest = {
        clinicId: parseInt(clinicId),
        doctorId: doctorId,
        appointmentDate: formatDateForApolloAPI(selectedDate)
      };

      const response = await ConsultationAPI.ApolloHospitalDoctorSlotDetails(requestData);

      if (response.status === 'success' && response.doctorSlotsResponse) {
        // Store all Apollo slots
        setAllApolloTimeSlots(response.doctorSlotsResponse);

        // Filter slots by selected time period
        const filteredSlots = response.doctorSlotsResponse.filter(slot => {
          const slotPeriod = getTimePeriod(slot.time);
          return slotPeriod === selectedTimePeriod;
        });

        setFilteredApolloTimeSlots(filteredSlots);

        // Convert filtered Apollo slots to TimeSlotResponse format for consistency
        const formattedSlots: TimeSlotResponse[] = filteredSlots.map(slot => ({
          TimeId: slot.slotId,
          Time: slot.time.split('-')[0],
          TimeZone: true,
          DCUniqueName: 'Apollo Consultation'
        }));

        setTimeSlots(formattedSlots);
      } else {
        console.warn('No Apollo time slots found:', response);
        setAllApolloTimeSlots([]);
        setFilteredApolloTimeSlots([]);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error loading Apollo time slots:', error);
      toast.error('Failed to load available time slots from Apollo');
      setAllApolloTimeSlots([]);
      setFilteredApolloTimeSlots([]);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const loadTimeSlots = async (DCUniqueName: string, timeZone: number, selectedDate: Date, DoctorId: number) => {
    setLoadingTimeSlots(true);
    setSelectedTimeSlot(null);
    setSelectedApolloTimeSlot(null);
    setSelectedTime('');
    try {
      // If Apollo doctor and in-clinic appointment, use Apollo API
      if ((selectedDoctor?.DoctorTypeDescription === 'Apollo' || selectedDoctor?.DoctorTypeDescription === 'Appolo') &&
        appointmentType === 'in-clinic' &&
        selectedClinic) {
        await loadApolloTimeSlots(selectedClinic, DoctorId, selectedDate);
        return;
      }

      // For non-Apollo doctors, use the original API
      const requestData: TimeSlotRequest = {
        DCUniqueName: DCUniqueName,
        TimeZone: timeZone,
        ...(DCUniqueName === 'Apollo Consultation' && { doctorId: DoctorId })
      };
      const response = await ConsultationAPI.CRMLoadTimeSlots(requestData);
      if (Array.isArray(response)) {
        setTimeSlots(response);
      } else {
        console.warn('No time slots found:', response);
        setTimeSlots([]);
      }
      setAllApolloTimeSlots([]);
      setFilteredApolloTimeSlots([]);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error('Failed to load available time slots');
      setTimeSlots([]);
      setAllApolloTimeSlots([]);
      setFilteredApolloTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Filter Apollo time slots when time period changes
  useEffect(() => {
    if ((selectedDoctor?.DoctorTypeDescription === 'Apollo' || selectedDoctor?.DoctorTypeDescription === 'Appolo') &&
      appointmentType === 'in-clinic' &&
      allApolloTimeSlots.length > 0) {
      const filteredSlots = allApolloTimeSlots.filter(slot => {
        const slotPeriod = getTimePeriod(slot.time);
        return slotPeriod === selectedTimePeriod;
      });

      setFilteredApolloTimeSlots(filteredSlots);

      // Convert filtered Apollo slots to TimeSlotResponse format
      const formattedSlots: TimeSlotResponse[] = filteredSlots.map(slot => ({
        TimeId: slot.slotId,
        Time: slot.time.split('-')[0],
        TimeZone: true,
        DCUniqueName: 'Apollo Consultation'
      }));

      setTimeSlots(formattedSlots);
    }
  }, [selectedTimePeriod, allApolloTimeSlots, selectedDoctor, appointmentType]);

  useEffect(() => {
    if (showModal && (selectedConsultationType === 'tele' || appointmentType === 'in-clinic') && !selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
  }, [showModal, selectedConsultationType, appointmentType, selectedDate]);

  useEffect(() => {
    if ((selectedConsultationType === 'tele' || appointmentType === 'in-clinic') && selectedDoctor) {
      const dateToUse = selectedDate || new Date();
      const timeZone = getTimeZoneFromPeriod(selectedTimePeriod);
      const doctorType = selectedDoctor.DCUniqueName;
      const DoctorId = selectedDoctor.DoctorId;
      loadTimeSlots(doctorType, timeZone, dateToUse, DoctorId);
    }
  }, [selectedDate, selectedTimePeriod, selectedDoctor, selectedConsultationType, appointmentType, selectedClinic]);

  const isTimeSlotExpired = (timeSlot: TimeSlotResponse | ApolloDoctorSlot, selectedDate: Date): boolean => {
    const now = new Date();
    const slotDateTime = new Date(selectedDate);

    let timeString = '';
    if ('time' in timeSlot) {
      // Apollo slot format
      timeString = timeSlot.time?.split('-')[0] || '';
    } else {
      // Regular time slot format
      timeString = timeSlot.Time || '';
    }

    // If timeString is empty or invalid, don't mark as expired (allow selection)
    if (!timeString || !timeString.trim()) {
      console.warn('Invalid time slot format:', timeSlot);
      return false;
    }

    const timeParts = timeString.split(' ');
    if (timeParts.length < 1) {
      console.warn('Invalid time string format:', timeString);
      return false;
    }

    const [time, modifier] = timeParts;
    const timeComponents = time.split(':');
    if (timeComponents.length < 2) {
      console.warn('Invalid time components:', time);
      return false;
    }

    let [hours, minutes] = timeComponents.map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    } else if (!modifier && hours >= 0 && hours <= 23) {
      // Handle 24-hour format (like Apollo's 18:30 format)
      // Already in 24-hour format, no conversion needed
    }

    slotDateTime.setHours(hours, minutes, 0, 0);

    return slotDateTime < now;
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlotResponse | ApolloDoctorSlot) => {
    const dateToUse = selectedDate || new Date();
    if (isTimeSlotExpired(timeSlot, dateToUse)) {
      return;
    }

    if ('time' in timeSlot) {
      // Apollo slot
      setSelectedApolloTimeSlot(timeSlot);
      setSelectedTime(timeSlot.time);
      setSelectedTimeSlot(null);
    } else {
      // Regular time slot
      setSelectedTimeSlot(timeSlot);
      setSelectedTime(timeSlot.Time);
      setSelectedApolloTimeSlot(null);
    }
  };

  const [formData, setFormData] = useState({
    relationshipId: '',
    relationshipPersonId: '',
    patientName: '',
    symptoms: ''
  });

  const openDependentModal = () => {
    setDependentFormData({
      dependentName: '',
      relationshipId: '',
      dateOfBirth: '',
      contactNumber: '',
      gender: '',
      email: ''
    });
    setShowDependentModal(true);
  };

  const closeDependentModal = () => {
    setShowDependentModal(false);
  };

  const handleDependentInputChange = (field: keyof DependentFormData, value: string) => {
    setDependentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDependent = async () => {
    const phoneRegex = /^[0-9]{10}$/;

    setLoadingSaveDependent(true);
    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      const employeeId = employeeRefId ? parseInt(employeeRefId) : 0;

      if (!employeeId) {
        toast.error("Please log in to add dependent");
        setLoadingSaveDependent(false);
        return;
      }

      const formatDateOfBirth = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const generateDependentId = (): string => {
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `WEZ${timestamp}D${randomNum}`;
      };

      const generateDependentMemberId = (): string => {
        return `WZD${Math.floor(10000 + Math.random() * 90000)}`;
      };

      const getGenderNumber = (gender: string): number => {
        switch (gender.toLowerCase()) {
          case 'male': return 1;
          case 'female': return 2;
          case 'other': return 3;
          default: return 0;
        }
      };

      const relationshipNumber = parseInt(dependentFormData.relationshipId);

      const payload: DependentRequest = {
        EmployeeDependentDetailsId: 0,
        EmployeeId: employeeId,
        DependentId: generateDependentId(),
        DependentRelationShip: relationshipNumber,
        DependentName: dependentFormData.dependentName.trim(),
        DependentMobileNo: dependentFormData.contactNumber.trim(),
        DependentGender: getGenderNumber(dependentFormData.gender),
        DependentDOB: formatDateOfBirth(dependentFormData.dateOfBirth),
        AccessProfilePermission: false,
        MaritalStatus: 1,
        Occupation: "",
        DependentEmailId: "",
        IsActive: true,
        DependentMemberId: generateDependentMemberId(),
        DependentUserName: "",
        Password: ""
      };

      console.log("Dependent Form Data:", dependentFormData);
      console.log("Prepared Payload for API:", payload);

      const response = await DependantsAPI.CRMInsertUpdateEmployeeDependantDetails(payload);

      if (response && response.Message) {
        toast.success(response.Message);
        closeDependentModal();
      } else {
        toast.error("Failed to add dependent. Please try again.");
      }

    } catch (error) {
      console.error("Failed to save dependent:", error);
      toast.error("Failed to add dependent. Please try again.");
    } finally {
      setLoadingSaveDependent(false);
    }
  };

  const formatQualificationBadge = (qualification: string, doctorId: string): string => {
    if (!qualification) return "";
    const list = qualification.split(",").map(q => q.trim());
    const isExpanded = expandedQual[doctorId] || false;
    if (isExpanded) {
      return list.join(", ");
    }
    const firstThree = list.slice(0, 3).join(", ");
    const extraCount = list.length - 3;
    if (extraCount > 0) {
      return `${firstThree}, +${extraCount}`;
    }

    return firstThree;
  };

  const toggleQualification = (doctorId: string) => {
    setExpandedQual(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  const truncateDoctorName = (name: string, doctorId: string, maxLength: number = 18): string => {
    if (!name) return 'Doctor';

    if (name.length <= maxLength) {
      return name;
    }

    if (expandedDoctorNames[doctorId]) {
      return name;
    }

    return name.substring(0, maxLength) + '...';
  };

  const toggleDoctorName = (doctorId: string) => {
    setExpandedDoctorNames(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  const needsDoctorNameTruncation = (name: string, maxLength: number = 18): boolean => {
    return !!name && name.length > maxLength;
  };

  const renderDoctorName = (doc: CRMConsultationDoctorDetailsResponse) => {
    const doctorName = doc.DoctorName || 'Doctor';
    const doctorId = doc.DoctorId?.toString() || 'unknown';
    const needsToggle = needsDoctorNameTruncation(doctorName);
    const isExpanded = expandedDoctorNames[doctorId] || false;

    return (
      <div className="doctor-name-container">
        <span className="doctor-name-consulation" title={isExpanded ? '' : doctorName}>
          {(doc.DoctorName)}
        </span>
        {needsToggle && (
          <button
            className="read-more-less-btn doctor-name-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleDoctorName(doctorId);
            }}
          >
            {/* {isExpanded ? 'Read Less' : 'Read More'} */}
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const loadRelationships = async () => {
      setLoadingRelationships(true);
      try {
        const relationshipsData = await gymServiceAPI.CRMRelationShipList();

        setRelationships(relationshipsData);
      } catch (error) {
        console.error("Failed to load relationships:", error);
        toast.error("Failed to load relationships. Please try again.");
      } finally {
        setLoadingRelationships(false);
      }
    };
    loadRelationships();
  }, []);

  useEffect(() => {
    const loadRelationshipPersons = async () => {
      if (personType === 'Dependent' && formData.relationshipId) {
        setLoadingRelationshipPersons(true);
        try {
          const employeeRefId = localStorage.getItem("EmployeeRefId");
          if (!employeeRefId) {
            toast.error("Please log in to select dependents.");
            return;
          }
          // Use the new GetDependents API which calls /api/dependants/
          const allDependents = await DependantsAPI.GetDependents();
          console.log("Fetched Dependents:", allDependents);

          // Filter dependents by selected relationship logic
          const personsData = allDependents.filter(p =>
            p.DependentRelationShip === parseInt(formData.relationshipId)
          );

          setRelationshipPersons(personsData);

          if (personsData.length === 1) {
            setFormData(prev => ({
              ...prev,
              relationshipPersonId: personsData[0].EmployeeDependentDetailsId.toString(),
              patientName: personsData[0].DependentName
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              relationshipPersonId: '',
              patientName: ''
            }));
          }
        } catch (error) {
          console.error("Failed to load relationship persons:", error);
          toast.error("Failed to load dependents. Please try again.");
          setRelationshipPersons([]);
        } finally {
          setLoadingRelationshipPersons(false);
        }
      } else {
        setRelationshipPersons([]);
        if (personType === 'Dependent') {
          setFormData(prev => ({
            ...prev,
            relationshipPersonId: '',
            patientName: ''
          }));
        }
      }
    };
    loadRelationshipPersons();
  }, [personType, formData.relationshipId]);

  useEffect(() => {
    if (personType === 'Dependent' && formData.relationshipPersonId) {
      const selectedPerson = relationshipPersons.find(
        person => person.EmployeeDependentDetailsId.toString() === formData.relationshipPersonId
      );
      if (selectedPerson) {
        setFormData(prev => ({
          ...prev,
          patientName: selectedPerson.DependentName
        }));
      }
    }
  }, [formData.relationshipPersonId, relationshipPersons, personType]);

  useEffect(() => {
    if (personType === 'Self') {
      setFormData(prev => ({
        ...prev,
        relationshipId: '',
        relationshipPersonId: '',
        patientName: localStorage.getItem("DisplayName") || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patientName: ''
      }));
    }
  }, [personType]);

  const fetchSpecializations = async () => {
    try {
      setLoadingSpecializations(true);
      console.log("Fetching specializations...");
      const data = await ConsultationAPI.LoadVendorListDetailsForEye();
      const sortedData = data.sort((a, b) =>
        a.Specializations.localeCompare(b.Specializations)
      );
      setSpecializations(sortedData);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    } finally {
      setLoadingSpecializations(false);
    }
  };

  const fetchDoctorTypes = async () => {
    try {
      setLoadingDoctorTypes(true);
      const data = await ConsultationAPI.GetDoctorTypes();
      const sortedData = data.sort((a, b) =>
        a.DoctorTypeDescription.localeCompare(b.DoctorTypeDescription)
      );
      setDoctorTypes(sortedData);
    } catch (error) {
      console.error('Error fetching doctor types:', error);
    } finally {
      setLoadingDoctorTypes(false);
    }
  };

  const fetchDoctorLanguages = async () => {
    try {
      setLoadingLanguages(true);
      const data = await ConsultationAPI.GetDoctorLanguages();
      const sortedData = data.sort((a, b) =>
        a.LanguageDescription.localeCompare(b.LanguageDescription)
      );
      setLanguages(sortedData);
    } catch (error) {
      console.error('Error fetching doctor languages:', error);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const fetchDoctorPincodes = async () => {
    try {
      setLoadingPincodes(true);
      const data = await ConsultationAPI.GetDoctorPincodes();
      const sortedData = data.sort((a, b) =>
        a.Pincode.localeCompare(b.Pincode)
      );
      setPincodes(sortedData);
    } catch (error) {
      console.error('Error fetching doctor pincodes:', error);
    } finally {
      setLoadingPincodes(false);
    }
  };

  // Update fetchDoctors to use currentDistrictId
  const fetchDoctors = async (districtId?: number) => {
    const districtToUse = districtId ?? currentDistrictId;

    // if (!districtToUse) {
    //   setError("Please select a district");
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      const specialityId = 0;
      const employeeRefId = 0;

      const doctorData = await ConsultationAPI.CRMLoadDoctorListDetails(
        specialityId,
        employeeRefId,
        districtToUse || 0
      );

      const doctorsArray = Array.isArray(doctorData) ? doctorData : [];
      setDoctors(doctorsArray);
      setFilteredDoctors(doctorsArray);
      setCurrentPage(1);

      if (!Array.isArray(doctorData)) {
        setError("Currently required doctor is not available, Please contact us.");
      }
    } catch (err) {
      setError("Failed to fetch doctor details");
      console.error(err);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect that calls fetchDoctors
  useEffect(() => {
    fetchSpecializations();
    fetchDoctorTypes();
    fetchDoctorLanguages();
    fetchDoctorPincodes();
    fetchDoctors();
  }, [currentDistrictId]);

  const applyFilters = () => {
    setError(null);

    let filtered = [...doctors];
    let originalFilteredCount = filtered.length;

    // Doctor name filter
    if (searchDoctorName.trim()) {
      const searchTerm = searchDoctorName.toLowerCase().trim();
      filtered = filtered.filter(doc => {
        const doctorName = doc?.DoctorName || '';
        return doctorName.toLowerCase().includes(searchTerm);
      });
    }

    // Pincode filter
    if (selectedPincode && (!Array.isArray(selectedPincode) || selectedPincode.length > 0)) {
      if (Array.isArray(selectedPincode)) {
        filtered = filtered.filter(doc => {
          const pincode = doc?.Pincode || '';
          return selectedPincode.some(pin => {
            const pinLabel = pin?.label || '';
            return pincode === pinLabel;
          });
        });
      } else {
        filtered = filtered.filter(doc => {
          const pincode = doc?.Pincode || '';
          const pinLabel = selectedPincode?.label || '';
          return pincode === pinLabel;
        });
      }
    }

    // Specialization filter
    if (selectedSpecialization && (!Array.isArray(selectedSpecialization) || selectedSpecialization.length > 0)) {
      if (Array.isArray(selectedSpecialization)) {
        filtered = filtered.filter(doc => {
          if (!doc?.DoctorSpecializations) return false;

          const docSpecializations = doc.DoctorSpecializations.split(',').map(id => id.trim());
          const selectedIds = selectedSpecialization
            .filter(spec => spec?.value)
            .map(spec => spec.value.toString());

          return selectedIds.some(id => docSpecializations.includes(id));
        });
      } else {
        filtered = filtered.filter(doc => {
          if (!doc?.DoctorSpecializations) return false;

          const docSpecializations = doc.DoctorSpecializations.split(',').map(id => id.trim());
          const specValue = selectedSpecialization?.value?.toString();
          return specValue && docSpecializations.includes(specValue);
        });
      }
    }

    // Language filter
    if (selectedLanguage && (!Array.isArray(selectedLanguage) || selectedLanguage.length > 0)) {
      if (Array.isArray(selectedLanguage)) {
        filtered = filtered.filter(doc => {
          const language = doc?.Language || '';
          const languageLower = language.toLowerCase();

          return selectedLanguage.some(lang => {
            const langLabel = lang?.label || '';
            return languageLower.includes(langLabel.toLowerCase());
          });
        });
      } else {
        filtered = filtered.filter(doc => {
          const language = doc?.Language || '';
          const langLabel = selectedLanguage?.label || '';
          return language.toLowerCase().includes(langLabel.toLowerCase());
        });
      }
    }

    // Doctor type filter
    if (selectedDoctorType && (!Array.isArray(selectedDoctorType) || selectedDoctorType.length > 0)) {
      if (Array.isArray(selectedDoctorType)) {
        filtered = filtered.filter(doc => {
          const doctorType = doc?.DoctorTypeDescription || '';

          return selectedDoctorType.some(type => {
            let filterValue = type?.label || '';
            if (filterValue === 'In-House') {
              filterValue = 'Welleazy';
            }
            if (filterValue === 'Appolo') {
              return doctorType === 'Apollo' || doctorType === 'Appolo';
            }
            return doctorType === filterValue;
          });
        });
      } else {
        let filterValue = selectedDoctorType?.label || '';
        if (filterValue === 'In-House') {
          filterValue = 'Welleazy';
        }

        const finalFilterValue = filterValue;
        filtered = filtered.filter(doc => {
          const doctorType = doc?.DoctorTypeDescription || '';
          if (finalFilterValue === 'Appolo') {
            return doctorType === 'Apollo' || doctorType === 'Appolo';
          }
          return doctorType === finalFilterValue;
        });
      }
    }

    const hasFilters = searchDoctorName.trim() ||
      (selectedPincode && (!Array.isArray(selectedPincode) || selectedPincode.length > 0)) ||
      (selectedSpecialization && (!Array.isArray(selectedSpecialization) || selectedSpecialization.length > 0)) ||
      (selectedLanguage && (!Array.isArray(selectedLanguage) || selectedLanguage.length > 0)) ||
      (selectedDoctorType && (!Array.isArray(selectedDoctorType) || selectedDoctorType.length > 0));

    if (hasFilters && filtered.length === 0) {
      let message = "No doctors found matching your search criteria.";

      if (selectedLanguage && (!Array.isArray(selectedLanguage) || selectedLanguage.length > 0)) {
        message = "We regret the inconvenience, but the selected language doctor is currently not available. Please explore the service with other available doctors. Thank you.";
      } else if (selectedSpecialization && (!Array.isArray(selectedSpecialization) || selectedSpecialization.length > 0)) {
        message = "We regret the inconvenience, but the selected specialization doctor is currently not available. Please explore the service with other available doctors. Thank you.";
      } else if (selectedDoctorType && (!Array.isArray(selectedDoctorType) || selectedDoctorType.length > 0)) {
        message = "We regret the inconvenience, but the selected vendor type doctor is currently not available. Please explore the service with other available doctors. Thank you.";
      } else if (selectedPincode && (!Array.isArray(selectedPincode) || selectedPincode.length > 0)) {
        message = "We regret the inconvenience, but the selected pincode doctor is currently not available. Please explore the service with other available doctors. Thank you.";
      }

      setError(message);
      setFilteredDoctors([]);
      setCurrentPage(1);
      return;
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
    setTimeout(() => {
      doctorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearFilters = () => {
    setSearchDoctorName('');
    setSelectedPincode(null);
    setSelectedSpecialization(null);
    setSelectedLanguage(null);
    setSelectedDoctorType(null);
    setFilteredDoctors(doctors);
    setCurrentPage(1);
    setError(null);
  };

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);

    setTimeout(() => {
      doctorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getPaginationNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 4) endPage = 5;
      if (currentPage >= totalPages - 3) startPage = totalPages - 4;

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const closeModal = () => {
    setShowModal(false);
    setShowBookingDetails(false);
    setShowConfirmation(false);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedTimeSlot(null);
    setSelectedApolloTimeSlot(null);
    setSelectedConsultationType(null);
    setAppointmentType(null);
    setSelectedTimePeriod('morning');
    setTimeSlots([]);
    setAllApolloTimeSlots([]);
    setFilteredApolloTimeSlots([]);
    setSelectedFiles([]);
    setApolloClinics([]);
    setSelectedClinic('');
    setFormData({
      relationshipId: '',
      relationshipPersonId: '',
      patientName: '',
      symptoms: ''
    });
    setPersonType('Self');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAppointmentDateTime = (date: Date, timeString: string): string => {
    if (!date || !timeString) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const datePart = `${year}-${month}-${day}`;

    // Extract start time from Apollo time format (e.g., "18:30-18:35" -> "18:30")
    const startTime = timeString.includes('-') ? timeString.split('-')[0] : timeString;

    const [time, modifier] = startTime.split(" ");
    let hours: number, minutes: number;

    if (modifier) {
      // Handle AM/PM format
      [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    } else {
      // Handle 24-hour format
      [hours, minutes] = startTime.split(":").map(Number);
    }

    const timePart = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;

    return `${datePart} ${timePart}`;
  };

  const handleBookAppointment = async () => {
    try {
      const corporateId = localStorage.getItem("CorporateId") || "37";
      const createdBy = localStorage.getItem("LoginRefId") || "11048";
      const employeeRefId = Number(localStorage.getItem("EmployeeRefId") || "0");
      const branchId = localStorage.getItem("BranchId") || "108";
      const previousCaseLeadId = localStorage.getItem("PreviousCaseLeadId") || "0";
      const previousCartUniqueId = Number(localStorage.getItem("PreviousCartUniqueId") || 0);
      const userCartKey = `app_cart_${employeeRefId || 'guest'}`;
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      const files: File[] = [];
      if (fileInput?.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          files.push(fileInput.files[i]);
        }
      }
      let preferredDateTime = "";
      if (selectedDate && (selectedTimeSlot || selectedApolloTimeSlot)) {
        const timeString = selectedApolloTimeSlot ? selectedApolloTimeSlot.time : selectedTimeSlot?.Time || "";
        preferredDateTime = formatAppointmentDateTime(selectedDate, timeString);
      }

      const service = selectedDoctor?.Service || "";
      let ProductId = "1";
      let consultationPrice = 0;
      let consultationType = "";

      if (appointmentType === "econsult") {
        if (service.includes("Video Consultation")) {
          ProductId = "1";
          consultationType = "Video Consultation";
        } else if (service.includes("Tele Consultation")) {
          ProductId = "2";
          consultationType = "Tele Consultation";
        }
      } else if (appointmentType === "in-clinic") {
        ProductId = "3";
        consultationType = "In-Clinic Consultation";
      }

      // Use selected clinic ID for Apollo doctors
      const dcId = selectedDoctor?.DoctorTypeDescription === 'Apollo' && selectedClinic
        ? selectedClinic
        : selectedDoctor?.ClinicId?.toString() || "0";

      const doctorId = selectedDoctor?.DoctorId?.toString() || "0";
      const DCUniqueName = selectedDoctor?.DCUniqueName;

      const appointmentData: BookAppointmentRequest = {
        CaseLeadId: previousCaseLeadId,
        LeadType: "Consultation",
        CaseRecMode: "Email",
        ServicesOffered: service,
        CorporateId: corporateId,
        BranchId: branchId,
        ProductId,
        EmployeeRefId: employeeRefId.toString(),
        MedicalTest: "",
        PaymentType: "Customer Paid",
        CaseFor: "1",
        EmployeeToPay: "0.00",
        IsActive: "1",
        LeadStatus: "1",
        VisitType: "",
        DCId: dcId,
        TestPackageTypeId: "4",
        SponsoredStatus: "0",
        DoctorId: doctorId,
        Symptoms: formData.symptoms,
        CreatedBy: createdBy,
        EmployeeDependentDetailsId: formData.relationshipPersonId || "0",
        EmployeeAddressDetailsId: "0",
        PreferredAppointmentDateTime: preferredDateTime,
        CaseLeadCompletionDateTime: "",
        Files: files
      };

      console.log("📢 [BOOKING] Step 1: Creating appointment...");
      const appointmentResult = await ConsultationAPI.CRMSaveBookAppointmentDetails(appointmentData);
      console.log("📄 [BOOKING] Appointment result:", appointmentResult);

      const caseLeadId = appointmentResult?.CaseLead_Id;

      // Check if booking was successful
      if (!appointmentResult.Success || !caseLeadId || caseLeadId === "0") {
        const errorMsg = appointmentResult.Message || "Failed to create appointment";
        console.error("❌ [BOOKING] Appointment creation failed:", errorMsg);
        toast.error(errorMsg);
        return;
      }

      localStorage.setItem("PreviousCaseLeadId", caseLeadId);

      const payload = { EmployeeRefId: employeeRefId, ServiceOfferedId: ProductId };

      console.log("📢 [BOOKING] Step 2: Checking sponsored services...");
      const SponsoredStatusResult = await ConsultationAPI.CRMSponsoredServices(payload);
      console.log("📄 [BOOKING] Sponsored result:", SponsoredStatusResult);

      const isServiceAvailable = Number(SponsoredStatusResult.ServiceAvailable) === 1;

      const cartPayload = {
        CaseLead_Id: caseLeadId,
        EmployeeRefId: employeeRefId,
        CaseFor: personType === 'Self' ? 1 : 2,
        EmployeeDependentDetailsId: formData.relationshipPersonId ? parseInt(formData.relationshipPersonId) : 0,
        CaseType: "Consultation",
        ProductId: Number(ProductId),
        DCId: Number(dcId),
        SponsoredStatus: isServiceAvailable ? 1 : 0,
        TestPackageTypeId: 2,
        CartUniqueId: previousCartUniqueId
      };

      console.log("📢 [BOOKING] Step 3: Adding to cart...", cartPayload);
      const cartResult = await ConsultationAPI.CRMCustomerInsertCartItemDetails(cartPayload);
      console.log("📄 [BOOKING] Cart result:", cartResult);

      if (!cartResult?.Success || !cartResult?.CartUniqueId) {
        const errorMsg = cartResult?.Message || "Failed to add item to cart";
        console.error("❌ [BOOKING] Cart insertion failed:", errorMsg);
        toast.error(errorMsg);
        return;
      }

      const cartUniqueId = cartResult.CartUniqueId;
      const cartDetailsId = cartResult.CartDetailsId;
      localStorage.setItem("PreviousCartUniqueId", cartUniqueId.toString());

      if (cartDetailsId === undefined) {
        toast.error("CartDetailsId not returned from server");
        return;
      }

      const customerCartDetailsPayload = {
        CaseleadId: caseLeadId,
        AppointmentDateTime: preferredDateTime,
        DCId: 0,
        CreatedBy: employeeRefId,
        CartDetailsId: cartDetailsId,
        StMId: "",
        DCSelection: DCUniqueName,
        TestPackageCode: ""
      };

      console.log("📢 [BOOKING] Step 4: Saving cart details...");
      const customerCartResult = await ConsultationAPI.CRMSaveCustomerCartDetails(customerCartDetailsPayload);
      console.log("📄 [BOOKING] Customer cart result:", customerCartResult);

      const appointmentCartItem = {
        id: `appointment_${Date.now()}`,
        caseLeadId: caseLeadId,
        cartUniqueId: cartUniqueId,
        name: `${selectedDoctor?.DoctorName || 'Doctor'} - ${consultationType}`,
        doctorName: selectedDoctor?.DoctorName,
        price: consultationPrice,
        quantity: 1,
        type: 'appointment',
        consultationType: consultationType,
        appointmentTime: preferredDateTime,
        appointmentDate: selectedDate,
        timeSlot: selectedApolloTimeSlot?.time || selectedTimeSlot?.Time,
        symptoms: formData.symptoms,
        timestamp: Date.now()
      };
      const updatedCart = [appointmentCartItem];
      localStorage.setItem("CartUniqueId", cartUniqueId.toString());
      if (!localStorage.getItem("EmployeeRefId")) {
        localStorage.setItem("EmployeeRefId", employeeRefId.toString());
      }
      localStorage.setItem(userCartKey, JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: updatedCart.length }
      }));
      console.log("✅ [BOOKING] Booking completed successfully!");
      toast.success("Appointment booked successfully!");

      navigate("/Checkout", {
        state: {
          cartItems: updatedCart,
          totalAmount: consultationPrice,
          cartUniqueId: cartUniqueId,
          employeeRefId: employeeRefId,
          fromAppointment: true
        }
      });

      closeModal();
    } catch (error: any) {
      console.error("❌ [BOOKING ERROR] Caught exception:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to book appointment. Please try again.";

      toast.error(errorMessage);
    }
  };

  const getUserName = () => {
    if (personType === 'Self') {
      return localStorage.getItem("DisplayName") || "";
    } else {
      return formData.patientName || "";
    }
  };

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

  const handlePrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationCarouselIndex(prev =>
        prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  const getPriceFromFee = (feeString: string): number => {
    if (!feeString) return 150;
    const match = feeString.match(/Rs\.?(\d+)/);
    return match ? parseInt(match[1]) : 150;
  };

  const formatLanguages = (languageString: string): string[] => {
    if (!languageString) return ['English', 'Hindi'];
    return languageString.split(',').map(lang => lang.trim());
  };

  const truncateSpecialization = (specialization: string, doctorId: string, maxLength: number = 20): string => {
    if (!specialization) return 'General Physician';

    if (specialization.length <= maxLength) {
      return specialization;
    }

    if (expandedSpecializations[doctorId]) {
      return specialization;
    }

    return specialization.substring(0, maxLength) + '...';
  };

  const toggleSpecialization = (doctorId: string) => {
    setExpandedSpecializations(prev => {
      const currentValue = prev[doctorId];
      const newValue = currentValue === true ? false : true;
      return {
        ...prev,
        [doctorId]: newValue
      };
    });
  };

  const needsTruncation = (specialization: string, maxLength: number = 20): boolean => {
    return !!specialization && specialization.length > maxLength;
  };

  const renderSpecialization = (doc: CRMConsultationDoctorDetailsResponse) => {
    const specialization = doc.Specialization || 'General Physician';
    const doctorId = doc.DoctorId?.toString() || 'unknown';
    const needsToggle = needsTruncation(specialization);
    const isExpanded = expandedSpecializations[doctorId] || false;

    return (
      <div className="specialization-container">
        <span className="doctor-specialty">
          {truncateSpecialization(specialization, doctorId)}
        </span>
        {needsToggle && (
          <button
            className="read-more-less-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleSpecialization(doctorId);
            }}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    );
  };

  const isWelleazyDoctor = (doc: CRMConsultationDoctorDetailsResponse): boolean => {
    return doc.VendorImageUrl?.includes('welleazy') || doc.ServiceProvider?.includes('Welleazy');
  };

  const isApolloDoctor = (doc: CRMConsultationDoctorDetailsResponse): boolean => {
    return doc.DoctorTypeDescription === 'Apollo';
  };

  const getButtonAvailability = (doc: CRMConsultationDoctorDetailsResponse) => {
    const hasEConsultService = doc.Service?.includes("Video Consultation") || doc.Service?.includes("Tele Consultation") || false;
    const hasInClinicService = doc.Service?.includes("In-Person Consultation") || doc.Service?.includes("Physical Consultation") || false;

    return {
      eConsult: hasEConsultService,
      inClinic: hasInClinicService
    };
  };

  const getImageUrl = (url: string | null): string => {
    if (!url) return DoctorDefaultimage;
    if (url.startsWith('/9j/') || url.startsWith('data:image/') || url.startsWith('iVBORw0KGgo')) {
      if (url.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${url}`;
      }
      else if (url.startsWith('iVBORw0KGgo')) {
        return `data:image/png;base64,${url}`;
      }
      else if (url.startsWith('data:image/')) {
        return url;
      }
    }

    if (url.includes('~')) {
      return url.replace('~', 'https://live.welleazy.com');
    }

    return url;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    const validFiles: SelectedFile[] = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateFileName = (fileName: string, maxLength: number = 25): string => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength) + '...';
  };

  const getFileType = (mimeType: string): string => {
    if (!mimeType) return 'File';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('text')) return 'Text';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    return 'File';
  };

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '900px',
            overflowY: 'auto',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)'
          }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {appointmentType === 'econsult' ? 'Book E-Consultation' : 'Book In-Clinic Appointment'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Person Type Selection - Radio Buttons */}
              <div className="person-type-selection">
                <div className="radio-buttons-container">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="personType"
                      value="Self"
                      checked={personType === 'Self'}
                      onChange={(e) => setPersonType('Self')}
                      className="radio-input"
                    />
                    <span className="radio-custom"></span>
                    Self
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="personType"
                      value="Dependent"
                      checked={personType === 'Dependent'}
                      onChange={(e) => setPersonType('Dependent')}
                      className="radio-input"
                    />
                    <span className="radio-custom"></span>
                    Dependent
                  </label>

                  {personType === 'Dependent' && (
                    <div
                      style={{
                        marginLeft: 400,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(180deg, #E64E15 0%, #E9950B 100%)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                      }}
                    >
                      <button
                        title="Add Dependent"
                        onClick={openDependentModal}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '6px 10px',
                        }}
                      >
                        + Add Dependent
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dependent Form - Two Columns */}
              {personType === 'Dependent' && (
                <div className="">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Relationship</label>
                        <select
                          className="form-select"
                          value={formData.relationshipId}
                          onChange={(e) => handleInputChange('relationshipId', e.target.value)}
                          disabled={loadingRelationships}
                        >
                          <option value="">Select Relationship</option>
                          {relationships.map((relationship) => (
                            <option key={relationship.RelationshipId} value={relationship.RelationshipId}>
                              {relationship.Relationship}
                            </option>
                          ))}
                        </select>
                        {loadingRelationships && <small>Loading relationships...</small>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Dependent</label>
                        <div className="dependent-select-with-button">
                          <select
                            className="form-select"
                            value={formData.relationshipPersonId}
                            onChange={(e) => handleInputChange('relationshipPersonId', e.target.value)}
                            disabled={loadingRelationshipPersons || !formData.relationshipId}
                          >
                            <option value="">Select Dependent</option>
                            {relationshipPersons.map((person) => (
                              <option key={person.EmployeeDependentDetailsId} value={person.EmployeeDependentDetailsId}>
                                {person.DependentName}
                              </option>
                            ))}
                          </select>
                        </div>
                        {loadingRelationshipPersons && <small>Loading dependents...</small>}
                        {!loadingRelationshipPersons && formData.relationshipId && relationshipPersons.length === 0 && (
                          <small className="text-warning">No dependents found for this relationship</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Information - Compact Layout */}
              <div className="patient-info-section">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter patient name"
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Doctor's Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedDoctor?.DoctorName || ''}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Speciality</label>
                      <input
                        type="text"
                        className="form-input"
                        value={selectedDoctor?.Specialization}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="symptoms-section">
                <div className="form-group">
                  <label className="form-label">Symptoms</label>
                  <input
                    className="form-textarea"
                    placeholder="Describe your symptoms..."
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  />
                </div>
              </div>

              <div className="">
                <div className="Upload-Reference-Report">
                  <label className="form-label">Upload Reference Report</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-upload-input"
                      onChange={handleFileUpload}
                      multiple
                    />

                    <label htmlFor="file-upload" className="file-upload-label">
                      <div className="file-upload-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      <div className="file-upload-text">
                        {selectedFiles.length === 0 ? (
                          <>
                            <span className="file-upload-title">Choose files</span>
                            <span className="file-upload-subtitle">PDF, DOC, JPG, PNG (Max 10MB)</span>
                          </>
                        ) : (
                          <div className="selected-files-preview">
                            <div className="selected-files-header-inside">
                              <div className="selected-files-count-badge">
                                {selectedFiles.length} file(s) selected
                              </div>
                              <button
                                type="button"
                                className="clear-all-btn-inside"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFiles([]);
                                }}
                                title="Clear all files"
                              >
                                Clear All
                              </button>
                            </div>

                            <div className="selected-files-row">
                              {selectedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="file-chip"
                                  title={file.name}
                                >
                                  <span className="file-chip-name">
                                    {truncateFileName(file.name, 15)}
                                  </span>
                                  <button
                                    type="button"
                                    className="file-chip-remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFile(index);
                                    }}
                                    title="Remove file"
                                  >
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                      <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Consultation Type Selection - Only show for econsult */}
              {appointmentType === 'econsult' && (
                <div className='btn-consultation-type'>
                  <button
                    className={`btn-video-consulation ${selectedConsultationType === 'video' ? 'active' : ''}`}
                    onClick={() => setSelectedConsultationType('video')}
                  >
                    Video
                  </button>
                  <button
                    className={`btn-tele-consulation ${selectedConsultationType === 'tele' ? 'active' : ''}`}
                    onClick={() => setSelectedConsultationType('tele')}
                  >
                    Tele
                  </button>
                </div>
              )}

              {/* Calendar Section - Only show for tele or in-clinic */}
              {(selectedConsultationType === 'tele' || appointmentType === 'in-clinic') && (
                <div>
                  {/* Only show clinic dropdown for Apollo doctors */}
                  {selectedDoctor?.DoctorTypeDescription === 'Apollo' && appointmentType === 'in-clinic' && (
                    <div className="clinic-selection-section" style={{
                      marginBottom: '20px',
                      width: '100%',
                      maxWidth: '400px'
                    }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>
                          Select Clinic Name
                        </label>
                        {loadingClinics ? (
                          <div className="text-center py-2">
                            <div className="spinner-border spinner-border-sm text-primary"></div>
                            <span className="ms-2">Loading clinics...</span>
                          </div>
                        ) : apolloClinics.length > 0 ? (
                          <select
                            className="form-select"
                            style={{
                              padding: '10px 15px',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: '#fff'
                            }}
                            value={selectedClinic}
                            onChange={(e) => setSelectedClinic(e.target.value)}
                            required
                          >
                            <option value="">-- Select Clinic Name --</option>
                            {apolloClinics.map((clinic) => (
                              <option key={clinic.ClinicId} value={clinic.ClinicId}>
                                {clinic.ClinicName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="alert alert-warning py-2">
                            <small>No clinics available for this doctor</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="calendar-time-layout">
                    <div className="calendar-side">
                      <div className="calendar-container" style={{ marginLeft: '58px' }}>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => {
                            setSelectedDate(date);
                            setSelectedTimeSlot(null);
                            setSelectedApolloTimeSlot(null);
                            setSelectedTime('');
                          }}
                          minDate={new Date()}
                          inline
                          className="tele-calendar"
                          dateFormat="dd/MM/yyyy"
                          highlightDates={[new Date()]}
                        />
                      </div>
                    </div>

                    <div className="time-slots-side">
                      <div className="time-selection-section">
                        <h4 className="time-section-title">Select Time Slot</h4>

                        <div className="time-period-tabs">
                          <button
                            className={`time-period-tab ${selectedTimePeriod === 'morning' ? 'active' : ''}`}
                            onClick={() => setSelectedTimePeriod('morning')}
                          >
                            🌅 Morning
                          </button>
                          <button
                            className={`time-period-tab ${selectedTimePeriod === 'afternoon' ? 'active' : ''}`}
                            onClick={() => setSelectedTimePeriod('afternoon')}
                          >
                            ☀️ Afternoon
                          </button>
                          <button
                            className={`time-period-tab ${selectedTimePeriod === 'evening' ? 'active' : ''}`}
                            onClick={() => setSelectedTimePeriod('evening')}
                          >
                            🌆 Evening
                          </button>
                          <button
                            className={`time-period-tab ${selectedTimePeriod === 'night' ? 'active' : ''}`}
                            onClick={() => setSelectedTimePeriod('night')}
                          >
                            🌙 Night
                          </button>
                        </div>

                        <div className="time-slots-grid">
                          {loadingTimeSlots ? (
                            <div className="loading-time-slots">
                              <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} />
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
                                  title={isExpired ? 'This time slot has expired' : `Select ${format24HourTo12Hour(timeSlot.Time)}`}
                                >
                                  {format24HourTo12Hour(timeSlot.Time)}
                                </button>
                              );
                            })
                          ) : filteredApolloTimeSlots && Array.isArray(filteredApolloTimeSlots) && filteredApolloTimeSlots.length > 0 ? (
                            filteredApolloTimeSlots.map((timeSlot, index) => {
                              const dateToUse = selectedDate || new Date();
                              const isExpired = isTimeSlotExpired(timeSlot, dateToUse);
                              const isSelected = selectedApolloTimeSlot?.slotId === timeSlot.slotId;

                              return (
                                <button
                                  key={timeSlot.slotId || index}
                                  className={`time-slot-btn ${isSelected ? 'active' : ''
                                    } ${isExpired ? 'expired' : ''
                                    }`}
                                  onClick={() => handleTimeSlotSelect(timeSlot)}
                                  disabled={isExpired}
                                  title={isExpired ? 'This time slot has expired' : `Select ${format24HourTo12Hour(timeSlot.time)}`}
                                >
                                  {format24HourTo12Hour(timeSlot.time)}
                                </button>
                              );
                            })
                          ) : (
                            <div className="no-time-slots">
                              <p>⏰ No slots available</p>
                              <small>
                                {allApolloTimeSlots.length > 0
                                  ? `No slots available for ${selectedTimePeriod}. Try selecting a different time period.`
                                  : "This doctor doesn't have available slots for the selected time period"}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Only show when a consultation type is selected */}
              {(selectedConsultationType || appointmentType === 'in-clinic') && (
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button className="btn-secondary-consulation-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary-confirmbooking-consultation"
                    onClick={handleBookAppointment}
                    disabled={
                      (selectedConsultationType === 'tele' && (!selectedDate || (!selectedTimeSlot && !selectedApolloTimeSlot))) ||
                      (appointmentType === 'in-clinic' && (!selectedDate || (!selectedTimeSlot && !selectedApolloTimeSlot))) ||
                      (selectedDoctor?.DoctorTypeDescription === 'Apollo' && appointmentType === 'in-clinic' && !selectedClinic)
                    }
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dependent Modal - Updated with full form */}
      {showDependentModal && (
        <div className="modal-overlay" onClick={closeDependentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
          }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Dependent</h2>
              <button className="modal-close-btn" onClick={closeDependentModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="dependent-form-modal">
                <div className="dependent-form-grid">
                  {/* Row 1: Name and Relationship */}
                  <div className="form-row">
                    <div className="form-group-col">
                      <label className="form-label">
                        Relationship <span className="required-star">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={dependentFormData.relationshipId}
                        onChange={(e) => handleDependentInputChange('relationshipId', e.target.value)}
                        disabled={loadingRelationships}
                        required
                      >
                        <option value="">Select Relationship</option>
                        {relationships.map((relationship) => (
                          <option key={relationship.RelationshipId} value={relationship.RelationshipId}>
                            {relationship.Relationship}
                          </option>
                        ))}
                      </select>
                      {loadingRelationships && <div className="form-hint">Loading relationships...</div>}
                    </div>

                    <div className="form-group-col">
                      <label className="form-label">
                        Dependent Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter dependent's full name"
                        value={dependentFormData.dependentName}
                        onChange={(e) => handleDependentInputChange('dependentName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Date of Birth and Gender */}
                  <div className="form-row">
                    <div className="form-group-col">
                      <label className="form-label">
                        Date of Birth <span className="required-star">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={dependentFormData.dateOfBirth}
                        onChange={(e) => handleDependentInputChange('dateOfBirth', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group-col">
                      <label className="form-label">
                        Gender <span className="required-star">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={dependentFormData.gender}
                        onChange={(e) => handleDependentInputChange('gender', e.target.value)}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Contact Number and Email */}
                  <div className="form-row">
                    <div className="form-group-col">
                      <label className="form-label">
                        Contact Number <span className="required-star">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Enter 10-digit mobile number"
                        value={dependentFormData.contactNumber}
                        onChange={(e) => handleDependentInputChange('contactNumber', e.target.value)}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                  <button
                    className="btn-secondary-consulation-cancel"
                    onClick={closeDependentModal}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary-confirmbooking-consultation"
                    onClick={handleSaveDependent}
                    disabled={loadingSaveDependent}
                    style={{ flex: 1, background: '#F26122' }}
                  >
                    {loadingSaveDependent ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      'Add Dependent'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="consultation-page">
        <Container>
          {/* Search Bar */}
          <div className="search-bar">
            <Form className="search-form-row">
              <Select
                placeholder={
                  loadingSpecializations
                    ? "Loading..."
                    : selectedSpecialization?.length > 0
                      ? `Specialization (${selectedSpecialization.length} selected)`
                      : "Specialization"
                }
                options={specializations.map(spec => ({
                  value: spec.DoctorSpecializationsId,
                  label: spec.Specializations
                }))}
                value={selectedSpecialization}
                onChange={setSelectedSpecialization}
                isLoading={loadingSpecializations}
                isDisabled={loadingSpecializations}
                noOptionsMessage={() =>
                  loadingSpecializations ? "Loading..." : "No specializations found"
                }
                isClearable
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  ValueContainer: ({ children, ...props }) => {
                    const selectedCount = props.getValue().length;
                    const childrenArray = Array.isArray(children) ? children : [children];
                    const [firstChild, ...otherChildren] = childrenArray;

                    return (
                      <components.ValueContainer {...props}>
                        {selectedCount > 0 ? (
                          <>
                            <div >
                              {selectedCount} selected
                            </div>
                            {otherChildren}
                          </>
                        ) : (
                          children
                        )}
                      </components.ValueContainer>
                    );
                  },
                  Option: (props) => (
                    <components.Option {...props}>
                      <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => { }}
                        style={{ marginRight: "8px" }}
                      />
                      {props.label}
                    </components.Option>
                  ),
                  MultiValue: () => null,
                  MultiValueRemove: () => null,
                }}
                styles={{
                  option: (base) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    flexWrap: 'nowrap',
                  }),
                }}
              />

              <Select
                placeholder={
                  loadingLanguages
                    ? "Loading..."
                    : selectedLanguage?.length > 0
                      ? `Language (${selectedLanguage.length} selected)`
                      : "Language"
                }
                options={languages.map(lang => ({
                  value: lang.LanguageId,
                  label: lang.LanguageDescription
                }))}
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                isLoading={loadingLanguages}
                isDisabled={loadingLanguages}
                noOptionsMessage={() =>
                  loadingLanguages ? "Loading..." : "No languages found"
                }
                isClearable
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  ValueContainer: ({ children, ...props }) => {
                    const selectedCount = props.getValue().length;
                    const childrenArray = Array.isArray(children) ? children : [children];
                    const [firstChild, ...otherChildren] = childrenArray;

                    return (
                      <components.ValueContainer {...props}>
                        {selectedCount > 0 ? (
                          <>
                            <div>
                              {selectedCount} selected
                            </div>
                            {otherChildren}
                          </>
                        ) : (
                          children
                        )}
                      </components.ValueContainer>
                    );
                  },
                  Option: (props) => (
                    <components.Option {...props}>
                      <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => { }}
                        style={{ marginRight: "8px" }}
                      />
                      {props.label}
                    </components.Option>
                  ),
                  MultiValue: () => null,
                  MultiValueRemove: () => null,
                }}
                styles={{
                  option: (base) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    flexWrap: 'nowrap',
                  }),
                }}
              />

              <Select
                placeholder={
                  loadingPincodes
                    ? "Loading..."
                    : selectedPincode?.length > 0
                      ? `Pincode (${selectedPincode.length} selected)`
                      : "Pincode"
                }
                options={pincodes.map(p => ({
                  value: p.PincodeId,
                  label: p.Pincode
                }))}
                value={selectedPincode}
                onChange={setSelectedPincode}
                isLoading={loadingPincodes}
                isDisabled={loadingPincodes}
                noOptionsMessage={() =>
                  loadingPincodes ? "Loading..." : "No pincodes found"
                }
                isClearable
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  ValueContainer: ({ children, ...props }) => {
                    const selectedCount = props.getValue().length;
                    const childrenArray = Array.isArray(children) ? children : [children];
                    const [firstChild, ...otherChildren] = childrenArray;

                    return (
                      <components.ValueContainer {...props}>
                        {selectedCount > 0 ? (
                          <>
                            <div>
                              {selectedCount} selected
                            </div>
                            {otherChildren}
                          </>
                        ) : (
                          children
                        )}
                      </components.ValueContainer>
                    );
                  },
                  Option: (props) => (
                    <components.Option {...props}>
                      <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => { }}
                        style={{ marginRight: "8px" }}
                      />
                      {props.label}
                    </components.Option>
                  ),
                  MultiValue: () => null,
                  MultiValueRemove: () => null,
                }}
                styles={{
                  option: (base) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    flexWrap: 'nowrap',
                  }),
                }}
              />

              <Input
                label=""
                type="text"
                name="doctorName"
                placeholder='Search Dr. Name'
                value={searchDoctorName}
                onChange={(e) => setSearchDoctorName(e.target.value)}
              />

              <Select
                placeholder={
                  loadingDoctorTypes
                    ? "Loading..."
                    : selectedDoctorType?.length > 0
                      ? `Vendor (${selectedDoctorType.length} selected)`
                      : "Vendor"
                }
                options={doctorTypes.map(type => ({
                  value: type.DoctorTypeDetailsId,
                  label: type.DoctorTypeDescription
                }))}
                value={selectedDoctorType}
                onChange={setSelectedDoctorType}
                isLoading={loadingDoctorTypes}
                isDisabled={loadingDoctorTypes}
                noOptionsMessage={() =>
                  loadingDoctorTypes ? "Loading..." : "No vendor types found"
                }
                isClearable
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  ValueContainer: ({ children, ...props }) => {
                    const selectedCount = props.getValue().length;
                    const childrenArray = Array.isArray(children) ? children : [children];
                    const [firstChild, ...otherChildren] = childrenArray;

                    return (
                      <components.ValueContainer {...props}>
                        {selectedCount > 0 ? (
                          <>
                            <div>
                              {selectedCount} selected
                            </div>
                            {otherChildren}
                          </>
                        ) : (
                          children
                        )}
                      </components.ValueContainer>
                    );
                  },
                  Option: (props) => (
                    <components.Option {...props}>
                      <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => { }}
                        style={{ marginRight: "8px" }}
                      />
                      {props.label}
                    </components.Option>
                  ),
                  MultiValue: () => null,
                  MultiValueRemove: () => null,
                }}
                styles={{
                  option: (base) => ({
                    ...base,
                    display: "flex",
                    alignItems: "center",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    flexWrap: 'nowrap',
                  }),
                }}
              />
              <div className="filter-buttons-consultation">
                <button className="apply-buttons-consultation" onClick={applyFilters} type="button">
                  Apply
                </button>
                <button className="clear-buttons-consultation" onClick={clearFilters} type="button">
                  Clear
                </button>
              </div>
            </Form>
          </div>

          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3">Loading doctors...</p>
            </div>
          )}

          {/* Show error message when no doctors found with filters */}
          {!loading && error && (
            <div className="text-center my-5">
              <p style={{ color: 'red', fontSize: '18px', marginBottom: '20px' }}>{error}</p>
            </div>
          )}

          {/* Show doctors only when there's no error */}
          {!loading && !error && (
            <div ref={doctorSectionRef} className="doctors-with-pagination-container">
              {/* Doctor Cards Section */}
              <div className="doctor-cards-section">
                <Row className="doctor-cards-row">
                  {/* Check if filteredDoctors is empty - show message */}
                  {filteredDoctors.length === 0 ? (
                    <div className="text-center col-12 my-5">
                      <p style={{ color: '#666', fontSize: '18px' }}>No doctors available at the moment.</p>
                    </div>
                  ) : (
                    // Show current doctors from pagination
                    currentDoctors.map((doc, index) => {
                      const availability = getButtonAvailability(doc);
                      const isApollo = isApolloDoctor(doc);
                      const isWelleazy = isWelleazyDoctor(doc);
                      // Only show experience if it exists and is greater than 0
                      const experienceYears = doc.Experience ? parseInt(doc.Experience) : 0;
                      const experienceText = experienceYears > 0 ? `${doc.Experience} Yrs Experience` : '';

                      return (
                        <Col md={3} sm={6} xs={12} key={doc.DoctorId + '-' + index} className="doctor-card-col">
                          <Card className="doctor-card">
                            <div className="doctor-img-container">

                              {doc.DCUniqueName === 'Apollo Consultation' ? (
                                <img
                                  src={(doc.DoctorURL)}
                                  alt={doc.DoctorName}
                                  className="doctor-img"
                                  onError={(e) => {
                                    const img = e.currentTarget;
                                    img.onerror = null;
                                    img.src = DoctorDefaultimage;
                                  }}
                                />
                              ) : (
                                <img
                                  src={getImageUrl(doc.DoctorImage)}
                                  alt={doc.DoctorName}
                                  className="doctor-img"
                                  onError={(e) => {
                                    const img = e.currentTarget;
                                    img.onerror = null;
                                    img.src = DoctorDefaultimage;
                                  }}
                                />
                              )}

                              <div className="Consultation-discount-badge">
                                50% OFF
                              </div>
                            </div>

                            <Card.Body className="doctor-card-body">
                              {/* Doctor Name with Read More/Less */}
                              {renderDoctorName(doc)}

                              {experienceText && <p className="doctor-experience">{experienceText}</p>}

                              {/* Doctor Type Badge Section */}
                              <div className="badges-container">
                                <div className="doctor-type-badge">
                                  {doc.DoctorTypeDescription === "Dr.Mohan" ? (
                                    <>
                                      <img
                                        src="/DrMohanDiabetes.jpg"
                                        alt="Dr. Mohan"
                                        className="welleazy-logo"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="doctor-type-text">Dr. Mohan</span>
                                    </>
                                  ) : (doc.DoctorTypeDescription === "Apollo" || doc.DoctorTypeDescription === "Appolo") ? (
                                    <>
                                      <img
                                        src="/Apollo_Logo1.png"
                                        alt={doc.DoctorTypeDescription}
                                        className="welleazy-logo"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="doctor-type-text">{doc.DoctorTypeDescription}</span>
                                    </>
                                  ) : doc.DoctorTypeDescription === "Welleazy" ? (
                                    <>
                                      <img
                                        src="/hero_logo.png"
                                        alt="Welleazy"
                                        className="welleazy-logo"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="doctor-type-text">Welleazy</span>
                                    </>
                                  ) : doc.VendorImageUrl ? (
                                    <>
                                      <img
                                        src={getImageUrl(doc.VendorImageUrl)}
                                        alt={doc.DoctorTypeDescription || "Doctor"}
                                        className="welleazy-logo"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="doctor-type-text">{doc.DoctorTypeDescription || 'Doctor'}</span>
                                    </>
                                  ) : (
                                    <span className="doctor-type-text-only">{doc.DoctorTypeDescription || 'Doctor'}</span>
                                  )}
                                </div>
                              </div>

                              {/* Specialization with Read More/Less */}
                              {renderSpecialization(doc)}

                              {doc.Qualification && (
                                <div
                                  className="qualification-badge"
                                  onClick={() => toggleQualification(doc.DoctorId?.toString() || "unknown")}
                                  style={{ cursor: "pointer" }}
                                >
                                  {formatQualificationBadge(doc.Qualification, doc.DoctorId?.toString() || "unknown")}
                                </div>
                              )}

                              {doc.ClinicName && (
                                <div
                                  className="qualification-badge"
                                  onClick={() => toggleQualification(doc.ClinicName?.toString() || "unknown")}
                                  style={{ cursor: "pointer" }}
                                >
                                  {doc.ClinicName}
                                </div>
                              )}

                              <p className="doctor-languages">
                                🌐 {formatLanguages(doc.Language).join(', ')}
                              </p>

                              <div className="consult-type-buttons">
                                {/* E-Consult Button */}
                                <div
                                  className={availability.eConsult ? "" : "tooltip-wrapper"}
                                  title={!availability.eConsult ? "E-Consult service not available" : ""}
                                >
                                  <button
                                    className={`consult-btn e-consult ${availability.eConsult ? 'active-btn' : 'disabled-btn'
                                      }`}
                                    disabled={!availability.eConsult}
                                    onClick={() => {
                                      if (availability.eConsult) {
                                        setSelectedDoctor(doc);
                                        setAppointmentType('econsult');
                                        setShowModal(true);
                                        setFormData(prev => ({
                                          ...prev,
                                          patientName: localStorage.getItem("DisplayName") || ""
                                        }));
                                      }
                                    }}
                                  >
                                    E-Consult
                                  </button>
                                </div>

                                {/* In-Clinic Button */}
                                <div
                                  className={availability.inClinic ? "" : "tooltip-wrapper"}
                                  title={!availability.inClinic ? "In-Clinic service not available" : ""}
                                >
                                  <button
                                    className={`consult-btn in-clinic ${availability.inClinic ? 'active-btn' : 'disabled-btn'
                                      }`}
                                    disabled={!availability.inClinic}
                                    onClick={() => {
                                      if (availability.inClinic) {
                                        setSelectedDoctor(doc);
                                        setAppointmentType('in-clinic');
                                        setShowModal(true);
                                        setFormData(prev => ({
                                          ...prev,
                                          patientName: localStorage.getItem("DisplayName") || ""
                                        }));
                                      }
                                    }}
                                  >
                                    In-Clinic
                                  </button>
                                </div>
                              </div>

                              <div className="doctor-price">
                                {doc.Fee && doc.Fee !== "0" ? (
                                  doc.Fee
                                ) : (
                                  <span className="text-muted" style={{ fontSize: '12px' }}>Check App for Price</span>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })
                  )}
                </Row>
              </div>

              {/* Pagination - Only show if we have filtered doctors */}
              {filteredDoctors.length > doctorsPerPage && (
                <div className="pagination-container-consultation">
                  <button
                    className="pagination-arrow-consultation"
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  <div className="pagination-numbers-consultation">
                    {getPaginationNumbers().map((num, i) => (
                      <button
                        key={i}
                        disabled={num === '...'}
                        className={`pagination-number-consultation ${num === currentPage ? 'active' : ''}`}
                        onClick={() => typeof num === 'number' && paginate(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-arrow-consultation"
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}

              {/* Pagination info - Only show if we have doctors */}
              {filteredDoctors.length > 0 && (
                <div className="pagination-info-consultation">
                  Showing {indexOfFirstDoctor + 1}-{Math.min(indexOfLastDoctor, filteredDoctors.length)} of {filteredDoctors.length}
                </div>
              )}
            </div>
          )}
        </Container>

        {/* Our Locations Section */}
        <Container>
          <section className="our-location-section" style={{ marginBottom: '48px' }}>
            <h2 className="our-location-heading">Our Locations</h2>
            <div className="location-carousel-wrapper">
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
      </div>
    </>
  );
};

export default Consultation;