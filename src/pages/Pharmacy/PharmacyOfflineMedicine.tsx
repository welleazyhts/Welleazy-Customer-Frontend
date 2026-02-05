import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PharmacyOfflineMedicine.css';
import { gymServiceAPI } from '../../api/GymService';
import { CustomerProfile, State, District, Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import { PharmacyAPI } from '../../api/Pharmacy';
import { PharmacyProductList } from '../../types/Pharmacy';

interface MedicineItem {
  id: string;
  name: string;
}

interface FormData {
  beneficiaryType: 'self' | 'dependant';
  name: string;
  contactNumber: string;
  email: string;
  state: string;
  stateId: string;
  city: string;
  cityId: string;
  address: string;
  medicineNames: MedicineItem[];
  relationshipId: string;
  relationshipPersonId: string;
  prescriptionFile: File | null;
}

const PharmacyOfflineMedicine: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    beneficiaryType: 'self',
    name: '',
    contactNumber: '',
    email: '',
    state: '',
    stateId: '',
    city: '',
    cityId: '',
    address: '',
    medicineNames: [],
    relationshipId: '',
    relationshipPersonId: '',
    prescriptionFile: null
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic states and districts
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Relationship states
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Medicine suggestions state
  const [suggestions, setSuggestions] = useState<PharmacyProductList[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [medicineInput, setMedicineInput] = useState<string>('');
  const [products, setProducts] = useState<PharmacyProductList[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const productList = await PharmacyAPI.LoadPharmacyProductList();
        setProducts(productList);
      } catch (err) {
        console.error('Error loading products:', err);
        toast.error('Failed to load medicine list');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Show suggestions when typing
  useEffect(() => {
    const searchProducts = async () => {
      if (medicineInput.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        // Filter products for suggestions based on input
        const filteredSuggestions = products.filter(product =>
          product.Name.toLowerCase().includes(medicineInput.toLowerCase())
        ).slice(0, 8); // Limit to 8 suggestions
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error searching products:', err);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [medicineInput, products]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Reset city when state changes
    if (field === 'stateId') {
      const selectedState = states.find(s => s.StateId.toString() === value);
      setFormData(prev => ({
        ...prev,
        state: selectedState?.StateName || '',
        stateId: value,
        city: '',
        cityId: ''
      }));
    }

    // Reset relationship person when relationship changes
    if (field === 'relationshipId') {
      setFormData(prev => ({
        ...prev,
        relationshipId: value,
        relationshipPersonId: '',
        name: ''
      }));
    }

    // Auto-fill name when relationship person is selected
    if (field === 'relationshipPersonId' && value) {
      const selectedPerson = relationshipPersons.find(p => p.EmployeeDependentDetailsId.toString() === value);
      if (selectedPerson) {
        setFormData(prev => ({
          ...prev,
          name: selectedPerson.DependentName,
          relationshipPersonId: value
        }));
      }
    }
  };

  // Medicine related functions
  const handleMedicineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMedicineInput(value);
  };

  const handleMedicineSelect = (product: PharmacyProductList) => {
    const newMedicine: MedicineItem = {
      id: product.OneMGSearchAllResultDetailsId.toString(),
      name: product.Name
    };

    // Check if medicine already exists
    const exists = formData.medicineNames.some(med => med.id === newMedicine.id);
    if (!exists) {
      setFormData(prev => ({
        ...prev,
        medicineNames: [...prev.medicineNames, newMedicine]
      }));
    }

    setMedicineInput('');
    setShowSuggestions(false);
  };

  const handleMedicineRemove = (medicineId: string) => {
    setFormData(prev => ({
      ...prev,
      medicineNames: prev.medicineNames.filter(med => med.id !== medicineId)
    }));
  };

  const handleAddCustomMedicine = () => {
    if (medicineInput.trim() && medicineInput.trim().length >= 2) {
      const newMedicine: MedicineItem = {
        id: `custom-${Date.now()}`,
        name: medicineInput.trim()
      };

      setFormData(prev => ({
        ...prev,
        medicineNames: [...prev.medicineNames, newMedicine]
      }));
      setMedicineInput('');
      setShowSuggestions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit contact number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.stateId) {
      newErrors.state = 'State is required';
    }

    if (!formData.cityId) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.medicineNames.length === 0) {
      // Fix: Use a string for the error message
      (newErrors as any).medicineNames = 'At least one medicine is required';
    }

    // Dependent validation
    if (formData.beneficiaryType === 'dependant') {
      if (!formData.relationshipId) {
        newErrors.relationshipId = 'Relationship is required';
      }
      if (!formData.relationshipPersonId) {
        newErrors.relationshipPersonId = 'Please select a dependent';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const employeeRefId = localStorage.getItem("EmployeeRefId");
    
    const medicineNamesString = formData.medicineNames
      .map(med => typeof med === 'string' ? med : med.name)
      .join(', ');    
    const nameInitial = formData.name.length >= 2 ? formData.name.substring(0, 2).toUpperCase() : formData.name.toUpperCase();
    const couponData = {
      ApolloId: 0, 
      ApolloSKU: '', 
      Relation: formData.beneficiaryType === 'self' ? 1 : parseInt(formData.relationshipId || '1'),
      Name: formData.name,
      ContactNo: formData.contactNumber,
      Email: formData.email,
      State: parseInt(formData.stateId || '0'),
      City: parseInt(formData.cityId || '0'),
      Address: formData.address,
      CouponName: `Medicine Coupon - ${new Date().toLocaleDateString()}`,
      CreatedBy: employeeRefId ? parseInt(employeeRefId) : 0,
      MedicineName: medicineNamesString,
      prescriptionFile: formData.prescriptionFile
    };
    const response = await PharmacyAPI.GenerateOfflineMedicineCoupon(couponData);

    if (response.Success) {
      const couponInfo = {
        ...formData,
        couponCode: response.CouponCode,
        skuCode: response.SKUCode,
        apolloId: response.ApolloId,
        generatedAt: new Date().toISOString(),
        beneficiaryName: formData.name,
        beneficiaryType: formData.beneficiaryType,
        medicineNames: formData.medicineNames.map(med => typeof med === 'string' ? med : med.name),
        hasPrescription: !!formData.prescriptionFile,
        email: formData.email,
        state: formData.state,
        city: formData.city,
        address: formData.address
      };

      localStorage.setItem('medicineCoupon', JSON.stringify(couponInfo));      
      sessionStorage.setItem('Coupon', response.CouponCode);
      sessionStorage.setItem('Email', formData.email);
      sessionStorage.setItem('ApolloId', response.ApolloId.toString());
      toast.success('Coupon generated successfully!');      
      setTimeout(() => {
        navigate('/pharmacy/coupon-success');
      }, 2000);

    } else {
      toast.error(response.Message || 'Failed to generate coupon');
    }
    
  } catch (error) {
    console.error('Error generating coupon:', error);
    toast.error('Failed to generate coupon. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleReset = () => {
    setFormData({
      beneficiaryType: 'self',
      name: '',
      contactNumber: '',
      email: '',
      state: '',
      stateId: '',
      city: '',
      cityId: '',
      address: '',
      medicineNames: [],
      relationshipId: '',
      relationshipPersonId: '',
      prescriptionFile: null
    });
    setMedicineInput('');
    setErrors({});
  };

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const statesData = await gymServiceAPI.CRMStateList();
        setStates(statesData);
      } catch (error) {
        console.error("Failed to load states:", error);
        toast.error("Failed to load states. Please try again.");
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.stateId) {
        setLoadingDistricts(true);
        try {
          const districtsData = await gymServiceAPI.CRMDistrictList(parseInt(formData.stateId));
          setDistricts(districtsData);
        } catch (error) {
          console.error("Failed to load districts:", error);
          setDistricts([]);
          toast.error("Failed to load districts for the selected state.");
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [formData.stateId]);

  // Load relationships
  useEffect(() => {
    const loadRelationships = async () => {
      if (formData.beneficiaryType === 'dependant') {
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
      }
    };
    loadRelationships();
  }, [formData.beneficiaryType]);

  // Load relationship persons when relationship changes (for dependent mode)
  useEffect(() => {
    const loadRelationshipPersons = async () => {
      if (formData.beneficiaryType === 'dependant' && formData.relationshipId) {
        setLoadingRelationshipPersons(true);
        try {
          const employeeRefId = localStorage.getItem("EmployeeRefId");
          if (!employeeRefId) {
            toast.error("Please log in to select dependents.");
            return;
          }
          const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
            parseInt(employeeRefId),
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
  }, [formData.beneficiaryType, formData.relationshipId]);

  // Load customer profile and auto-fill form
  useEffect(() => {
    const loadCustomerProfile = async () => {
      if (states.length === 0) return;

      setLoadingProfile(true);
      setProfileError(null);
      try {
        const employeeRefId = localStorage.getItem("EmployeeRefId");
        if (!employeeRefId) {
          setProfileError("Please log in to continue with your purchase.");
          setLoadingProfile(false);
          return;
        }

        const profile = await gymServiceAPI.CRMLoadCustomerProfileDetails(parseInt(employeeRefId));
        localStorage.setItem("mobile", profile.MobileNo);
localStorage.setItem("email", profile.Emailid);
localStorage.setItem("employeeName", profile.EmployeeName);
localStorage.setItem("address", profile.Address || profile.AddressLineTwo || "");
localStorage.setItem("pincode", profile.Pincode);
        setCustomerProfile(profile);

        // Find matching state
        const userState = states.find(s => 
          s.StateName === profile.StateName || 
          s.StateId === profile.State
        );

        if (userState) {
          // Load districts for the user's state
          const userDistricts = await gymServiceAPI.CRMDistrictList(userState.StateId);
          setDistricts(userDistricts);

          // Find matching district
          const userDistrict = userDistricts.find(d => 
            d.DistrictName === profile.DistrictName || 
            d.DistrictId === profile.City
          );

          setFormData(prev => ({
            ...prev,
            name: profile.EmployeeName,
            contactNumber: profile.MobileNo,
            email: profile.Emailid,
            state: userState?.StateName || '',
            stateId: userState?.StateId.toString() || '',
            city: userDistrict?.DistrictName || '',
            cityId: userDistrict?.DistrictId.toString() || '',
            address: `${profile.AddressLineOne || ''} ${profile.AddressLineTwo || ''}`.trim(),
            beneficiaryType: 'self',
            relationshipId: '1' // Default to Self relationship
          }));
        }
      } catch (error) {
        console.error("Failed to load customer profile:", error);
        setProfileError("Failed to load your profile information. Please fill the form manually.");
        toast.error("Failed to load your profile information.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadCustomerProfile();
  }, [states]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file format (JPG, PNG, PDF, DOC)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        prescriptionFile: file
      }));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      prescriptionFile: null
    }));
    // Reset file input
    const fileInput = document.getElementById('prescription-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFilePreview = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setShowFilePreview(true);
    }
  };

  return (
    <div className="pharmacy-offline-medicine-page">
      {/* Header */}
      <div className="offline-medicine-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1>Generate Medicine Coupon</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="offline-medicine-container">
        {/* Form Section */}
        <div className="coupon-form-section">
          <div className="form-header">
            <h2>Medicine Request Form</h2>
            <p>Fill in the details to generate your medicine coupon for offline purchase</p>
          </div>

          {loadingProfile && (
            <div className="profile-loading">
              <div className="loading-spinner"></div>
              Loading your profile information...
            </div>
          )}

          {profileError && (
            <div className="profile-error">
              <span>⚠️ {profileError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="coupon-form">
            {/* Beneficiary Type - Single Row */}
            <div className="beneficiary-type-section">
              <label className="beneficiary-label">Generate Medicine Coupon For</label>
              <div className="beneficiary-options-row">
                <label className="beneficiary-option">
                  <input
                    type="radio"
                    name="beneficiaryType"
                    value="self"
                    checked={formData.beneficiaryType === 'self'}
                    onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                  />
                  <span className="beneficiary-radio-custom"></span>
                  <span className="beneficiary-text">Self</span>
                </label>
                <label className="beneficiary-option">
                  <input
                    type="radio"
                    name="beneficiaryType"
                    value="dependant"
                    checked={formData.beneficiaryType === 'dependant'}
                    onChange={(e) => handleInputChange('beneficiaryType', e.target.value)}
                  />
                  <span className="beneficiary-radio-custom"></span>
                  <span className="beneficiary-text">Dependant</span>
                </label>
              </div>
            </div>

            {/* Dependent Mode - Show relationship dropdowns */}
            {formData.beneficiaryType === 'dependant' && (
              <div className="dependent-section">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Relationship *</label>
                    <select
                      className={`form-select ${errors.relationshipId ? 'error' : ''}`}
                      value={formData.relationshipId}
                      onChange={(e) => handleInputChange('relationshipId', e.target.value)}
                      disabled={loadingRelationships}
                    >
                      <option value="">Select Relationship</option>
                      {relationships
                        .filter(rel => rel.RelationshipId !== 1) // Exclude "Self"
                        .map((relationship) => (
                          <option key={relationship.RelationshipId} value={relationship.RelationshipId.toString()}>
                            {relationship.Relationship}
                          </option>
                        ))
                      }
                    </select>
                    {loadingRelationships && <span className="loading-text">Loading relationships...</span>}
                    {errors.relationshipId && <span className="error-message">{errors.relationshipId}</span>}
                  </div>

                  <div className="form-group">
                    {formData.relationshipId && (
                      <>
                        <label className="form-label">
                          {relationshipPersons.length > 1 ? 'Select Dependent *' : 'Dependent Name *'}
                        </label>
                        {relationshipPersons.length > 1 ? (
                          <select
                            className={`form-select ${errors.relationshipPersonId ? 'error' : ''}`}
                            value={formData.relationshipPersonId}
                            onChange={(e) => handleInputChange('relationshipPersonId', e.target.value)}
                            disabled={loadingRelationshipPersons}
                          >
                            <option value="">Select Dependent</option>
                            {relationshipPersons.map((person) => (
                              <option key={person.EmployeeDependentDetailsId} value={person.EmployeeDependentDetailsId.toString()}>
                                {person.DependentName}
                              </option>
                            ))}
                          </select>
                        ) : relationshipPersons.length === 1 ? (
                          <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            readOnly
                            placeholder="Dependent name will auto-fill"
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-input text-muted"
                            value="No dependents found"
                            readOnly
                          />
                        )}
                        {loadingRelationshipPersons && <span className="loading-text">Loading dependents...</span>}
                        {!loadingRelationshipPersons && relationshipPersons.length === 0 && formData.relationshipId && (
                          <span className="warning-text">No dependents found for this relationship.</span>
                        )}
                        {errors.relationshipPersonId && <span className="error-message">{errors.relationshipPersonId}</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Name field for dependent (editable when no person selected) */}
                {formData.relationshipId && !formData.relationshipPersonId && (
                  <div className="form-group">
                    <label className="form-label">Dependent Name *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter dependent name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Personal Information */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  readOnly={formData.beneficiaryType === 'dependant' && !!formData.relationshipPersonId}
                />
                {formData.beneficiaryType === 'dependant' && !!formData.relationshipPersonId && (
                  <span className="info-text">Name is auto-filled from selected dependent.</span>
                )}
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="text"
                  className={`form-input ${errors.contactNumber ? 'error' : ''}`}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  maxLength={10}
                />
                {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  className={`form-select ${errors.state ? 'error' : ''}`}
                  value={formData.stateId}
                  onChange={(e) => handleInputChange('stateId', e.target.value)}
                  disabled={loadingStates}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.StateId} value={state.StateId.toString()}>
                      {state.StateName}
                    </option>
                  ))}
                </select>
                {loadingStates && <span className="loading-text">Loading states...</span>}
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            </div>

            {/* Location Information */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select
                  className={`form-select ${errors.city ? 'error' : ''}`}
                  value={formData.cityId}
                  onChange={(e) => handleInputChange('cityId', e.target.value)}
                  disabled={!formData.stateId || loadingDistricts}
                >
                  <option value="">Select City</option>
                  {districts.map(district => (
                    <option key={district.DistrictId} value={district.DistrictId.toString()}>
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
                {loadingDistricts && <span className="loading-text">Loading cities...</span>}
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className={`form-textarea ${errors.address ? 'error' : ''}`}
                  placeholder="Enter complete address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            </div>

            {/* Medicine Information */}
            <div className='form-row'>
              <div className="form-group medicine-input-group">
                <label className="form-label">Medicine Names *</label>
                <div className="medicine-input-container">
                  <input
                    type="text"
                    className="form-input medicine-input"
                    placeholder="Type medicine name to search..."
                    value={medicineInput}
                    onChange={handleMedicineInputChange}
                    onFocus={() => medicineInput && setShowSuggestions(true)}
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="medicine-suggestions">
                      {suggestions.map((product) => (
                        <div
                          key={product.OneMGSearchAllResultDetailsId}
                          className="suggestion-item"
                          onClick={() => handleMedicineSelect(product)}
                        >
                          <div className="suggestion-content">
                            <div className="suggestion-name">{product.Name}</div>
                            {product.Label && (
                              <div className="suggestion-details">{product.Label}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {medicineInput.trim().length >= 2 && (
                    <button
                      type="button"
                      className="add-custom-medicine-btn"
                      onClick={handleAddCustomMedicine}
                    >
                      Add "{medicineInput}"
                    </button>
                  )}
                </div>
                
                {/* Selected Medicines */}
                <div className="selected-medicines">
                  {formData.medicineNames.map((medicine) => (
                    <div key={medicine.id} className="medicine-tag">
                      <span className="medicine-name">{medicine.name}</span>
                      <button
                        type="button"
                        className="medicine-remove"
                        onClick={() => handleMedicineRemove(medicine.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Fix: Use proper error display */}
                {(errors as any).medicineNames && (
                  <span className="error-message">{(errors as any).medicineNames}</span>
                )}
                
                {/* {formData.medicineNames.length === 0 && (
                  <div className="medicine-hint">
                    Start typing to search for medicines or add custom medicine names
                  </div>
                )} */}
              </div>

              <div className="form-group">
                <label className="form-label">Upload Prescription</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="prescription-upload"
                    className="file-input"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e)}
                  />
                  <label htmlFor="prescription-upload" className="file-upload-label">
                    <div className="file-upload-content">
                      <span className="file-upload-icon">📎</span>
                      <span className="file-upload-text">
                        {formData.prescriptionFile ? formData.prescriptionFile.name : 'Choose File'}
                      </span>
                    </div>
                    <span className="file-upload-button">Browse</span>
                  </label>
                </div>
                {formData.prescriptionFile && (
                  <div className="file-info">
                    <span 
                      className="file-name clickable"
                      onClick={() => handleFilePreview(formData.prescriptionFile)}
                    >
                      {formData.prescriptionFile.name}
                    </span>
                    <button 
                      type="button" 
                      className="file-remove"
                      onClick={() => handleRemoveFile()}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="file-upload-hint">
                  Supported formats: JPG, PNG, PDF, DOC (Max: 5MB)
                </div>
              </div>
            </div>

            {/* File Preview Modal */}
            {showFilePreview && selectedFile && (
              <div className="file-preview-modal">
                <div className="file-preview-content">
                  <div className="file-preview-header">
                    <h3>File Preview</h3>
                    <button 
                      className="file-preview-close"
                      onClick={() => setShowFilePreview(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="file-preview-body">
                    {selectedFile.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Prescription preview" 
                        className="file-preview-image"
                      />
                    ) : selectedFile.type === 'application/pdf' ? (
                      <div className="pdf-preview">
                        <div className="pdf-icon">📄</div>
                        <p>PDF File: {selectedFile.name}</p>
                        <a 
                          href={URL.createObjectURL(selectedFile)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="pdf-download-btn"
                        >
                          Open PDF in New Tab
                        </a>
                      </div>
                    ) : (
                      <div className="document-preview">
                        <div className="document-icon">📝</div>
                        <p>Document: {selectedFile.name}</p>
                        <a 
                          href={URL.createObjectURL(selectedFile)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-download-btn"
                        >
                          Download Document
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="file-preview-footer">
                    <button 
                      className="preview-close-btn"
                      onClick={() => setShowFilePreview(false)}
                    >
                      Close
                    </button>
                    <a 
                      href={URL.createObjectURL(selectedFile)} 
                      download={selectedFile.name}
                      className="preview-download-btn"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Clear All
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Generating Coupon...
                  </>
                ) : (
                  'Generate Coupon'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information Sidebar */}
        <div className="info-sidebar">
          <div className="info-card">
            <h3>How it Works</h3>
            <div className="info-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Fill the Form</h4>
                  <p>Provide your details and medicine information</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Generate Coupon</h4>
                  <p>Get your unique medicine coupon code</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Visit Store</h4>
                  <p>Take the coupon to your nearest Apollo pharmacy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="benefits-card">
            <h3>Benefits</h3>
            <ul className="benefits-list">
              <li>✓ Discount on medicines</li>
              <li>✓ Priority service at pharmacy</li>
              <li>✓ Expert consultation available</li>
              <li>✓ Wide range of medicines</li>
              <li>✓ Multiple store locations</li>
            </ul>
          </div>

          <div className="support-card">
            <h3>Need Help?</h3>
            <p>Contact our support team for assistance</p>
            <div className="support-contact">
              <span>📞 1800-123-4567</span>
              <span>✉️ support@apollo.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOfflineMedicine;