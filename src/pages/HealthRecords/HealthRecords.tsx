import React, { useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Button, Modal, Table, Pagination } from 'react-bootstrap';
import "./HealthRecords.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faCalendarAlt,
  faPlus,
  faFileMedicalAlt,
  faChartBar,
  faUpload,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faEye,
  faDownload,
  faChevronUp,
  faChevronDown,
  faRulerVertical,
  faWeightScale,
  faHeartPulse,
  faHeartbeat,
  faLungs,
  faCalculator,
  faDroplet,
  faPrint,
  faHistory,
  faUser,
  faUserDoctor,
  faFlask,
  faCheckCircle,
  faArrowDown,
  faArrowUp,
  faMinus,
  faArrowRight,
  faExternalLinkAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import HealthRecordsAPI from "../../api/HealthRecords";
import { homeAPI } from "../../api/home";
import { Vital, LabParameter, HealthRecord, DoctorSpecialization, TestReportParameterRecord } from "../../types/HealthRecords";
import { Relationship, RelationshipPerson } from '../../types/GymServices';
import { gymServiceAPI } from '../../api/GymService';
import { useAuth } from '../../context/AuthContext';
import { toast } from "react-toastify";
import Select from 'react-select';
import Input from '../../components/Input';

const HealthRecords: React.FC = () => {
  // Refs for file inputs and date pickers
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for health records data
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [allRecords, setAllRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState<Vital[]>([]);

  // State for editing vitals
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("");

  // State for active tab and record management
  const [activeTab, setActiveTab] = useState("Prescription & Lab Tests");
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [showLabParameters, setShowLabParameters] = useState(false);
  const [recordCarouselIndex, setRecordCarouselIndex] = useState(0);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // State for document management
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [documentsToRemove, setDocumentsToRemove] = useState<string[]>([]);

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  // State for different record types
  const [hospitalizationRecords, setHospitalizationRecords] = useState<any[]>([]);
  const [allHospitalizationRecords, setAllHospitalizationRecords] = useState<any[]>([]);
  const [hospitalizationLoading, setHospitalizationLoading] = useState(false);

  const [medicalBillRecords, setMedicalBillRecords] = useState<any[]>([]);
  const [allMedicalBillRecords, setAllMedicalBillRecords] = useState<any[]>([]);
  const [medicalBillLoading, setMedicalBillLoading] = useState(false);

  const [vaccinationRecords, setVaccinationRecords] = useState<any[]>([]);
  const [allVaccinationRecords, setAllVaccinationRecords] = useState<any[]>([]);
  const [vaccinationLoading, setVaccinationLoading] = useState(false);

  // State for document collections
  const [testReportDocuments, setTestReportDocuments] = useState<any[]>([]);
  const [medicalBillDocuments, setMedicalBillDocuments] = useState<any[]>([]);
  const [vaccinationDocuments, setVaccinationDocuments] = useState<any[]>([]);
  const [hospitalizationDocuments, setHospitalizationDocuments] = useState<any[]>([]);

  // State for document modal
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentType, setDocumentType] = useState('');

  // State for history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedVitalHistory, setSelectedVitalHistory] = useState<Vital | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('');

  // State for parameters modal
  const [showParametersModal, setShowParametersModal] = useState<boolean>(false);
  const [selectedParameters, setSelectedParameters] = useState<any[]>([]);
  const [parametersLoading, setParametersLoading] = useState<boolean>(false);
  const [selectedRecordForParameters, setSelectedRecordForParameters] = useState<HealthRecord | null>(null);
  const [parametersCount, setParametersCount] = useState<number>(0);

  // State for dependants
  const [dependants, setDependants] = useState<any[]>([]);
  const [dependantsLoading, setDependantsLoading] = useState(false);

  // State for editing records
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editingRecordType, setEditingRecordType] = useState<string>('');

  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    date: '',
    caseForOption: '',
    doctorName: ''
  });
  const [filterLoading, setFilterLoading] = useState(false);

  // State for health metrics loading
  const [healthMetricsLoading, setHealthMetricsLoading] = useState(false);
  const [healthChoices, setHealthChoices] = useState<any>(null);

  // Authentication and navigation
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<DoctorSpecialization[]>([]);
  const [specializationOptions, setSpecializationOptions] = useState<{ value: string, label: string }[]>([]);

  // Form state with additional fields for relationships
  const [formData, setFormData] = useState({
    person: "self",
    recordFor: "",
    recordDate: "",
    recordName: "",

    typeOfRecord: "",
    recordDoctorName: "",
    doctorSpecialization: "",
    reasonForConsultation: "",
    hospitalName: "",
    additionalNotes: "",
    billNumber: "",
    vaccinationDose: "",
    vaccinationCenter: "",
    registrationId: "",
    // New fields for relationships
    relationshipId: "",
    relationshipPersonId: "",
    name: "",
    relation: "",

  });

  const [labParameters, setLabParameters] = useState<LabParameter[]>([createLabParameter()]);

  // ==================== VALIDATION STATE ====================
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ==================== CONSTANTS ====================

  // Add this state near your other useState declarations
  const [unitToggle, setUnitToggle] = useState({
    height: "Cm", // "cm" or "feet"
    weight: "Kg"  // "kg" or "lbs"
  });

  // Icon mappings for vitals
  const vitalIcons: { [key: string]: any } = {
    "Height": faRulerVertical,
    "Weight": faWeightScale,
    "Heart Rate": faHeartPulse,
    "Blood Pressure": faHeartbeat,
    "O2 Saturation": faLungs,
    "BMI": faCalculator,
    "Glucose": faDroplet,
  };

  // Dropdown options
  const recordNameOptions = [
    { value: "Doctor Prescriptions", label: "Doctor Prescriptions" },
    { value: "Pathology Medical Reports", label: "Pathology Medical Reports" },
    { value: "Radiology Medical Reports", label: "Radiology Medical Reports" },
    { value: "Fitness certificate", label: "Fitness certificate" },
    { value: "Vaccination certificate", label: "Vaccination certificate" },
    { value: "Preventive Health Package", label: "Preventive Health Package" },
    { value: "Other Medical records", label: "Other Medical records" },
  ];

  const typeOfRecordOptions = [
    { value: "Doctor Prescription", label: "Doctor Prescription" },
    { value: "Medical Report", label: "Medical Report" },
    { value: "Other", label: "Other" },
  ];
  // Hardcoded options for Vaccination Name as requested
  const vaccinationNameOptions = [
    { value: "COVID-19 Vaccine", label: "COVID-19 Vaccine" },
    { value: "Hepatitis B", label: "Hepatitis B" },
    { value: "MMR - Measles, Mumps, Rubella", label: "MMR - Measles, Mumps, Rubella" },
    { value: "Tetanus (TT/DT)", label: "Tetanus (TT/DT)" },
    { value: "Typhoid Vaccine", label: "Typhoid Vaccine" },
    { value: "Influenza Vaccine", label: "Influenza Vaccine" },
    { value: "Other", label: "Other" }
  ];
  useEffect(() => {
    const fetchHealthChoices = async () => {
      try {
        const data = await HealthRecordsAPI.getChoices();
        setHealthChoices(data);
      } catch (error) {
        console.error("Failed to fetch health choices:", error);
      }
    };
    fetchHealthChoices();
  }, []);



  const vaccinationDoseOptions = [
    { value: "First Dose", label: "First Dose" },
    { value: "Second Dose", label: "Second Dose" },
    { value: "Booster Dose", label: "Booster Dose" },
    { value: "Single Dose", label: "Single Dose" },
  ];

  const caseForOptions = [
    { value: "", label: "All" },
    { value: "1", label: "Self" },
    { value: "2", label: "Dependant" },
  ];

  const personOptions = [
    { value: "self", label: "Self" },
    { value: "dependant", label: "Dependant" },
  ];

  // Location data for carousel
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

  // Constants
  const HISTORY_PAGE_SIZE = 5;
  const LOCATIONS_VISIBLE = 4;

  // ==================== VALIDATION FUNCTIONS ====================

  // Validate prescription form
  const validatePrescriptionForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.recordFor.trim()) errors.recordFor = "Record for is required";
    if (!formData.recordDate) errors.recordDate = "Record date is required";
    if (!formData.recordName) errors.recordName = "Record name is required";
    if (!formData.recordDoctorName.trim()) errors.recordDoctorName = "Doctor name is required";

    // If adding lab parameters, validate them
    if (showLabParameters) {
      labParameters.forEach((param, index) => {
        if (param.parameterName.trim() && !param.result.trim()) {
          errors[`labResult_${index}`] = "Result is required when parameter name is provided";
        }
        if (!param.parameterName.trim() && param.result.trim()) {
          errors[`labParamName_${index}`] = "Parameter name is required when result is provided";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate hospitalization form
  const validateHospitalizationForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recordFor.trim()) errors.recordFor = "Record for is required";
    if (!formData.recordDate) errors.recordDate = "Record date is required";
    if (!formData.recordName) errors.recordName = "Record name is required";
    if (!formData.typeOfRecord) errors.typeOfRecord = "Type of record is required";
    if (!formData.recordDoctorName.trim()) errors.recordDoctorName = "Doctor name is required";
    if (!formData.hospitalName.trim()) errors.hospitalName = "Hospital name is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate medical bill form
  const validateMedicalBillForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recordFor.trim()) errors.recordFor = "Record for is required";
    if (!formData.recordDate) errors.recordDate = "Record date is required";
    if (!formData.recordName) errors.recordName = "Record name is required";
    if (!formData.hospitalName.trim()) errors.hospitalName = "Hospital name is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate vaccination form
  const validateVaccinationForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recordFor.trim()) errors.recordFor = "Record for is required";
    if (!formData.recordDate) errors.recordDate = "Vaccination date is required";
    if (!formData.recordName) errors.recordName = "Vaccination name is required";
    if (!formData.vaccinationDose) errors.vaccinationDose = "Vaccination dose is required";
    if (!formData.vaccinationCenter.trim()) errors.vaccinationCenter = "Vaccination center is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate dependant selection
  const validateDependantFields = (): boolean => {
    if (formData.person === "dependant") {
      if (!formData.relationshipId) {
        setValidationErrors(prev => ({ ...prev, relationshipId: "Relationship is required" }));
        return false;
      }
      if (!formData.relationshipPersonId) {
        setValidationErrors(prev => ({ ...prev, relationshipPersonId: "Dependant is required" }));
        return false;
      }
    }
    return true;
  };

  // General validation function
  const validateForm = (): boolean => {
    setIsSubmitted(true);
    let isValid = false;

    // Clear previous errors
    setValidationErrors({});

    // Validate dependant fields first
    if (!validateDependantFields()) {
      return false;
    }

    // Validate based on active tab
    switch (activeTab) {
      case "Prescription & Lab Tests":
        isValid = validatePrescriptionForm();
        break;
      case "Hospitalizations":
        isValid = validateHospitalizationForm();
        break;
      case "Medical Bills":
        isValid = validateMedicalBillForm();
        break;
      case "Vaccinations Certificates":
        isValid = validateVaccinationForm();
        break;
      default:
        isValid = false;
    }

    return isValid;
  };

  // Reset validation
  const resetValidation = () => {
    setValidationErrors({});
    setIsSubmitted(false);
  };

  // ==================== UTILITY FUNCTIONS ====================

  // Add this function near your other functions
  const toggleUnit = (vitalName: string) => {
    if (vitalName === "Height") {
      setUnitToggle(prev => ({
        ...prev,
        height: prev.height === "Cm" ? "Feet" : "Cm"
      }));

    } else if (vitalName === "Weight") {
      setUnitToggle(prev => ({
        ...prev,
        weight: prev.weight === "Kg" ? "Pound" : "Kg"
      }));
    }
  };
  // Get display name from user context
  const getDisplayName = () => {
    return user?.name || "Self";
  };

  // Get current date in DD-MM-YYYY format
  const getCurrentDateInDDMMYYYY = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Create initial lab parameter object
  function createLabParameter(): LabParameter {
    return {
      parameterName: "",
      result: "",
      unit: "",
      startRange: "",
      endRange: ""
    };
  }

  // Convert dd-mm-yyyy to yyyy-mm-dd for HTML date input
  const getDateInputValue = (dateString: string) => {
    if (!dateString) return '';

    try {
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        return dateString;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
      }

      if (dateString.includes('T')) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }

      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Format file path for URLs
  const formatFilePath = (filePath: string) => {
    if (!filePath) return '';

    // If it's already a full URL (http/https), return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // Handle local paths
    if (filePath.startsWith('C:\\')) {
      const fileName = filePath.split('\\').pop();
      return `https://live.welleazy.com/HealthRecords/${fileName}`;
    }

    return filePath;
  };

  // Get document ID and type
  const getDocumentIdAndType = (doc: any): { id: number, type: string } => {
    if (doc.TR_DocumentId) {
      return { id: Number(doc.TR_DocumentId), type: 'TEST_REPORT' };
    } else if (doc.H_DocumentId) {
      return { id: Number(doc.H_DocumentId), type: 'HOSPITALIZATION' };
    } else if (doc.MB_DocumentId) {
      return { id: Number(doc.MB_DocumentId), type: 'MEDICAL_BILL' };
    } else if (doc.V_DocumentId) {
      return { id: Number(doc.V_DocumentId), type: 'VACCINATION' };
    } else if (doc.id) {
      // Fallback for new API structure where id is direct
      return { id: Number(doc.id), type: 'DOCUMENT' };
    }
    return { id: 0, type: '' };
  };

  // Open document in new tab
  const handleViewDocument = (doc: any) => {
    // New API uses 'file', Legacy uses 'UplordDocPath' or 'DocumentPath'
    const rawPath = doc.file || doc.UplordDocPath || doc.DocumentPath;
    const filePath = formatFilePath(rawPath);

    if (filePath) {
      window.open(filePath, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("Document path not found");
    }
  };

  // Download document with Blob logic to force download
  const handleDownloadDocument = async (doc: any) => {
    const rawPath = doc.file || doc.UplordDocPath || doc.DocumentPath;
    const filePath = formatFilePath(rawPath);

    if (!filePath) {
      toast.error("Document path not found for download");
      return;
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = doc.UplordDocName || doc.DocumentName || (rawPath ? rawPath.split('/').pop() : 'document.pdf');
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, opening in new tab:", error);
      // Fallback: simpler window.open if fetch/blob fails (e.g. CORS issues)
      window.open(filePath, '_blank');
    }
  };

  // Get relationship options for dropdown
  const getRelationshipOptions = () => {
    if (loadingRelationships) {
      return [{ value: "", label: "Loading relationships..." }];
    }
    if (relationships.length === 0) {
      return [{ value: "", label: "No relationships found" }];
    }
    return relationships.map(relationship => ({
      value: relationship.RelationshipId.toString(),
      label: relationship.Relationship
    }));
  };

  // Get relationship person options for dropdown
  const getRelationshipPersonOptions = () => {
    if (loadingRelationshipPersons) {
      return [{ value: "", label: "Loading persons..." }];
    }
    if (relationshipPersons.length === 0) {
      return [{ value: "", label: "No persons found for this relationship" }];
    }
    return relationshipPersons.map(person => ({
      value: person.EmployeeDependentDetailsId.toString(),
      label: person.DependentName,
      data: person
    }));
  };

  // Get dependant options for dropdown
  const dependantOptions = () => {
    if (dependantsLoading) {
      return [{ value: "", label: "Loading..." }];
    }
    if (dependants.length === 0) {
      return [{ value: "", label: "No dependants found" }];
    }
    return dependants.map(dependant => ({
      value: dependant.name,
      label: `${dependant.name} (${dependant.relation})`
    }));
  };

  // Get visible locations for carousel
  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  // ==================== EFFECT HOOKS ====================

  // Load relationships on component mount
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

  // Load relationship persons when relationship changes
  useEffect(() => {
    const loadRelationshipPersons = async () => {
      if (formData.person === "dependant" && formData.relationshipId) {
        setLoadingRelationshipPersons(true);
        try {
          const employeeRefId = user?.employeeRefId || user?.id?.toString();
          if (!employeeRefId) {
            toast.error("Please log in to select dependents.");
            return;
          }
          const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
            typeof employeeRefId === 'string' ? parseInt(employeeRefId) : employeeRefId,
            parseInt(formData.relationshipId)
          );
          setRelationshipPersons(personsData);
        } catch (error) {
          console.error("Failed to load relationship persons:", error);
          toast.error("Failed to load dependents. Please try again.");
          setRelationshipPersons([]);
        } finally {
          setLoadingRelationshipPersons(false);
        }
      } else {
        setRelationshipPersons([]);
      }
    };

    loadRelationshipPersons();
  }, [formData.person, formData.relationshipId, user]);

  // Load doctor specializations on component mount
  // Load doctor specializations on component mount
  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const data = await HealthRecordsAPI.getPrescriptionDoctorSpecializations();

        // Map response to internal format
        const mappedData = data.map((item: any) => ({
          DoctorSpecializationsId: item.id || item.DoctorSpecializationsId,
          Specializations: item.name || item.Specializations,
          ImageName: item.image || item.ImageName,
          Imagepath: item.image_path || item.Imagepath,
          Description: item.description || item.Description,
          IsActive: item.is_active || item.IsActive || 1
        }));

        const sorted = mappedData.sort((a, b) =>
          (a.Specializations || '').localeCompare(b.Specializations || '')
        );
        setSpecializations(sorted);

        const options = sorted.map((item) => ({
          value: item.DoctorSpecializationsId.toString(),
          label: item.Specializations,
        }));
        setSpecializationOptions(options);
      } catch (err) {
        console.error("Failed to load specializations:", err);
      }
    };
    loadSpecializations();
  }, []);

  // Initialize form with display name
  useEffect(() => {
    const displayName = getDisplayName();
    const currentDate = getCurrentDateInDDMMYYYY();
    setFormData(prev => ({
      ...prev,
      recordFor: displayName,
      recordDate: currentDate
    }));
  }, []);

  // Fetch dependants and health metrics on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHealthMetrics();
    }
  }, [isAuthenticated, user]);

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHealthRecords();
      fetchHospitalizationDetails();
      fetchMedicalBillDetails();
      fetchVaccinationDetails();

      fetchTestReportDocuments();
      fetchMedicalBillDocuments();
      fetchVaccinationDocuments();
      fetchHospitalizationDocuments();
    }
  }, [isAuthenticated, user]);

  const fetchHealthMetrics = async () => {
    try {
      if (!isAuthenticated || !user) return;

      setHealthMetricsLoading(true);

      const [
        latestHeight, heightHistory,
        latestWeight, weightHistory,
        latestBMI, bmiHistory,
        latestBP, bpHistory,
        latestHR, hrHistory,
        latestO2, o2History,
        latestGlucose, glucoseHistory
      ] = (await Promise.all([
        HealthRecordsAPI.getLatestHeight(), HealthRecordsAPI.listHeightHistory(),
        HealthRecordsAPI.getLatestWeight(), HealthRecordsAPI.listWeightHistory(),
        HealthRecordsAPI.getLatestBMI(), HealthRecordsAPI.listBMIHistory(),
        HealthRecordsAPI.getLatestBloodPressure(), HealthRecordsAPI.listBloodPressureHistory(),
        HealthRecordsAPI.getLatestHeartRate(), HealthRecordsAPI.listHeartRateHistory(),
        HealthRecordsAPI.getLatestO2Saturation(), HealthRecordsAPI.listO2SaturationHistory(),
        HealthRecordsAPI.getLatestGlucose(), HealthRecordsAPI.listGlucoseHistory()
      ])) as any[];

      const hasValue = (val: any) => val !== null && val !== undefined && val !== "";

      const actualVitals: Vital[] = [
        {
          name: "Height",
          value: hasValue(latestHeight?.value) ? `${latestHeight.value} ${latestHeight.unit || "cm"}` : "N/A",
          lastUpdated: latestHeight?.created_at ? formatDisplayDate(latestHeight.created_at) : "N/A",
          history: (heightHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.value} ${item.unit || "cm"}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "Weight",
          value: hasValue(latestWeight?.value) ? `${latestWeight.value} ${latestWeight.unit || "kg"}` : "N/A",
          lastUpdated: latestWeight?.created_at ? formatDisplayDate(latestWeight.created_at) : "N/A",
          history: (weightHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.value} ${item.unit || "kg"}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "BMI",
          value: hasValue(latestBMI?.value) ? `${latestBMI.value}` : "N/A",
          lastUpdated: latestBMI?.created_at ? formatDisplayDate(latestBMI.created_at) : "N/A",
          history: (bmiHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.value}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "Blood Pressure",
          value: hasValue(latestBP?.systolic) ? `${latestBP.systolic}/${latestBP.diastolic} ${latestBP.unit || "mmHg"}` : "N/A",
          lastUpdated: latestBP?.created_at ? formatDisplayDate(latestBP.created_at) : "N/A",
          history: (bpHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.systolic}/${item.diastolic} ${item.unit || "mmHg"}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "Heart Rate",
          value: hasValue(latestHR?.value) ? `${latestHR.value} ${latestHR.unit || "bpm"}` : "N/A",
          lastUpdated: latestHR?.created_at ? formatDisplayDate(latestHR.created_at) : "N/A",
          history: (hrHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.value} ${item.unit || "bpm"}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "O2 Saturation",
          value: hasValue(latestO2?.value) ? `${latestO2.value}${latestO2.unit || "%"}` : "N/A",
          lastUpdated: latestO2?.created_at ? formatDisplayDate(latestO2.created_at) : "N/A",
          history: (o2History || []).slice(0, 2).map((item: any) => ({
            value: `${item.value}${item.unit || "%"}`,
            date: formatDisplayDate(item.created_at)
          }))
        },
        {
          name: "Glucose",
          value: hasValue(latestGlucose?.value) ? `${latestGlucose.value} ${latestGlucose.unit || "mg/dL"}` : "N/A",
          lastUpdated: latestGlucose?.created_at ? formatDisplayDate(latestGlucose.created_at) : "N/A",
          history: (glucoseHistory || []).slice(0, 2).map((item: any) => ({
            value: `${item.value} ${item.unit || "mg/dL"}`,
            date: formatDisplayDate(item.created_at)
          }))
        }
      ];

      setVitals(actualVitals);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      toast.error("Failed to load health metrics");
      setVitals(getEmptyVitals());
    } finally {
      setHealthMetricsLoading(false);
    }
  };


  // Get empty vitals structure for fallback
  const getEmptyVitals = (): Vital[] => {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;

    return [
      { name: "Height", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "Weight", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "Heart Rate", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "Blood Pressure", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "O2 Saturation", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "BMI", value: "N/A", lastUpdated: formattedDate, history: [] },
      { name: "Glucose", value: "N/A", lastUpdated: formattedDate, history: [] },
    ];
  };

  // Fetch health records
  // Fetch health records
  const fetchHealthRecords = async () => {
    try {
      if (!isAuthenticated || !user) return;

      setLoading(true);

      const rawData = await HealthRecordsAPI.listPrescriptions();

      const allDocs: any[] = [];

      const mappedRecords: HealthRecord[] = rawData.map((item: any) => {
        // Handle parameters
        const labParameters: LabParameter[] = (item.parameters || []).map((param: any) => ({
          parameterName: param.parameter_name,
          result: param.result,
          unit: param.unit,
          startRange: '',
          endRange: ''
        }));

        // Handle documents
        if (item.documents && Array.isArray(item.documents)) {
          item.documents.forEach((doc: any) => {
            allDocs.push({
              TR_DocumentId: doc.id,
              TR_id: item.id,
              UplordDocName: doc.file.split('/').pop(),
              UplordDocPath: doc.file
            });
          });
        }

        const docName = item.documents?.[0]?.file.split('/').pop();
        const docPath = item.documents?.[0]?.file;

        return {
          id: item.id,
          name: item.for_whom === 'self' ? 'Self' : (item.dependant_name || 'Dependent'),
          relation: item.for_whom === 'self' ? "Self" : "Dependent",
          type: item.record_type,
          recordName: item.record_name,
          doctor: item.doctor_name,
          recordDate: item.record_date,
          notes: item.reason,
          employeeRefId: 0,
          specialization: item.doctor_specialization?.toString(),
          uploadedDocName: docName,
          uploadedDocPath: docPath,
          createdOn: item.created_at,
          updatedOn: item.updated_at,
          typeOfRecord: item.record_type === 'lab_test' ? 'Medical Report' : 'Doctor Prescription',
          labParameters: labParameters,
        };
      });

      setRecords(mappedRecords);
      setAllRecords(mappedRecords);
      setTestReportDocuments(allDocs);
    } catch (error) {
      console.error("Error in fetchHealthRecords:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospitalization records
  const fetchHospitalizationDetails = async () => {
    try {
      if (!isAuthenticated || !user) return;

      setHospitalizationLoading(true);
      const employeeRefId = user.employeeRefId || user.id;

      const records = await HealthRecordsAPI.GetHospitalizationDetails(employeeRefId);

      if (!Array.isArray(records) || records.length === 0) {
        setHospitalizationRecords([]);
        setAllHospitalizationRecords([]);
        return;
      }

      const mapped = records.map((item) => ({
        id: item.H_id,
        recordFor: item.Record_for,
        recordDate: item.Record_date,
        recordName: item.RecordName,
        doctor: item.Record_Doctor_Name,
        hospital: item.Record_Hospital_Name,
        type: item.Type_of_Record,
        notes: item.Additional_Notes,
        docName: item.UplordDocName,
        docPath: item.UplordDocPath,
        employeeRefId: item.EmployeeRefId,
        relation: item.Relation,
        createdOn: item.CreatedOn,
        updatedOn: item.UpdatedOn,
        documents: item.documents || []
      }));

      setHospitalizationRecords(mapped);
      setAllHospitalizationRecords(mapped);
    } catch (error) {
      console.error("Error in fetchHospitalizationDetails:", error);
    } finally {
      setHospitalizationLoading(false);
    }
  };

  // Fetch medical bill records
  const fetchMedicalBillDetails = async () => {
    try {
      if (!isAuthenticated || !user) return;

      setMedicalBillLoading(true);
      const employeeRefId = user.employeeRefId || user.id;

      const records = await HealthRecordsAPI.GetMedicalBillDetails(employeeRefId);

      if (!Array.isArray(records) || records.length === 0) {
        setMedicalBillRecords([]);
        setAllMedicalBillRecords([]);
        return;
      }

      const mapped = records.map((item) => ({
        id: item.MB_id,
        recordFor: item.Record_for,
        recordDate: item.Record_date,
        recordName: item.RecordName,
        billNumber: item.Record_Bill_Number,
        hospital: item.Record_Hospital_Name,
        type: item.Type_of_Record,
        docName: item.UplordDocName,
        docPath: item.UplordDocPath,
        employeeRefId: item.EmployeeRefId,
        relation: item.Relation,
        createdOn: item.CreatedOn,
        updatedOn: item.UpdatedOn,
        documents: item.documents || []
      }));

      setMedicalBillRecords(mapped);
      setAllMedicalBillRecords(mapped);
    } catch (error) {
      console.error("Error in fetchMedicalBillDetails:", error);
    } finally {
      setMedicalBillLoading(false);
    }
  };

  // Fetch vaccination records
  const fetchVaccinationDetails = async () => {
    try {
      if (!isAuthenticated || !user) return;
      setVaccinationLoading(true);

      const employeeRefId = user.employeeRefId || user.id;
      const records = await HealthRecordsAPI.GetVaccinationDetails(employeeRefId);

      if (!Array.isArray(records) || records.length === 0) {
        setVaccinationRecords([]);
        setAllVaccinationRecords([]);
        return;
      }

      const mapped = records.map((item) => ({
        id: item.V_id,
        recordFor: item.Record_for,
        recordDate: item.Record_date,
        recordName: item.RecordName,
        vaccinationDose: item.Vaccination_dose,
        vaccinationCenter: item.Vaccination_center,
        registrationId: item.Registration_id,
        docName: item.UplordDocName,
        docPath: item.UplordDocPath,
        employeeRefId: item.EmployeeRefId,
        relation: item.Relation,
        createdOn: item.CreatedOn,
        updatedOn: item.UpdatedOn,
        documents: item.documents || []
      }));

      setVaccinationRecords(mapped);
      setAllVaccinationRecords(mapped);
    } catch (error) {
      console.error("Error in fetchVaccinationDetails:", error);
    } finally {
      setVaccinationLoading(false);
    }
  };

  // Fetch test report documents - Handled in fetchHealthRecords now, keeping empty for compatibility
  const fetchTestReportDocuments = async () => {
    // Already fetched in fetchHealthRecords
  };

  // Fetch medical bill documents
  const fetchMedicalBillDocuments = async () => {
    try {
      if (!isAuthenticated || !user) return;
      const employeeRefId = user.employeeRefId || user.id;
      const documents = await HealthRecordsAPI.GetMedicalBillDocumentDetails(employeeRefId);
      setMedicalBillDocuments(documents);
    } catch (error) {
      console.error("Error in fetchMedicalBillDocuments:", error);
    }
  };

  // Fetch vaccination documents
  const fetchVaccinationDocuments = async () => {
    try {
      if (!isAuthenticated || !user) return;
      const employeeRefId = user.employeeRefId || user.id;
      const documents = await HealthRecordsAPI.GetVaccinationDocumentDetails(employeeRefId);
      setVaccinationDocuments(documents);
    } catch (error) {
      console.error("Error in fetchVaccinationDocuments:", error);
    }
  };

  // Fetch hospitalization documents
  const fetchHospitalizationDocuments = async () => {
    try {
      if (!isAuthenticated || !user) return;
      const employeeRefId = user.employeeRefId || user.id;
      const documents = await HealthRecordsAPI.GetHospitalizationDocumentDetails(employeeRefId);
      setHospitalizationDocuments(documents);
    } catch (error) {
      console.error("Error in fetchHospitalizationDocuments:", error);
    }
  };

  // Fetch dependants (Removed as it was using mock data and relationships API is used instead)
  /* 
  const fetchDependants = async () => {
     // Removed
  };
  */

  // ==================== EVENT HANDLERS ====================

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "person") {
      const displayName = getDisplayName();
      const updatedData = {
        ...formData,
        [name]: value,
        recordFor: value === "self" ? displayName : "",
        relationshipId: value === "self" ? "" : formData.relationshipId,
        relationshipPersonId: value === "self" ? "" : formData.relationshipPersonId,
        name: value === "self" ? displayName : formData.name,
        relation: value === "self" ? "Self" : formData.relation
      };
      setFormData(updatedData);

      // Clear relationship validation errors when switching to self
      if (value === "self") {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.relationshipId;
          delete newErrors.relationshipPersonId;
          return newErrors;
        });
      }
    } else if (name === "relationshipId") {
      // Clear dependent person when relationship changes
      const updatedData = {
        ...formData,
        [name]: value,
        relationshipPersonId: "",
        name: "",
        relation: "",
        recordFor: ""
      };
      setFormData(updatedData);

      // Clear relationship person error
      if (validationErrors.relationshipPersonId) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.relationshipPersonId;
          return newErrors;
        });
      }
    } else if (name === "relationshipPersonId") {
      const selectedPerson = relationshipPersons.find(
        person => person.EmployeeDependentDetailsId.toString() === value
      );

      const updatedData = {
        ...formData,
        [name]: value,
        name: selectedPerson ? selectedPerson.DependentName : "",
        relation: selectedPerson ? selectedPerson.DependentName || "" : "",
        recordFor: selectedPerson ? selectedPerson.DependentName : ""
      };
      setFormData(updatedData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle filter changes - automatically apply filters
  const handleFilterChange = (name: string, value: string) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);

    // Automatically apply filters after a short delay to allow for typing
    setTimeout(() => {
      applyFiltersWithValues(newFilters);
    }, 300);
  };

  // Apply filters with specific filter values
  const applyFiltersWithValues = async (filterValues: typeof filters) => {
    try {
      setFilterLoading(true);

      const employeeRefId = user?.employeeRefId || user?.id?.toString() || "0";

      const filterData = {
        FromDate: filterValues.date,
        ToDate: filterValues.date,
        CaseForOption: filterValues.caseForOption,
        SearchKeyword: filterValues.doctorName,
        EmployeeRefid: employeeRefId
      };

      // If all filters are empty, just reset to show all records
      if (!filterValues.date && !filterValues.caseForOption && !filterValues.doctorName) {
        switch (activeTab) {
          case "Prescription & Lab Tests":
            setRecords(allRecords);
            break;
          case "Hospitalizations":
            setHospitalizationRecords(allHospitalizationRecords);
            break;
          case "Medical Bills":
            setMedicalBillRecords(allMedicalBillRecords);
            break;
          case "Vaccinations Certificates":
            setVaccinationRecords(allVaccinationRecords);
            break;
        }
        setFilterLoading(false);
        return;
      }

      let response: any;

      switch (activeTab) {
        case "Prescription & Lab Tests":
          response = await HealthRecordsAPI.GetFilteredTestReports(filterData);

          let filteredData: any[] = [];

          if (Array.isArray(response)) {
            filteredData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            filteredData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            filteredData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              filteredData = response[arrayKeys[0]];
            } else {
              filteredData = [];
            }
          } else {
            filteredData = [];
          }

          if (filteredData.length > 0) {
            const parameters = await HealthRecordsAPI.CRMGetCustomerTestReportParameterDetails(employeeRefId);

            const mappedRecords: HealthRecord[] = filteredData.map((item: any) => {
              const recordParameters = parameters.filter(param => param.TR_id === item.TR_id);

              const labParameters: LabParameter[] = recordParameters.map((param: any) => ({
                parameterName: param.ParameterName || '',
                result: param.Result || '',
                unit: param.ResultType || param.StartRangeType || '',
                startRange: param.StartRange || '',
                endRange: param.EndRange || ''
              }));

              const relation = item.RelationType === 1 ? "Self" :
                item.RelationType === 2 ? "Dependent" :
                  item.Relation || "Self";

              return {
                id: item.TR_id,
                name: item.Record_for,
                relation: relation,
                type: item.Type_of_Record,
                recordName: item.RecordName,
                doctor: item.Record_Doctor_Name,
                recordDate: item.Record_date,
                notes: item.Additional_Notes,
                employeeRefId: item.EmployeeRefId,
                specialization: item.OtherRecordName || item.DoctorSpecialization || undefined,
                uploadedDocName: item.UplordDocName,
                uploadedDocPath: item.UplordDocPath,
                createdOn: item.CreatedOn,
                updatedOn: item.UpdatedOn,
                typeOfRecord: item.Type_of_Record,
                labParameters: labParameters,
              };
            });

            setRecords(mappedRecords);
          } else {
            setRecords([]);
          }
          break;

        case "Hospitalizations":
          response = await HealthRecordsAPI.GetFilteredHospitalizations(filterData);

          let hospitalizationData: any[] = [];

          if (Array.isArray(response)) {
            hospitalizationData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            hospitalizationData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            hospitalizationData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              hospitalizationData = response[arrayKeys[0]];
            } else {
              hospitalizationData = [];
            }
          }

          const mappedHospitalizations = hospitalizationData.map((item: any) => ({
            id: item.H_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            doctor: item.Record_Doctor_Name,
            hospital: item.Record_Hospital_Name,
            type: item.Type_of_Record,
            notes: item.Additional_Notes,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setHospitalizationRecords(mappedHospitalizations);
          break;

        case "Medical Bills":
          response = await HealthRecordsAPI.GetFilteredMedicalBills(filterData);

          let medicalBillData: any[] = [];

          if (Array.isArray(response)) {
            medicalBillData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            medicalBillData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            medicalBillData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              medicalBillData = response[arrayKeys[0]];
            } else {
              medicalBillData = [];
            }
          }

          const mappedMedicalBills = medicalBillData.map((item: any) => ({
            id: item.MB_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            billNumber: item.Record_Bill_Number,
            hospital: item.Record_Hospital_Name,
            type: item.Type_of_Record,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setMedicalBillRecords(mappedMedicalBills);
          break;

        case "Vaccinations Certificates":
          response = await HealthRecordsAPI.GetFilteredVaccinations(filterData);

          let vaccinationData: any[] = [];

          if (Array.isArray(response)) {
            vaccinationData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            vaccinationData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            vaccinationData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              vaccinationData = response[arrayKeys[0]];
            } else {
              vaccinationData = [];
            }
          }

          const mappedVaccinations = vaccinationData.map((item: any) => ({
            id: item.V_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            vaccinationDose: item.Vaccination_dose,
            vaccinationCenter: item.Vaccination_center,
            registrationId: item.Registration_id,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setVaccinationRecords(mappedVaccinations);
          break;

        default:
          return;
      }

    } catch (error: any) {
      console.error("Error applying filters:", error);
      // Fallback to client-side filtering
      applyClientSideFiltersWithValues(filterValues);
    } finally {
      setFilterLoading(false);
    }
  };

  // Client-side filtering with specific filter values
  const applyClientSideFiltersWithValues = (filterValues: typeof filters) => {
    const filterRecords = (records: any[]) => {
      return records.filter(record => {
        if (filterValues.doctorName) {
          const searchTerm = filterValues.doctorName.toLowerCase();
          const doctorName = (record.doctor || record.recordDoctorName || record.doctor_name || '').toString().toLowerCase();
          const recordName = (record.recordName || record.RecordName || record.vaccinationName || '').toString().toLowerCase();
          const hospitalName = (record.hospital || record.hospital_name || record.Record_Hospital_Name || record.vaccinationCenter || '').toString().toLowerCase();
          const patientName = (record.name || record.recordFor || record.patient_name || '').toString().toLowerCase();

          if (!doctorName.includes(searchTerm) &&
            !recordName.includes(searchTerm) &&
            !hospitalName.includes(searchTerm) &&
            !patientName.includes(searchTerm)) {
            return false;
          }
        }

        if (filterValues.date) {
          const rawDate = record.recordDate || record.vaccinationDate || record.admitted_date || '';
          if (rawDate) {
            let dateObjStr: string = '';
            if (rawDate.includes('-')) {
              const parts = rawDate.split('-');
              if (parts[0].length === 4) {
                dateObjStr = rawDate;
              } else {
                dateObjStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            }

            if (dateObjStr && dateObjStr === filterValues.date) {
              // Match found
            } else if (dateObjStr) {
              return false;
            }
          } else {
            return false;
          }
        }

        if (filterValues.caseForOption) {
          const relation = (record.relation || "").toString().toLowerCase();
          const isDependent = relation === "dependent" || relation === "dependant";

          if (filterValues.caseForOption === "1" && relation !== "self") {
            return false;
          }
          if (filterValues.caseForOption === "2" && !isDependent) {
            return false;
          }
        }

        return true;
      });
    };

    switch (activeTab) {
      case "Prescription & Lab Tests":
        setRecords(filterRecords(allRecords));
        break;
      case "Hospitalizations":
        setHospitalizationRecords(filterRecords(allHospitalizationRecords));
        break;
      case "Medical Bills":
        setMedicalBillRecords(filterRecords(allMedicalBillRecords));
        break;
      case "Vaccinations Certificates":
        setVaccinationRecords(filterRecords(allVaccinationRecords));
        break;
    }
  };

  // Handle lab parameter changes
  const handleLabParameterChange = (index: number, field: keyof LabParameter, value: string) => {
    // Clear validation errors for this parameter
    const paramErrorKey = `labResult_${index}`;
    const nameErrorKey = `labParamName_${index}`;

    if (validationErrors[paramErrorKey] || validationErrors[nameErrorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramErrorKey];
        delete newErrors[nameErrorKey];
        return newErrors;
      });
    }

    const updatedParams = [...labParameters];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: value
    };
    setLabParameters(updatedParams);
  };

  // Add new lab parameter
  const addLabParameter = () => {
    setLabParameters(prev => [
      ...prev,
      createLabParameter()
    ]);
  };

  // Remove lab parameter
  const removeLabParameter = (index: number) => {
    if (labParameters.length > 1) {
      const updatedParams = labParameters.filter((_, i) => i !== index);
      setLabParameters(updatedParams);

      // Clear any validation errors for the removed parameter
      const paramErrorKey = `labResult_${index}`;
      const nameErrorKey = `labParamName_${index}`;

      if (validationErrors[paramErrorKey] || validationErrors[nameErrorKey]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[paramErrorKey];
          delete newErrors[nameErrorKey];
          return newErrors;
        });
      }
    }
  };

  // Handle file upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing document (local state only)
  const handleRemoveExistingDocument = (docId: string) => {
    setDocumentsToRemove(prev => [...prev, docId]);
    setExistingDocuments(prev => prev.filter(doc => doc.UplordDocName !== docId && doc.DocumentName !== docId));
  };

  // Restore removed document
  const handleRestoreDocument = (docId: string) => {
    setDocumentsToRemove(prev => prev.filter(id => id !== docId));
  };

  // Reset all document states
  const resetDocumentStates = () => {
    setUploadedFiles([]);
    setExistingDocuments([]);
    setDocumentsToRemove([]);
  };

  // Open document in new tab
  // Open document in new tab (Legacy handler rename or remove if unused, keeping for safety)
  const handleOpenExistingDocument = (document: any) => {
    handleViewDocument(document);
  };

  // Delete document from server
  const handleDeleteDocument = async (documentId: number, documentType: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this document?")) {
        return;
      }

      // Check if we are deleting a prescription document
      if (documentType === 'TEST_REPORT') {
        // Since the new API doesn't have a specific delete-document endpoint and uses update with keep_documents,
        // we might not be able to delete securely without the parent record ID.
        // However, if we assume this is called from a context where we might know the record... 
        // But we don't. 

        // If this function is only called from the "View Documents" modal where we might have strict access...
        // Let's look at where it is called.

        // If we are strictly failing on 404, we should temporarily handle it gracefully or try the legacy path only for others.

        // For now, let's catch the 404 and show a more helpful message or try to use the legacy endpoint only if not prescription.
        // But "TEST_REPORT" maps to prescription documents in our new logic.

        toast.error("Document deletion involves updating the record. Please Edit the record to remove documents.");
        return;
      }

      const result = await HealthRecordsAPI.CRMDeleteHealthDocument(documentId, documentType);

      if (result && result.Message && result.Message.includes("Successfully")) {
        toast.success("Document deleted successfully!");

        // Refresh the appropriate documents based on type
        switch (documentType) {
          case "TEST_REPORT":
            // fetchTestReportDocuments(); // No longer needed as we rely on record details
            fetchHealthRecords(); // Refresh main list to update document counts/links
            break;
          case "HOSPITALIZATION":
            fetchHospitalizationDocuments();
            break;
          case "MEDICAL_BILL":
            fetchMedicalBillDocuments();
            break;
          case "VACCINATION":
            fetchVaccinationDocuments();
            break;
          default:
            break;
        }
      } else {
        throw new Error(result?.Message || "Failed to delete document");
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete document: ${error.message || "Please try again"}`);
    }
  };

  // Save test details
  // Save test details
  const handleSaveTestDetails = async () => {
    try {
      if (!validateForm()) {
        toast.error("Please fill all required fields correctly");
        return;
      }

      setLoading(true);

      const payload: any = {
        record_date: getDateInputValue(formData.recordDate),
        record_type: formData.typeOfRecord === 'Medical Report' ? 'lab_test' : 'prescription',
        record_name: formData.recordName,
        doctor_name: formData.recordDoctorName,
        doctor_specialization: formData.doctorSpecialization ? parseInt(formData.doctorSpecialization) : null,
        reason: formData.reasonForConsultation || formData.additionalNotes,
        for_whom: formData.person,
        dependant: formData.person === 'dependant' ? parseInt(formData.relationshipPersonId) : undefined,
        parameters: labParameters
          .filter(p => p.parameterName.trim())
          .map(p => ({
            parameter_name: p.parameterName,
            result: p.result,
            unit: p.unit
          }))
      };

      // Handle documents to keep during update
      if (isEditing && existingDocuments.length > 0) {
        const documentsToKeep = existingDocuments
          .filter(doc => {
            const docName = doc.UplordDocName || doc.DocumentName || (doc.file ? doc.file.split('/').pop() : '');
            return docName && !documentsToRemove.includes(docName);
          })
          .map(doc => doc.id || doc.TR_DocumentId); // Ensure we get the ID correctly

        if (documentsToKeep.length > 0) {
          payload.keep_documents = documentsToKeep;
        }
      }

      let response;
      if (isEditing && editingRecordId) {
        response = await HealthRecordsAPI.updatePrescription(editingRecordId, payload, uploadedFiles);
      } else {
        response = await HealthRecordsAPI.createPrescription(payload, uploadedFiles);
      }

      if (response) {
        resetForm();
        resetValidation();
        resetDocumentStates();
        setIsAddingRecord(false);
        setShowLabParameters(false);
        setIsEditing(false);
        setEditingRecordId(null);
        fetchHealthRecords(); // This will also update documents

        toast.success(
          isEditing
            ? "Prescription & Lab Test updated successfully!"
            : "Prescription & Lab Test saved successfully!"
        );
      }
    } catch (error: any) {
      console.error("Error saving health record:", error);
      toast.error(`Error saving health record: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Save hospitalization details
  const handleSaveHospitalizationDetails = async () => {
    try {
      if (!validateForm()) {
        toast.error("Please fill all required fields correctly");
        return;
      }

      setLoading(true);

      const payload: any = {
        hospitalization_type: formData.typeOfRecord,
        record_name: formData.recordName,
        hospital_name: formData.hospitalName,
        admitted_date: getDateInputValue(formData.recordDate),
        discharged_date: getDateInputValue(formData.recordDate), // Fallback since UI lacks this field
        doctor_name: formData.recordDoctorName,
        notes: formData.additionalNotes || "",
        for_whom: formData.person,
        dependant: formData.person === 'dependant' ? parseInt(formData.relationshipPersonId) : undefined
      };

      // Add keep_documents for update scenario
      if (isEditing && existingDocuments.length > 0) {
        // Filter out documents marked for removal
        const documentsToKeep = existingDocuments
          .filter(doc => {
            const docName = doc.UplordDocName || doc.DocumentName;
            return !documentsToRemove.includes(docName);
          })
          .map(doc => doc.id || doc.H_id); // Ensure we get the ID

        payload.keep_documents = documentsToKeep;
      }

      let response;
      if (isEditing && editingRecordId) {
        response = await HealthRecordsAPI.updateHospitalization(editingRecordId, payload, uploadedFiles);
      } else {
        response = await HealthRecordsAPI.createHospitalization(payload, uploadedFiles);
      }

      if (response) {
        resetForm();
        resetValidation();
        resetDocumentStates();
        setIsAddingRecord(false);
        setIsEditing(false);
        setEditingRecordId(null);

        // Refresh data
        if (typeof fetchHospitalizationDetails === 'function') {
          await fetchHospitalizationDetails();
        }
        await fetchHospitalizationDocuments();

        toast.success(isEditing ? "Hospitalization record updated successfully!" : "Hospitalization record saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving hospitalization record:", error);
      toast.error(`Error: ${error.message || "Failed to save hospitalization record"}`);
    } finally {
      setLoading(false);
    }
  };

  // Save medical bill details
  const handleSaveMedicalBillDetails = async () => {
    try {
      if (!validateForm()) {
        toast.error("Please fill all required fields correctly");
        return;
      }

      const payload: any = {
        for_whom: formData.person,
        bill_type: formData.typeOfRecord,
        record_name: formData.recordName,
        record_date: getDateInputValue(formData.recordDate),
        record_bill_number: formData.billNumber,
        record_hospital_name: formData.hospitalName,
        notes: formData.additionalNotes,
        dependant: formData.person === 'dependant' ? parseInt(formData.relationshipPersonId) : undefined,
      };

      if (isEditing && existingDocuments.length > 0) {
        const documentsToKeep = existingDocuments
          .filter(doc => {
            const docName = doc.UplordDocName || doc.DocumentName || (doc.file ? doc.file.split('/').pop() : '');
            return docName && !documentsToRemove.includes(docName);
          })
          .map(doc => doc.id); // Ensure ID is used

        if (documentsToKeep.length > 0) {
          payload.keep_documents = documentsToKeep;
        }
      }

      let response;
      if (isEditing && editingRecordId) {
        response = await HealthRecordsAPI.updateMedicalBill(editingRecordId, payload, uploadedFiles);
      } else {
        response = await HealthRecordsAPI.createMedicalBill(payload, uploadedFiles);
      }

      if (response) {
        resetForm();
        resetValidation();
        resetDocumentStates();
        setIsAddingRecord(false);
        setIsEditing(false);
        setEditingRecordId(null);
        fetchMedicalBillDetails();
        toast.success(isEditing ? "Medical bill record updated successfully!" : "Medical bill record saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving medical bill record:", error);
      toast.error(`Error saving medical bill record: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Save vaccination details
  const handleSaveVaccinationDetails = async () => {
    try {
      if (!validateForm()) {
        toast.error("Please fill all required fields correctly");
        return;
      }

      setLoading(true);

      const formDataToSubmit = new FormData();
      const loginRefId = user?.id?.toString() || "0";
      const employeeRefId = user?.employeeRefId || user?.id?.toString() || "0";

      if (isEditing && editingRecordId) {
        formDataToSubmit.append("V_id", editingRecordId.toString());
      } else {
        formDataToSubmit.append("V_id", "0");
      }

      formDataToSubmit.append("Record_for", formData.recordFor);
      formDataToSubmit.append("Record_date", formData.recordDate);
      formDataToSubmit.append(
        "RecordName",
        formData.recordName
      );

      formDataToSubmit.append("Vaccination_dose", formData.vaccinationDose);
      formDataToSubmit.append("Vaccination_center", formData.vaccinationCenter);
      formDataToSubmit.append("Registration_id", formData.registrationId || "");
      formDataToSubmit.append("UploadDocName", "");
      formDataToSubmit.append("UploadDocPath", "");
      formDataToSubmit.append("EmployeeRefId", employeeRefId);
      formDataToSubmit.append("RelationType", formData.person === "self" ? "1" : "2");

      // Add relationship and dependent info if dependant
      if (formData.person === "dependant") {
        formDataToSubmit.append("RelationshipId", formData.relationshipId || "0");
        formDataToSubmit.append("EmployeeDependentDetailsId", formData.relationshipPersonId || "0");
      } else {
        formDataToSubmit.append("RelationshipId", "0");
        formDataToSubmit.append("EmployeeDependentDetailsId", "0");
      }

      const payload: any = {
        for_whom: formData.person,
        vaccination_date: getDateInputValue(formData.recordDate),
        vaccination_name: formData.recordName,
        vaccination_dose: formData.vaccinationDose,
        vaccination_center: formData.vaccinationCenter,
        registration_id: formData.registrationId,
        notes: formData.additionalNotes,
        dependant: formData.person === 'dependant' ? parseInt(formData.relationshipPersonId) : undefined,
      };

      if (isEditing && existingDocuments.length > 0) {
        const documentsToKeep = existingDocuments
          .filter(doc => {
            const docName = doc.UplordDocName || doc.DocumentName || (doc.file ? doc.file.split('/').pop() : '');
            return docName && !documentsToRemove.includes(docName);
          })
          .map(doc => doc.id);

        if (documentsToKeep.length > 0) {
          payload.keep_documents = documentsToKeep;
        }
      }

      let response;
      if (isEditing && editingRecordId) {
        response = await HealthRecordsAPI.updateVaccinationCertificate(editingRecordId, payload, uploadedFiles);
      } else {
        response = await HealthRecordsAPI.createVaccinationCertificate(payload, uploadedFiles);
      }

      if (response) {
        resetForm();
        resetValidation();
        resetDocumentStates();
        setIsAddingRecord(false);
        setIsEditing(false);
        setEditingRecordId(null);
        fetchVaccinationDetails();
        toast.success(isEditing ? "Vaccination record updated successfully!" : "Vaccination record saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving vaccination record:", error);
      toast.error(`Error saving vaccination record: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    const displayName = getDisplayName();
    const currentDate = getCurrentDateInDDMMYYYY();
    setFormData({
      person: "self",
      recordFor: displayName,
      recordDate: currentDate,
      recordName: "",
      typeOfRecord: "",
      recordDoctorName: "",
      doctorSpecialization: "",
      reasonForConsultation: "",
      hospitalName: "",
      additionalNotes: "",
      billNumber: "",
      vaccinationDose: "",
      vaccinationCenter: "",
      registrationId: "",
      relationshipId: "",
      relationshipPersonId: "",
      name: "",
      relation: ""
    });
    setLabParameters([createLabParameter()]);
    resetDocumentStates();
    setIsEditing(false);
    setEditingRecordId(null);
    setEditingRecordType('');
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      date: '',
      caseForOption: '',
      doctorName: ''
    });
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setFilterLoading(true);

      const employeeRefId = user?.employeeRefId || user?.id?.toString() || "0";

      const filterData = {
        FromDate: filters.date,
        ToDate: filters.date,
        CaseForOption: filters.caseForOption,
        SearchKeyword: filters.doctorName,
        EmployeeRefid: employeeRefId
      };

      let response: any;

      switch (activeTab) {
        case "Prescription & Lab Tests":
          response = await HealthRecordsAPI.GetFilteredTestReports(filterData);

          let filteredData: any[] = [];

          if (Array.isArray(response)) {
            filteredData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            filteredData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            filteredData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              filteredData = response[arrayKeys[0]];
            } else {
              filteredData = [];
            }
          } else {
            filteredData = [];
          }

          if (filteredData.length > 0) {
            const parameters = await HealthRecordsAPI.CRMGetCustomerTestReportParameterDetails(employeeRefId);

            const mappedRecords: HealthRecord[] = filteredData.map((item: any) => {
              const recordParameters = parameters.filter(param => param.TR_id === item.TR_id);

              const labParameters: LabParameter[] = recordParameters.map((param: any) => ({
                parameterName: param.ParameterName || '',
                result: param.Result || '',
                unit: param.ResultType || param.StartRangeType || '',
                startRange: param.StartRange || '',
                endRange: param.EndRange || ''
              }));

              const relation = item.RelationType === 1 ? "Self" :
                item.RelationType === 2 ? "Dependent" :
                  item.Relation || "Self";

              return {
                id: item.TR_id,
                name: item.Record_for,
                relation: relation,
                type: item.Type_of_Record,
                recordName: item.RecordName,
                doctor: item.Record_Doctor_Name,
                recordDate: item.Record_date,
                notes: item.Additional_Notes,
                employeeRefId: item.EmployeeRefId,
                specialization: item.OtherRecordName || item.DoctorSpecialization || undefined,
                uploadedDocName: item.UplordDocName,
                uploadedDocPath: item.UplordDocPath,
                createdOn: item.CreatedOn,
                updatedOn: item.UpdatedOn,
                typeOfRecord: item.Type_of_Record,
                labParameters: labParameters,
              };
            });

            setRecords(mappedRecords);
          } else {
            setRecords([]);
          }
          break;

        case "Hospitalizations":
          response = await HealthRecordsAPI.GetFilteredHospitalizations(filterData);

          let hospitalizationData: any[] = [];

          if (Array.isArray(response)) {
            hospitalizationData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            hospitalizationData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            hospitalizationData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              hospitalizationData = response[arrayKeys[0]];
            } else {
              hospitalizationData = [];
            }
          }

          const mappedHospitalizations = hospitalizationData.map((item: any) => ({
            id: item.H_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            doctor: item.Record_Doctor_Name,
            hospital: item.Record_Hospital_Name,
            type: item.Type_of_Record,
            notes: item.Additional_Notes,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setHospitalizationRecords(mappedHospitalizations);
          break;

        case "Medical Bills":
          response = await HealthRecordsAPI.GetFilteredMedicalBills(filterData);

          let medicalBillData: any[] = [];

          if (Array.isArray(response)) {
            medicalBillData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            medicalBillData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            medicalBillData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              medicalBillData = response[arrayKeys[0]];
            } else {
              medicalBillData = [];
            }
          }

          const mappedMedicalBills = medicalBillData.map((item: any) => ({
            id: item.MB_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            billNumber: item.Record_Bill_Number,
            hospital: item.Record_Hospital_Name,
            type: item.Type_of_Record,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setMedicalBillRecords(mappedMedicalBills);
          break;

        case "Vaccinations Certificates":
          response = await HealthRecordsAPI.GetFilteredVaccinations(filterData);

          let vaccinationData: any[] = [];

          if (Array.isArray(response)) {
            vaccinationData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            vaccinationData = response.data;
          } else if (response && response.records && Array.isArray(response.records)) {
            vaccinationData = response.records;
          } else if (response && typeof response === 'object') {
            const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
            if (arrayKeys.length > 0) {
              vaccinationData = response[arrayKeys[0]];
            } else {
              vaccinationData = [];
            }
          }

          const mappedVaccinations = vaccinationData.map((item: any) => ({
            id: item.V_id,
            recordFor: item.Record_for,
            recordDate: item.Record_date,
            recordName: item.RecordName,
            vaccinationDose: item.Vaccination_dose,
            vaccinationCenter: item.Vaccination_center,
            registrationId: item.Registration_id,
            docName: item.UplordDocName,
            docPath: item.UplordDocPath,
            employeeRefId: item.EmployeeRefId,
            relation: item.RelationType === 1 ? "Self" :
              item.RelationType === 2 ? "Dependant" :
                item.Relation || "Self",
            createdOn: item.CreatedOn,
            updatedOn: item.UpdatedOn,
          }));

          setVaccinationRecords(mappedVaccinations);
          break;

        default:
          return;
      }

    } catch (error: any) {
      console.error("Error applying filters:", error);
      toast.error(`Error applying filters: ${error.message || "Please try again"}`);

      applyClientSideFilters();
    } finally {
      setFilterLoading(false);
    }
  };

  // Client-side filtering fallback
  const filterRecordsClientSide = (records: any[]) => {
    return records.filter(record => {
      // 1. Search Filter (checks multiple fields)
      if (filters.doctorName) {
        const searchTerm = filters.doctorName.toLowerCase();
        const doctorName = (record.doctor || record.recordDoctorName || record.doctor_name || '').toString().toLowerCase();
        const recordName = (record.recordName || record.RecordName || record.vaccinationName || '').toString().toLowerCase();
        const hospitalName = (record.hospital || record.hospital_name || record.Record_Hospital_Name || record.vaccinationCenter || '').toString().toLowerCase();
        const patientName = (record.name || record.recordFor || record.patient_name || '').toString().toLowerCase();

        if (!doctorName.includes(searchTerm) &&
          !recordName.includes(searchTerm) &&
          !hospitalName.includes(searchTerm) &&
          !patientName.includes(searchTerm)) {
          return false;
        }
      }

      // 2. Date Filter (Exact match)
      if (filters.date) {
        const rawDate = record.recordDate || record.vaccinationDate || record.admitted_date || '';
        if (rawDate) {
          // Attempt to parse date consistently (expects YYYY-MM-DD or DD-MM-YYYY)
          let dateObjStr: string = '';
          if (rawDate.includes('-')) {
            const parts = rawDate.split('-');
            if (parts[0].length === 4) { // YYYY-MM-DD
              dateObjStr = rawDate;
            } else { // DD-MM-YYYY
              dateObjStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          if (dateObjStr && dateObjStr === filters.date) {
            // Match found
          } else if (dateObjStr) {
            return false;
          }
        } else {
          return false;
        }
      }

      // 3. Self/Dependent Filter
      if (filters.caseForOption) {
        const relation = (record.relation || "").toString().toLowerCase();
        // Handle both spellings for reliability
        const isDependent = relation === "dependent" || relation === "dependant";

        if (filters.caseForOption === "1" && relation !== "self") {
          return false;
        }
        if (filters.caseForOption === "2" && !isDependent) {
          return false;
        }
      }

      return true;
    });
  };

  // Apply client-side filters
  const applyClientSideFilters = () => {
    switch (activeTab) {
      case "Prescription & Lab Tests":
        const filteredTestReports = filterRecordsClientSide(allRecords);
        setRecords(filteredTestReports);
        toast.success(`Found ${filteredTestReports.length} record(s)`);
        break;
      case "Hospitalizations":
        const filteredHospitalizations = filterRecordsClientSide(allHospitalizationRecords);
        setHospitalizationRecords(filteredHospitalizations);
        toast.success(`Found ${filteredHospitalizations.length} record(s)`);
        break;
      case "Medical Bills":
        const filteredMedicalBills = filterRecordsClientSide(allMedicalBillRecords);
        setMedicalBillRecords(filteredMedicalBills);
        toast.success(`Found ${filteredMedicalBills.length} record(s)`);
        break;
      case "Vaccinations Certificates":
        const filteredVaccinations = filterRecordsClientSide(allVaccinationRecords);
        setVaccinationRecords(filteredVaccinations);
        toast.success(`Found ${filteredVaccinations.length} record(s)`);
        break;
      default:
        break;
    }
  };

  // Clear filters
  const clearFilters = async () => {
    try {
      setFilterLoading(true);
      resetFilters();

      switch (activeTab) {
        case "Prescription & Lab Tests":
          setRecords(allRecords);
          break;
        case "Hospitalizations":
          setHospitalizationRecords(allHospitalizationRecords);
          break;
        case "Medical Bills":
          setMedicalBillRecords(allMedicalBillRecords);
          break;
        case "Vaccinations Certificates":
          setVaccinationRecords(allVaccinationRecords);
          break;
        default:
          break;
      }

      toast.success("Filters cleared");
    } catch (error) {
      console.error("Error clearing filters:", error);
      toast.error("Error clearing filters");
    } finally {
      setFilterLoading(false);
    }
  };

  // Update health metric
  const updateHealthMetric = async (index: number, newValue: string) => {
    try {
      if (!isAuthenticated || !user) return;

      const vital = vitals[index];
      let response;

      const numericValue = parseFloat(newValue.replace(/[^\d.]/g, '')) || 0;
      const unitLabel = newValue.replace(/[\d.\s]/g, '').trim();

      const getChoiceValue = (categoryKeywords: string[], label: string, defaultVal: string) => {
        const targetLabel = (label || defaultVal).toString().trim();

        if (healthChoices && typeof healthChoices === 'object') {
          // Flatten if data is nested inside a 'data' property
          const choicesData = healthChoices.data && typeof healthChoices.data === 'object' && !Array.isArray(healthChoices.data)
            ? healthChoices.data
            : healthChoices;

          // Try to find a category that matches any of the keywords
          const categoryKey = Object.keys(choicesData).find(key =>
            categoryKeywords.some(kw => key.toLowerCase().includes(kw))
          );

          if (categoryKey) {
            const categoryData = choicesData[categoryKey];

            if (Array.isArray(categoryData)) {
              const choice = categoryData.find((c: any) =>
                (c.label && String(c.label).toLowerCase() === targetLabel.toLowerCase()) ||
                (c.name && String(c.name).toLowerCase() === targetLabel.toLowerCase()) ||
                (c.display && String(c.display).toLowerCase() === targetLabel.toLowerCase()) ||
                (c.value && String(c.value).toLowerCase() === targetLabel.toLowerCase()) ||
                (c.id && String(c.id).toLowerCase() === targetLabel.toLowerCase())
              );
              if (choice) return choice.value || choice.id || choice.label;
            } else if (categoryData && typeof categoryData === 'object') {
              // Handle mapping object like { "cm": "Centimeters" }
              const entry = Object.entries(categoryData).find(([k, v]) =>
                k.toLowerCase() === targetLabel.toLowerCase() ||
                String(v).toLowerCase() === targetLabel.toLowerCase()
              );
              if (entry) return entry[0];
            } else if (typeof categoryData === 'string' && categoryData.toLowerCase() === targetLabel.toLowerCase()) {
              return categoryData;
            }
          }
        }

        // Fallback to lowercase string which is common for Django choice slugs
        return targetLabel.toLowerCase();
      };

      switch (vital.name) {
        case "Height":
          response = await HealthRecordsAPI.createHeight({
            value: numericValue,
            unit: getChoiceValue(['unit', 'height'], unitLabel || "cm", "cm")
          });
          break;

        case "Weight":
          response = await HealthRecordsAPI.createWeight({
            value: numericValue,
            unit: getChoiceValue(['unit', 'weight'], unitLabel || "kg", "kg")
          });
          break;

        case "BMI":
          response = await HealthRecordsAPI.createBMI({ value: numericValue });
          break;

        case "Blood Pressure":
          const [systolic, diastolic] = newValue.split('/').map(v => parseFloat(v) || 0);
          const bpUnitLabel = newValue.split(' ').pop() || "mmHg";
          response = await HealthRecordsAPI.createBloodPressure({
            systolic: systolic || 0,
            diastolic: diastolic || 0,
            unit: getChoiceValue(['unit', 'bp', 'blood_pressure'], bpUnitLabel || "mmHg", "mmHg"),
            type: getChoiceValue(['type', 'bp', 'blood_pressure'], "Exercise", "exercise")
          });
          break;

        case "Heart Rate":
          response = await HealthRecordsAPI.createHeartRate({
            value: numericValue,
            unit: getChoiceValue(['unit', 'heart'], unitLabel || "bpm", "bpm")
          });
          break;

        case "O2 Saturation":
          response = await HealthRecordsAPI.createO2Saturation({
            value: numericValue,
            unit: getChoiceValue(['unit', 'oxygen', 'o2'], unitLabel || "%", "%")
          });
          break;

        case "Glucose":
          response = await HealthRecordsAPI.createGlucose({
            value: numericValue,
            unit: getChoiceValue(['unit', 'glucose'], unitLabel || "mg/dL", "mg/dL"),
            test_type: getChoiceValue(['test_type', 'glucose'], "Random", "random")
          });
          break;

        default:
          console.warn(`Unknown metric: ${vital.name}`);
          return;
      }

      await fetchHealthMetrics();
      toast.success(`${vital.name} updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${vitals[index].name}:`, error);
      toast.error(`Error updating ${vitals[index].name}. Please try again.`);
    }
  };

  // Handle edit vital
  // Update handleEdit function
  const handleEdit = (index: number) => {
    const vital = vitals[index];

    // Extract just the numeric value (remove unit)
    const numericValue = vital.value.split(' ')[0];

    setEditingIndex(index);
    setEditedValue(numericValue);
  };

  // Handle save vital
  const handleSave = async (index: number) => {
    try {
      const vital = vitals[index];
      let valueToSave = editedValue;

      // Special handling for Blood Pressure as it's not a single numeric value
      if (vital.name === "Blood Pressure") {
        const originalUnit = vital.value.split(' ').pop() || "mmHg";
        valueToSave = `${editedValue} ${originalUnit}`;
      } else {
        // Extract numeric value for other vitals
        const numericValue = parseFloat(editedValue) || 0;

        if (vital.name === "Height") {
          valueToSave = `${numericValue} ${unitToggle.height}`;
        } else if (vital.name === "Weight") {
          valueToSave = `${numericValue} ${unitToggle.weight}`;
        } else {
          // For other vitals (Heart Rate, O2, Glucose), append original unit
          const originalUnit = vital.value.split(' ').pop() || "";
          valueToSave = `${numericValue} ${originalUnit}`;
        }
      }

      await updateHealthMetric(index, valueToSave);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedValue("");
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter((file) =>
        ["image/jpeg", "image/jpg", "image/png", "application/pdf"].includes(file.type)
      );
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Show history modal
  const handleShowHistory = async (index: number) => {
    try {
      setHistoryLoading(true);
      const vital = vitals[index];
      setSelectedVitalHistory(vital);
      setSelectedMetricType(vital.name);

      const employeeRefId = user?.employeeRefId || user?.id;
      if (!employeeRefId) return;

      let historyResponse;

      switch (vital.name) {
        case "Height":
          historyResponse = await HealthRecordsAPI.listHeightHistory();
          break;
        case "Weight":
          historyResponse = await HealthRecordsAPI.listWeightHistory();
          break;
        case "BMI":
          historyResponse = await HealthRecordsAPI.listBMIHistory();
          break;
        case "Blood Pressure":
          historyResponse = await HealthRecordsAPI.listBloodPressureHistory();
          break;
        case "Heart Rate":
          historyResponse = await HealthRecordsAPI.listHeartRateHistory();
          break;
        case "O2 Saturation":
          historyResponse = await HealthRecordsAPI.listO2SaturationHistory();
          break;
        case "Glucose":
          historyResponse = await HealthRecordsAPI.listGlucoseHistory();
          break;
        default:
          historyResponse = [];
      }

      const transformedData = transformHistoryData(historyResponse as any[], vital.name);
      setHistoryData(transformedData);
      setCurrentHistoryPage(1);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history data");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Transform history data
  const transformHistoryData = (data: any[], metricType: string) => {
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      let value = '';
      let createdOn = '';
      let createdBy = '';

      switch (metricType) {
        case "Height":
          value = item.value ? `${item.value} ${item.unit || "cm"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "Weight":
          value = item.value ? `${item.value} ${item.unit || "kg"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "BMI":
          value = item.value ? `${item.value}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "Blood Pressure":
          value = item.systolic ? `${item.systolic}/${item.diastolic} ${item.unit || "mmHg"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "Heart Rate":
          value = item.value ? `${item.value} ${item.unit || "bpm"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "O2 Saturation":
          value = item.value ? `${item.value}${item.unit || "%"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        case "Glucose":
          value = item.value ? `${item.value} ${item.unit || "mg/dL"}` : 'N/A';
          createdOn = item.created_at || 'N/A';
          createdBy = item.user_name || 'System';
          break;
        default:
          value = 'N/A';
          createdOn = 'N/A';
          createdBy = 'System';
      }

      return {
        sNo: index + 1,
        value,
        createdOn: formatDisplayDate(createdOn),
        createdBy,
        metricType
      };
    });
  };

  // Close history modal
  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedVitalHistory(null);
    setHistoryData([]);
    setCurrentHistoryPage(1);
    setSelectedMetricType('');
  };

  // Get paginated history
  const getPaginatedHistory = () => {
    const startIndex = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE;
    const endIndex = startIndex + HISTORY_PAGE_SIZE;
    return historyData.slice(startIndex, endIndex);
  };

  const totalHistoryPages = Math.ceil(historyData.length / HISTORY_PAGE_SIZE);

  // Handle history page change
  const handleHistoryPageChange = (page: number) => {
    setCurrentHistoryPage(page);
  };

  // Open datepicker
  const openDatepicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === "function") {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    }
  };

  // Get test report documents
  const getTestReportDocuments = (recordId: number) => {
    return testReportDocuments.filter(doc => doc.TR_id === recordId);
  };

  // Get medical bill documents
  const getMedicalBillDocuments = (recordId: number) => {
    return medicalBillDocuments.filter(doc => doc.MB_id === recordId);
  };

  // Get vaccination documents
  const getVaccinationDocuments = (recordId: number) => {
    return vaccinationDocuments.filter(doc => doc.V_id === recordId);
  };

  // Get hospitalization documents
  const getHospitalizationDocuments = (recordId: number) => {
    return hospitalizationDocuments.filter(doc => doc.H_id === recordId);
  };

  // Handle view documents
  const handleViewDocuments = (documents: any[], type: string) => {
    setSelectedDocuments(documents);
    setDocumentType(type);
    setShowDocumentModal(true);
  };

  // Close document modal
  const handleCloseDocumentModal = () => {
    setSelectedDocuments([]);
    setShowDocumentModal(false);
    setDocumentType('');
  };



  // Handle view all documents
  const handleViewAllDocuments = (documents: any[]) => {
    console.log('Opening documents modal with:', documents);
    if (documents.length === 1) {
      handleViewDocument(documents[0]);
    } else {
      handleViewDocuments(documents, 'Documents');
    }
  };

  // Handle tab click
  const handleTabClick = async (tab: string) => {
    setActiveTab(tab);
    resetFilters();
    resetValidation();

    if (tab === "Medicine Reminder") {
      navigate("/medicinereminder");
      return;
    }

    if (tab === "Hospitalizations") {
      setHospitalizationRecords(allHospitalizationRecords);
      await fetchHospitalizationDocuments();
    }

    if (tab === "Medical Bills") {
      setMedicalBillRecords(allMedicalBillRecords);
      await fetchMedicalBillDocuments();
    }

    if (tab === "Prescription & Lab Tests") {
      setRecords(allRecords);
      await fetchTestReportDocuments();
    }

    if (tab === "Vaccinations Certificates") {
      setVaccinationRecords(allVaccinationRecords);
      await fetchVaccinationDocuments();
    }
  };

  // Fetch lab parameters for record
  const fetchLabParametersForRecord = useCallback(async (recordId: number, record: HealthRecord) => {
    try {
      if (showParametersModal) {
        setShowParametersModal(false);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setParametersLoading(true);

      if (!isAuthenticated || !user) {
        toast.error("Please login to view parameters");
        return;
      }

      const recordDetails = await HealthRecordsAPI.getPrescriptionById(recordId);

      let recordParameters: any[] = [];
      if (recordDetails && recordDetails.parameters && Array.isArray(recordDetails.parameters)) {
        recordParameters = recordDetails.parameters.map((p: any) => ({
          ParameterName: p.parameter_name,
          Result: p.result,
          ResultType: p.unit,
          StartRange: "", // New API might not return this yet
          EndRange: ""   // New API might not return this yet
        }));
      }

      setSelectedParameters(recordParameters);
      setParametersCount(recordParameters.length);
      setSelectedRecordForParameters(record);

      setTimeout(() => {
        setShowParametersModal(true);
      }, 50);

    } catch (error) {
      console.error("Error fetching lab parameters:", error);
      toast.error("Failed to load lab parameters");
    } finally {
      setTimeout(() => {
        setParametersLoading(false);
      }, 300);
    }
  }, [isAuthenticated, user, showParametersModal]);

  // Close parameters modal
  const handleCloseParametersModal = () => {
    setShowParametersModal(false);
    setTimeout(() => {
      setSelectedParameters([]);
      setSelectedRecordForParameters(null);
      setParametersCount(0);
    }, 300);
  };

  // Handle edit click for records
  const handleEditClick = async (record: any, recordType: string = 'prescription') => {
    try {
      setLoading(true);

      let recordData;
      let documents: any[] = [];

      switch (recordType) {
        case 'prescription':
          recordData = await HealthRecordsAPI.getPrescriptionById(record.id);
          // Documents are inside the record now
          documents = (recordData.documents || []).map((doc: any) => ({
            id: doc.id,
            UplordDocName: doc.file.split('/').pop(),
            UplordDocPath: doc.file,
            // ... other fields if necessary
          }));
          break;
        case 'hospitalization':
          const hospitalizationData = await HealthRecordsAPI.CRMGetCustomerHospitalizationDetailsById(record.id);
          recordData = hospitalizationData.details[0];
          documents = getHospitalizationDocuments(record.id);
          break;
        case 'medicalBill':
          recordData = await HealthRecordsAPI.CRMGetCustomerMedicalBillDetailsById(record.id);
          documents = (recordData.documents || []).map((doc: any) => ({
            id: doc.id,
            UplordDocName: doc.file.split('/').pop(),
            UplordDocPath: doc.file,
          }));
          break;
        case 'vaccination':
          const vData = await HealthRecordsAPI.CRMGetCustomerVaccinationDetailsById(record.id);
          recordData = vData; // New API returns direct object
          documents = (recordData.documents || []).map((doc: any) => ({
            id: doc.id,
            UplordDocName: doc.file.split('/').pop(),
            UplordDocPath: doc.file,
          }));
          break;
        default:
          recordData = record;
      }

      if (recordData) {
        setIsEditing(true);
        setEditingRecordId(record.id);
        setEditingRecordType(recordType);

        setExistingDocuments(documents || []);
        setDocumentsToRemove([]);
        setUploadedFiles([]);

        if (recordType === 'prescription') {
          // Flatten recordData if it's nested (API might return { id: 1, ... } or { data: { ... } })
          const data = recordData;

          setFormData({
            person: data.for_whom === "self" ? "self" : "dependant",
            recordFor: data.for_whom === "self" ? (user?.name || "Self") : (data.dependant_name || "Dependant"), // Best effort
            recordDate: data.record_date,
            recordName: data.record_name,
            typeOfRecord: data.record_type === 'lab_test' ? 'Medical Report' : 'Doctor Prescription',
            recordDoctorName: data.doctor_name,
            doctorSpecialization: data.doctor_specialization?.toString() || "",
            reasonForConsultation: data.reason || "",
            hospitalName: "",
            additionalNotes: "",
            billNumber: "",
            vaccinationDose: "",
            vaccinationCenter: "",
            registrationId: "",
            relationshipId: "", // Relationship ID might need to be resolved if needed for dropdown
            relationshipPersonId: data.dependant?.toString() || "",
            name: data.record_name,
            relation: data.for_whom
          });

          if (data.parameters && data.parameters.length > 0) {
            setLabParameters(data.parameters.map((p: any) => ({
              parameterName: p.parameter_name,
              result: p.result,
              unit: p.unit,
              startRange: "",
              endRange: ""
            })));
            setShowLabParameters(true);
          } else {
            setLabParameters([createLabParameter()]);
            setShowLabParameters(false);
          }
        } else if (recordType === 'hospitalization') {
          // Use the fetched recordData which comes from CRMGetCustomerHospitalizationDetailsById
          const data = recordData.details && recordData.details[0] ? recordData.details[0] : recordData; // Handle wrapped structure if any

          setFormData({
            person: data.for_whom === "self" ? "self" : "dependant",
            recordFor: data.patient_name || (data.for_whom === "self" ? (user?.name || "Self") : "Dependant"),
            recordDate: data.admitted_date || data.Record_date,
            recordName: data.record_name || data.RecordName,
            typeOfRecord: data.hospitalization_type || data.Type_of_Record,
            recordDoctorName: data.doctor_name || data.Record_Doctor_Name,
            doctorSpecialization: "",
            reasonForConsultation: "",
            hospitalName: data.hospital_name || data.Record_Hospital_Name,
            additionalNotes: data.notes || data.Additional_Notes || "",
            billNumber: "",
            vaccinationDose: "",
            vaccinationCenter: "",
            registrationId: "",
            relationshipId: "",
            relationshipPersonId: data.dependant?.toString() || data.EmployeeDependentDetailsId?.toString() || "",
            name: data.record_name || data.RecordName,
            relation: data.for_whom === "self" ? "Self" : "Dependant"
          });
          setShowLabParameters(false);
        } else if (recordType === 'medicalBill') {
          const data = recordData;
          setFormData({
            person: data.for_whom === "self" ? "self" : "dependant",
            recordFor: data.for_whom === "self" ? (user?.name || "Self") : (data.dependant_name || "Dependant"),
            recordDate: data.record_date,
            recordName: data.record_name,
            typeOfRecord: data.bill_type,
            recordDoctorName: "",
            doctorSpecialization: "",
            reasonForConsultation: data.notes || "",
            hospitalName: data.record_hospital_name,
            additionalNotes: data.notes || "",
            billNumber: data.record_bill_number,
            vaccinationDose: "",
            vaccinationCenter: "",
            registrationId: "",
            relationshipId: "",
            relationshipPersonId: data.dependant?.toString() || "",
            name: data.record_name,
            relation: data.for_whom
          });
          setShowLabParameters(false);
        } else if (recordType === 'vaccination') {
          const data = recordData;
          setFormData({
            person: data.for_whom === "self" ? "self" : "dependant",
            recordFor: data.for_whom === "self" ? (user?.name || "Self") : (data.dependant_name || "Dependant"),
            recordDate: data.vaccination_date,
            recordName: data.vaccination_name,
            typeOfRecord: "",
            recordDoctorName: "",
            doctorSpecialization: "",
            reasonForConsultation: data.notes || "",
            hospitalName: "",
            additionalNotes: data.notes || "",
            billNumber: "",
            vaccinationDose: data.vaccination_dose,
            vaccinationCenter: data.vaccination_center,
            registrationId: data.registration_id || "",
            relationshipId: "",
            relationshipPersonId: data.dependant?.toString() || "",
            name: data.vaccination_name,
            relation: data.for_whom
          });
          setShowLabParameters(false);
        }

        setIsAddingRecord(true);
        resetValidation();
      }
    } catch (error) {
      console.error("Error fetching record for editing:", error);
      toast.error("Error loading record for editing");
    } finally {
      setLoading(false);
    }
  };

  // Handle add new record
  const handleAddNewRecord = () => {
    resetForm();
    resetValidation();
    setIsAddingRecord(true);
    setIsEditing(false);
    setEditingRecordId(null);
    setEditingRecordType('');
  };

  // Handle location carousel navigation
  const handlePrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  // Render record for field with relationship functionality
  const renderRecordForField = () => {
    if (formData.person === "self") {
      return (
        <div className="">
          <label className="required-field">
            Record for <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="recordFor"
            value={formData.recordFor}
            onChange={(e) => handleInputChange("recordFor", e.target.value)}
            required
            className={validationErrors.recordFor ? 'input-error' : ''}
          />
          {validationErrors.recordFor && (
            <div className="error-message">{validationErrors.recordFor}</div>
          )}
        </div>
      );
    } else {
      return (
        <>
          <div className="">
            <label className="required-field">
              Relationship <span className="required-asterisk">*</span>
            </label>
            <Select
              options={getRelationshipOptions()}
              value={getRelationshipOptions().find(opt => opt.value === formData.relationshipId)}
              onChange={(selected) => handleInputChange("relationshipId", selected?.value || "")}
              placeholder="Select Relationship"
              isClearable
              isDisabled={loadingRelationships}
              className={validationErrors.relationshipId ? 'select-error' : ''}
              classNamePrefix="react-select"
            />
            {validationErrors.relationshipId && (
              <div className="error-message">{validationErrors.relationshipId}</div>
            )}
            {loadingRelationships && <small className="field-hint">Loading relationships...</small>}
          </div>

          <div className="">
            <label className="required-field">
              Dependant <span className="required-asterisk">*</span>
            </label>
            <Select
              options={getRelationshipPersonOptions()}
              value={getRelationshipPersonOptions().find(opt => opt.value === formData.relationshipPersonId)}
              onChange={(selected) => handleInputChange("relationshipPersonId", selected?.value || "")}
              placeholder={formData.relationshipId ? "Select Dependant" : "Select relationship first"}
              isClearable
              isDisabled={!formData.relationshipId || loadingRelationshipPersons}
              className={validationErrors.relationshipPersonId ? 'select-error' : ''}
              classNamePrefix="react-select"
            />
            {validationErrors.relationshipPersonId && (
              <div className="error-message">{validationErrors.relationshipPersonId}</div>
            )}
            {loadingRelationshipPersons && <small className="field-hint">Loading dependants...</small>}
            {formData.relationshipId && relationshipPersons.length === 0 && !loadingRelationshipPersons && (
              <small className="field-hint warning">No dependants found for this relationship</small>
            )}
          </div>
        </>
      );
    }
  };

  // Update the renderUploadedFiles function
  const renderUploadedFiles = () => {
    const allFiles = [
      ...existingDocuments.map(doc => {
        const { id: documentId, type: documentType } = getDocumentIdAndType(doc);

        return {
          name: doc.UplordDocName || doc.DocumentName || 'Existing Document',
          type: 'existing',
          id: documentId,
          documentType: documentType,
          path: doc.UplordDocPath || doc.DocumentPath,
          document: doc
        };
      }),
      ...uploadedFiles.map((file, index) => ({
        name: file.name,
        type: 'new',
        id: 0,
        documentType: '',
        path: '',
        document: null
      }))
    ];

    if (allFiles.length === 0) return null;

    return (
      <div className="uploaded-files-list">
        <h4>Documents ({allFiles.length}):</h4>
        {allFiles.map((file, index) => (
          <div key={`${file.type}-${file.id || index}`} className="uploaded-file-item">
            <div className="file-name-container">
              {file.type === 'existing' ? (
                <button
                  className="file-name-link"
                  onClick={() => handleOpenExistingDocument(file.document)}
                  title="Click to open document in new tab"
                >
                  📄 {file.name}
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className="external-link-icon"
                    title="Open in new tab"
                  />
                </button>
              ) : (
                <span className="file-name">
                  📤 {file.name}
                </span>
              )}
              <span className={`file-badge ${file.type}`}>
                {file.type === 'existing' ? 'Existing' : 'New'}
              </span>
              {file.documentType && (
                <span className="file-type-badge">
                  {file.documentType}
                </span>
              )}
            </div>
            <div className="file-actions">
              {file.type === 'existing' && file.id > 0 && file.documentType && activeTab !== "Hospitalizations" && (
                <button
                  className="delete-file-btn"
                  onClick={() => handleDeleteDocument(file.id, file.documentType)}
                  title="Delete document from server"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              <button
                className="remove-file-btn"
                onClick={() => {
                  if (file.type === 'existing') {
                    const docName = file.document?.UplordDocName || file.document?.DocumentName;
                    if (docName) {
                      handleRemoveExistingDocument(docName);
                    }
                  } else {
                    const newIndex = index - existingDocuments.length;
                    handleRemoveFile(newIndex);
                  }
                }}
                title={`Remove ${file.type === 'existing' ? 'from this record' : 'new file'}`}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render different form based on active tab
  const renderAddRecordForm = () => {
    switch (activeTab) {
      case "Prescription & Lab Tests":
        return renderPrescriptionForm();
      case "Hospitalizations":
        return renderHospitalizationForm();
      case "Medical Bills":
        return renderMedicalBillForm();
      case "Vaccinations Certificates":
        return renderVaccinationForm();
      default:
        return renderPrescriptionForm();
    }
  };

  // Render prescription form
  const renderPrescriptionForm = () => (
    <div className="add-record-container">
      <h3>{isEditing ? 'Edit Prescription & Lab Test' : 'Add Prescription & Lab Test'}</h3>

      <div className="form-radios">
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="self"
            checked={formData.person === "self"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Self
        </label>
        <label className="Healthradio-label">
          <input
            type="radio"
            name="person"
            value="dependant"
            checked={formData.person === "dependant"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Dependant
        </label>
      </div>

      <div className="add-form-grid">
        {renderRecordForField()}
        <div className="">
          <label className="required-field">
            Record date <span className="required-asterisk">*</span>
          </label>
          <Input
            type="date"
            name="recordDate"
            value={getDateInputValue(formData.recordDate)}
            onChange={(e) => handleInputChange("recordDate", e.target.value)}
            required
            className={validationErrors.recordDate ? 'input-error' : ''}
          />
          {validationErrors.recordDate && (
            <div className="error-message">{validationErrors.recordDate}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Record name <span className="required-asterisk">*</span>
          </label>
          <Select
            options={recordNameOptions}
            value={recordNameOptions.find(opt => opt.value === formData.recordName)}
            onChange={(selected) => handleInputChange("recordName", selected?.value || "")}
            placeholder="Select record name"
            isClearable
            required
            className={validationErrors.recordName ? 'select-error' : ''}
            classNamePrefix="react-select"
          />
          {validationErrors.recordName && (
            <div className="error-message">{validationErrors.recordName}</div>
          )}
        </div>
        <div className="">
          <label>Type of Record</label>
          <Select
            options={typeOfRecordOptions}
            value={typeOfRecordOptions.find(opt => opt.value === formData.typeOfRecord)}
            onChange={(selected) => handleInputChange("typeOfRecord", selected?.value || "")}
            placeholder="Select type of record"
            isClearable
          />
        </div>
        <div className="">
          <label className="required-field">
            Doctor Name <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="recordDoctorName"
            value={formData.recordDoctorName}
            onChange={(e) => handleInputChange("recordDoctorName", e.target.value)}
            placeholder="Enter doctor name"
            required
            className={validationErrors.recordDoctorName ? 'input-error' : ''}
          />
          {validationErrors.recordDoctorName && (
            <div className="error-message">{validationErrors.recordDoctorName}</div>
          )}
        </div>
        <div className="">
          <label>Doctor Specialization</label>
          <Select
            options={specializationOptions}
            value={specializationOptions.find(opt => opt.value === formData.doctorSpecialization)}
            onChange={(selected) => handleInputChange("doctorSpecialization", selected?.value || "")}
            placeholder="Select doctor specialization"
            isClearable
          />
        </div>
      </div>

      <div className="">
        <label>Reason for Consultation/Lab Test</label>
        <textarea
          rows={2}
          name="reasonForConsultation"
          value={formData.reasonForConsultation}
          onChange={(e) => handleInputChange("reasonForConsultation", e.target.value)}
          className={validationErrors.reasonForConsultation ? 'input-error' : ''}
        ></textarea>
        {validationErrors.reasonForConsultation && (
          <div className="error-message">{validationErrors.reasonForConsultation}</div>
        )}
      </div>

      <div className="add-form-actions">
        <button
          className="add-lab-btn"
          onClick={() => setShowLabParameters((prev) => !prev)}
        >
          {showLabParameters ? 'Hide Lab Parameters' : 'Add Lab Parameters'}
        </button>
        <div className="upload-area" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          <p>Upload a document</p>
          <small>(Only upload.jpeg,.jpg,.png,.pdf format.)</small>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".jpeg,.jpg,.png,.pdf"
            onChange={handleFileChange}
            multiple
          />
        </div>
      </div>

      {renderUploadedFiles()}

      {showLabParameters && (
        <div className="lab-parameters-section">
          <h3 className="lab-params-heading">Record Details</h3>
          <div className="lab-params-table-container">
            <table className="lab-params-table">
              <thead>
                <tr>
                  <th>Parameter Name</th>
                  <th>Result <span className="required-asterisk">*</span></th>
                  <th>Unit</th>
                  <th>Start Range</th>
                  <th>End Range</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {labParameters.map((param, index) => (
                  <tr key={index} className={validationErrors[`labResult_${index}`] || validationErrors[`labParamName_${index}`] ? 'parameter-error-row' : ''}>
                    <td>
                      <Input
                        type="text"
                        placeholder="Enter Parameter Name"
                        value={param.parameterName}
                        onChange={(e) => handleLabParameterChange(index, 'parameterName', e.target.value)}
                        className={validationErrors[`labParamName_${index}`] ? 'input-error' : ''}
                      />
                      {validationErrors[`labParamName_${index}`] && (
                        <div className="error-message">{validationErrors[`labParamName_${index}`]}</div>
                      )}
                    </td>
                    <td>
                      <Input
                        type="text"
                        placeholder="Enter Result (Ex. 110)"
                        value={param.result}
                        onChange={(e) => handleLabParameterChange(index, 'result', e.target.value)}
                        className={validationErrors[`labResult_${index}`] ? 'input-error' : ''}
                      />
                      {validationErrors[`labResult_${index}`] && (
                        <div className="error-message">{validationErrors[`labResult_${index}`]}</div>
                      )}
                    </td>
                    <td>
                      <Input
                        type="text"
                        placeholder="Unit"
                        value={param.unit}
                        onChange={(e) => handleLabParameterChange(index, 'unit', e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        placeholder="Start (Ex. 80)"
                        value={param.startRange}
                        onChange={(e) => handleLabParameterChange(index, 'startRange', e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        placeholder="End (Ex. 80)"
                        value={param.endRange}
                        onChange={(e) => handleLabParameterChange(index, 'endRange', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        className="remove-param-btn"
                        onClick={() => removeLabParameter(index)}
                        disabled={labParameters.length === 1}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="add-param-row">
                  <td colSpan={6}>
                    <button className="add-record-details-btn" onClick={addLabParameter}>
                      + Add Parameter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="form-buttons">
        <button className="save-btn" onClick={handleSaveTestDetails}>
          {loading ? "Saving..." : (isEditing ? "Update" : "Save")}
        </button>
        <button
          className="cancel-btn"
          onClick={() => {
            setIsAddingRecord(false);
            setShowLabParameters(false);
            resetForm();
            resetValidation();
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Render hospitalization form
  const renderHospitalizationForm = () => (
    <div className="add-record-container">
      <h3>{isEditing ? 'Edit Hospitalization Record' : 'Add Hospitalization Record'}</h3>

      <div className="form-radios">
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="self"
            checked={formData.person === "self"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Self
        </label>
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="dependant"
            checked={formData.person === "dependant"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Dependant
        </label>
      </div>

      <div className="add-form-grid">
        {renderRecordForField()}
        <div className="">
          <label className="required-field">
            Record date <span className="required-asterisk">*</span>
          </label>
          <Input
            type="date"
            name="recordDate"
            value={getDateInputValue(formData.recordDate)}
            onChange={(e) => handleInputChange("recordDate", e.target.value)}
            required
            className={validationErrors.recordDate ? 'input-error' : ''}
          />
          {validationErrors.recordDate && (
            <div className="error-message">{validationErrors.recordDate}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Record name <span className="required-asterisk">*</span>
          </label>
          <Select
            options={recordNameOptions}
            value={recordNameOptions.find(opt => opt.value === formData.recordName)}
            onChange={(selected) => handleInputChange("recordName", selected?.value || "")}
            placeholder="Select record name"
            isClearable
            required
            className={validationErrors.recordName ? 'select-error' : ''}
            classNamePrefix="react-select"
          />
          {validationErrors.recordName && (
            <div className="error-message">{validationErrors.recordName}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Type of Record <span className="required-asterisk">*</span>
          </label>
          <Select
            options={typeOfRecordOptions}
            value={typeOfRecordOptions.find(opt => opt.value === formData.typeOfRecord)}
            onChange={(selected) => handleInputChange("typeOfRecord", selected?.value || "")}
            placeholder="Select type of record"
            isClearable
            required
            className={validationErrors.typeOfRecord ? 'select-error' : ''}
            classNamePrefix="react-select"
          />
          {validationErrors.typeOfRecord && (
            <div className="error-message">{validationErrors.typeOfRecord}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Record Doctor's Name <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="recordDoctorName"
            value={formData.recordDoctorName}
            onChange={(e) => handleInputChange("recordDoctorName", e.target.value)}
            placeholder="Enter doctor name"
            required
            className={validationErrors.recordDoctorName ? 'input-error' : ''}
          />
          {validationErrors.recordDoctorName && (
            <div className="error-message">{validationErrors.recordDoctorName}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Record Hospital Name <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={(e) => handleInputChange("hospitalName", e.target.value)}
            placeholder="Enter hospital name"
            required
            className={validationErrors.hospitalName ? 'input-error' : ''}
          />
          {validationErrors.hospitalName && (
            <div className="error-message">{validationErrors.hospitalName}</div>
          )}
        </div>
      </div>

      <div className="">
        <label>Additional Notes</label>
        <textarea
          rows={2}
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
        ></textarea>
      </div>

      <div className="add-form-actions">
        <div className="upload-area" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          <p>Upload a document</p>
          <small>(Only upload.jpeg,.jpg,.png,.pdf format.)</small>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".jpeg,.jpg,.png,.pdf"
            onChange={handleFileChange}
            multiple
          />
        </div>
      </div>

      {renderUploadedFiles()}

      <div className="form-buttons">
        <button className="save-btn" onClick={handleSaveHospitalizationDetails}>
          {loading ? "Saving..." : (isEditing ? "Update" : "Save")}
        </button>
        <button
          className="cancel-btn"
          onClick={() => {
            setIsAddingRecord(false);
            resetForm();
            resetValidation();
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Render medical bill form
  const renderMedicalBillForm = () => (
    <div className="add-record-container">
      <h3>{isEditing ? 'Edit Medical Bill' : 'Add Medical Bill'}</h3>

      <div className="form-radios">
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="self"
            checked={formData.person === "self"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Self
        </label>
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="dependant"
            checked={formData.person === "dependant"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Dependant
        </label>
      </div>

      <div className="add-form-grid">
        {renderRecordForField()}
        <div className="">
          <label className="required-field">
            Record date <span className="required-asterisk">*</span>
          </label>
          <Input
            type="date"
            name="recordDate"
            value={getDateInputValue(formData.recordDate)}
            onChange={(e) => handleInputChange("recordDate", e.target.value)}
            required
            className={validationErrors.recordDate ? 'input-error' : ''}
          />
          {validationErrors.recordDate && (
            <div className="error-message">{validationErrors.recordDate}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Record name <span className="required-asterisk">*</span>
          </label>
          <Select
            options={recordNameOptions}
            value={recordNameOptions.find(opt => opt.value === formData.recordName)}
            onChange={(selected) => handleInputChange("recordName", selected?.value || "")}
            placeholder="Select record name"
            isClearable
            required
            className={validationErrors.recordName ? 'select-error' : ''}
            classNamePrefix="react-select"
          />
          {validationErrors.recordName && (
            <div className="error-message">{validationErrors.recordName}</div>
          )}
        </div>
        <div className="">
          <label>Record Bill Number</label>
          <Input
            type="text"
            name="billNumber"
            value={formData.billNumber}
            onChange={(e) => handleInputChange("billNumber", e.target.value)}
            placeholder="Enter bill number"
          />
        </div>
        <div className="">
          <label className="required-field">
            Record Hospital Name <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={(e) => handleInputChange("hospitalName", e.target.value)}
            placeholder="Enter hospital name"
            required
            className={validationErrors.hospitalName ? 'input-error' : ''}
          />
          {validationErrors.hospitalName && (
            <div className="error-message">{validationErrors.hospitalName}</div>
          )}
        </div>
        <div className="">
          <label>Type of Record</label>
          <Select
            options={typeOfRecordOptions}
            value={typeOfRecordOptions.find(opt => opt.value === formData.typeOfRecord)}
            onChange={(selected) => handleInputChange("typeOfRecord", selected?.value || "")}
            placeholder="Select type of record"
            isClearable
          />
        </div>
      </div>

      <div className="add-form-actions">
        <div className="upload-area" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          <p>Upload a document</p>
          <small>(Only upload.jpeg,.jpg,.png,.pdf format.)</small>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".jpeg,.jpg,.png,.pdf"
            onChange={handleFileChange}
            multiple
          />
        </div>
      </div>

      {renderUploadedFiles()}

      <div className="form-buttons">
        <button className="save-btn" onClick={handleSaveMedicalBillDetails}>
          {loading ? "Saving..." : (isEditing ? "Update" : "Save")}
        </button>
        <button
          className="cancel-btn"
          onClick={() => {
            setIsAddingRecord(false);
            resetForm();
            resetValidation();
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Render vaccination form
  const renderVaccinationForm = () => (
    <div className="add-record-container">
      <h3>{isEditing ? 'Edit Vaccination Record' : 'Add Vaccination Record'}</h3>

      <div className="form-radios">
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="self"
            checked={formData.person === "self"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Self
        </label>
        <label className="Health-radio-label">
          <input
            type="radio"
            name="person"
            value="dependant"
            checked={formData.person === "dependant"}
            onChange={(e) => handleInputChange("person", e.target.value)}
          /> Dependant
        </label>
      </div>

      <div className="add-form-grid">
        {renderRecordForField()}
        <div className="">
          <label className="required-field">
            Vaccination date <span className="required-asterisk">*</span>
          </label>
          <Input
            type="date"
            name="recordDate"
            value={getDateInputValue(formData.recordDate)}
            onChange={(e) => handleInputChange("recordDate", e.target.value)}
            required
            className={validationErrors.recordDate ? 'input-error' : ''}
          />
          {validationErrors.recordDate && (
            <div className="error-message">{validationErrors.recordDate}</div>
          )}
        </div>
        <div>
          <label className="required-field">
            Vaccination name <span className="required-asterisk">*</span>
          </label>

          <Select
            options={vaccinationNameOptions}
            value={vaccinationNameOptions.find(
              opt => opt.label === formData.recordName
            )}
            onChange={(selected) =>
              handleInputChange("recordName", selected ? selected.label : "")
            }
            placeholder="Select vaccination name"
            isClearable
            className={validationErrors.recordName ? "select-error" : ""}
            classNamePrefix="react-select"
          />

          {validationErrors.recordName && (
            <div className="error-message">{validationErrors.recordName}</div>
          )}
        </div>


        <div className="">
          <label className="required-field">
            Vaccination Dose <span className="required-asterisk">*</span>
          </label>
          <Select
            options={vaccinationDoseOptions}
            value={vaccinationDoseOptions.find(opt => opt.value === formData.vaccinationDose)}
            onChange={(selected) => handleInputChange("vaccinationDose", selected?.value || "")}
            placeholder="Select vaccination dose"
            isClearable
            required
            className={validationErrors.vaccinationDose ? 'select-error' : ''}
            classNamePrefix="react-select"
          />
          {validationErrors.vaccinationDose && (
            <div className="error-message">{validationErrors.vaccinationDose}</div>
          )}
        </div>
        <div className="">
          <label className="required-field">
            Vaccination Center <span className="required-asterisk">*</span>
          </label>
          <Input
            type="text"
            name="vaccinationCenter"
            value={formData.vaccinationCenter}
            onChange={(e) => handleInputChange("vaccinationCenter", e.target.value)}
            placeholder="Enter vaccination center"
            required
            className={validationErrors.vaccinationCenter ? 'input-error' : ''}
          />
          {validationErrors.vaccinationCenter && (
            <div className="error-message">{validationErrors.vaccinationCenter}</div>
          )}
        </div>
        <div className="">
          <label>Registration Id</label>
          <Input
            type="text"
            name="registrationId"
            value={formData.registrationId}
            onChange={(e) => handleInputChange("registrationId", e.target.value)}
            placeholder="Enter registration ID"
          />
        </div>
      </div>

      <div className="add-form-actions">
        <div className="upload-area" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} className="upload-icon" />
          <p>Upload a document</p>
          <small>(Only upload.jpeg,.jpg,.png,.pdf format.)</small>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".jpeg,.jpg,.png,.pdf"
            onChange={handleFileChange}
            multiple
          />
        </div>
      </div>

      {renderUploadedFiles()}

      <div className="form-buttons">
        <button className="save-btn" onClick={handleSaveVaccinationDetails}>
          {loading ? "Saving..." : (isEditing ? "Update" : "Save")}
        </button>
        <button
          className="cancel-btn"
          onClick={() => {
            setIsAddingRecord(false);
            resetForm();
            resetValidation();
          }}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Card components
  const PrescriptionCard = ({ record }: { record: HealthRecord }) => {
    const documents = getTestReportDocuments(record.id);
    const parametersCount = record.labParameters?.length || 0;

    return (
      <div key={record.id} className="record-card-custom">
        <div className="record-card-header">
          <div>
            <strong className="record-patient-name">{record.name}</strong>
            <p className="record-patient-relation">{record.relation}</p>
          </div>
          <button className="record-edit-btn" onClick={() => handleEditClick(record, 'prescription')}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </button>
        </div>

        <div className="record-card-body">
          <div className="record-field-row">
            <span className="record-field-label">Record Type:</span>
            <span className="record-field-value">{record.type}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Name:</span>
            <span className="record-field-value orange">{record.recordName}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Doctor/Centre Name:</span>
            <span className="record-field-value orange">{record.doctor}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Date:</span>
            <span className="record-field-value orange">{formatDisplayDate(record.recordDate)}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Type of Record:</span>
            <span className="record-field-value orange">{record.typeOfRecord}</span>
          </div>
        </div>

        <div className="record-card-footer">
          <button
            className="record-footer-btn"
            onClick={() => fetchLabParametersForRecord(record.id, record)}
            disabled={parametersCount === 0}
          >
            View Parameters ({parametersCount})
          </button>
          <button
            className="record-footer-btn"
            onClick={() => handleViewAllDocuments(documents)}
            disabled={documents.length === 0}
          >
            View Documents ({documents.length})
          </button>
        </div>
      </div>
    );
  };

  const HospitalizationCard = ({ record }: { record: any }) => {
    const documents = record.documents || [];

    return (
      <div key={record.id} className="record-card-custom hospitalization-card">
        <div className="record-card-header">
          <div>
            <strong className="record-patient-name">{record.recordFor}</strong>
            <p className="record-patient-relation">{record.relation}</p>
          </div>
          <button className="record-edit-btn" onClick={() => handleEditClick(record, 'hospitalization')}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </button>
        </div>

        <div className="record-card-body">
          <div className="record-field-row">
            <span className="record-field-label">Hospital Name:</span>
            <span className="record-field-value orange">{record.hospital}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Doctor Name:</span>
            <span className="record-field-value orange">{record.doctor}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Name:</span>
            <span className="record-field-value orange">{record.recordName}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Date:</span>
            <span className="record-field-value orange">{formatDisplayDate(record.recordDate)}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Type of Record:</span>
            <span className="record-field-value orange">{record.type}</span>
          </div>
        </div>

        <div className="record-card-footer">
          <button
            className="record-footer-btn"
            onClick={() => handleViewAllDocuments(documents)}
            disabled={documents.length === 0}
          >
            View Documents ({documents.length})
          </button>
        </div>
      </div>
    );
  };

  const MedicalBillCard = ({ record }: { record: any }) => {
    const documents = record.documents || [];

    return (
      <div key={record.id} className="record-card-custom medical-bill-card">
        <div className="record-card-header">
          <div>
            <strong className="record-patient-name">{record.recordFor}</strong>
            <p className="record-patient-relation">{record.relation}</p>
          </div>
          <button className="record-edit-btn" onClick={() => handleEditClick(record, 'medicalBill')}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </button>
        </div>

        <div className="record-card-body">
          <div className="record-field-row">
            <span className="record-field-label">Hospital Name:</span>
            <span className="record-field-value orange">{record.hospital}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Bill Number:</span>
            <span className="record-field-value orange">{record.billNumber}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Name:</span>
            <span className="record-field-value orange">{record.recordName}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Record Date:</span>
            <span className="record-field-value orange">{formatDisplayDate(record.recordDate)}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Type of Record:</span>
            <span className="record-field-value orange">{record.type}</span>
          </div>
        </div>

        <div className="record-card-footer">
          <button
            className="record-footer-btn"
            onClick={() => handleViewAllDocuments(documents)}
            disabled={documents.length === 0}
          >
            View Documents ({documents.length})
          </button>
        </div>
      </div>
    );
  };

  const VaccinationCard = ({ record }: { record: any }) => {
    const documents = record.documents || [];

    return (
      <div key={record.id} className="record-card-custom vaccination-card">
        <div className="record-card-header">
          <div>
            <strong className="record-patient-name">{record.recordFor}</strong>
            <p className="record-patient-relation">{record.relation}</p>
          </div>
          <button className="record-edit-btn" onClick={() => handleEditClick(record, 'vaccination')}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </button>
        </div>

        <div className="record-card-body">
          <div className="record-field-row">
            <span className="record-field-label">Vaccine Name:</span>
            <span className="record-field-value orange">{record.recordName}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Dose:</span>
            <span className="record-field-value orange">{record.vaccinationDose}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Vaccination Center:</span>
            <span className="record-field-value orange">{record.vaccinationCenter}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Registration ID:</span>
            <span className="record-field-value orange">{record.registrationId}</span>
          </div>
          <div className="record-field-row">
            <span className="record-field-label">Vaccination Date:</span>
            <span className="record-field-value orange">{formatDisplayDate(record.recordDate)}</span>
          </div>
        </div>

        <div className="record-card-footer">
          <button
            className="record-footer-btn"
            onClick={() => handleViewAllDocuments(documents)}
            disabled={documents.length === 0}
          >
            View Certificate ({documents.length})
          </button>
        </div>
      </div>
    );
  };

  // Get current records based on active tab
  const getCurrentRecords = () => {
    switch (activeTab) {
      case "Prescription & Lab Tests":
        return records;
      case "Hospitalizations":
        return hospitalizationRecords;
      case "Medical Bills":
        return medicalBillRecords;
      case "Vaccinations Certificates":
        return vaccinationRecords;
      default:
        return [];
    }
  };

  // Get current loading state based on active tab
  const getCurrentLoading = () => {
    switch (activeTab) {
      case "Prescription & Lab Tests":
        return loading || filterLoading;
      case "Hospitalizations":
        return hospitalizationLoading || filterLoading;
      case "Medical Bills":
        return medicalBillLoading || filterLoading;
      case "Vaccinations Certificates":
        return vaccinationLoading || filterLoading;
      default:
        return false;
    }
  };

  // If adding record, show the appropriate form
  if (isAddingRecord) {
    return (
      <Container>
        {renderAddRecordForm()}
      </Container>
    );
  }

  return (
    <div className="health-records-container">
      {/* Vitals Grid */}
      <div
        className="vitals-grid"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {healthMetricsLoading ? (
          <div className="loading-message">Loading health metrics...</div>
        ) : (
          vitals.map((vital, index) => (
            <div
              className="vital-card"
              key={index}
              style={{ flexShrink: 0, width: "200px" }}
            >
              <div className="vital-header">
                <FontAwesomeIcon
                  icon={vitalIcons[vital.name as keyof typeof vitalIcons]}
                  className="vital-icon"
                  style={{ fontSize: "24px", color: "#4a6fa5" }}
                />
                <h3>{vital.name}</h3>
              </div>
              <div className="vital-body">
                {editingIndex === index ? (
                  <>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        position: 'relative',
                        flex: 1
                      }}>
                        <Input
                          type="text"
                          value={editedValue}
                          onChange={(e) => {
                            // Allow only numbers and decimal point
                            const value = e.target.value.replace(/[^\d.]/g, '');
                            setEditedValue(value);
                          }}
                          className="edit-input"
                          style={{
                            paddingRight: '40px',
                            backgroundColor: 'transparent',
                            position: 'relative',
                            zIndex: 1,
                            width: '100%'
                          }}
                        />
                        {/* Unit placeholder in background */}
                        <div style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999',
                          fontSize: '14px',
                          pointerEvents: 'none',
                          zIndex: 0
                        }}>
                          {vital.name === "Height" ? unitToggle.height :
                            vital.name === "Weight" ? unitToggle.weight :
                              vital.value.replace(/[\d.\s]/g, '').trim()}
                        </div>
                      </div>

                      {/* Unit toggle button for Height and Weight */}
                      {(vital.name === "Height" || vital.name === "Weight") && (
                        <button
                          type="button"
                          onClick={() => toggleUnit(vital.name)}
                          style={{
                            padding: '8px 8px',
                            fontSize: '10px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          title={`Switch to ${vital.name === "Height" ?
                            (unitToggle.height === "Cm" ? "Feet" : "Cm") :
                            (unitToggle.weight === "Kg" ? "Pound" : "Kg")}`}
                        >
                          {vital.name === "Height" ?
                            (unitToggle.height === "Cm" ? "Cm ↔ Feet" : "Feet ↔ Cm") :
                            (unitToggle.weight === "Kg" ? "Kg ↔ Pound" : "Pound ↔ Kg")}
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => handleSave(index)}
                        className="save-btn"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleShowHistory(index)}
                        className="history-btn"
                      >
                        <FontAwesomeIcon icon={faHistory} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="vital-value">
                      {vital.value.split(' ')[0]} {vital.name === "Height" ? unitToggle.height : vital.name === "Weight" ? unitToggle.weight : vital.value.split(' ')[1]}
                    </p>
                    <p className="last-updated">
                      Last updated: {vital.lastUpdated}
                    </p>
                    <div className="vital-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(index)}
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      <button
                        className="history-btn"
                        onClick={() => handleShowHistory(index)}
                      >
                        <FontAwesomeIcon icon={faHistory} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="Health-filters-container">
        <Input
          type="text"
          placeholder="Search records (Doctor, Record Name...)"
          className="filter-input search-filter"
          value={filters.doctorName}
          onChange={(e) => handleFilterChange('doctorName', e.target.value)}
        />
        <div className="date-input-wrapper">
          <Input
            type="date"
            placeholder="Record Date"
            className="date-input"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
        <select
          name="caseForOption"
          value={filters.caseForOption}
          onChange={(e) => handleFilterChange('caseForOption', e.target.value)}
          className="normal-select"
        >
          {caseForOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>


      </div>

      {/* Tabs */}
      <div className="Health-tabs-container">
        {[
          "Prescription & Lab Tests",
          "Medicine Reminder",
          "Hospitalizations",
          "Medical Bills",
          "Vaccinations Certificates",
        ].map((tab) => (
          <button
            key={tab}
            className={`Health-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="Health-actions-container">
        <div className="Health-main-actions">
          <button
            className="Health-action-btn add-record"
            onClick={handleAddNewRecord}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Record
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="health-records-cards-container">
        {getCurrentLoading() ? (
          <div className="loading-message">
            {filterLoading ? "Filtering records..." : "Loading records..."}
          </div>
        ) : getCurrentRecords().length === 0 ? (
          <div className="no-records-message">
            {Object.values(filters).some(filter => filter !== '')
              ? `No ${activeTab.toLowerCase()} found matching your filters.`
              : `No ${activeTab.toLowerCase()} found.`}
          </div>
        ) : (
          <>
            {activeTab === "Prescription & Lab Tests" && records.map((record) => (
              <PrescriptionCard key={record.id} record={record} />
            ))}
            {activeTab === "Hospitalizations" && hospitalizationRecords.map((record) => (
              <HospitalizationCard key={record.id} record={record} />
            ))}
            {activeTab === "Medical Bills" && medicalBillRecords.map((record) => (
              <MedicalBillCard key={record.id} record={record} />
            ))}
            {activeTab === "Vaccinations Certificates" && vaccinationRecords.map((record) => (
              <VaccinationCard key={record.id} record={record} />
            ))}
          </>
        )}
      </div>

      {/* Document Modal */}
      <Modal
        show={showDocumentModal}
        onHide={handleCloseDocumentModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Documents ({selectedDocuments.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedDocuments.length === 0 ? (
            <div className="no-documents text-center p-4">No documents available</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Document Name</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDocuments.map((doc, index) => {
                    let documentId = 0;
                    let documentType = '';

                    if (doc.TR_DocumentId) {
                      documentId = Number(doc.TR_DocumentId);
                      documentType = 'TEST_REPORT';
                    } else if (doc.H_DocumentId) {
                      documentId = Number(doc.H_DocumentId);
                      documentType = 'HOSPITALIZATION';
                    } else if (doc.MB_DocumentId) {
                      documentId = Number(doc.MB_DocumentId);
                      documentType = 'MEDICAL_BILL';
                    } else if (doc.V_DocumentId) {
                      documentId = Number(doc.V_DocumentId);
                      documentType = 'VACCINATION';
                    }

                    return (
                      <tr key={index}>
                        <td className="align-middle">{index + 1}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            {doc.UplordDocName || doc.DocumentName || (doc.file ? doc.file.split('/').pop() : 'Document')}
                          </div>
                        </td>
                        <td className="align-middle text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-primary btn-sm px-3"
                              onClick={() => handleViewDocument(doc)}
                              title="View Document"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-success btn-sm px-3"
                              onClick={() => handleDownloadDocument(doc)}
                              title="Download Document"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                            {documentId > 0 && documentType && (
                              <button
                                className="btn btn-danger btn-sm px-3"
                                onClick={() => handleDeleteDocument(documentId, documentType)}
                                title="Delete Document"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDocumentModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Parameters Modal */}
      <Modal
        show={showParametersModal}
        onHide={handleCloseParametersModal}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faFileMedicalAlt} className="me-2" />
            Lab Test Parameters
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {parametersLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading parameters...</p>
            </div>
          ) : selectedParameters.length === 0 ? (
            <div className="text-center p-5">
              <div className="mb-3">
                <FontAwesomeIcon icon={faFileMedicalAlt} className="text-muted" size="3x" />
              </div>
              <h5 className="text-muted mb-2">No Parameters Found</h5>
              <p className="text-muted">No lab parameters available for this record.</p>
            </div>
          ) : (
            <div className="parameters-container">
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center">#</th>
                      <th >Parameter Name</th>
                      <th className="text-center">Result</th>
                      <th className="text-center">Unit</th>
                      <th className="text-center">Reference Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedParameters.map((param, index) => {
                      const resultNum = parseFloat(param.Result || "0");
                      const startRangeNum = parseFloat(param.StartRange || "0");
                      const endRangeNum = parseFloat(param.EndRange || "0");

                      let status = "Normal";
                      let statusClass = "badge bg-success";
                      let statusIcon = faCheckCircle;

                      if (!isNaN(resultNum) && !isNaN(startRangeNum) && !isNaN(endRangeNum)) {
                        if (resultNum < startRangeNum) {
                          status = "Low";
                          statusClass = "badge bg-warning";
                          statusIcon = faArrowDown;
                        } else if (resultNum > endRangeNum) {
                          status = "High";
                          statusClass = "badge bg-danger";
                          statusIcon = faArrowUp;
                        }
                      } else {
                        status = "Not Set";
                        statusClass = "badge bg-secondary";
                        statusIcon = faMinus;
                      }

                      return (
                        <tr key={param.TRRecordDetailsId || index}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon icon={faFlask} className="text-primary me-2" />
                              <span>{param.ParameterName || "N/A"}</span>
                            </div>
                          </td>
                          <td className="text-center fw-bold">
                            <span className={resultNum !== startRangeNum || resultNum !== endRangeNum ? "text-primary" : ""}>
                              {param.Result || "N/A"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border">
                              {param.ResultType || param.StartRangeType || "N/A"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="text-muted">{param.StartRange || "N/A"}</span>
                              <FontAwesomeIcon icon={faArrowRight} className="mx-2 text-muted" size="xs" />
                              <span className="text-muted">{param.EndRange || "N/A"}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div>
              <small className="text-muted">
                {selectedParameters.length} parameters loaded
              </small>
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={handleCloseParametersModal}
                className="me-2"
              >
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                Close
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* History Modal */}
      <Modal
        show={showHistoryModal}
        onHide={handleCloseHistoryModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedVitalHistory?.name} History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyLoading ? (
            <div className="loading-message text-center p-4">Loading history...</div>
          ) : historyData.length > 0 ? (
            <>
              <div className="history-table-container">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>{selectedMetricType}</th>
                        <th>Created On</th>
                        <th>Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedHistory().map((item, index) => (
                        <tr key={index}>
                          <td>{item.sNo}</td>
                          <td className="metric-value">{item.value}</td>
                          <td>{item.createdOn}</td>
                          <td>{item.createdBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalHistoryPages > 1 && (
                <div className="pagination-container mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="pagination-info">
                      Showing {((currentHistoryPage - 1) * HISTORY_PAGE_SIZE) + 1} to {Math.min(currentHistoryPage * HISTORY_PAGE_SIZE, historyData.length)} of {historyData.length} records
                    </div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        disabled={currentHistoryPage === 1}
                        onClick={() => handleHistoryPageChange(currentHistoryPage - 1)}
                      />
                      {Array.from({ length: totalHistoryPages }, (_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentHistoryPage}
                          onClick={() => handleHistoryPageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentHistoryPage === totalHistoryPages}
                        onClick={() => handleHistoryPageChange(currentHistoryPage + 1)}
                      />
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-history text-center p-4">
              No history available for {selectedVitalHistory?.name}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHistoryModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Our Locations Section */}
      <Container>
        <section className="our-location-sections" style={{ marginBottom: "48px" }}>
          <h2 className="our-location-heading">Our Locations</h2>
          <div className="location-carousel-wrappers">
            <button className="carousel-arrow left" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img
                    src={loc.img}
                    alt={loc.name}
                    className="location-img large-location-img"
                  />
                  <div className="location-name large-location-name">
                    {loc.name}
                  </div>
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

export default HealthRecords;