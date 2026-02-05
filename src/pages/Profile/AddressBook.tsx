import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import Select from 'react-select';
import Input from '../../components/Input';
import './AddressBook.css';
import { AddressBookAPI } from '../../api/AddressBook';
import { EmployeeAddressDetails } from '../../types/AddressBook';
import { MangeProfileApi } from '../../api/MangeProfile';
import { CRMStateListResponse, CRMCityListResponse } from '../../types/MangeProfile';
import { gymServiceAPI } from "../../api/GymService";
import { Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import{EmployeeDeliveryAddress} from'../../types/Pharmacy';

type AddressType = 'Home' | 'Office' | 'Other';

interface AddressFormData {
  AddressType: AddressType;
  ForWhom: 'Self' | 'Other';
  Relationship: string;
  RelationshipPersonName: string;
  RelationshipPersonId: string;
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  StateId: number | '';
  StateName: string;
  CityId: number | '';
  CityName: string;
  Pincode: string;
  ContactNo: string;
  IsDefault: boolean;
}

// Create a relationship ID mapping
const getRelationshipIdFromName = (relationshipName: string): number => {
  const relationshipMap: Record<string, number> = {
    'Self': 1,
    'Dependent': 2,
    'Both': 3,
    'Spouse': 4,
    'Son': 5,
    'Daughter': 6,
    'Father': 7,
    'Mother': 8,
    'Others': 9,
    'Father In Law': 10,
    'Mother In Law': 11,
    'Brother In Law': 12,
    'Sister In Law': 13,
    'Brother': 14,
    'Sister': 15
  };
  
  return relationshipMap[relationshipName] || 1; // Default to Self if not found
};

/* ---------------- TOAST CONFIGURATION ---------------- */

const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored" as const
};

const showSuccessToast = (message: string) => {
  toast.success(message, toastConfig);
};

const showErrorToast = (message: string) => {
  toast.error(message, toastConfig);
};

const showInfoToast = (message: string) => {
  toast.info(message, toastConfig);
};

const showWarningToast = (message: string) => {
  toast.warning(message, toastConfig);
};

/* ---------------- COMPONENT ---------------- */

const AddressBook: React.FC = () => {
  const location = useLocation(); // Get location object to access navigation state
  const navigate = useNavigate(); // For navigation
  
  // Check if we should open the form for editing from navigation state
  const shouldEditAddress = location.state?.editAddress || false;
  const addressData = location.state?.addressData;
  const selectedTabFromNav = location.state?.selectedTab;
  
  const [activeTab, setActiveTab] = useState<AddressType>('Home');
  const [addresses, setAddresses] = useState<EmployeeAddressDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize showForm based on navigation state
  const [showForm, setShowForm] = useState<boolean>(shouldEditAddress || location.state?.openForm || false);
  const [isEditing, setIsEditing] = useState<boolean>(shouldEditAddress);
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(
    shouldEditAddress && addressData ? addressData.EmployeeAddressDetailsId : null
  );
  
  // API Data States
  const [stateOptions, setStateOptions] = useState<any[]>([]);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<any[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingPersons, setLoadingPersons] = useState<boolean>(false);

  // Get DisplayName from localStorage
  const displayName = localStorage.getItem('DisplayName') || '';

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    AddressType: 'Home',
    ForWhom: 'Self',
    Relationship: 'Self', // Initialize with 'Self'
    RelationshipPersonName: displayName,
    RelationshipPersonId: '',
    AddressLineOne: '',
    AddressLineTwo: '',
    Landmark: '',
    StateId: '',
    StateName: '',
    CityId: '',
    CityName: '',
    Pincode: '',
    ContactNo: '',
    IsDefault: false
  });

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  /* ---------------- FETCH INITIAL DATA ---------------- */

  useEffect(() => {
    fetchRelationships();
    fetchStates();
  }, []);

  // Effect to handle navigation states (editing or adding from PharmacyCart)
  useEffect(() => {
    if (shouldEditAddress && addressData) {
      // Set the active tab based on navigation state (from PharmacyCart modal)
      if (selectedTabFromNav) {
        const tabName = capitalizeFirstLetter(selectedTabFromNav) as AddressType;
        setActiveTab(tabName);
      }
      
      // Load the address data into the form for editing
      loadAddressForEdit(addressData);
    } else if (location.state?.openForm) {
      // Handle add new address from navigation (from PharmacyCart "Add New Address" link)
      resetForm();
      setIsEditing(false);
      setCurrentAddressId(null);
      setShowForm(true);
    }
  }, [shouldEditAddress, addressData, selectedTabFromNav]);

  // Function to load address data for editing from navigation state
  const loadAddressForEdit = async (address: EmployeeDeliveryAddress) => {
    try {
      // Fetch cities for the selected state
      if (address.StateId) {
        await fetchCities(address.StateId);
      }

      const isSelf = address.Relationship === 'Self';
      
      if (!isSelf && address.Relationship) {
        try {
          const employeeRefIdStr = localStorage.getItem('EmployeeRefId');
          if (employeeRefIdStr) {
            const relationshipId = getRelationshipIdFromName(address.Relationship);
            const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
              Number(employeeRefIdStr),
              relationshipId
            );
            setRelationshipPersons(personsData);
          }
        } catch (error) {
          console.error('Failed to fetch relationship persons for edit:', error);
        }
      }

      setFormData({
        AddressType: address.AddressType as AddressType || 'Home',
        ForWhom: isSelf ? 'Self' : 'Other',
        Relationship: address.Relationship || '',
        RelationshipPersonName: isSelf ? displayName : address.EmployeeName || '',
        RelationshipPersonId: address.EmployeeDependentDetailsId?.toString() || '',
        AddressLineOne: address.AddressLineOne || '',
        AddressLineTwo: address.AddressLineTwo || '',
        Landmark: address.Landmark || '',
        StateId: address.StateId || '',
        StateName: address.StateName || '',
        CityId: address.CityId || '',
        CityName: address.DistrictName || '',
        Pincode: address.Pincode || '',
        ContactNo: address.MobileNo || '',
        IsDefault: address.IsDefault || false
      });
      
      setCurrentAddressId(address.EmployeeAddressDetailsId);
      setIsEditing(true);
      setShowForm(true);
      
    } catch (error: any) {
      console.error('Error loading address for edit from navigation:', error);
      showErrorToast('Failed to load address details. Please try again.');
    }
  };

  // Fetch Relationship Persons based on selected relationship
  useEffect(() => {
    const fetchRelationshipPersons = async () => {
      if (formData.ForWhom === 'Other' && formData.Relationship) {
        try {
          setLoadingPersons(true);
          const employeeRefIdStr = localStorage.getItem('EmployeeRefId');
          
          if (!employeeRefIdStr) {
            console.error('EmployeeRefId not found');
            return;
          }

          const relationshipId = getRelationshipIdFromName(formData.Relationship);
          const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
            Number(employeeRefIdStr),
            relationshipId
          );

          console.log('Fetched relationship persons:', personsData);
          setRelationshipPersons(personsData);

          // If only one person exists, auto-select it
          if (personsData.length === 1) {
            setFormData(prev => ({
              ...prev,
              RelationshipPersonName: personsData[0].DependentName,
              RelationshipPersonId: personsData[0].EmployeeDependentDetailsId.toString()
            }));
          } else {
            // Reset person selection if multiple persons or none
            setFormData(prev => ({
              ...prev,
              RelationshipPersonName: '',
              RelationshipPersonId: ''
            }));
          }
        } catch (error) {
          console.error('Failed to fetch relationship persons:', error);
          setRelationshipPersons([]);
        } finally {
          setLoadingPersons(false);
        }
      } else {
        setRelationshipPersons([]);
      }
    };

    fetchRelationshipPersons();
  }, [formData.ForWhom, formData.Relationship]);

  // Fetch Relationships
  const fetchRelationships = async () => {
    try {
      setLoadingRelationships(true);
      const data = await gymServiceAPI.CRMRelationShipList();
      
      console.log('Raw relationship data from API:', data);
      
      // Map the API response and add IDs using our mapping function
      const formattedData = data.map((item: Relationship) => {
        const id = getRelationshipIdFromName(item.Relationship);
        return {
          value: item.Relationship,
          label: item.Relationship,
          id: id
        };
      });
      
      console.log('Formatted relationship data with IDs:', formattedData);
      
      setRelationshipOptions(formattedData);
    } catch (err) {
      console.error('Failed to fetch relationships:', err);
      showErrorToast('Failed to load relationships');
      setError('Failed to load relationships');
    } finally {
      setLoadingRelationships(false);
    }
  };

  // Fetch States
  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const data = await MangeProfileApi.CRMStateList();
      const formattedData = data.map((state: CRMStateListResponse) => ({
        value: state.StateId,
        label: state.StateName,
        id: state.StateId
      }));
      setStateOptions(formattedData);
    } catch (err) {
      console.error('Failed to fetch states:', err);
      showErrorToast('Failed to load states');
      setError('Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch Cities based on selected state
  const fetchCities = async (stateId: number) => {
    try {
      setLoadingCities(true);
      const data = await MangeProfileApi.CRMCityList(stateId);
      const formattedData = data.map((city: CRMCityListResponse) => ({
        value: city.DistrictId,
        label: city.DistrictName,
        id: city.DistrictId
      }));
      setCityOptions(formattedData);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      showErrorToast('Failed to load cities');
    } finally {
      setLoadingCities(false);
    }
  };

  /* ---------------- FETCH ADDRESSES ---------------- */

  useEffect(() => {
    const employeeRefIdStr = localStorage.getItem('EmployeeRefId');

    if (!employeeRefIdStr) {
      showErrorToast('EmployeeRefId not found');
      setError('EmployeeRefId not found');
      return;
    }

    const employeeRefId = Number(employeeRefIdStr);

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiResponse = await AddressBookAPI.CRMGetCustomerAddressDetails(employeeRefId);

        console.log('RAW API RESPONSE:', apiResponse);

        const normalizedAddresses: EmployeeAddressDetails[] = Array.isArray(apiResponse)
          ? apiResponse
          : (apiResponse as any)?.data ?? [];

        setAddresses(normalizedAddresses);
      } catch (err) {
        console.error(err);
        showErrorToast('Failed to fetch address details');
        setError('Failed to fetch address details');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */

  const handleSelectChange = (name: string, selectedOption: any) => {
    setFormData(prev => {
      const updatedData = { ...prev };

      if (name === 'ForWhom') {
        updatedData.ForWhom = selectedOption?.value || '';
        if (selectedOption?.value === 'Self') {
          // When selecting Self:
          // 1. Set Relationship to 'Self'
          // 2. Set RelationshipPersonName to DisplayName from localStorage
          updatedData.Relationship = 'Self';
          updatedData.RelationshipPersonName = displayName;
          updatedData.RelationshipPersonId = '';
        } else if (selectedOption?.value === 'Other') {
          // When selecting Other, clear the fields for dependent
          updatedData.Relationship = '';
          updatedData.RelationshipPersonName = '';
          updatedData.RelationshipPersonId = '';
        }
      } else if (name === 'Relationship') {
        updatedData.Relationship = selectedOption?.value || '';
        updatedData.RelationshipPersonName = '';
        updatedData.RelationshipPersonId = '';
      } else if (name === 'RelationshipPersonId') {
        const selectedPerson = relationshipPersons.find(
          person => person.EmployeeDependentDetailsId.toString() === selectedOption?.value
        );
        updatedData.RelationshipPersonId = selectedOption?.value || '';
        updatedData.RelationshipPersonName = selectedPerson?.DependentName || '';
      } else if (name === 'StateId') {
        updatedData.StateId = selectedOption?.value || '';
        updatedData.StateName = selectedOption?.label || '';
        updatedData.CityId = '';
        updatedData.CityName = '';
        setCityOptions([]);
        if (selectedOption?.value) {
          fetchCities(selectedOption.value);
        }
      } else if (name === 'CityId') {
        updatedData.CityId = selectedOption?.value || '';
        updatedData.CityName = selectedOption?.label || '';
      }

      return updatedData;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Only allow editing RelationshipPersonName if ForWhom is 'Other'
      if (name === 'RelationshipPersonName' && formData.ForWhom === 'Self') {
        // Do nothing - this field should not be editable when ForWhom is 'Self'
        return;
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressTypeChange = (type: AddressType) => {
    setFormData(prev => ({
      ...prev,
      AddressType: type
    }));
  };

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const employeeRefIdStr = localStorage.getItem('EmployeeRefId');
    if (!employeeRefIdStr) {
      showErrorToast('Employee ID not found');
      return;
    }
    if (!formData.AddressLineOne.trim()) {
      showWarningToast('Address Line 1 is required');
      return;
    }
    if (!formData.StateId) {
      showWarningToast('State is required');
      return;
    }
    if (!formData.CityId) {
      showWarningToast('City is required');
      return;
    }
    let relationshipPersonName = '';
    let employeeDependentDetailsId = 0;
    
    if (formData.ForWhom === 'Self') {
      relationshipPersonName = displayName;
      employeeDependentDetailsId = 0;
    } else {
      if (!formData.Relationship) {
        showWarningToast('Please select a relationship');
        return;
      }
      if (!formData.RelationshipPersonName.trim()) {
        showWarningToast('Please select or enter a relationship person name');
        return;
      }
      relationshipPersonName = formData.RelationshipPersonName;
      employeeDependentDetailsId = formData.RelationshipPersonId ? Number(formData.RelationshipPersonId) : 0;
    }

    // Find relationship ID using our mapping function
    let relationshipId = 0;
    
    if (formData.ForWhom === 'Self') {
      // For Self, always use ID 1
      relationshipId = getRelationshipIdFromName('Self');
    } else {
      // For Other, use the selected relationship
      relationshipId = getRelationshipIdFromName(formData.Relationship);
    }

    // Prepare data for API according to the required format
    const addressData = {
      EmployeeAddressDetailsId: isEditing && currentAddressId ? currentAddressId : 0,
      EmployeeRefId: Number(employeeRefIdStr),
      RelationShip: relationshipId,
      AddressType: formData.AddressType,
      AddressLineOne: formData.AddressLineOne,
      AddressLineTwo: formData.AddressLineTwo || "",
      Landmark: formData.Landmark || "",
      StateId: Number(formData.StateId),
      CityId: Number(formData.CityId),
      Pincode: formData.Pincode,
      IsDefault: formData.IsDefault,
      EmployeeDependentDetailsId: employeeDependentDetailsId,
      Latitude: "0",
      Longitude: "0"
    };

    console.log('Submitting address data:', addressData);

    setFormLoading(true);

    // Use the same API for both add and update (CRMSaveCustomerAddressDetails)
    const response = await AddressBookAPI.CRMSaveCustomerAddressDetails(addressData);
    
    if (response.Message === "Customer Address Details Saved Successfully") {
      showSuccessToast(isEditing ? 'Address updated successfully!' : 'Address added successfully!');
      
      // Refresh addresses
      const employeeRefId = Number(employeeRefIdStr);
      const updatedAddresses = await AddressBookAPI.CRMGetCustomerAddressDetails(employeeRefId);
      setAddresses(Array.isArray(updatedAddresses) ? updatedAddresses : []);
      const cameFromPharmacyCart = location.state?.fromPharmacyCart || false;
      
      if (cameFromPharmacyCart) {
        navigate('/pharmacy/cart');

      } else {
        handleCancelForm();
      }
      
    } else {
      throw new Error(response.Message || 'Failed to save address');
    }
    
  } catch (error: any) {
    console.error('Error saving address:', error);
    showErrorToast(error.message || 'Failed to save address. Please try again.');
  } finally {
    setFormLoading(false);
  }
};

const handleCancelForm = () => {
  setShowForm(false);
  setIsEditing(false);
  setCurrentAddressId(null);
  resetForm();
  setCityOptions([]); // Clear cities when canceling
  setRelationshipPersons([]); // Clear relationship persons
  
  // Check if we came from PharmacyCart
  const cameFromPharmacyCart = location.state?.fromPharmacyCart || false;
  
  if (cameFromPharmacyCart) {
    // If we came from PharmacyCart, navigate back
    navigate('/pharmacy-cart');
  } else {
    // Clear navigation state when going back to address list
    navigate('/my-address', { replace: true, state: {} });
  }
};
  const resetForm = () => {
    setFormData({
      AddressType: 'Home',
      ForWhom: 'Self',
      Relationship: 'Self', // Set to 'Self' by default
      RelationshipPersonName: displayName,
      RelationshipPersonId: '',
      AddressLineOne: '',
      AddressLineTwo: '',
      Landmark: '',
      StateId: '',
      StateName: '',
      CityId: '',
      CityName: '',
      Pincode: '',
      ContactNo: '',
      IsDefault: false
    });
  };

  /* ---------------- ADDRESS ACTIONS ---------------- */

  const handleEdit = async (addressId: number) => {
    try {
      // Fetch the individual address details from API
      const addressResponse = await AddressBookAPI.CRMGetCustomerIndividualAddressDetails(addressId);
      
      // Check if we got valid data
      if (!addressResponse || addressResponse.length === 0) {
        showErrorToast('Address not found');
        return;
      }

      const address = addressResponse[0]; // Get the first (and should be only) address
      
      console.log('Editing address:', address);

      // Fetch cities for the selected state
      if (address.StateId) {
        await fetchCities(address.StateId);
      }

      const isSelf = address.Relationship === 'Self';
      
      if (!isSelf && address.Relationship) {
        try {
          const employeeRefIdStr = localStorage.getItem('EmployeeRefId');
          if (employeeRefIdStr) {
            const relationshipId = getRelationshipIdFromName(address.Relationship);
            const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
              Number(employeeRefIdStr),
              relationshipId
            );
            setRelationshipPersons(personsData);
          }
        } catch (error) {
          console.error('Failed to fetch relationship persons for edit:', error);
        }
      }

      setFormData({
        AddressType: address.AddressType as AddressType || 'Home',
        ForWhom: isSelf ? 'Self' : 'Other',
        Relationship: address.Relationship || '',
        RelationshipPersonName: isSelf ? displayName : address.EmployeeName || '',
        RelationshipPersonId: address.EmployeeDependentDetailsId?.toString() || '',
        AddressLineOne: address.AddressLineOne || '',
        AddressLineTwo: address.AddressLineTwo || '',
        Landmark: address.Landmark || '',
        StateId: address.StateId || '',
        StateName: address.StateName || '',
        CityId: address.CityId || '',
        CityName: address.DistrictName || '',
        Pincode: address.Pincode || '',
        ContactNo: address.ContactNo || '',
        IsDefault: address.IsDefault || false
      });
      
      setCurrentAddressId(addressId);
      setIsEditing(true);
      setShowForm(true);
      
    } catch (error: any) {
      console.error('Error fetching address for edit:', error);
      showErrorToast('Failed to load address details. Please try again.');
    }
  };

const handleDelete = async (addressId: number) => {
  // Use window.confirm instead of custom toast
  const isConfirmed = window.confirm('Are you sure you want to delete this address?');
  
  if (isConfirmed) {
    try {
      const response = await AddressBookAPI.CRMDeleteCustomerIndividualAddressDetails(addressId);
      if (response.Message === "Address deleted successfully" || 
          response.Message === "Customer Address Details Deleted Successfully" ||
          response.Message?.toLowerCase().includes("success")) {
        setAddresses(addresses.filter(addr => addr.EmployeeAddressDetailsId !== addressId));
        showSuccessToast('Address deleted successfully');
      } else {
        throw new Error(response.Message || 'Failed to delete address');
      }
    } catch (error: any) {
      console.error('Error deleting address:', error);
      showErrorToast(error.message || 'Failed to delete address. Please try again.');
    }
  }
};

  const performDelete = async (addressId: number) => {
    try {
      const response = await AddressBookAPI.CRMDeleteCustomerIndividualAddressDetails(addressId);
      if (response.Message === "Address deleted successfully" || 
          response.Message === "Customer Address Details Deleted Successfully" ||
          response.Message?.toLowerCase().includes("success")) {
        setAddresses(addresses.filter(addr => addr.EmployeeAddressDetailsId !== addressId));
        showSuccessToast('Address deleted successfully');
      } else {
        throw new Error(response.Message || 'Failed to delete address');
      }
    } catch (error: any) {
      console.error('Error deleting address:', error);
      showErrorToast(error.message || 'Failed to delete address. Please try again.');
    }
  };

  const handleAddNewAddress = () => {
    resetForm();
    setIsEditing(false);
    setCurrentAddressId(null);
    setShowForm(true);
  };

  /* ---------------- FILTER BY TAB ---------------- */

  const filteredAddresses = Array.isArray(addresses)
    ? addresses.filter(address => address.AddressType?.trim() === activeTab)
    : [];

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <div className="address-book-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="address-book-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- FORM SECTION ---------------- */

  if (showForm) {
    // Determine if we should show dropdown or input for relationship person
    const showPersonDropdown = formData.ForWhom === 'Other' && 
                               formData.Relationship && 
                               relationshipPersons.length > 1;
    
    const showPersonInput = formData.ForWhom === 'Other' && 
                           formData.Relationship && 
                           relationshipPersons.length <= 1;

    return (
      <div className="address-book-container">
        <div className="address-book-header">
          <h1 className="address-book-title">
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </h1>
          <button 
            className="back-to-addresses-btn"
            onClick={handleCancelForm}
            disabled={formLoading}
          >
            ← Back to Addresses
          </button>
        </div>

        <div className="address-form-container">
          <form onSubmit={handleFormSubmit} className="address-form">
            
            {/* Row 1: Address Type Tabs */}
            <div className="form-row">
              <div className="form-group full-width">
                <label>Address Type *</label>
                <div className="form-tabs">
                  {(['Home', 'Office', 'Other'] as AddressType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`form-tab ${formData.AddressType === type ? 'active' : ''}`}
                      onClick={() => handleAddressTypeChange(type)}
                      disabled={formLoading}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: For Whom & Relationship & Relationship Person Name */}
            <div className="form-row three-column">
              {/* For Whom */}
              <div className="form-group">
                <label>For Whom *</label>
                <Select
                  value={formData.ForWhom ? { value: formData.ForWhom, label: formData.ForWhom } : null}
                  onChange={(selected) => handleSelectChange('ForWhom', selected)}
                  options={[
                    { value: 'Self', label: 'Self' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  placeholder="Select"
                  isDisabled={formLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Relationship */}
              <div className="form-group">
                <label>Relationship *</label>
                {formData.ForWhom === 'Self' ? (
                  <Input
                    type="text"
                    name="Relationship"
                    value="Self"
                    readOnly
                    className="custom-input read-only"
                    placeholder="Self"
                  />
                ) : (
                  <Select
                    value={relationshipOptions.find(opt => opt.value === formData.Relationship) || null}
                    onChange={(selected) => handleSelectChange('Relationship', selected)}
                    options={relationshipOptions.filter(opt => opt.value !== 'Self')} // Hide Self when Other is selected
                    placeholder="Select"
                    isDisabled={formLoading || loadingRelationships}
                    isLoading={loadingRelationships}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                )}
              </div>

              {/* Relationship Person Name */}
              <div className="form-group">
                <label>Relationship Person Name *</label>
                {formData.ForWhom === 'Self' ? (
                  <Input
                    type="text"
                    name="RelationshipPersonName"
                    value={displayName}
                    readOnly
                    className="custom-input read-only"
                    placeholder={displayName || "Your Name"}
                  />
                ) : showPersonDropdown ? (
                  <Select
                    value={relationshipPersons.find(
                      person => person.EmployeeDependentDetailsId.toString() === formData.RelationshipPersonId
                    ) ? {
                      value: formData.RelationshipPersonId,
                      label: formData.RelationshipPersonName
                    } : null}
                    onChange={(selected) => handleSelectChange('RelationshipPersonId', selected)}
                    options={relationshipPersons.map(person => ({
                      value: person.EmployeeDependentDetailsId.toString(),
                      label: person.DependentName
                    }))}
                    placeholder="Select Person"
                    isDisabled={formLoading || loadingPersons}
                    isLoading={loadingPersons}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                ) : (
                  <Input
                    type="text"
                    name="RelationshipPersonName"
                    value={formData.RelationshipPersonName}
                    onChange={handleInputChange}
                    placeholder={
                      relationshipPersons.length === 1 
                        ? relationshipPersons[0].DependentName
                        : "Enter person name"
                    }
                    disabled={formLoading || (relationshipPersons.length === 1)}
                    required={formData.ForWhom === 'Other'}
                    className="custom-input"
                  />
                )}
              </div>
            </div>

            {/* Row 3: Address Line 1 & Address Line 2 & Landmark */}
            <div className="form-row three-column">
              {/* Address Line 1 */}
              <div className="form-group">
                <label>Address Line 1 *</label>
                <Input
                  type="text"
                  name="AddressLineOne"
                  value={formData.AddressLineOne}
                  onChange={handleInputChange}
                  placeholder="Address Line 1"
                  required
                  disabled={formLoading}
                  className="custom-input"
                />
              </div>

              {/* Address Line 2 */}
              <div className="form-group">
                <label>Address Line 2</label>
                <Input
                  type="text"
                  name="AddressLineTwo"
                  value={formData.AddressLineTwo}
                  onChange={handleInputChange}
                  placeholder="Address Line 2"
                  disabled={formLoading}
                  className="custom-input"
                />
              </div>

              {/* Landmark */}
              <div className="form-group">
                <label>Landmark (Optional)</label>
                <Input
                  type="text"
                  name="Landmark"
                  value={formData.Landmark}
                  onChange={handleInputChange}
                  placeholder="Landmark"
                  disabled={formLoading}
                  className="custom-input"
                />
              </div>
            </div>

            {/* Row 4: State & City & Pin Code */}
            <div className="form-row three-column">
              {/* State */}
              <div className="form-group">
                <label>State *</label>
                <Select
                  value={stateOptions.find(opt => opt.value === formData.StateId) || null}
                  onChange={(selected) => handleSelectChange('StateId', selected)}
                  options={stateOptions}
                  placeholder="Select"
                  isDisabled={formLoading || loadingStates}
                  isLoading={loadingStates}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label>City *</label>
                <Select
                  value={cityOptions.find(opt => opt.value === formData.CityId) || null}
                  onChange={(selected) => handleSelectChange('CityId', selected)}
                  options={cityOptions}
                  placeholder="Select"
                  isDisabled={!formData.StateId || formLoading || loadingCities}
                  isLoading={loadingCities}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Pin Code */}
              <div className="form-group">
                <label>Pin Code *</label>
                <Input
                  type="text"
                  name="Pincode"
                  value={formData.Pincode}
                  onChange={handleInputChange}
                  placeholder="Pin Code"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  disabled={formLoading}
                  className="custom-input"
                />
              </div>
            </div>

            {/* Set as Default Checkbox */}
            <div className="form-checkbox-group">
              <input
                type="checkbox"
                id="IsDefault"
                name="IsDefault"
                checked={formData.IsDefault}
                onChange={handleInputChange}
                className="checkbox-input"
                disabled={formLoading}
              />
              <label htmlFor="IsDefault" className="checkbox-label">
                Set as default address
              </label>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancelForm}
                className="cancel-btn"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Address' : 'Add Address'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN ADDRESS BOOK VIEW ---------------- */

  return (
    <div className="address-book-container">
      {/* Header */}
      <div className="address-book-header">
        <h1 className="address-book-title">My Address Book</h1>
        <button 
          className="my-add-address-btn"
          onClick={handleAddNewAddress}
          title="Add new address"
        >
          <span>+</span>
          <span>Add Address</span>
        </button>
      </div>

      {/* Subtitle */}
      <p className="address-book-subtitle">Manage your address</p>

      {/* Tabs */}
      <div className="address-book-tabs">
        <button
          className={`address-tab ${activeTab === 'Home' ? 'active' : ''}`}
          onClick={() => setActiveTab('Home')}
        >
          Home
        </button>

        <button
          className={`address-tab ${activeTab === 'Office' ? 'active' : ''}`}
          onClick={() => setActiveTab('Office')}
        >
          Office
        </button>

        <button
          className={`address-tab ${activeTab === 'Other' ? 'active' : ''}`}
          onClick={() => setActiveTab('Other')}
        >
          Other
        </button>
      </div>

      {/* Content */}
      <div className="address-book-content">
        <div className="address-cards-container">
          {filteredAddresses.length > 0 ? (
            filteredAddresses.map(address => (
              <div
                key={address.EmployeeAddressDetailsId}
                className={`address-card ${address.IsDefault ? '' : ''}`}
              >
                {/* Card Header with Name, Default Badge, and Actions */}
                <div className="card-header">
                  <div className="contact-name">
                    <h3>{address.EmployeeName || 'No Name'}</h3>
                    {address.IsDefault && (
                      <span className="default-badge">Default</span>
                    )}
                    <span className="relationship-tag">{address.Relationship || 'Self'}</span>
                  </div>
                  
                  {/* Edit and Delete Icons */}
                  <div className="card-actions">
                    <button 
                      className="icon-button edit-button"
                      onClick={() => handleEdit(address.EmployeeAddressDetailsId)}
                      title="Edit address"
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-button delete-button"
                      onClick={() => handleDelete(address.EmployeeAddressDetailsId)}
                      title="Delete address"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  {/* Address */}
                  <div className="address-field">
                    <span className="field-label">Address:</span>
                    <span className="field-value">
                      {[address.AddressLineOne, address.AddressLineTwo]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>

                  {/* City & State */}
                  <div className="address-field">
                    <span className="field-label">City/State:</span>
                    <span className="field-value">
                      {`${address.DistrictName || ''}, ${address.StateName || ''}`}
                    </span>
                  </div>

                  {/* Pincode */}
                  <div className="address-field">
                    <span className="field-label">Pincode:</span>
                    <span className="field-value">{address.Pincode || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No {activeTab.toLowerCase()} addresses found.</p>
              <button 
                onClick={handleAddNewAddress} 
                className="add-first-address"
              >
                Add Your First {activeTab} Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBook;