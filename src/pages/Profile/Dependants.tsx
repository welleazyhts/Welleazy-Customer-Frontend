import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faEnvelope,
  faCalendarAlt,
  faPhone,
  faVenusMars,
  faUsers,
  faSave,
  faTimes,
  faArrowLeft,
  faUserPlus,
  faCheckSquare,
  faSquare,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faChevronLeft,
  faChevronRight,
  faSortDown,
  faSortUp,
  faSearch,
  faSyncAlt,
  faKey,
  faLock,
  faCheckCircle,
  faTimesCircle,
  faRedo,
  faToggleOn
} from "@fortawesome/free-solid-svg-icons";
import "./Dependants.css";
import { DependantsAPI } from "../../api/dependants";
import { CRMMaritalStatusResponse } from '../../types/MangeProfile';
import Select from 'react-select';
import Input from '../../components/Input';
import { toast } from "react-toastify";
import { MangeProfileApi } from "../../api/MangeProfile";
import {
  CRMInsertUpdateEmployeeDependantDetailsRequest,
  CRMFetchDependentDetailsForEmployeeResponse
} from '../../types/dependants'
import { gymServiceAPI } from "../../api/GymService";
import { Relationship } from '../../types/GymServices';

const Dependants: React.FC = () => {
  // Initial form state
  const initialFormData = {
    memberId: "",
    username: "",
    relationship: "",
    gender: "",
    name: "",
    dateOfBirth: "",
    email: "",
    mobileNo: "",
    maritalStatus: "",
    occupation: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [consentAccess, setConsentAccess] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<CRMMaritalStatusResponse[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Relationship states
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  // Dependents list state
  const [dependents, setDependents] = useState<CRMFetchDependentDetailsForEmployeeResponse[]>([]);
  const [fetchingDependents, setFetchingDependents] = useState(false);
  const [showDependentsList, setShowDependentsList] = useState(true); // Start with list view
  const [editingDependent, setEditingDependent] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Search and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('DependentName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filteredDependents, setFilteredDependents] = useState<CRMFetchDependentDetailsForEmployeeResponse[]>([]);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [fetchingEditData, setFetchingEditData] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Active/Inactive filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');


  // Load relationships on mount
  const loadRelationships = async () => {
    setLoadingRelationships(true);
    try {
      const relationshipsData = await gymServiceAPI.CRMRelationShipList();
      // Filter out "Self" relationship - not needed for dependents
      const filteredRelationships = relationshipsData.filter(
        relationship => relationship.Relationship.toLowerCase() !== 'self'
      );
      setRelationships(filteredRelationships);
    } catch (error) {
      console.error("Failed to load relationships:", error);
      toast.error("Failed to load relationships. Please try again.");
    } finally {
      setLoadingRelationships(false);
    }
  };

  const relationshipOptions = relationships.map((item) => ({
    value: item.RelationshipId.toString(),
    label: item.Relationship
  }));

  // Fetch Marital Status data
  const fetchMaritalStatus = async () => {
    try {
      const data = await MangeProfileApi.CRMMaritalStatus();

      // Ensure "Married" and "Unmarried" are included as minimum options
      const defaultOptions = [
        { MaritalStatusId: 1, MaritalDescription: "Married" },
        { MaritalStatusId: 2, MaritalDescription: "Unmarried" }
      ];

      const mergedOptions = [...data];
      defaultOptions.forEach(def => {
        if (!mergedOptions.some(opt => opt.MaritalDescription?.toLowerCase() === def.MaritalDescription.toLowerCase())) {
          mergedOptions.push(def);
        }
      });

      setMaritalStatusOptions(mergedOptions);
    } catch (err) {
      // API endpoint doesn't exist, use default options
      // This is expected behavior, so we don't log it as an error
      setMaritalStatusOptions([
        { MaritalStatusId: 1, MaritalDescription: "Married" },
        { MaritalStatusId: 2, MaritalDescription: "Unmarried" }
      ]);
      // Don't set error state since this is expected and we have working defaults
    }
  };

  // Fetch dependents list
  const fetchDependents = async () => {
    const EmployeeRefId = localStorage.getItem("EmployeeRefId");

    if (!EmployeeRefId) {
      toast.error("Employee reference ID not found");
      return;
    }

    setFetchingDependents(true);
    try {
      const response = await DependantsAPI.CRMFetchDependentDetailsForEmployee({
        EmployeeRefId: parseInt(EmployeeRefId),
      });

      // Ensure the data is always an array
      let dependentsArray: CRMFetchDependentDetailsForEmployeeResponse[] = [];
      if (Array.isArray(response)) {
        dependentsArray = response;
      } else if (response && typeof response === 'object' && 'Dependents' in response && Array.isArray((response as any).Dependents)) {
        dependentsArray = (response as any).Dependents;
      }

      setDependents(dependentsArray);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching dependents:", error);
      toast.error("Failed to fetch dependent details");
      setDependents([]); // fallback
    } finally {
      setFetchingDependents(false);
    }
  };


  // Handle search filtering and sorting
  const handleFilterAndSort = () => {
    let result = [...dependents];

    // Apply active/inactive filter
    if (activeFilter !== 'all') {
      result = result.filter(dependent =>
        activeFilter === 'active' ? dependent.IsActive : !dependent.IsActive
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(dependent =>
        dependent.DependentName?.toLowerCase().includes(term) ||
        dependent.DependentMemberId?.toLowerCase().includes(term) ||
        dependent.Relationship?.toLowerCase().includes(term) ||
        dependent.DependentEmailId?.toLowerCase().includes(term) ||
        dependent.DependentMobileNo?.includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField as keyof CRMFetchDependentDetailsForEmployeeResponse] || '';
      const bValue = b[sortField as keyof CRMFetchDependentDetailsForEmployeeResponse] || '';

      if (sortDirection === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    setFilteredDependents(result);
  };

  // Handle column sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fetch Dependent details for editing
  const fetchDependentDetailsForEdit = async (dependentId: number) => {
    try {
      setFetchingEditData(true);
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");

      if (!EmployeeRefId) {
        toast.error("Employee reference ID not found");
        return;
      }

      // Find the dependent from existing list
      const dependent = dependents.find(d => d.EmployeeDependentDetailsId === dependentId);

      if (dependent) {
        const relationship = relationships.find(r => r.RelationshipId === dependent.DependentRelationShip);
        const relationshipValue = relationship ? relationship.RelationshipId.toString() : "";

        // Find marital status by Description (String)
        // dependent.MaritalStatus is now a string from API
        const maritalStatus = maritalStatusOptions.find(m => m.MaritalDescription === dependent.MaritalStatus);
        const maritalStatusValue = maritalStatus ? maritalStatus.MaritalDescription : (dependent.MaritalStatus || "");

        setFormData({
          memberId: dependent.DependentMemberId || "",
          username: dependent.DependentEmailId || "",
          relationship: relationshipValue,
          gender: dependent.DependentGender || "",
          name: dependent.DependentName || "",
          dateOfBirth: formatDateForInput(dependent.DOB || dependent.DependentDOB),
          email: dependent.DependentEmailId || "",
          mobileNo: dependent.DependentMobileNo || "",
          maritalStatus: maritalStatusValue,
          occupation: dependent.Occupation || "",
          password: ""
        });

        setConsentAccess(dependent.AccessProfilePermission || false);
        setEditingDependent(dependent.EmployeeDependentDetailsId);
        setIsEditing(true);
        setShowForm(true);
        setShowDependentsList(false);

        if (!dependent.DependentEmailId) {
          toast.info("Editing dependent. Please enter username and password to update.");
        } else {
          toast.success("Dependent details loaded for editing.");
        }
      } else {
        toast.error("Dependent not found");
      }
    } catch (error) {
      console.error("Error fetching dependent details:", error);
      toast.error("Failed to load dependent details for editing");
    } finally {
      setFetchingEditData(false);
    }
  };

  // Function to handle adding new dependent
  const handleAddNewDependent = () => {
    // Reset form to initial state
    setFormData(initialFormData);
    setConsentAccess(false);
    setSameAsPrimary(false);
    setEditingDependent(null);
    setIsEditing(false);
    setShowPassword(false);
    setError(null);

    // Note: Member ID will be auto-generated by the backend when the dependent is created

    // Show form and hide list
    setShowForm(true);
    setShowDependentsList(false);

    toast.info("Adding new dependent");
  };

  useEffect(() => {
    fetchMaritalStatus();
    loadRelationships();
    fetchDependents();
  }, []);

  // Apply filtering and sorting when dependents, searchTerm, sortField, or sortDirection change
  useEffect(() => {
    if (dependents.length > 0) {
      handleFilterAndSort();
    }
  }, [dependents, searchTerm, sortField, sortDirection, activeFilter]);

  // Note: Member ID is auto-generated by the backend, no need to fetch it on mount

  // Update email and mobile when sameAsPrimary is checked
  useEffect(() => {
    if (sameAsPrimary) {
      setFormData(prev => ({
        ...prev,
        email: "",
        mobileNo: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        email: "",
        mobileNo: ""
      }));
    }
  }, [sameAsPrimary]);

  // Calculate pagination based on filteredDependents
  const totalPages = Math.ceil(filteredDependents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDependents = filteredDependents.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parts2 = dateString.split('-');
    if (parts2.length === 3) {
      const [month, day, year] = parts2;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateString;
  };



  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter dependent name");
      return;
    }

    if (!formData.relationship) {
      toast.error("Please select relationship");
      return;
    }

    if (!formData.gender) {
      toast.error("Please select gender");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.mobileNo || formData.mobileNo.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const EmployeeId = localStorage.getItem("EmployeeRefId");
    if (!EmployeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const selectedRelationship = relationships.find(r => r.RelationshipId.toString() === formData.relationship);
      const relationshipId = selectedRelationship ? selectedRelationship.RelationshipId : 0;



      // Get the dependent to edit
      let dependentToUpdate = null;
      if (editingDependent) {
        dependentToUpdate = dependents.find(d => d.EmployeeDependentDetailsId === editingDependent);
      }

      const saveData: CRMInsertUpdateEmployeeDependantDetailsRequest = {
        EmployeeDependentDetailsId: editingDependent || 0,
        EmployeeId: parseInt(EmployeeId),
        DependentId: dependentToUpdate?.DependentId || formData.memberId,
        DependentRelationShip: relationshipId,
        DependentName: formData.name,
        DependentMobileNo: formData.mobileNo,
        DependentGender: formData.gender,
        DependentDOB: formatDateForAPI(formData.dateOfBirth),
        AccessProfilePermission: consentAccess,
        MaritalStatus: formData.maritalStatus,
        Occupation: formData.occupation || "",
        DependentEmailId: formData.email,
        IsActive: true,
        DependentMemberId: formData.memberId,
        DependentUserName: formData.username,
        Password: formData.password || (isEditing ? "" : "default123")
      };

      console.log("Saving dependent data:", saveData);
      const response = await DependantsAPI.CRMInsertUpdateEmployeeDependantDetails(saveData);

      // Log the response data to console
      console.log("API Response:", response);
      if (response.data) {
        console.log("Newly created/updated dependent data:", response.data);
        console.log("Dependent ID:", response.data.id);
        console.log("Member ID:", response.data.member_id);
        console.log("Name:", response.data.name);
        console.log("Email:", response.data.email);
        console.log("Marital Status:", response.data.marital_status);
        console.log("Occupation:", response.data.occupation);
      }

      if (response.Message === "Dependant Data Already Exists") {
        toast.error("Dependent with these details already exists");
      } else {
        const successMessage = isEditing ? "Dependent updated successfully!" : "Dependent saved successfully!";
        toast.success(successMessage);

        // Show additional info if data is available
        if (response.data) {
          toast.info(`Dependent ${response.data.name} (${response.data.member_id}) has been ${isEditing ? 'updated' : 'added'}`);
        }

        // Fetch updated dependents list
        await fetchDependents();

        // Clear form and redirect to list view
        handleCancel();

        // Member ID is auto-generated by the backend, no need to fetch it
      }

    } catch (error) {
      console.error("Error saving dependent:", error);
      toast.error("Failed to save dependent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to initial state
    setFormData(initialFormData);
    setConsentAccess(false);
    setSameAsPrimary(false);
    setEditingDependent(null);
    setIsEditing(false);
    setShowPassword(false);
    setError(null);

    // Always show list view after cancel (both for new and edit)
    setShowForm(false);
    setShowDependentsList(true);

    // Member ID will be auto-generated by the backend when creating a new dependent

    toast.info(isEditing ? "Edit cancelled" : "Form cleared");
  };

  const handleEditDependent = (dependent: CRMFetchDependentDetailsForEmployeeResponse) => {
    fetchDependentDetailsForEdit(dependent.EmployeeDependentDetailsId);
  };

  const handleDeleteDependent = async (dependentId: number) => {
    if (!window.confirm("Are you sure you want to delete this dependent? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);

      const response = await DependantsAPI.DeactivateEmployeeDependent(dependentId);

      if (response.success) {
        toast.success(response.message || "Dependent deleted successfully!");
        // Refresh the dependents list to reflect the change
        await fetchDependents();
      } else {
        toast.error(response?.message || "Failed to delete dependent");
      }

    } catch (error) {
      console.error("Error deleting dependent:", error);
      toast.error("Failed to delete dependent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDependent = async (dependentId: number) => {
    if (!window.confirm("Are you sure you want to activate this dependent?")) {
      return;
    }

    try {
      setLoading(true);
      const EmployeeId = localStorage.getItem("EmployeeRefId");

      if (!EmployeeId) {
        toast.error("Employee ID not found");
        return;
      }

      // Find the dependent to activate
      const dependentToActivate = dependents.find(d => d.EmployeeDependentDetailsId === dependentId);
      if (!dependentToActivate) {
        toast.error("Dependent not found");
        return;
      }

      // Use the update API to set IsActive to true
      const activateData: CRMInsertUpdateEmployeeDependantDetailsRequest = {
        EmployeeDependentDetailsId: dependentId,
        EmployeeId: parseInt(EmployeeId),
        DependentId: dependentToActivate.DependentId,
        DependentRelationShip: dependentToActivate.DependentRelationShip,
        DependentName: dependentToActivate.DependentName,
        DependentMobileNo: dependentToActivate.DependentMobileNo,
        DependentGender: dependentToActivate.DependentGender,
        DependentDOB: dependentToActivate.DependentDOB,
        AccessProfilePermission: dependentToActivate.AccessProfilePermission,
        MaritalStatus: dependentToActivate.MaritalStatus,
        Occupation: dependentToActivate.Occupation,
        DependentEmailId: dependentToActivate.DependentEmailId,
        IsActive: true,
        DependentMemberId: dependentToActivate.DependentMemberId,
        DependentUserName: dependentToActivate.DependentEmailId || "",
        Password: ""
      };

      const response = await DependantsAPI.CRMInsertUpdateEmployeeDependantDetails(activateData);

      if (response.Message === "Dependant Data Already Exists") {
        toast.error("Dependent with these details already exists");
      } else {
        toast.success("Dependent activated successfully!");
        // Refresh the dependents list to reflect the change
        await fetchDependents();
      }

    } catch (error) {
      console.error("Error activating dependent:", error);
      toast.error("Failed to activate dependent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    if (showDependentsList) {
      // When switching from list to form, add new dependent
      handleAddNewDependent();
    } else {
      // When switching from form to list, show dependents list
      setShowForm(false);
      setShowDependentsList(true);
      fetchDependents();
    }
  };

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];

  const occupationOptions = [
    { value: "", label: "Select Occupation" },
    { value: "Self Employed", label: "Self Employed" },
    { value: "Government Employee", label: "Government Employee" },
    { value: "Private Employee", label: "Private Employee" },
    { value: "Business", label: "Business" },
    { value: "Student", label: "Student" },
    { value: "Housewife", label: "Housewife" },
    { value: "Retired", label: "Retired" },
    { value: "Unemployed", label: "Unemployed" }
  ];

  const maritalStatusOptionsFormatted = maritalStatusOptions.map((option) => ({
    value: option.MaritalDescription,
    label: option.MaritalDescription,
    originalValue: option
  }));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate counts for filter buttons
  const activeCount = dependents.filter(d => d.IsActive).length;
  const inactiveCount = dependents.filter(d => !d.IsActive).length;
  const totalCount = dependents.length;

  return (
    <div className="dependants-container">
      {/* Header Section */}
      <div className="dependants-header">
        <div className="dependants-header-content">
          <button
            className="dependants-back-btn"
            onClick={() => window.history.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>

          <div className="dependants-header-title">
            <h1>
              <FontAwesomeIcon icon={faUsers} className="header-icon" />
              Dependants
            </h1>
            <p className="dependants-subtitle">
              {showForm ? (isEditing ? "Edit Dependent Profile" : "Add New Dependent") : "Manage your dependents"}
            </p>
          </div>

          <div className="dependants-header-actions">
            <button
              className="view-dependents-btn"
              onClick={toggleView}
            >
              <FontAwesomeIcon icon={showDependentsList ? faUserPlus : faEye} />
              {showDependentsList ? " Add New Dependent" : " View Dependents"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Form View */}
      {showForm && (
        <div className="dependants-form-container">
          {/* Loading Indicator */}
          {(loading || fetchingEditData) && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>{fetchingEditData ? "Loading dependent details..." : "Saving..."}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Consent Section */}
          <div className="consent-section">
            <div className="consent-item">
              <div
                className="consent-checkbox"
                onClick={() => setConsentAccess(!consentAccess)}
              >
                <FontAwesomeIcon
                  icon={consentAccess ? faCheckSquare : faSquare}
                  className={consentAccess ? "checkbox-checked" : "checkbox-unchecked"}
                />
                <span className="consent-label">
                  Are you willing to give consent to access your profile
                </span>
              </div>
            </div>

            <div className="consent-item">
              <div
                className="consent-checkbox"
                onClick={() => setSameAsPrimary(!sameAsPrimary)}
              >
                <FontAwesomeIcon
                  icon={sameAsPrimary ? faCheckSquare : faSquare}
                  className={sameAsPrimary ? "checkbox-checked" : "checkbox-unchecked"}
                />
                <span className="consent-label">
                  Set mobile number and email id same as primary
                </span>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="dependants-form-grid">
            {/* Member ID */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faIdCard} className="input-icon" />
                Member ID <span className="required">*</span>
              </label>
              <Input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleInputChange}
                placeholder="Generating Member ID..."
                disabled
                className="dependants-form-input"
              />
            </div>

            {/* Username */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                Username {isEditing && <span className="required">*</span>}
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={isEditing ? "Enter username to update" : "Enter username"}
                className="dependants-form-input"
                disabled={loading || loadingRelationships || fetchingEditData}
              />
            </div>

            {/* Relationship */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faUsers} className="input-icon" />
                Relationship <span className="required">*</span>
              </label>
              <div className="custom-select">
                <Select
                  name="relationship"
                  value={relationshipOptions.find(opt => opt.value === formData.relationship)}
                  onChange={(selectedOption) =>
                    handleSelectChange("relationship", selectedOption?.value || "")
                  }
                  options={relationshipOptions}
                  placeholder="Select Relationship"
                  isDisabled={loading || loadingRelationships || fetchingEditData}
                  className="react-select-dropdown"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#ccc',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#ccc' }
                    })
                  }}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faVenusMars} className="input-icon" />
                Gender <span className="required">*</span>
              </label>
              <div className="custom-select">
                <Select
                  name="gender"
                  value={genderOptions.find(opt => opt.value === formData.gender)}
                  onChange={(selectedOption) =>
                    handleSelectChange("gender", selectedOption?.value || "")
                  }
                  options={genderOptions}
                  placeholder="Select Gender"
                  isDisabled={loading || loadingRelationships || fetchingEditData}
                  className="react-select-dropdown"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#ccc',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#ccc'
                      }
                    })
                  }}
                />
              </div>
            </div>

            {/* Name */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                Name <span className="required">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter dependent name"
                className="dependants-form-input"
                disabled={loading || loadingRelationships || fetchingEditData}
              />
            </div>

            {/* Date of Birth */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                Date of Birth
              </label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="dependants-form-input"
                disabled={loading || loadingRelationships || fetchingEditData}
              />
            </div>

            {/* Email */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                Mail ID <span className="required">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="dependants-form-input"
                disabled={sameAsPrimary || loading || loadingRelationships || fetchingEditData}
              />
            </div>

            {/* Mobile No */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                Mobile No <span className="required">*</span>
              </label>
              <Input
                type="text"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                className="dependants-form-input"
                disabled={sameAsPrimary || loading || loadingRelationships || fetchingEditData}
                maxLength={10}
              />
            </div>

            {/* Marital Status */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                Marital Status
              </label>
              <div className="custom-select">
                <Select
                  name="maritalStatus"
                  value={maritalStatusOptionsFormatted.find(
                    (opt) => opt.value === formData.maritalStatus
                  )}
                  onChange={(selectedOption) =>
                    setFormData(prev => ({
                      ...prev,
                      maritalStatus: selectedOption?.value || ""
                    }))
                  }
                  options={maritalStatusOptionsFormatted}
                  placeholder="Select Marital Status"
                  isDisabled={loading || loadingRelationships || fetchingEditData}
                  className="react-select-dropdown"
                  styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    menu: base => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({
                      ...base,
                      borderColor: '#ccc',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#ccc'
                      }
                    })
                  }}
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="dependants-form-group">
              <label className="dependants-form-label">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                Occupation
              </label>
              <div className="custom-select">
                <Select
                  name="occupation"
                  value={occupationOptions.find(opt => opt.value === formData.occupation)}
                  onChange={(selectedOption) =>
                    handleSelectChange("occupation", selectedOption?.value || "")
                  }
                  options={occupationOptions}
                  placeholder="Select Occupation"
                  isDisabled={loading || loadingRelationships || fetchingEditData}
                  className="react-select-dropdown"
                  styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    menu: base => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({
                      ...base,
                      borderColor: '#ccc',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#ccc'
                      }
                    })
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="dependants-action-buttons">
            <button
              className="dependants-save-btn"
              onClick={handleSave}
              disabled={loading || loadingRelationships || fetchingEditData}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  {isEditing ? "Update Dependent" : "Save Dependent"}
                </>
              )}
            </button>
            <button
              className="dependants-cancel-btn"
              onClick={handleCancel}
              disabled={loading || loadingRelationships || fetchingEditData}
            >
              <FontAwesomeIcon icon={faTimes} />
              {isEditing ? "Cancel Edit" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Dependents List View - Table Layout */}
      {showDependentsList && (
        <div className="dependents-table-container">
          <div className="dependents-table-header">
            <div className="dependents-table-title">
              <h2>
                <FontAwesomeIcon icon={faUsers} />
                My Dependents
              </h2>
              <span className="dependents-table-count">
                {filteredDependents.length} dependent{filteredDependents.length !== 1 ? 's' : ''} shown
              </span>
            </div>

            <div className="dependents-table-controls">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search dependents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="table-action-btn refresh-btn" onClick={fetchDependents}>
                <FontAwesomeIcon icon={faSyncAlt} />
                Refresh
              </button>

              <button
                className="table-action-btn add-btn"
                onClick={handleAddNewDependent}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Add New Dependent
              </button>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="status-filter-container">
            <div className="status-filter-buttons">
              <button
                className={`status-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <FontAwesomeIcon icon={faUsers} />
                All
                <span className="filter-count">{totalCount}</span>
              </button>

              <button
                className={`status-filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                Active
                <span className="filter-count">{activeCount}</span>
              </button>

              <button
                className={`status-filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setActiveFilter('inactive')}
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                Inactive
                <span className="filter-count">{inactiveCount}</span>
              </button>
            </div>
          </div>

          {fetchingDependents ? (
            <div className="table-loading">
              <div className="table-loading-spinner"></div>
              <p>Loading dependents...</p>
            </div>
          ) : filteredDependents.length === 0 ? (
            <div className="table-empty-state">
              <div className="table-empty-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>No Dependents Found</h3>
              <p>
                {searchTerm
                  ? "No results match your search."
                  : activeFilter === 'active'
                    ? "No active dependents found."
                    : activeFilter === 'inactive'
                      ? "No inactive dependents found."
                      : "You haven't added any dependents yet."
                }
              </p>
              <button
                className="add-btn table-action-btn"
                onClick={handleAddNewDependent}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Add Your First Dependent
              </button>
            </div>
          ) : (
            <>
              <div className="dependents-table-wrapper">
                <table className="dependents-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('DependentName')}>
                        Name
                        {sortField === 'DependentName' && (
                          <FontAwesomeIcon
                            icon={sortDirection === 'asc' ? faSortUp : faSortDown}
                            className="sort-icon"
                          />
                        )}
                      </th>
                      <th>Member ID</th>
                      <th>Relationship</th>
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDependents.map((dependent) => (
                      <tr key={dependent.EmployeeDependentDetailsId} className={dependent.IsActive ? '' : 'inactive-row'}>
                        <td>
                          <div className="font-medium text-gray-900">
                            {dependent.DependentName}
                          </div>
                        </td>
                        <td className="font-mono text-sm">
                          {dependent.DependentMemberId}
                        </td>
                        <td>
                          <span className="relationship-badge">
                            {dependent.Relationship}
                          </span>
                        </td>
                        <td>{dependent.DOB || dependent.DependentDOB}</td>
                        <td>{dependent.DependentGender}</td>
                        <td>
                          {dependent.DependentMobileNo ? (
                            <a href={`tel:${dependent.DependentMobileNo}`} className="text-blue-600 hover:text-blue-800">
                              {dependent.DependentMobileNo}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td>
                          {dependent.DependentEmailId ? (
                            <a href={`mailto:${dependent.DependentEmailId}`} className="text-blue-600 hover:text-blue-800 truncate block max-w-[200px]">
                              {dependent.DependentEmailId}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`table-status-badge ${dependent.IsActive ? 'status-active' : 'status-inactive'}`}>
                            {dependent.IsActive ? (
                              <>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Active
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faTimesCircle} />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="dependt-edit-btn"
                              onClick={() => handleEditDependent(dependent)}
                              disabled={loading || fetchingEditData}
                              title="Edit Dependent"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>

                            {dependent.IsActive ? (
                              <button
                                className="dependt-delete-btn"
                                onClick={() => handleDeleteDependent(dependent.EmployeeDependentDetailsId)}
                                disabled={loading}
                                title="Deactivate Dependent"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            ) : (
                              <button
                                className="dependt-activate-btn"
                                onClick={() => handleActivateDependent(dependent.EmployeeDependentDetailsId)}
                                disabled={loading}
                                title="Activate Dependent"
                              >
                                <FontAwesomeIcon icon={faToggleOn} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="table-pagination">
                  <div className="pagination-info">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDependents.length)} of {filteredDependents.length} dependents
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                      Previous
                    </button>

                    <div className="page-numbers">
                      {getPageNumbers().map(number => (
                        <button
                          key={number}
                          className={`page-number ${currentPage === number ? 'active' : ''}`}
                          onClick={() => goToPage(number)}
                        >
                          {number}
                        </button>
                      ))}
                    </div>

                    <button
                      className="page-btn"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dependants;