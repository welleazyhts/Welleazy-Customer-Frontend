import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Table } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faEdit,
  faCalculator,    // BMI icon
  faHeartbeat,     // Blood Pressure icon
  faHeartPulse,    // Heart Rate icon
  faLungs,         // O2 Saturation icon
  faDroplet        // Glucose icon
} from '@fortawesome/free-solid-svg-icons';
import { upcomingeventdata, VitalData, HealthMetricHistory, SponsoredServiceType } from '../../types/home';
import { useAuth } from '../../context/AuthContext';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { toast } from "react-toastify";
import { homeAPI } from '../../api/home';
import { DependantsAPI } from '../../api/dependants';
import { District } from '../../types/dependants';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Sponsored' | 'Health'>('Sponsored');
  const careProgramRef = useRef<HTMLDivElement | null>(null);
  const servicesSectionRef = useRef<HTMLDivElement | null>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<upcomingeventdata[]>([]);
  const [vitalData, setVitalData] = useState<VitalData | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState<boolean>(true);
  const [vitalsError, setVitalsError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, logout, user } = useAuth();

  // State for health metric history
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<HealthMetricHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [currentMetric, setCurrentMetric] = useState<string>('');
  const [currentMetricLabel, setCurrentMetricLabel] = useState<string>('');

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVital, setEditingVital] = useState<any>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage] = useState<number>(5);

  const [expanded, setExpanded] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [SponsoredService, setSponsoredService] = useState<SponsoredServiceType[]>([]);
  const [dynamicCities, setDynamicCities] = useState<District[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);



  // Define vital icon mapping
  const vitalIcons: Record<string, IconDefinition> = {
    'BMI': faCalculator,
    'Blood Pressure': faHeartbeat,
    'Heart Rate': faHeartPulse,
    'O2 Saturation Levels': faLungs,
    'Glucose': faDroplet
  };

  // Handle token expiration
  const handleTokenExpiration = () => {
    toast.error('Session expired. Please login again.');
    logout();
    navigate('/login');
  };

  // Transform API vital data to component format
  const transformVitalData = (data: VitalData) => {
    console.log('Transforming vital data:', data);
    return [
      {
        icon: faCalculator, // Use icon instead of image path
        value: `${data.BMI || '0'} ${data.BMIValue || 'BMI'}`,
        label: 'BMI',
        viewOnly: true,
        metricType: 'BMI',
        data: {
          value: data.BMI || '0',
          lastUpdated: data.lastUpdateBMIValue || ''
        }
      },
      {
        icon: faHeartbeat, // Use icon instead of image path
        value: `${data.bloodPressure || '0/0'} ${data.bloodPressureValue || 'MMHG'}`,
        label: 'Blood Pressure',
        viewOnly: false,
        metricType: 'BloodPressure',
        data: {
          value: data.bloodPressure || '0/0',
          lastUpdated: data.lastUpdateBloodPressureValue || ''
        }
      },
      {
        icon: faHeartPulse, // Use icon instead of image path
        value: `${data.heartRate || '0'} ${data.heartRateValue || 'BPM'}`,
        label: 'Heart Rate',
        viewOnly: false,
        metricType: 'HeartRate',
        data: {
          value: data.heartRate || '0',
          lastUpdated: data.lastUpdateHeartRateValue || ''
        }
      },
      {
        icon: faLungs, // Use icon instead of image path
        value: `${data.o2SaturationLevels || '0'} ${data.o2SaturationLevelsValue || '%'}`,
        label: 'O2 Saturation Levels',
        viewOnly: false,
        metricType: 'O2SaturationLevels',
        data: {
          value: data.o2SaturationLevels || '0',
          lastUpdated: data.lastUpdateO2SaturationLevelsValue || ''
        }
      },
      {
        icon: faDroplet, // Use icon instead of image path
        value: `${data.glucose || '0'} ${data.glucoseValue || 'MG/DL'}`,
        label: 'Glucose',
        viewOnly: false,
        metricType: 'GLUCOSE',
        data: {
          value: data.glucose || '0',
          lastUpdated: data.lastUpdateGlucoseValue || ''
        }
      },
    ];
  };

  // Handle view icon click - fetch history data
  const handleViewClick = async (vital: any) => {
    try {
      setHistoryLoading(true);
      setCurrentMetric(vital.metricType);
      setCurrentMetricLabel(vital.label);
      setCurrentPage(1);

      if (!isAuthenticated || !user) {
        setVitalsError('Please login to view vital data');
        setVitalsLoading(false);
        return;
      }

      const employeeRefId = user.employeeRefId || user.id;
      let rawHistory: any[] = [];

      // Fetch metric history based on metric type
      switch (vital.metricType) {
        case 'BMI':
          rawHistory = (await homeAPI.GetBMIMetricHistory(employeeRefId)) as any[];
          break;
        case 'BloodPressure':
          rawHistory = (await homeAPI.GetBloodPressureMetricHistory(employeeRefId)) as any[];
          break;
        case 'HeartRate':
          rawHistory = (await homeAPI.GetHeartRateMetricHistory(employeeRefId)) as any[];
          break;
        case 'O2SaturationLevels':
          rawHistory = (await homeAPI.GetO2SaturationMetricHistory(employeeRefId)) as any[];
          break;
        case 'GLUCOSE':
          rawHistory = (await homeAPI.GetGlucoseMetricHistory(employeeRefId)) as any[];
          break;
        default:
          throw new Error(`Unknown metric type: ${vital.metricType}`);
      }

      console.log('Raw history data for', vital.metricType, ':', rawHistory);

      // Transform data into consistent format
      const transformed = transformHistoryData(rawHistory, vital.metricType);

      console.log('Transformed history data:', transformed);

      setHistoryData(transformed);
      setShowHistoryModal(true);
      toast.success(`${vital.label} history loaded successfully!`);
    } catch (err: any) {
      console.error('Error fetching health metric history:', err);

      if (err.message.includes('Session expired') || err.message.includes('token')) {
        handleTokenExpiration();
        return;
      }

      toast.error(`Failed to load ${vital.label} history: ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle edit icon click
  const handleEditClick = (vital: any) => {
    if (vital.viewOnly) {
      toast.warning('This vital is view-only and cannot be edited.');
    } else {
      setEditingVital(vital);
      const currentValue = vital.value.split(' ')[0];
      setEditValue(currentValue);
      setShowEditModal(true);
    }
  };

  // Handle update metric using individual APIs
  const handleUpdateMetric = async () => {
    if (!editValue.trim()) {
      toast.error('Please enter a value');
      return;
    }
    let validationError = '';
    const value = editValue.trim();
    if (editingVital.metricType === 'BloodPressure') {
      const bpPattern = /^\d{2,3}\/\d{2,3}$/;
      if (!bpPattern.test(value)) {
        validationError = 'Please enter blood pressure as systolic/diastolic (e.g., 120/80)';
      }
    } else if (editingVital.metricType === 'HeartRate') {
      const hr = +value;
      if (isNaN(hr) || hr < 30 || hr > 200) {
        validationError = 'Please enter a valid heart rate between 30 and 200 BPM';
      }
    } else if (editingVital.metricType === 'O2SaturationLevels') {
      const o2 = +value;
      if (isNaN(o2) || o2 < 70 || o2 > 100) {
        validationError = 'Please enter a valid oxygen saturation between 70 and 100%';
      }
    } else if (editingVital.metricType === 'GLUCOSE') {
      const glucose = parseFloat(value);
      if (isNaN(glucose) || glucose < 30 || glucose > 300) {
        validationError = 'Please enter a valid glucose value between 30 and 300 MG/DL';
      }
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      setUpdating(true);

      if (!isAuthenticated || !user) {
        toast.error('Please login to update health metrics');
        return;
      }
      const employeeRefId = user.employeeRefId || user.id;
      const loginRefIdStr = localStorage.getItem('LoginRefId');

      if (!loginRefIdStr) {
        toast.error('Login reference not found. Please login again.');
        return;
      }
      const loginRefId: number = Number(loginRefIdStr);

      if (isNaN(loginRefId)) {
        toast.error('Invalid login reference. Please login again.');
        return;
      }


      let result;
      console.log('Updating metric:', editingVital.metricType, 'with value:', value);
      switch (editingVital.metricType) {
        case 'BloodPressure':
          result = await homeAPI.UpdateBloodPressureMetric(employeeRefId, value, "1", loginRefId);
          break;
        case 'HeartRate':
          result = await homeAPI.UpdateHeartRateMetric(employeeRefId, value, '1', loginRefId);
          break;
        case 'O2SaturationLevels':
          result = await homeAPI.UpdateO2SaturationMetric(employeeRefId, value, '1', loginRefId);
          break;
        case 'GLUCOSE':
          result = await homeAPI.UpdateGlucoseMetric(employeeRefId, value, '1', loginRefId);
          break;
        default:
          throw new Error(`Unsupported metric type: ${editingVital.metricType}`);
      }

      console.log('API result:', result);

      if (result && (result as any).Message) {
        toast.success((result as any).Message || `${editingVital.label} updated successfully!`);
        await fetchVitalData();
        setShowEditModal(false);
      } else {
        toast.warning(`Update may not have succeeded for ${editingVital.label}`);
      }

    } catch (error: any) {
      console.error('Error updating metric:', error);

      if (error.message.includes('Session expired') || error.message.includes('token')) {
        handleTokenExpiration();
        return;
      }

      let msg = `Failed to update ${editingVital.label}`;
      if (error.response) msg += `: ${error.response.data?.message || error.response.statusText}`;
      else if (error.request) msg += ': No response from server.';
      else msg += `: ${error.message}`;
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = historyData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(historyData.length / recordsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const staticLocationData = [
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

  // Merge dynamic cities with static images
  const locationData = dynamicCities.length > 0
    ? dynamicCities.map(city => {
      const cityName = city.DistrictName || (city as any).name || '';
      const staticMatch = staticLocationData.find(s =>
        (s.name || '').toLowerCase() === cityName.toLowerCase()
      );
      return {
        name: cityName,
        img: staticMatch ? staticMatch.img : '/BANGALORE-8.png', // Default image
        id: city.DistrictId || (city as any).id
      };
    })
    : staticLocationData;

  const LOCATIONS_VISIBLE = 4;
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);

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

  // Fetch vital data function using single API
  const fetchVitalData = async () => {
    try {
      setVitalsLoading(true);

      if (!isAuthenticated || !user) {
        setVitalsError('Please login to view vital data');
        setVitalsLoading(false);
        return;
      }

      const employeeRefId = user.employeeRefId || user.id;
      if (!employeeRefId) {
        setVitalsError('User information not available');
        setVitalsLoading(false);
        return;
      }
      console.log('Fetching vital data for employee:', employeeRefId);
      const response = await homeAPI.CRMCustomerHealthBasicDetails(employeeRefId);
      const healthData = Array.isArray(response) ? response[0] : response;
      console.log('API Response:', healthData);
      if (healthData) {
        const transformedData: VitalData = {
          employeeRefId: healthData.EmployeeRefId,
          height: healthData.Height,
          heightValue: healthData.HRHeightValue,
          lastUpdateHeightValue: healthData.LastUpdateHeightValue,
          weight: healthData.Weight,
          weightValue: healthData.HRWeightValue,
          lastUpdateWeightValue: healthData.LastUpdateWeightValue,
          BMI: healthData.BMI,
          BMIValue: healthData.HRBMIValue,
          lastUpdateBMIValue: healthData.LastUpdateBMIValue,
          bloodPressure: healthData.BloodPressure,
          bloodPressure1: healthData.BloodPressure1,
          bloodPressure2: healthData.BloodPressure2,
          bloodPressureValue: healthData.HRBloodPressureValue,
          bloodPressureTypeValue: healthData.BloodPressureTypeValue,
          lastUpdateBloodPressureValue: healthData.LastUpdateBloodPressureValue,
          heartRate: healthData.HeartRate,
          heartRate1: healthData.HeartRate1,
          heartRate2: healthData.HeartRate2,
          heartRateValue: healthData.HRHeartRateValue,
          lastUpdateHeartRateValue: healthData.LastUpdateHeartRateValue,
          o2SaturationLevels: healthData.O2SaturationLevels,
          o2SaturationLevels1: healthData.O2SaturationLevels1,
          o2SaturationLevels2: healthData.O2SaturationLevels2,
          o2SaturationLevelsValue: healthData.HRO2SaturationLevelsValue,
          lastUpdateO2SaturationLevelsValue: healthData.LastUpdateO2SaturationLevelsValue,
          glucose: healthData.Glucose,
          glucoseValue: healthData.HRGlucoseValue,
          lastUpdateGlucoseValue: healthData.LastUpdateGlucoseValue,
          hrHeightValue: healthData.HRHeightValue,
          hrWeightValue: healthData.HRWeightValue,
          hrbmiValue: healthData.HRBMIValue,
          hrBloodPressureValue: healthData.HRBloodPressureValue,
          hrHeartRateValue: healthData.HRHeartRateValue,
          hrO2SaturationLevelsValue: healthData.HRO2SaturationLevelsValue,
          hrGlucoseValue: healthData.HRGlucoseValue,
          hrBloodGroup: healthData.HRBloodGroup
        };

        console.log('Transformed vital data:', transformedData);
        setVitalData(transformedData);
        setVitalsError(null);
      } else {
        throw new Error('Failed to fetch health data');
      }

    } catch (err: any) {
      console.error('Error fetching vital data:', err);
      if (err.message.includes('Session expired') || err.message.includes('token')) {
        handleTokenExpiration();
        return;
      }
      setVitalsError(err.message || 'Failed to load vital data');
      toast.error('Failed to load vital data');
    } finally {
      setVitalsLoading(false);
    }
  };

  // Fetch upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated || !user) {
          setError('Please login to view upcoming events');
          setLoading(false);
          return;
        }
        const employeeRefId = user.employeeRefId || user.id;
        const corporateId = Number(localStorage.getItem("CorporateId"));
        const loginType = Number(localStorage.getItem("LoginType"));
        const roleId = user.roleId || 0;

        const events = await homeAPI.GetUpcomingEvents(
          employeeRefId,
          corporateId,
          roleId,
          loginType
        );

        setUpcomingEvents(events as any[]);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching upcoming events:', err);

        if (err.message.includes('Session expired') || err.message.includes('token')) {
          handleTokenExpiration();
          return;
        }

        setError(err.message || 'Failed to load upcoming events');
        toast.error('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [isAuthenticated, user]);

  // Fetch vital data when tab changes to Health
  useEffect(() => {
    if (activeTab === 'Health' && isAuthenticated) {
      fetchVitalData();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setIsLoadingCities(true);
    try {
      const data = await DependantsAPI.CRMLoadCitys();
      if (data && data.length > 0) {
        setDynamicCities(data);
        console.log("Loaded cities in Home:", data);
      }
    } catch (error) {
      console.error("Failed to fetch cities in Home:", error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const transformEventsData = (events: upcomingeventdata[]) => {
    return events.map(event => ({
      caseId: event.CaseId,
      type: event.appointmentType,
      date: `${event.AppointmentDate} ${event.AppointmentTime}`,
      doctor: event.DoctorName,
      img: '/ser_3.png',
      status: event.caseStatus,
    }));
  };

  const eventData = transformEventsData(upcomingEvents);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  const EVENT_CARDS_VISIBLE = 3;

  // Auto rotate locations
  useEffect(() => {
    const locationTimer = setInterval(() => {
      setLocationCarouselIndex((prevIndex) => {
        return (prevIndex + 1) % locationData.length;
      });
    }, 3000);

    return () => clearInterval(locationTimer);
  }, [locationData.length]);

  // Scroll to care program section
  useEffect(() => {
    if (location.hash === '#care-program' && careProgramRef.current) {
      careProgramRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  // Clean and simple service click handler with scroll to top
  const handleServiceClick = (serviceTitle: string) => {
    // Scroll to top before navigating
    window.scrollTo(0, 0);

    // Add a small delay to ensure scroll happens
    setTimeout(() => {
      switch (serviceTitle) {
        case 'Consultation':
          navigate('/consultation');
          break;
        case 'Insurance Records':
          navigate('/insurance-record');
          break;
        case 'Health Records':
          navigate('/health-records');
          break;
        case 'Health Assessment':
          navigate('/health-assessment');
          break;
        case 'Medicine Reminder':
          navigate('/medicinereminder');
          break;
        case 'Diagnostics/Labs Test':
          navigate('/lab-test');
          break;
        case 'Pharmacy':
          navigate('/pharmacy');
          break;
        case 'GYM Services':
          navigate('/gymservices');
          break;
        case 'Eye Care/Dental Care':
          navigate('/eyecare-dentalcare');
          break;
        case 'Home and Elderly Care Programs':
          navigate('/home-elderly-care');
          break;
        default:
          // For other services, just navigate directly
          navigate(`/${serviceTitle.toLowerCase().replace(/ /g, '-')}`);
      }
    }, 10);
  };

  // Alternative function that scrolls to the top of the services section
  const handleServiceClickAlt = (serviceTitle: string) => {
    // Scroll to the top of the services section
    if (servicesSectionRef.current) {
      servicesSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Add a small delay to allow the scroll animation to complete
    setTimeout(() => {
      switch (serviceTitle) {
        case 'Consultation':
          navigate('/consultation');
          break;
        case 'Insurance Records':
          navigate('/insurance-record');
          break;
        case 'Health Records':
          navigate('/health-records');
          break;
        case 'Health Assessment':
          navigate('/health-assessment');
          break;
        case 'Medicine Reminder':
          navigate('/medicinereminder');
          break;
        case 'Diagnostics/Labs Test':
          navigate('/lab-test');
          break;
        case 'Pharmacy':
          navigate('/pharmacy');
          break;
        case 'GYM Services':
          navigate('/gymservices');
          break;
        case 'Eye Care/Dental Care':
          navigate('/eyecare-dentalcare');
          break;
        case 'Home and Elderly Care Programs':
          navigate('/home-elderly-care');
          break;
        default:
          window.location.reload();
      }
    }, 500); // 500ms delay to ensure smooth scroll completes
  };

  // Function to check if a service is coming soon
  const isComingSoon = (serviceTitle: string) => {
    return ['Mental Wellness', 'Women Health', 'Comprehensive Health Plans'].includes(serviceTitle);
  };

  // REMOVED STATIC DATA FALLBACK - Only use API data
  const vitals = vitalData ? transformVitalData(vitalData) : [];

  const services = [
    {
      title: 'Consultation',
      description: 'Doctor consultation is a consultation between you and your doctor. It can be done in person, over the phone or through video/Tele/Chat. Our doctors provide high-quality medical care. our doctor consultation services are easily accessible and convenient for patients spread ...',
      img: '/ser_1.png',
      comingSoon: false,
      imgWidth: '140px'
    },
    {
      title: 'Diagnostics/Labs Test',
      description: 'Lab and diagnostic services are treatments, tests, or procedures that help doctors diagnose your condition. They can include blood tests, X-rays, ultrasounds and more. Our lab and diagnostic services are easily accessible and convenient ...',
      img: '/ser_2.png',
      comingSoon: false,
    },
    {
      title: 'Insurance Records',
      description: 'Insurance record is a unique feature provided by us. The portal provides a secure area where all the insurance details can be stored in one place. The user will have access to all their insurance documents and details, which can be accessed at any time. It will help the individuals to get ...',
      img: '/ser_7.png',
      comingSoon: false,
    },
    {
      title: 'Health Records',
      description: 'Your Health records at one place. we can provide you with a secure access to your health records so that only those who are authorized to view the information can do so. We also offer a secure file sharing system, where your health records can be stored securely in our portal. The user ...',
      img: '/ser_8.png',
      comingSoon: false,
    },
    {
      title: 'Health Assessment',
      description: 'Health Risk Assessment (HRA) is a systematic approach to identifying potential health risks and promoting preventive care. Typically conducted through a questionnaire and biometric screenings, it evaluates factors such as lifestyle, medical history, and current health status. The insights ...',
      img: '/ser_8.png',
      comingSoon: false,
    },
    {
      title: 'Medicine Reminder',
      description: 'Care programs are comprehensive plans that are designed to improve the health and well-being of individuals who require care and support. We provide care and support to someone with a long-term condition or terminal illness. This includes different types of care and support that ...',
      img: '/pharmacy-slider-icon.png',
      comingSoon: false,
    },
    {
      title: 'Pharmacy',
      description: 'Online pharmacies provide a convenient and accessible way for patients to purchase medications and health-related products from the comfort of their own home. Our pharmacy provides prescription medications at competitive prices, as well as a wide range of over-the-counter drugs. ...',
      img: '/ser_4.png',
      comingSoon: false,
    },
    {
      title: 'GYM Services',
      description: 'Our GYM services offer access to fitness facilities, personal trainers, and group classes to help you stay healthy and active.',
      img: '/GYM.png',
      comingSoon: false,
    },
    {
      title: 'Eye Care/Dental Care',
      description: 'Our Eye Care and Dental Care services provide specialized treatments and regular checkups for your vision and oral health.',
      img: '/13955765_5411446.svg',
      comingSoon: false,
    },
    {
      title: 'Home and Elderly Care Programs',
      description: 'Care programs are comprehensive plans that are designed to improve the health and well-being of individuals who require care and support. We provide care and support to someone with a long-term condition or terminal illness. This includes different types of care and support that ...',
      img: '/ser_5.png',
      comingSoon: false,
      imgHeight: '165px'
    },
    {
      title: 'Mental Wellness',
      description: 'Mental wellness is essential for maintaining overall health and professional efficiency. It includes stress management, emotional well-being, and proactive mental health care. Setting priorities for mental health improves attention, resilience, and interactions with others, while also ...',
      img: '/Mental-wellness.png',
      comingSoon: true,
    },
    {
      title: 'Women Health',
      description: 'Our Women Health services provide specialized care for women, including gynecology, maternity, and wellness programs.',
      img: '/jiotr6.png',
      comingSoon: true,
    },
    {
      title: 'Comprehensive Health Plans',
      description: 'These plans are made to cover a variety of medical services, including prescription drugs, doctor visits, preventive care, etc. They do, however, frequently provide more comprehensive coverage and cheaper out-of-pocket expenses.',
      img: '/ser_3.png',
      comingSoon: true,
      imgHeight: '165px'
    },
  ];

  const transformHistoryData = (rawData: any[], metricType: string): HealthMetricHistory[] => {
    if (!Array.isArray(rawData)) {
      console.log('Raw data is not an array:', rawData);
      return [];
    }

    console.log('Transforming history data. Raw data length:', rawData.length);

    const transformed = rawData.map(item => {
      let value = '';

      switch (metricType) {
        case 'BMI':
          value = item.HRBMIValue || `${item.BMI || ''} BMI`;
          break;

        case 'BloodPressure':
          value = item.HRBloodPressureValue || item.BloodPressure || '';
          break;

        case 'HeartRate':
          value = item.HRHeartRateValue || `${item.HeartRate || ''} BPM`;
          break;

        case 'O2SaturationLevels':
          value = item.HRO2SaturationLevelsValue || `${item.O2SaturationLevels || ''} %`;
          break;

        case 'GLUCOSE':
          value = item.HRGlucoseValue || `${item.Glucose || ''} MG/DL`;
          break;

        case 'HEIGHT':
          value = item.HRHeightValue || `${item.Height || ''} CM`;
          break;

        case 'WEIGHT':
          value = item.HRWeightValue || `${item.Weight || ''} KG`;
          break;

        default:
          const firstKey = Object.keys(item).find(k => typeof item[k] === 'string' && k !== 'DisplayName' && k !== 'CreatedOn');
          value = firstKey ? item[firstKey] : '';
      }

      return {
        metricValue: value,
        CreatedOn: item.CreatedOn || item.createdOn || item.LastUpdated || '',
        DisplayName: item.DisplayName || item.displayName || 'System'
      };
    });

    console.log('Transformed history data:', transformed);
    return transformed;
  };

  useEffect(() => {
    const loadSponsoredServices = async () => {
      try {
        const employeeRefIdStr = localStorage.getItem("EmployeeRefId");
        if (!employeeRefIdStr) {
          setError("EmployeeRefId not found");
          setSponsoredService([]);
          return;
        }

        const employeeRefId = Number(employeeRefIdStr);
        if (isNaN(employeeRefId)) {
          setError("Invalid EmployeeRefId");
          setSponsoredService([]);
          return;
        }

        setLoading(true);
        const data = await homeAPI.CRMLoadSponsoredServices(employeeRefId);

        setSponsoredService(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load sponsored services");
        setSponsoredService([]);
      } finally {
        setLoading(false);
      }
    };

    loadSponsoredServices();
  }, []);



  return (
    <div className="home-page">
      {/* Health Metric History Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentMetricLabel} History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyLoading ? (
            <div className="text-center">Loading history data...</div>
          ) : historyData.length > 0 ? (
            <>
              <div className="history-table-container">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Value</th>
                      <th>Created Date</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                        <td>
                          <strong>{record.metricValue}</strong>
                        </td>
                        <td>{formatDate(record.CreatedOn)}</td>
                        <td>{record.DisplayName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* FIXED PAGINATION */}
              {totalPages > 1 ? (
                <div className="pagination-container mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="pagination-info-home">
                      Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, historyData.length)} of {historyData.length} records
                    </div>

                    {/* Custom pagination to avoid issues with react-bootstrap Pagination */}
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="d-flex gap-1">
                        {(() => {
                          const pageButtons = [];
                          const maxVisiblePages = 5;

                          // Calculate start and end pages to show
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                          // Adjust if we're near the end
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }

                          // First page button if not showing page 1
                          if (startPage > 1) {
                            pageButtons.push(
                              <Button
                                key={1}
                                variant={1 === currentPage ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </Button>
                            );
                            if (startPage > 2) {
                              pageButtons.push(
                                <span key="ellipsis-start" className="px-2">...</span>
                              );
                            }
                          }

                          // Page number buttons
                          for (let i = startPage; i <= endPage; i++) {
                            pageButtons.push(
                              <Button
                                key={i}
                                variant={i === currentPage ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => handlePageChange(i)}
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Last page button if not showing last page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pageButtons.push(
                                <span key="ellipsis-end" className="px-2">...</span>
                              );
                            }
                            pageButtons.push(
                              <Button
                                key={totalPages}
                                variant={totalPages === currentPage ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pageButtons;
                        })()}
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : historyData.length > 0 ? (
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Showing all {historyData.length} records (single page)
                  </small>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-center">No history data available</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Health Metric Modal */}
      <Modal show={showEditModal} onHide={() => !updating && setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit {editingVital?.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="edit-metric-form">
            <div className="mb-3">
              <label htmlFor="metricValue" className="form-label">
                Enter new value for {editingVital?.label}:
              </label>
              <input
                type="text"
                className="form-control"
                id="metricValue"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Current: ${editingVital?.value}`}
                disabled={updating}
                autoFocus
              />
              <div className="form-text">
                {editingVital?.metricType === 'BloodPressure' && 'Enter blood pressure value (e.g., 120/80)'}
                {editingVital?.metricType === 'HeartRate' && 'Enter heart rate value (e.g., 72)'}
                {editingVital?.metricType === 'O2SaturationLevels' && 'Enter oxygen saturation value (e.g., 98)'}
                {editingVital?.metricType === 'GLUCOSE' && 'Enter glucose value (e.g., 97)'}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateMetric}
            disabled={updating || !editValue.trim()}
          >
            {updating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hero Section */}
      <section className="hero-section-custom">
        <Container>
          <div className="Home-tab-buttons">
            <Button
              className={`Home-tab-btn ${activeTab === 'Sponsored' ? 'active' : ''}`}
              onClick={() => setActiveTab('Sponsored')}
            >
              Sponsored
            </Button>
            <Button
              className={`Home-tab-btn ${activeTab === 'Health' ? 'active' : ''}`}
              onClick={() => setActiveTab('Health')}
            >
              Health
            </Button>
          </div>

          {activeTab === 'Sponsored' ? (
            <Row className="align-items-center justify-content-between">
              <Col md={4} className="consultation-col">
                <div className="consultation-options">

                  {loading && <p>Loading  Services..</p>}
                  {!loading && SponsoredService.length === 0 && (
                    <p style={{ color: "red" }}>No Sponsored Services available.</p>)}

                  {!loading && SponsoredService.map((service) => (
                    <div className="consultation-card" key={service.SubProductId}>
                      <Link
                        to="/consultation"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <img
                          src={service.ImagePath}
                          alt={service.SponsoredServiceName}
                        />
                        <p style={{ textAlign: 'center', fontWeight: 500, lineHeight: 1.2 }}>
                          {service.SponsoredServiceName.split(" ")[0]}
                          <br />
                          {service.SponsoredServiceName.split(" ").slice(1).join(" ")}
                        </p>

                      </Link>
                    </div>

                  ))}

                </div>
              </Col>

              <Col md={4} className="sponsored-info" style={{ marginRight: '-100px' }}>
                <h2>Sponsored Services</h2>
                <p>
                  Sponsored services are health care benefits that the company pays for the employee.
                  Some of the corporates cover their family members also. <br />
                  The employer may pay the entire cost of the health benefits or contribute a percentage or
                  pay for a specific package. <br />
                  The highlighted services are the sponsored services by your corporate.
                </p>
                <Button
                  onClick={() => navigate('/lab-test')}
                  style={{
                    background: 'linear-gradient(to right, #f68b1f, #e26b00)',
                    color: '#ffffff'
                  }}
                >
                  Know More
                </Button>

              </Col>

              <Col md={4} className="hero-right text-center">
                <div className="hero-image-circle">
                  <img src="/hero_logo.png" alt="Sponsored Services" className="img-fluid hero-img" />
                </div>
              </Col>
            </Row>
          ) : (
            <>
              <div className="vitals-header">
                <div className="view-all-text" onClick={() => navigate('/health-records')} style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>View All</div>
              </div>

              {vitalsLoading && (
                <div className="vitals-loading">Loading vital data...</div>
              )}

              {vitalsError && (
                <div className="vitals-error">
                  {vitalsError}
                  {vitalsError.includes('login') && (
                    <Button
                      variant="link"
                      onClick={() => navigate('/login')}
                      style={{ marginLeft: '10px', color: '#007bff' }}
                    >
                      Login Now
                    </Button>
                  )}
                </div>
              )}

              {!vitalsLoading && !vitalsError && vitals.length > 0 ? (
                <div className="vitals-container vitals-no-carousel">
                  {vitals.map((item, idx) => (
                    <div className="vital-card" key={idx}>
                      {/* Use FontAwesomeIcon instead of img */}
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="vital-icon-fontawesome"
                        style={{ fontSize: '32px', color: '#4a6fa5', marginBottom: '10px' }}
                      />
                      <div className="vital-value">{item.value}</div>
                      <div className="vital-label">{item.label}</div>
                      <div className="vital-icons">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="vital-icon-btn view-icon"
                          onClick={() => handleViewClick(item)}
                          title="View History"
                        />
                        {!item.viewOnly && (
                          <FontAwesomeIcon
                            icon={faEdit}
                            className="vital-icon-btn edit-icon"
                            onClick={() => handleEditClick(item)}
                            title="Edit"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !vitalsLoading && !vitalsError ? (
                <div className="vitals-error">
                  No vital data available. Please check if your health data is properly configured.
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>

      {/* Services Section */}
      <section className="services-main-section" ref={servicesSectionRef}>
        <h1 className="services-title">Our Services</h1>



        <div className="services-grid">
          {services.map((service, idx) => {
            // Determine which services are free
            const isFreeService = [
              'Health Assessment',
              'Medicine Reminder',
              'Health Records',
              'Insurance Records'
            ].includes(service.title);

            // All services get up to 30% discount (except coming soon)
            const hasDiscount = !service.comingSoon;

            return (
              <div
                className="service-card-custom"
                key={idx}
                ref={el => {
                  if (service.title === 'Home and Elderly Care Programs') {
                    careProgramRef.current = el;
                  }
                }}
              >
                {/* FREE Ribbon for free services */}
                {isFreeService && !service.comingSoon && (
                  <div className="Home-service-ribbon free" style={{
                    backgroundColor: '#28a745',
                    marginTop: 0,
                    background: 'linear-gradient(135deg, #28a745, #1e7e34)'
                  }}>
                    FREE
                  </div>
                )}

                {/* DISCOUNT Ribbon for other services (not free and not coming soon) */}
                {!isFreeService && hasDiscount && !service.comingSoon && (
                  <div className="Home-service-ribbon discount" style={{
                    backgroundColor: '#f68b1f',
                    marginTop: 0,
                    background: 'linear-gradient(135deg, #f68b1f, #e26b00)',
                    color: '#ffffff'
                  }}>
                    UP TO 30% OFF
                  </div>
                )}

                {/* COMING SOON Ribbon */}
                {service.comingSoon && (
                  <div className="Home-service-ribbon coming-soon" style={{
                    backgroundColor: '#6c757d',
                    marginTop: 0
                  }}>
                    COMING SOON
                  </div>
                )}

                <div className="service-card-content">
                  <div className="service-img-col">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="service-img"
                      style={{
                        ...(service.imgHeight && { height: service.imgHeight }),
                        ...(service.imgWidth && { width: service.imgWidth }),
                        // Add some opacity for coming soon services
                        ...(service.comingSoon && { opacity: 0.7 })
                      }}
                    />
                  </div>
                  <div className="service-info-col">
                    <div className="service-card-title" style={{
                      ...(service.comingSoon && { color: '#6c757d' })
                    }}>
                      {service.title}

                    </div>

                    <div className="service-card-desc">
                      {expanded === idx
                        ? service.description
                        : truncateText(service.description, 150)}
                      {service.description.length > 150 && (
                        <span
                          className="read-more-toggle"
                          onClick={() => setExpanded(expanded === idx ? null : idx)}
                          style={{ color: '#ff9800', cursor: 'pointer', marginLeft: 8 }}
                        >
                          {expanded === idx ? 'Read Less' : 'Read More'}
                        </span>
                      )}
                    </div>



                    {isComingSoon(service.title) ? (
                      <button
                        className="service-btn-custom small-btn coming-soon-btn"
                        disabled
                        style={{
                          backgroundColor: '#6c757d',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <button
                        className="service-btn-custom small-btn"
                        onClick={(e) => handleServiceClick(service.title)}
                        style={
                          isFreeService ? {
                            backgroundColor: '#28a745',
                            borderColor: '#28a745'
                          } : {}
                        }
                      >
                        {isFreeService ? 'Click Here' : 'Click Here'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Upcoming Events Section */}
      <section className="upcoming-events-section">
        <h2 className="upcoming-events-heading">Upcoming Events</h2>
        <div className="events-carousel-container">
          <div
            className="events-carousel-track"
            style={{
              transform: `translateX(-${(eventCarouselIndex * 100) / eventData.length
                }%)`,
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {eventData.map((event, idx) => (
              <div className="event-card" key={`${event.caseId}-${idx}`}>
                <img
                  src={event.img}
                  alt="Event Illustration"
                  className="event-illustration-img"
                />
                <div className="event-details">
                  <div className="event-detail-item">
                    Case Id : {event.caseId}
                  </div>
                  <div className="event-detail-item">{event.type}</div>
                  <div className="event-detail-item">{event.date}</div>
                  <div className="event-detail-item">{event.doctor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="carousel-dots">
          {Array.from({
            length: Math.ceil(eventData.length / EVENT_CARDS_VISIBLE),
          }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`dot ${dotIndex ===
                Math.floor(eventCarouselIndex / EVENT_CARDS_VISIBLE)
                ? "active"
                : ""
                }`}
              onClick={() =>
                setEventCarouselIndex(dotIndex * EVENT_CARDS_VISIBLE)
              }
            ></span>
          ))}
        </div>
      </section>

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
    </div>
  );
};

export default Home;