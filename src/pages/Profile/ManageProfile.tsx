import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
  faUser,
  faIdCard,
  faBuilding,
  faEnvelope,
  faCalendarAlt,
  faPhone,
  faVenusMars,
  faTint,
  faSave,
  faTimes,
  faEdit,
  faHome,
  faBriefcase,
  faMapMarkerAlt,
  faMapPin,
  faUserPlus,
  faCamera,
  faTrash,
  faUpload
} from "@fortawesome/free-solid-svg-icons";
import "./ManageProfile.css";
import { MangeProfileApi } from "../../api/MangeProfile";
import { CRMMaritalStatusResponse, CRMStateListResponse } from '../../types/MangeProfile';
import Select from 'react-select';
import Input from '../../components/Input';
import { toast } from "react-toastify";

const ManageProfile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [addressType, setAddressType] = useState("Home");
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<CRMMaritalStatusResponse[]>([]);
  const [stateOptions, setStateOptions] = useState<CRMStateListResponse[]>([]);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeAddressDetailsId, setEmployeeAddressDetailsId] = useState<number>(0);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const [employeeProfileId, setEmployeeProfileId] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);


  const [formData, setFormData] = useState({
    memberId: "",
    userName: "",
    employeeId: "",
    corporateName: "",
    customerName: "",
    gender: "",
    personalEmail: "",
    corporateEmail: "",
    dateOfBirth: "",
    mobileNo: "",
    maritalStatus: "",
    bloodGroup: "",
  });

  const [addressData, setAddressData] = useState({
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    state: "",
    city: "",
    pincode: "",
  });

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const fetchProfilePicture = async () => {
    const employeeRefIdStr = localStorage.getItem('EmployeeRefId');
    if (!employeeRefIdStr) return;

    const employeeRefId = Number(employeeRefIdStr);

    try {
      const imageData =
        await MangeProfileApi.CRMFetchCustomerProfilePicture({
          EmployeeRefId: employeeRefId,
        });

      if (Array.isArray(imageData) && imageData.length > 0) {
        const profile = imageData[0];

        setProfileImage(profile.ProfileImagePath);
        setEmployeeProfileId(profile.EmployeeProfileId); // 


      } else {
        // No image exists
        setEmployeeProfileId(0);
      }
    } catch (error) {
      console.error('Failed to fetch profile picture:', error);
    }
  };



  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const employeeRefId = Number(localStorage.getItem('EmployeeRefId'));

    try {
      const res = await MangeProfileApi.CRMSaveCustomerProfilePicture(
        employeeProfileId,
        employeeRefId,
        file
      );

      setProfileImage(res.Message);
      toast.success('Profile picture updated');
      setIsEditMode(false);
    } catch {
      toast.error('Upload failed');
    } finally {
      event.target.value = '';
    }
  };




  // Fetch Marital Status data
  const fetchMaritalStatus = async () => {
    setLoading(true);
    let apiData: CRMMaritalStatusResponse[] = [];
    try {
      apiData = await MangeProfileApi.CRMMaritalStatus();
    } catch (err) {
      console.error('Failed to fetch marital status:', err);
      // We don't set global error here to allow fallback to defaults
    }

    // Ensure "Married" and "Unmarried" are included as minimum options
    const defaultOptions = [
      { MaritalStatusId: 1, MaritalDescription: "Married" },
      { MaritalStatusId: 2, MaritalDescription: "Unmarried" }
    ];

    const mergedOptions = [...apiData];
    defaultOptions.forEach(def => {
      if (!mergedOptions.some(opt => opt.MaritalDescription?.toLowerCase() === def.MaritalDescription.toLowerCase())) {
        mergedOptions.push(def);
      }
    });

    setMaritalStatusOptions(mergedOptions);
    setLoading(false);
  };

  // Fetch State data
  const fetchStates = async () => {
    try {
      const data = await MangeProfileApi.CRMStateList();
      setStateOptions(data);
    } catch (err) {
      console.error('Failed to fetch states:', err);
      setError('Failed to load states');
    }
  };

  // Fetch Cities based on selected state
  const fetchCities = async (stateId: number) => {
    try {
      const data = await MangeProfileApi.CRMCityList(stateId);
      setCityOptions(data);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const parts2 = dateString.split('/');
    if (parts2.length === 3) {
      const [day, month, year] = parts2;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateString;
  };

  // Fetch Profile Details
  const fetchProfileDetails = async () => {
    const EmployeeRefId = localStorage.getItem("EmployeeRefId");

    if (EmployeeRefId) {
      setLoading(true);
      try {
        const profileData = await MangeProfileApi.CRMLoadCustomerProfileDetails(parseInt(EmployeeRefId));

        console.log("Profile Data:", profileData);

        const maritalStatusId = profileData.MaritalStatus;
        let maritalStatusDesc = "";

        if (maritalStatusId && maritalStatusOptions.length > 0) {
          const maritalOption = maritalStatusOptions.find(
            option => option.MaritalStatusId === maritalStatusId
          );
          maritalStatusDesc = maritalOption?.MaritalDescription || "";
        }
        const stateId = profileData.StateId;
        let stateName = profileData.StateName || "";

        if (stateId && stateOptions.length > 0) {
          const stateOption = stateOptions.find(
            option => option.StateId === stateId
          );
          stateName = stateOption?.StateName || stateName;
          if (stateId) {
            fetchCities(stateId);
          }
        }

        const formattedDOB = formatDateForInput(profileData.Employee_DOB || "");
        setFormData({
          memberId: profileData.MemberId || "",
          userName: profileData.EmployeeName || "",
          employeeId: profileData.EmployeeId || "",
          corporateName: profileData.CorporateName || "",
          customerName: profileData.EmployeeName || "",
          gender: profileData.Gender || "",
          personalEmail: profileData.PersonalEmailid || "",
          corporateEmail: profileData.Emailid || "",
          dateOfBirth: formattedDOB,
          mobileNo: profileData.MobileNo || "",
          maritalStatus: maritalStatusDesc,
          bloodGroup: profileData.BloodGroup || "",
        });

        setAddressData({
          addressLine1: profileData.AddressLineOne || "",
          addressLine2: profileData.AddressLineTwo || "",
          landmark: profileData.Landmark || "",
          state: stateName,
          city: profileData.DistrictName || "",
          pincode: profileData.Pincode || "",
        });

        if (profileData.AddressType === "work") {
          setAddressType("Office");
        } else if (profileData.AddressType === "home") {
          setAddressType("Home");
        } else {
          setAddressType(profileData.AddressType || "Home");
        }

      } catch (error) {
        console.error('Failed to fetch profile details:', error);
        setError('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Employee reference ID not found');
    }
  };

  // Initialize all data
  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMaritalStatus(),
        fetchStates(),
        fetchProfilePicture() // Fetch profile picture
      ]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (maritalStatusOptions.length > 0 && stateOptions.length > 0) {
      fetchProfileDetails();
    }
  }, [maritalStatusOptions, stateOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (activeTab === "details") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setAddressData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (activeTab === "details") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setAddressData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStateChange = (selectedOption: any) => {
    const stateId = selectedOption?.value || "";
    const stateName = selectedOption?.label || "";

    setAddressData(prev => ({
      ...prev,
      state: stateName,
      city: ""
    }));

    if (selectedOption?.originalValue?.StateId) {
      fetchCities(selectedOption.originalValue.StateId);
    }
  };

  const maritalStatusOptionsFormatted = maritalStatusOptions.map((option) => ({
    value: option.MaritalDescription,
    label: option.MaritalDescription,
    originalValue: option
  }));

  const stateOptionsFormatted = stateOptions.map((option) => ({
    value: option.StateId.toString(),
    label: option.StateName,
    originalValue: option
  }));

  const handleSave = async () => {
    try {
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");

      if (!EmployeeRefId) {
        setError("EmployeeRefId not found");
        return;
      }

      const requestData = {
        employeeRefId: parseInt(EmployeeRefId),
        employeeName: formData.customerName,
        gender: formData.gender,
        dob: formatDateForInput(formData.dateOfBirth),
        mobileNo: formData.mobileNo,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        personalEmailid: formData.personalEmail,
      };

      console.log("UPDATE REQUEST:", requestData);
      const response = await MangeProfileApi.CRMUpdateMangeProfileDetails(requestData);
      toast.success(response);
      setIsEditMode(false);

    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Error updating profile!");
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    fetchProfileDetails();
  };

  const handleAddressTypeChange = async (type: string) => {
    const EmployeeRefId = localStorage.getItem("EmployeeRefId");

    if (EmployeeRefId) {
      try {
        const addressDataResponse = await MangeProfileApi.CRMLoadCustomerProfileDetailsByType(
          parseInt(EmployeeRefId),
          type.toLowerCase()
        );

        if (addressDataResponse && addressDataResponse.length > 0) {
          const addr = addressDataResponse[0];

          setEmployeeAddressDetailsId(addr.EmployeeAddressDetailsId || 0);

          let stateName = "";
          let cityName = "";
          if (stateOptions.length > 0) {
            const stateOption = stateOptions.find(state => state.StateId === addr.StateId);
            stateName = stateOption?.StateName || "";
            if (addr.StateId) {
              try {
                const cities = await MangeProfileApi.CRMCityList(addr.StateId);
                setCityOptions(cities);
                const cityOption = cities.find(city => city.DistrictId === addr.CityId);
                cityName = cityOption?.DistrictName || "";
              } catch (cityError) {
                console.error('Failed to fetch cities for state:', addr.StateId, cityError);
              }
            }
          }

          setAddressData({
            addressLine1: addr.AddressLineOne || "",
            addressLine2: addr.AddressLineTwo || "",
            landmark: addr.Landmark || "",
            state: stateName,
            city: cityName,
            pincode: addr.Pincode || ""
          });
        } else {
          setEmployeeAddressDetailsId(0);
          setAddressData({
            addressLine1: "",
            addressLine2: "",
            landmark: "",
            state: "",
            city: "",
            pincode: ""
          });
          if (addressType !== type) {
            setCityOptions([]);
          }
        }
        setAddressType(type);
      } catch (error) {
        console.error(`Failed to load ${type} address details:`, error);
        setEmployeeAddressDetailsId(0);
        setAddressType(type);
        setAddressData({
          addressLine1: "",
          addressLine2: "",
          landmark: "",
          state: "",
          city: "",
          pincode: ""
        });
      }
    } else {
      setError('Employee reference ID not found');
      setAddressType(type);
    }
  };

  const handleAddressSave = async () => {
    try {
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");

      if (!EmployeeRefId) {
        toast.error("EmployeeRefId not found");
        return;
      }

      const selectedState = stateOptions.find(
        (s) => s.StateName === addressData.state
      );
      const selectedCity = cityOptions.find(
        (c) => c.CityName === addressData.city || c.DistrictName === addressData.city
      );

      const requestData = {
        employeeRefId: parseInt(EmployeeRefId),
        employeeAddressDetailsId: employeeAddressDetailsId,
        addressLineOne: addressData.addressLine1,
        addressLineTwo: addressData.addressLine2,
        landmark: addressData.landmark,
        stateId: selectedState?.StateId || 0,
        cityId: selectedCity?.DistrictId || selectedCity?.CityId || 0,
        pincode: addressData.pincode,
        addressType: addressType.toLowerCase()
      };

      console.log("ADDRESS UPDATE REQUEST:", requestData);

      const response = await MangeProfileApi.CRMUpdateMangeProfileAddressDetails(requestData);

      toast.success(response);
      setIsEditMode(false);

      await handleAddressTypeChange(addressType);

    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
    }
  };

  useEffect(() => {
    if (activeTab === "address") {
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");
      if (EmployeeRefId && !addressData.addressLine1) {
        handleAddressTypeChange("Home");
      }
    }
  }, [activeTab]);

  return (
    <div className="manage-profile-container">
      {/* Header Section */}
      <div className="manage-profile-header">
        <div className="manage-profile-header-content">
          <div className="profile-header-left">
            <div className="profile-image-section">
              <div className="profile-image-container">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image-preview"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <FontAwesomeIcon icon={faUser} className="placeholder-icon" />
                  </div>
                )}
                {isEditMode && (
                  <div className="profile-image-actions">
                    <button
                      className="profile-image-action-btn upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className="profile-header-title">
              <h1>
                <FontAwesomeIcon icon={faUser} className="profile-header-icon" />
                Manage Profile
              </h1>
              <p className="profile-subtitle">
                View and update your personal, professional, and address details
              </p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="profile-edit-btn"
              onClick={() => navigate("/dependants")}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              Add Dependant
            </button>

            {!isEditMode ? (
              <button
                className="profile-edit-btn"
                onClick={() => setIsEditMode(true)}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-mode-actions">
                <button
                  className="profile-save-btn large"
                  onClick={activeTab === "details" ? handleSave : handleAddressSave}
                >
                  <FontAwesomeIcon icon={faSave} />
                  Save Changes
                </button>

                <button
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Tab Navigation */}
      <div className="profile-tabs">
        <div className="mange-tabs-container">
          <button
            className={`mange-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <FontAwesomeIcon icon={faUser} />
            Details
          </button>
          <button
            className={`mange-tab-btn ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Address
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="manage-profile-form-container">
        {activeTab === "details" ? (
          <>
            {/* Personal Information Section */}
            <div className="profile-section">
              <h3 className="profile-section-title">
                <FontAwesomeIcon icon={faUser} className="section-icon" />
                Personal Information
              </h3>
              <div className="profile-form-grid">
                {/* Member ID */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faIdCard} className="input-icon" />
                    Member Id <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    placeholder="Enter Member Id"
                    disabled
                  />
                </div>

                {/* User Name */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    User Name <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="userName"
                    value={formData.corporateEmail}
                    onChange={handleInputChange}
                    placeholder="Enter User Name"
                    disabled
                  />
                </div>

                {/* Employee ID */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faIdCard} className="input-icon" />
                    Employee Id <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="Enter Employee Id"
                    disabled
                  />
                </div>


                {/* Corporate Name */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    Corporate Name <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="corporateName"
                    value={formData.corporateName}
                    onChange={handleInputChange}
                    placeholder="Enter Corporate Name"
                    disabled={!isEditMode}
                  />
                </div>


                {/* Customer Name */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    Customer Name <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter Customer Name"
                    disabled={!isEditMode}
                  />
                </div>

                {/* Gender */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faVenusMars} className="input-icon" />
                    Gender <span className="required">*</span>
                  </label>
                  <div className="custom-select">
                    <Select
                      name="gender"
                      value={formData.gender ? { value: formData.gender, label: formData.gender } : null}
                      onChange={(selectedOption) =>
                        setFormData(prev => ({
                          ...prev,
                          gender: selectedOption?.value || ""
                        }))
                      }
                      isDisabled={!isEditMode}
                      options={[
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                        { value: "Other", label: "Other" }
                      ]}
                      placeholder="Select Gender"
                      className="react-select-dropdown"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({
                          ...base,
                          height: '38px',
                          minHeight: '38px',
                          border: '1px solid #ccc',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            borderColor: '#ccc'
                          }
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '36px'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '36px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '14px'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '14px',
                          color: '#999'
                        })
                      }}
                    />
                  </div>
                </div>


                {/*Personal Email ID  */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    Personal Email ID <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    placeholder="Enter Personal Email ID"
                    disabled={!isEditMode}
                  />
                </div>

                {/*Corporate Email ID*/}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    Corporate Email ID <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="corporateEmail"
                    value={formData.corporateEmail}
                    onChange={handleInputChange}
                    placeholder="Enter Corporate Email ID"
                    disabled={!isEditMode}
                  />
                </div>


                {/* Date of Birth */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                    Date Of Birth
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                  />
                </div>

                {/* Mobile No */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faPhone} className="input-icon" />
                    Mobile No <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    placeholder="Enter Mobile Number"
                    disabled={!isEditMode}
                  />
                </div>

                {/* Marital Status */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
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
                        handleSelectChange("maritalStatus", selectedOption?.value || "")
                      }
                      isDisabled={!isEditMode}
                      options={maritalStatusOptionsFormatted}
                      placeholder="Select Marital Status"
                      className="react-select-dropdown"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faTint} className="input-icon" />
                    Blood Group
                  </label>
                  <div className="custom-select">
                    <Select
                      name="bloodGroup"
                      value={bloodGroupOptions.find(opt => opt.value === formData.bloodGroup)}
                      onChange={(selected) =>
                        handleSelectChange("bloodGroup", selected?.value || "")
                      }
                      isDisabled={!isEditMode}
                      options={bloodGroupOptions}
                      placeholder="Select Blood Group"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Address Tab Content */
          <div className="address-section">
            {/* Address Type Selection */}
            <div className="address-type-section">
              <h3 className="profile-section-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
                Address Type
              </h3>
              <div className="address-type-cards">
                <div
                  className={`address-type-card ${addressType === "Home" ? "active" : ""}`}
                  onClick={() => handleAddressTypeChange("Home")}
                >
                  <FontAwesomeIcon icon={faHome} className="address-type-icon" />
                  <span className="address-type-label">Home</span>
                </div>
                <div
                  className={`address-type-card ${addressType === "Office" ? "active" : ""}`}
                  onClick={() => handleAddressTypeChange("Office")}
                >
                  <FontAwesomeIcon icon={faBriefcase} className="address-type-icon" />
                  <span className="address-type-label">Office</span>
                </div>
                <div
                  className={`address-type-card ${addressType === "Other" ? "active" : ""}`}
                  onClick={() => handleAddressTypeChange("Other")}
                >
                  <FontAwesomeIcon icon={faMapPin} className="address-type-icon" />
                  <span className="address-type-label">Other</span>
                </div>
              </div>
            </div>

            {/* Address Form */}
            <div className="address-form-section">
              <h3 className="profile-section-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
                {addressType} Address Details
              </h3>
              <div className="profile-form-grid">
                {/* Address Line 1 */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                    Address Line 1 <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="addressLine1"
                    value={addressData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Enter address line 1"
                    disabled={!isEditMode}
                  />
                </div>

                {/* Address Line 2 */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                    Address Line 2 <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="addressLine2"
                    value={addressData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Enter address line 2"
                    disabled={!isEditMode}
                  />
                </div>

                {/* Landmark */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                    Landmark (Optional)
                  </label>
                  <Input
                    type="text"
                    name="landmark"
                    value={addressData.landmark}
                    onChange={handleInputChange}
                    placeholder="Enter landmark"
                    disabled={!isEditMode}
                  />
                </div>

                {/* State */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                    State <span className="required">*</span>
                  </label>
                  <div className="custom-select">
                    <Select
                      name="state"
                      value={stateOptionsFormatted.find(
                        (opt) => opt.label === addressData.state
                      )}
                      onChange={handleStateChange}
                      isDisabled={!isEditMode}
                      options={stateOptionsFormatted}
                      placeholder="Select State"
                      className="react-select-dropdown"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({
                          ...base,
                          height: '38px',
                          minHeight: '38px',
                          border: '1px solid #ccc',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            borderColor: '#ccc'
                          }
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '36px'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '36px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '14px'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '14px',
                          color: '#999'
                        })
                      }}
                    />
                  </div>
                </div>

                {/* City/District */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                    City/District <span className="required">*</span>
                  </label>
                  <div className="custom-select">
                    <Select
                      name="city"
                      value={addressData.city ? { value: addressData.city, label: addressData.city } : null}
                      onChange={(selectedOption) =>
                        setAddressData(prev => ({
                          ...prev,
                          city: selectedOption?.value || ""
                        }))
                      }
                      isDisabled={!isEditMode}
                      options={cityOptions.map(city => ({
                        value: city.CityName || city.DistrictName || city,
                        label: city.CityName || city.DistrictName || city
                      }))}
                      placeholder="Select City"
                      className="react-select-dropdown"
                      styles={{
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        menu: base => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({
                          ...base,
                          height: '38px',
                          minHeight: '38px',
                          border: '1px solid #ccc',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            borderColor: '#ccc'
                          }
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: '36px'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          height: '36px',
                          padding: '0 8px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: 0,
                          padding: 0
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '14px'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '14px',
                          color: '#999'
                        })
                      }}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <FontAwesomeIcon icon={faMapPin} className="input-icon" />
                    Pincode <span className="required">*</span>
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    value={addressData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    disabled={!isEditMode}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons (Bottom) */}
        {isEditMode && (
          <div className="profile-action-buttons">
            <button
              className="profile-save-btn large"
              onClick={activeTab === "details" ? handleSave : handleAddressSave}
            >
              <FontAwesomeIcon icon={faSave} />
              Save Changes
            </button>
            <button
              className="profile-cancel-btn large"
              onClick={handleCancel}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProfile;