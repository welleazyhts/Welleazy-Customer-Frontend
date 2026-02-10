import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PharmacyOfflineMedicine.css';
import { gymServiceAPI } from '../../api/GymService';
import { CustomerProfile, State, District, Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import { PharmacyAPI } from '../../api/Pharmacy';
import { PharmacyMedicine } from '../../types/Pharmacy';

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
  relationshipName: string;
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
    relationshipName: '',
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
  const [suggestions, setSuggestions] = useState<PharmacyMedicine[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [medicineInput, setMedicineInput] = useState<string>('');
  const [products, setProducts] = useState<PharmacyMedicine[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const productList = await PharmacyAPI.getMedicines();
        setProducts(productList || []);
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
          (product.name || '').toLowerCase().includes(medicineInput.toLowerCase())
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

    // Update city name when cityId changes
    if (field === 'cityId') {
      const selectedDistrict = districts.find(d => d.DistrictId.toString() === value);
      setFormData(prev => ({
        ...prev,
        city: selectedDistrict?.DistrictName || '',
        cityId: value
      }));
    }

    // Reset relationship person when relationship changes
    if (field === 'relationshipId') {
      const rel = relationships.find(r => r.RelationshipId.toString() === value);
      setFormData(prev => ({
        ...prev,
        relationshipId: value,
        relationshipName: rel?.Relationship || '',
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
  const handleMedicineSelect = (product: PharmacyMedicine) => {
    const newMedicine: MedicineItem = {
      id: product.id.toString(),
      name: product.name
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
      const medicineNamesString = formData.medicineNames
        .map(med => med.name)
        .join(', ');

      const couponData = {
        vendor: '3', // Assuming a default vendor ID like in Postman example
        coupon_type: formData.beneficiaryType,
        medicine_name: medicineNamesString,
        name: formData.name,
        email: formData.email,
        contact_number: formData.contactNumber,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        relationship: formData.beneficiaryType === 'dependant' ? formData.relationshipName : undefined,
        document: formData.prescriptionFile
      };

      const response = await PharmacyAPI.createCoupon(couponData);

      if (response) {
        // Save coupon data to localStorage for the success page
        const medicineCoupon = {
          couponCode: response.CouponCode || response.coupon_code || 'Pending',
          skuCode: response.SkuCode || response.sku_code || '',
          apolloId: response.ApolloId || response.apollo_id || 0,
          generatedAt: new Date().toISOString(),
          beneficiaryName: formData.name,
          beneficiaryType: formData.beneficiaryType,
          medicineNames: formData.medicineNames.map(m => m.name),
          hasPrescription: !!formData.prescriptionFile,
          email: formData.email,
          state: formData.state,
          city: formData.city,
          address: formData.address
        };
        localStorage.setItem('medicineCoupon', JSON.stringify(medicineCoupon));

        toast.success('Coupon generated successfully!');
        setTimeout(() => {
          navigate('/pharmacy/coupon-success');
        }, 2000);
      } else {
        throw new Error("Validation failed or empty response");
      }

    } catch (error: any) {
      console.error('Error generating coupon:', error);
      toast.error(error.message || 'Failed to generate coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keeping existing loaders for states/districts/relationships/profile as they use GymService which is fine)

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
            {/* Beneficiary Type */}
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

            {/* Dependent Mode */}
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
                        .filter(rel => rel.RelationshipId !== 1)
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
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-input text-muted"
                            value="No dependents found"
                            readOnly
                          />
                        )}
                        {errors.relationshipPersonId && <span className="error-message">{errors.relationshipPersonId}</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  readOnly={formData.beneficiaryType === 'dependant' && !!formData.relationshipPersonId}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="text"
                  className={`form-input ${errors.contactNumber ? 'error' : ''}`}
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
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            </div>

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
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input
                  type="text"
                  className={`form-input ${errors.address ? 'error' : ''}`}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            </div>

            {/* Medicine Search */}
            <div className="medicine-section">
              <div className="form-group search-container">
                <label className="form-label">Add Medicines *</label>
                <div className="search-wrapper">
                  {loadingProducts && <div className="spinner-small" />}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search or Type Medicine Name"
                    value={medicineInput}
                    onChange={(e) => setMedicineInput(e.target.value)}
                  />
                  {/* Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((product, idx) => (
                        <li key={idx} onClick={() => handleMedicineSelect(product)}>
                          {product.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" className="add-btn" onClick={handleAddCustomMedicine}>
                    + Add
                  </button>
                </div>
                {/* Selected Medicines */}
                <div className="selected-medicines">
                  {formData.medicineNames.map((med) => (
                    <span key={med.id} className="medicine-tag">
                      {med.name}
                      <button type="button" onClick={() => handleMedicineRemove(med.id)}>×</button>
                    </span>
                  ))}
                </div>
                {(errors as any).medicineNames && <span className="error-message">{(errors as any).medicineNames}</span>}
              </div>
            </div>

            {/* Prescription Upload */}
            <div className="upload-section">
              <label className="form-label">Upload Prescription (Optional)</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="prescription-upload"
                  onChange={handleFileUpload}
                />
                {formData.prescriptionFile && (
                  <div className="file-preview">
                    <span>{formData.prescriptionFile.name}</span>
                    <button type="button" onClick={handleRemoveFile}>Remove</button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Generate Coupon'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOfflineMedicine;