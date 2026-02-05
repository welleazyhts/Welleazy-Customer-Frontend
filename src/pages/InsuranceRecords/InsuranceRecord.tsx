import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronLeft, 
  faChevronRight, 
  faTimes,
  faUpload,
  faFileAlt,
  faUser,
  faCalendarAlt,
  faBuilding,
  faIdCard,
  faFileSignature,
  faMoneyBillWave,
  faUserCheck,
  faStickyNote,
  faCheckCircle,
  faArrowLeft,
  faPaperclip,
  faTrash,
  faEye,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import { Container } from "react-bootstrap";
import "./InsuranceRecord.css";
import { useNavigate, useLocation } from "react-router-dom";
import { insuranceRecordAPI } from "../../api/InsuranceRecord";
import { UploadedFile, InsuranceType, InsuranceCompany, Dependent, InsuranceDocument } from "../../types/InsuranceRecord";
import { toast } from "react-toastify";

const locationData = [
  { name: "New Delhi", img: "/DELHI-8.png" },
  { name: "Chandigarh", img: "/Chandigarh.png" },
  { name: "Srinagar", img: "/srinagr.png" },
  { name: "Cochin", img: "/kochi.png" },
  { name: "Bangalore", img: "/BANGALORE-8.png" },
  { name: "Mumbai", img: "/mumbai.png" },
  { name: "Kolkata", img: "/KOLKATA-8.png" },
  { name: "Ahmedabad", img: "/AHEMDABAD-8.png" },
  { name: "Jaipur", img: "/JAIPUR-8.png" },
  { name: "Lucknow", img: "/LUCKNOW-8.png" },
];

// Define a union type for combined documents
type CombinedDocument = 
  | { isExisting: true; InsuranceRecordDocumentId: number; InsuranceRecordId: number; DocumentName: string; DocumentPath: string; }
  | { isExisting: false; file: File; preview: string; id: string; };

const InsuranceRecord: React.FC = () => {
  const [policyType, setPolicyType] = useState("Company Policy");
  const [selectedDependent, setSelectedDependent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [insuranceRecordId, setInsuranceRecordId] = useState<number>(0);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoadingDependents, setIsLoadingDependents] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<InsuranceDocument[]>([]);
  const [formData, setFormData] = useState({
    policyHolderName: "",
    policyFrom: "",
    policyTo: "",
    insuranceType: "",
    insuranceCompany: "",
    policyNumber: "",
    policyName: "",
    sumAssured: "",
    premiumAmount: "",
    nominee: "",
    tpa: "",
    additionalNotes: "",
    isFloater: false,
    maturityDate: "",
    maturityAmount: "",
    surrenderDate: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const storedDisplayName = localStorage.getItem("DisplayName") || "";
    setDisplayName(storedDisplayName);
    if (!isEditMode && (policyType === "Self" || policyType === "Company Policy")) {
      setFormData(prev => ({
        ...prev,
        policyHolderName: storedDisplayName
      }));
    }
  }, [isEditMode, policyType]);

  useEffect(() => {
    if (!isEditMode) {
      if (policyType === "Self" || policyType === "Company Policy") {
        setFormData(prev => ({
          ...prev,
          policyHolderName: displayName
        }));
      } else if (policyType === "Dependent") {
        setFormData(prev => ({
          ...prev,
          policyHolderName: ""
        }));
      }
    }
  }, [policyType, displayName, isEditMode]);

  const handlePolicyTypeChange = (type: string) => {
    setPolicyType(type);
    setSelectedDependent("");
    
    if (!isEditMode) {
      if (type === "Self" || type === "Company Policy") {
        setFormData(prev => ({
          ...prev,
          policyHolderName: displayName
        }));
      } else if (type === "Dependent") {
        setFormData(prev => ({
          ...prev,
          policyHolderName: ""
        }));
      }
    }
  };

  // Filter out "Self" from dependents - only show actual dependents
  const filteredDependents = dependents.filter(dep => dep.Relation !== "Self");

  // Check for edit mode on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const insuranceId = urlParams.get('insuranceId');
    
    if (insuranceId) {
      setIsEditMode(true);
      setInsuranceRecordId(parseInt(insuranceId));
      fetchInsuranceRecordDetails(parseInt(insuranceId));
    }
  }, [location]);

  const fetchInsuranceRecordDetails = async (id: number) => {
    setIsLoadingRecord(true);
    try {
      const response = await insuranceRecordAPI.CRMGetCustomerInsuranceRecordDetailsById(id);
      const recordDetails = response?.["Insurance Records Details"]?.[0];
      const documents = response?.["Insurance Records Documnets"] || [];
      
      if (recordDetails) {
        // Populate form with existing data
        setFormData({
          policyHolderName: recordDetails.PolicyHolderName || "",
          policyFrom: recordDetails.PolicyFrom ? formatDateForInput(recordDetails.PolicyFrom) : "",
          policyTo: recordDetails.PolicyTo ? formatDateForInput(recordDetails.PolicyTo) : "",
          insuranceType: recordDetails.TypeOfInsurance?.toString() || "",
          insuranceCompany: recordDetails.InsuranceCompany?.toString() || "",
          policyNumber: recordDetails.PolicyNumber || "",
          policyName: recordDetails.PolicyName || "",
          sumAssured: recordDetails.SumAssured || "",
          premiumAmount: recordDetails.PremiumAmount || "",
          nominee: recordDetails.Nominee || recordDetails.NomineeName || "",
          tpa: recordDetails.TPA || "",
          additionalNotes: recordDetails.AdditionalNotes || "",
          isFloater: recordDetails.IsFloater ?? false,
          maturityDate: recordDetails.MaturityDate ? formatDateForInput(recordDetails.MaturityDate) : "",
          maturityAmount: recordDetails.MaturityAmount || "",
          surrenderDate: recordDetails.SurrenderDate ? formatDateForInput(recordDetails.SurrenderDate) : "",
        });

        // Set existing documents
        setExistingDocuments(documents);
        // Clear uploaded files when loading existing record
        setUploadedFiles([]);

        // Set policy type and dependent if applicable
        if (recordDetails.PolicyType === "Dependent") {
          setSelectedDependent(recordDetails.PolicyHolderName);
          setPolicyType("Dependent");
        } else {
          setPolicyType(recordDetails.PolicyType || "Company Policy");
        }
      }
    } catch (error) {
      console.error("Error fetching record details:", error);
      toast.error("Error loading insurance record details");
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const formatDateForInput = (dateStr: string): string => {
    if(!dateStr) return "";
    return dateStr.split("T")[0];
  };

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const types = await insuranceRecordAPI.CRMFetchInsuranceTypeDropDown();
        if (types && Array.isArray(types)) {
          setInsuranceTypes(types);
        } else {
          toast.error("Failed to load insurance types");
        }
      } catch (error) {
        console.error("Error fetching insurance types:", error);
        toast.error("Error loading insurance types");
      }
    };

    fetchInsuranceTypes();
  }, []);

  useEffect(() => {
    const fetchDependents = async () => {
      setIsLoadingDependents(true);
      try {
        const dependentsList = await insuranceRecordAPI.CRMGetEmployeeSelfAndDependentList();
        if (dependentsList && Array.isArray(dependentsList)) {
          setDependents(dependentsList);
        } else {
          toast.error("Failed to load dependents");
          setDependents([]);
        }
      } catch (error) {
        console.error("Error fetching dependents:", error);
        toast.error("Error loading dependents");
        setDependents([]);
      } finally {
        setIsLoadingDependents(false);
      }
    };

    fetchDependents();
  }, []);

  useEffect(() => {
    const fetchInsuranceCompanies = async () => {
      if (!formData.insuranceType) {
        setInsuranceCompanies([]);
        return;
      }

      try {
        const selectedType = insuranceTypes.find(
          (type) => type.InsuranceTypeId.toString() === formData.insuranceType
        );

        if (!selectedType) {
          setInsuranceCompanies([]);
          return;
        }

        const companies = await insuranceRecordAPI.CRMGetInsuranceCompanyDetails(selectedType.InsuranceTypeId);
        if (companies && Array.isArray(companies)) {
          setInsuranceCompanies(companies);
        } else {
          toast.error("No companies found for this insurance type");
          setInsuranceCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching insurance companies:", error);
        toast.error("Error loading insurance companies");
        setInsuranceCompanies([]);
      }
    };

    fetchInsuranceCompanies();
  }, [formData.insuranceType, insuranceTypes]);

  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // If insurance type changes, reset insurance company
    if (name === "insuranceType") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        insuranceCompany: "" // Reset insurance company when type changes
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not supported. Please upload JPEG, PNG, or PDF files.`);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const fileId = Math.random().toString(36).substring(2, 9);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setUploadedFiles(prev => [...prev, { file, preview, id: fileId }]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles(prev => [{ file, preview: '/pdf-icon.png', id: fileId }, ...prev]);
      }
    });

    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.info("File removed");
  };

  const removeExistingDocument = async (documentId: number) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this document?");
      if (!confirmDelete) return;
      console.log("Deleting document with ID:", documentId);
      setIsLoading(true);
      const response = await insuranceRecordAPI.DeleteInsuranceRecordDocument(documentId);
      
      if (response?.message || response?.Message) {
        toast.success("Document deleted successfully");
        // Remove from existing documents
        setExistingDocuments(prev => prev.filter(doc => doc.InsuranceRecordDocumentId !== documentId));
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error deleting document");
    } finally {
      setIsLoading(false);
    }
  };

  const viewDocument = (documentPath: string, documentName: string) => {
    if (documentPath) {
      // Open in new tab
      window.open(documentPath, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("Document path not available");
    }
  };

  const validateForm = (): boolean => {
    if (policyType === "Dependent") {
      if (!selectedDependent) {
        toast.error("Please select a dependent");
        return false;
      }
    } else {
      if (!formData.policyHolderName.trim()) {
        toast.error("Please enter policy holder name");
        return false;
      }
    }

    const requiredFields = [
      'policyFrom',
      'policyTo', 
      'insuranceType',
      'insuranceCompany',
      'policyNumber',
      'policyName'
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        toast.error(`Please fill in ${fieldName}`);
        return false;
      }
    }

    if (formData.policyFrom && formData.policyTo) {
      const fromDate = new Date(formData.policyFrom);
      const toDate = new Date(formData.policyTo);
      if (toDate <= fromDate) {
        toast.error("Policy To date must be after Policy From date");
        return false;
      }
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const saveToast = toast.loading(isEditMode ? "Updating insurance record..." : "Saving insurance record...");

    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "";
      const memberId = "1";
      const loginRefId = localStorage.getItem("LoginRefId") || "0";

      const formDataToSend = new FormData();

      const selectedInsuranceType = insuranceTypes.find(
        type => type.InsuranceTypeId.toString() === formData.insuranceType
      );

      const selectedInsuranceCompany = insuranceCompanies.find(
        company => company.InsuranceCompanyId.toString() === formData.insuranceCompany
      );

      const selectedDependentDetails = filteredDependents.find(
        dep => dep.EmployeeName === selectedDependent
      );

      // InsuranceRecordId = 0 for create, actual ID for edit
      formDataToSend.append("InsuranceRecordId", isEditMode ? insuranceRecordId.toString() : "0");
      formDataToSend.append("EmployeeRefId", employeeRefId);
      formDataToSend.append(
        "PolicyHolderName",
        policyType === "Dependent" ? selectedDependent : formData.policyHolderName
      );
      formDataToSend.append("NomineeName", formData.nominee);
      formDataToSend.append("Nominee", formData.nominee);
      formDataToSend.append("PolicyNumber", formData.policyNumber);
      formDataToSend.append("PolicyName", formData.policyName);
      formDataToSend.append("TypeOfInsurance", formData.insuranceType);
      formDataToSend.append("InsuranceCompany", formData.insuranceCompany);
      formDataToSend.append("PolicyFrom", formatDateForAPI(formData.policyFrom));
      formDataToSend.append("PolicyTo", formatDateForAPI(formData.policyTo));
      formDataToSend.append("MemberId", memberId);
      formDataToSend.append("AdditionalNotes", formData.additionalNotes);
      formDataToSend.append("PolicyStatus", "1");
      formDataToSend.append("PolicyType", policyType);
      formDataToSend.append("IsActive", "1");
      formDataToSend.append("CreatedBy", loginRefId);
      formDataToSend.append("SumAssured", formData.sumAssured);
      formDataToSend.append("PremiumAmount", formData.premiumAmount);
      formDataToSend.append("TPA", formData.tpa);
      formDataToSend.append("Maturitydate", formData.maturityDate ? formatDateForAPI(formData.maturityDate) : "");
      formDataToSend.append("MaturityAmount", formData.maturityAmount || "");
      formDataToSend.append("SurrenderDate", formData.surrenderDate ? formatDateForAPI(formData.surrenderDate) : "");
      formDataToSend.append("UploadedBy", loginRefId);
      formDataToSend.append("EmployeeProfileId", "0");

      // Dependent details
      if (policyType === "Dependent" && selectedDependentDetails) {
        formDataToSend.append("DependentId", selectedDependentDetails.EmployeeDependentDetailsId.toString());
        formDataToSend.append("DependentRelation", selectedDependentDetails.Relation);
      } else {
        formDataToSend.append("DependentId", "0");
        formDataToSend.append("DependentRelation", "");
      }

      // Scheduled dates (example static)
      const insuranceScheduledData = {
        InsScheduledDate: [
          {
            Frequency: 1,
            ReminderType: 2,
            CustomizeDay: "Monday",
            InsuranceShceduledDate: "20-01-2025",
            IsMailSent: 0,
          },
        ],
      };
      formDataToSend.append("InsuranceScheduledDate", JSON.stringify(insuranceScheduledData));

      if (isEditMode) {
        const documentMetadata: Array<{DocumentName: string, DocumentPath: string}> = [];
        existingDocuments.forEach(doc => {
          documentMetadata.push({
            DocumentName: doc.DocumentName,
            DocumentPath: doc.DocumentPath
          });
        });
        
        uploadedFiles.forEach(fileObj => {
          const originalName = fileObj.file.name;
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 10);
          const uniqueFileName = `${timestamp}_${randomStr}_${originalName}`;        
          documentMetadata.push({
            DocumentName: originalName,
            DocumentPath: '' 
          });
          
          formDataToSend.append("DocumentFiles", fileObj.file, uniqueFileName);
        });
        if (documentMetadata.length > 0) {
          formDataToSend.append("ExistingDocumentMetadata", JSON.stringify(documentMetadata));
        }
        
      } else {
        // For new records, just send uploaded files
        uploadedFiles.forEach(fileObj => {
          const originalName = fileObj.file.name;
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 10);
          const uniqueFileName = `${timestamp}_${randomStr}_${originalName}`;
          formDataToSend.append("DocumentFiles", fileObj.file, uniqueFileName);
        });
      }
      const result = await insuranceRecordAPI.CRMSaveCustomerInsuranceRecordDetails(formDataToSend);

      console.log("Backend response:", result);

      if (result?.Message || result?.message) {
        toast.dismiss(saveToast);
        toast.success(result.Message || result.message);
        navigate("/insurance-record");
        if (!isEditMode) {
          // Reset form for new entry
          setFormData({
            policyHolderName: displayName,
            policyFrom: "",
            policyTo: "",
            insuranceType: "",
            insuranceCompany: "",
            policyNumber: "",
            policyName: "",
            sumAssured: "",
            premiumAmount: "",
            nominee: "",
            tpa: "",
            additionalNotes: "",
            isFloater: false,
            maturityDate: "",
            maturityAmount: "",
            surrenderDate: "",
          });
          setSelectedDependent("");
          setUploadedFiles([]);
          setExistingDocuments([]);
          setInsuranceCompanies([]);
          setPolicyType("Company Policy");
        } else {
          // Refresh to get the updated document list
          fetchInsuranceRecordDetails(insuranceRecordId);
          navigate(`/insurance-record`);
        }

      } else {
        toast.dismiss(saveToast);
        toast.error(`Failed to ${isEditMode ? "update" : "save"} record. Please try again.`);
      }

    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast.dismiss(saveToast);
      toast.error("An error occurred while saving the record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carousel logic
  const [visibleStart, setVisibleStart] = useState(0);
  const visibleCount = 4;

  const getVisibleLocations = () => {
    return locationData.slice(visibleStart, visibleStart + visibleCount);
  };

  const handleLocationNext = () => {
    if (visibleStart + visibleCount < locationData.length) {
      setVisibleStart(visibleStart + 1);
    }
  };

  const handleLocationPrev = () => {
    if (visibleStart > 0) {
      setVisibleStart(visibleStart - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleStart((prev) =>
        prev + visibleCount >= locationData.length ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview.startsWith('blob:') || file.preview.startsWith('data:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // Get file extension from filename
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Check if file is an image
  const isImageFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };

  // Check if file is PDF
  const isPdfFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ext === 'pdf';
  };

  // Combine existing and newly uploaded documents in one array with proper typing
  const allDocuments: CombinedDocument[] = [
    ...existingDocuments.map(doc => ({ 
      isExisting: true as const,
      InsuranceRecordDocumentId: doc.InsuranceRecordDocumentId,
      InsuranceRecordId: doc.InsuranceRecordId,
      DocumentName: doc.DocumentName,
      DocumentPath: doc.DocumentPath
    })),
    ...uploadedFiles.map(fileObj => ({ 
      isExisting: false as const,
      file: fileObj.file,
      preview: fileObj.preview,
      id: fileObj.id
    }))
  ];

  return (
    <div className="ins-record-container">
      {/* Header Section */}
      <div className="ins-record-header">
        <div className="ins-record-header-content">
          <button 
            className="ins-back-btn"
            onClick={() => navigate("/insurance-record")}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Records
          </button>
          <div className="ins-header-title">
            <h1>
              {isEditMode ? "Edit Insurance Record" : "Add New Insurance Record"}
            </h1>
            <p className="ins-subtitle">
              {isEditMode 
                ? "Update your existing insurance policy details" 
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="ins-record-form-container">
        {/* Policy Type Selection */}
        <div className="ins-policy-type-section">
          <h3 className="ins-section-title">
            <FontAwesomeIcon icon={faUser} className="ins-section-icon" />
            Select Policy Type
          </h3>
          <div className="ins-policy-type-cards">
            {["Company Policy", "Self", "Dependent"].map((type) => (
              <div
                key={type}
                className={`ins-policy-type-card ${policyType === type ? "active" : ""}`}
                onClick={() => {
                  setPolicyType(type);
                  setSelectedDependent("");
                }}
              >
                <div className="ins-policy-type-icon">
                  {type === "Company Policy" && <FontAwesomeIcon icon={faBuilding} />}
                  {type === "Self" && <FontAwesomeIcon icon={faUser} />}
                  {type === "Dependent" && <FontAwesomeIcon icon={faUserCheck} />}
                </div>
                <div className="ins-policy-type-name">{type}</div>
                {policyType === type && (
                  <div className="ins-policy-type-check">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingRecord && (
          <div className="ins-loading-section">
            <div className="ins-loading-spinner"></div>
            <p>Loading insurance record details...</p>
          </div>
        )}

        {/* Form Grid */}
        <div className="ins-form-grid">
          {/* Policy Holder / Dependent Field */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faUser} className="ins-input-icon" />
              {policyType === "Dependent" ? "Select Dependent" : "Policy Holder Name"}
              <span className="ins-required"> *</span>
            </label>
            {policyType === "Dependent" ? (
              <div className="ins-custom-select">
                <select
                  value={selectedDependent}
                  onChange={(e) => setSelectedDependent(e.target.value)}
                  required
                  disabled={isLoadingDependents || isLoadingRecord}
                  className="ins-form-select"
                >
                  <option value="">
                    {isLoadingDependents ? "Loading dependents..." : "Choose a dependent"}
                  </option>
                  {filteredDependents.map((dep) => (
                    <option key={dep.EmployeeDependentDetailsId} value={dep.EmployeeName}>
                      {dep.EmployeeName} ({dep.Relation})
                    </option>
                  ))}
                </select>
                <div className="ins-select-arrow">▼</div>
              </div>
            ) : (
              <input
                name="policyHolderName"
                placeholder="Enter policy holder name"
                value={formData.policyHolderName}
                onChange={handleInputChange}
                required
                disabled={isLoadingRecord}
                className="ins-form-input"
              />
            )}
          </div>

          {/* Policy Dates */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="ins-input-icon" />
              Policy From
              <span className="ins-required"> *</span>
            </label>
            <input
              name="policyFrom"
              type="date"
              value={formData.policyFrom}
              onChange={handleInputChange}
              required
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="ins-input-icon" />
              Policy To
              <span className="ins-required"> *</span>
            </label>
            <input
              name="policyTo"
              type="date"
              value={formData.policyTo}
              onChange={handleInputChange}
              required
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          {/* Insurance Type */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faFileAlt} className="ins-input-icon" />
              Type of Insurance
              <span className="ins-required"> *</span>
            </label>
            <div className="ins-custom-select">
              <select
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleInputChange}
                required
                disabled={isLoadingRecord}
                className="ins-form-select"
              >
                <option value="">Select insurance type</option>
                {insuranceTypes.map((type) => (
                  <option key={type.InsuranceTypeId} value={type.InsuranceTypeId}>
                    {type.InsuranceType}
                  </option>
                ))}
              </select>
              <div className="ins-select-arrow">▼</div>
            </div>
          </div>

          {/* Insurance Company */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faBuilding} className="ins-input-icon" />
              Insurance Company
              <span className="ins-required"> *</span>
            </label>
            <div className="ins-custom-select">
              <select
                name="insuranceCompany"
                value={formData.insuranceCompany}
                onChange={handleInputChange}
                required
                disabled={!formData.insuranceType || insuranceCompanies.length === 0 || isLoadingRecord}
                className="ins-form-select"
              >
                <option value="">Select company</option>
                {insuranceCompanies.map((company) => (
                  <option
                    key={company.InsuranceCompanyId}
                    value={company.InsuranceCompanyId}
                  >
                    {company.InsuranceCompanyName}
                  </option>
                ))}
              </select>
              <div className="ins-select-arrow">▼</div>
            </div>
          </div>

          {/* Policy Number and Name */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faIdCard} className="ins-input-icon" />
              Policy Number
              <span className="ins-required"> *</span>
            </label>
            <input
              name="policyNumber"
              placeholder="Enter policy number"
              value={formData.policyNumber}
              onChange={handleInputChange}
              required
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faFileSignature} className="ins-input-icon" />
              Policy Name
              <span className="ins-required"> *</span>
            </label>
            <input
              name="policyName"
              placeholder="Enter policy name"
              value={formData.policyName}
              onChange={handleInputChange}
              required
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          {/* Sum Assured and Premium */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faMoneyBillWave} className="ins-input-icon" />
              Sum Assured
            </label>
            <div className="ins-input-with-symbol">
              <span className="ins-currency-symbol">₹</span>
              <input
                name="sumAssured"
                placeholder="0.00"
                value={formData.sumAssured}
                onChange={handleInputChange}
                type="number"
                disabled={isLoadingRecord}
                className="ins-form-input with-symbol"
              />
            </div>
          </div>

          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faMoneyBillWave} className="ins-input-icon" />
              Premium Amount
            </label>
            <div className="ins-input-with-symbol">
              <span className="ins-currency-symbol">₹</span>
              <input
                name="premiumAmount"
                placeholder="0.00"
                value={formData.premiumAmount}
                onChange={handleInputChange}
                type="number"
                disabled={isLoadingRecord}
                className="ins-form-input with-symbol"
              />
            </div>
          </div>

          {/* TPA and Nominee */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faBuilding} className="ins-input-icon" />
              TPA (Third Party Administrator)
            </label>
            <input
              name="tpa"
              placeholder="Enter TPA name"
              value={formData.tpa}
              onChange={handleInputChange}
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faUserCheck} className="ins-input-icon" />
              Nominee
            </label>
            <input
              name="nominee"
              placeholder="Enter nominee name"
              value={formData.nominee}
              onChange={handleInputChange}
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          {/* Maturity Details */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="ins-input-icon" />
              Maturity Date
            </label>
            <input
              name="maturityDate"
              type="date"
              placeholder="Maturity Date"
              value={formData.maturityDate}
              onChange={handleInputChange}
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>

          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faMoneyBillWave} className="ins-input-icon" />
              Maturity Amount
            </label>
            <div className="ins-input-with-symbol">
              <span className="ins-currency-symbol">₹</span>
              <input
                name="maturityAmount"
                placeholder="0.00"
                value={formData.maturityAmount}
                onChange={handleInputChange}
                type="number"
                disabled={isLoadingRecord}
                className="ins-form-input with-symbol"
              />
            </div>
          </div>

          {/* Surrender Date */}
          <div className="ins-form-group">
            <label className="ins-form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="ins-input-icon" />
              Surrender Date
            </label>
            <input
              name="surrenderDate"
              type="date"
              placeholder="Surrender Date"
              value={formData.surrenderDate}
              onChange={handleInputChange}
              disabled={isLoadingRecord}
              className="ins-form-input"
            />
          </div>
        </div>

        {/* Floater / Individual Toggle */}
        <div className="">
          <h3 className="ins-section-title">
            <FontAwesomeIcon icon={faUser} className="ins-section-icon" />
            Policy Coverage
          </h3>
          <div className="ins-floater-toggle">
            <button
              className={`ins-floater-option ${!formData.isFloater ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, isFloater: false }))}
              type="button"
              disabled={isLoadingRecord}
            >
              <span className="ins-floater-label">Individual</span>
            </button>
            <button
              className={`ins-floater-option ${formData.isFloater ? "active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, isFloater: true }))}
              type="button"
              disabled={isLoadingRecord}
            >
              <span className="ins-floater-label">Floater</span>
            </button>
          </div>
        </div>

        {/* Document Upload Section */}
        <div style={{marginLeft:'500px',marginTop:'-108px'}}>
          <div className="ins-upload-container">
            <label className="ins-upload-area">
              <input 
                type="file" 
                style={{ display: "none" }} 
                onChange={handleFileUpload}
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.JPG,.JPEG,.PNG,.PDF"
                disabled={isLoadingRecord}
              />
              <div className="ins-upload-content">
                <FontAwesomeIcon icon={faUpload} size="2x" />
                <div className="ins-upload-text">
                  <p className="ins-upload-title">Click to upload or drag and drop</p>
                  <p className="ins-upload-subtitle">JPG, PNG or PDF (Max 5MB per file)</p>
                </div>
              </div>
            </label>

           {allDocuments.length > 0 && (
  <div className="ins-documents-section" style={{ marginTop:'-142px', marginLeft:'20px' }}>
    <div className="ins-files-header">
      <h4>Documents ({allDocuments.length})</h4>
    </div>

    <div className="ins-files-grid">
      {allDocuments.map((doc, idx) => (
        <div key={doc.isExisting ? doc.InsuranceRecordDocumentId : doc.id} className="ins-file-card">
          <div className="ins-file-preview">
            {doc.isExisting 
              ? isImageFile(doc.DocumentName) 
                ? <img 
                    src={doc.DocumentPath} 
                    alt={doc.DocumentName} 
                    className="ins-preview-image" 
                    onClick={() => viewDocument(doc.DocumentPath, doc.DocumentName)}
                  />
                : <div className="ins-pdf-preview" onClick={() => viewDocument(doc.DocumentPath, doc.DocumentName)}>
                    <FontAwesomeIcon icon={faFileAlt} size="2x" />
                  </div>
              : doc.file.type.startsWith('image/')
                ? <img src={doc.preview} alt={doc.file.name} className="ins-preview-image" />
                : <div className="ins-pdf-preview">
                    <FontAwesomeIcon icon={faFileAlt} size="2x" />
                  </div>
            }

            <div className="ins-file-actions">
              {doc.isExisting 
                ? <>
                    <button 
                      className="ins-view-file-btn"
                      onClick={() => viewDocument(doc.DocumentPath, doc.DocumentName)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button 
                      className="ins-remove-file-btn"
                      onClick={() => removeExistingDocument(doc.InsuranceRecordDocumentId)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                : <button 
                    className="ins-remove-file-btn"
                    onClick={() => removeFile(doc.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
              }
            </div>
          </div>

          <div className="ins-file-info">
            <span className="ins-file-name clickable">
              {doc.isExisting ? doc.DocumentName : doc.file.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          </div>
        </div>

        {/* Additional Notes */}
        <div className="ins-notes-section">
          <h3 className="ins-section-title">
            <FontAwesomeIcon icon={faStickyNote} className="ins-section-icon" />
            Additional Notes
          </h3>
          <textarea
            className="ins-notes-textarea"
            name="additionalNotes"
            placeholder="Enter any additional notes or important information about this policy..."
            value={formData.additionalNotes}
            onChange={handleInputChange}
            rows={4}
            disabled={isLoadingRecord}
          />
        </div>

        {/* Action Buttons */}
        <div className="ins-action-buttons">
          <button 
            className="ins-save-btn"
            onClick={handleSave}
            disabled={isLoading || isLoadingRecord}
          >
            {isLoading ? (
              <>
                <div className="ins-loading-spinner-small"></div>
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                {isEditMode ? "Update Record" : "Save Record"}
              </>
            )}
          </button>
          <button
            className="ins-cancel-btn"
            onClick={() => navigate("/insurance-record")}
            type="button"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
        </div>
      </div>

      {/* Our Locations Section */}
      <Container>
        <section className="our-location-section" style={{ marginBottom: "48px" }}>
          <h2 className="our-location-heading">Our Locations</h2>
          <div className="location-carousel-wrapper">
            <button className="carousel-arrow left" onClick={handleLocationPrev}>
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
            <button className="carousel-arrow right" onClick={handleLocationNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default InsuranceRecord;