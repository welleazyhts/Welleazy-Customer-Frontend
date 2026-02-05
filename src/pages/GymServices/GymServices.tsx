import React, { useEffect, useState } from 'react';
import './GymServices.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Container, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { gymServiceAPI } from '../../api/GymService';
import { GymPackage, CustomerProfile, State, District, Relationship, RelationshipPerson } from '../../types/GymServices';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Input from '../../components/Input';

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

interface OptionType {
  value: string;
  label: string;
  [key: string]: any;
}

const GymServices: React.FC = () => {
  const navigate = useNavigate()
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GymPackage | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Dynamic states and districts
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Gym center modal
  const [showGymCenterModal, setShowGymCenterModal] = useState(false);
  const [gymCenters, setGymCenters] = useState<any[]>([]);
  const [loadingGymCenters, setLoadingGymCenters] = useState(false);
  const [gymCenterError, setGymCenterError] = useState<string | null>(null);
  const [selectedGymCenterName, setSelectedGymCenterName] = useState<string>("");

  // Relationship states
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    membershipType: 'self', // 'self' or 'dependent'
    name: '',
    contactNumber: '',
    email: '',
    state: '',
    stateId: '',
    district: '',
    districtId: '',
    address: '',
    gymCenter: '',
    landmark: '',
    pincode: '',
    relationshipId: '',
    relationshipPersonId: ''
  });

  // Convert arrays to options for react-select
  const stateOptions: OptionType[] = states.map(state => ({
    value: state.StateId.toString(),
    label: state.StateName,
    stateId: state.StateId
  }));

  const districtOptions: OptionType[] = districts.map(district => ({
    value: district.DistrictId.toString(),
    label: district.DistrictName,
    districtId: district.DistrictId
  }));

  const relationshipOptions: OptionType[] = relationships
    .filter(rel => rel.RelationshipId !== 1) // Exclude "Self"
    .map(relationship => ({
      value: relationship.RelationshipId.toString(),
      label: relationship.Relationship,
      relationshipId: relationship.RelationshipId
    }));

  const relationshipPersonOptions: OptionType[] = relationshipPersons.map(person => ({
    value: person.EmployeeDependentDetailsId.toString(),
    label: person.DependentName,
    employeeDependentDetailsId: person.EmployeeDependentDetailsId
  }));

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

  // Load relationships on mount
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

  // Load relationship persons when relationship changes (for dependent mode)
  useEffect(() => {
    const loadRelationshipPersons = async () => {
      if (formData.membershipType === 'dependent' && formData.relationshipId) {
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
          
          // If only one person exists, auto-select it
          if (personsData.length === 1) {
            setFormData(prev => ({
              ...prev,
              relationshipPersonId: personsData[0].EmployeeDependentDetailsId.toString(),
              name: personsData[0].DependentName
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
      }
    };
    loadRelationshipPersons();
  }, [formData.membershipType, formData.relationshipId]);

  // Load packages
 useEffect(() => {
  const fetchPackages = async () => {
    try {
      let districtId = localStorage.getItem("DistrictId");
      if (!districtId) {
        districtId = "0";
        localStorage.setItem("DistrictId", districtId);
      }
      const response = await gymServiceAPI.LoadGymCardDetails(districtId);
      if (Array.isArray(response)) {
        setPackages(response);
      } 
      else
     {
       // setPackages([]);
          setError( "No packages available for the selected district." );
      }
    } catch (error) {
      console.error("Failed to load gym packages:", error);
      setPackages([]);
    }
  };

  fetchPackages();
}, []);


  // Fetch profile when modal opens
  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (showModal) {
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

          const userState = states.find(s => s.StateName === profile.StateName || s.StateId === profile.State);
          const userDistrict = districts.find(d => d.DistrictName === profile.DistrictName || d.DistrictId === profile.City);

          setFormData(prev => ({
            ...prev,
            name: profile.EmployeeName,
            contactNumber: profile.MobileNo,
            email: profile.Emailid,
            state: profile.StateName,
            stateId: userState ? userState.StateId.toString() : profile.State?.toString() || '',
            district: profile.DistrictName,
            districtId: userDistrict ? userDistrict.DistrictId.toString() : profile.City?.toString() || '',
            address: `${profile.AddressLineOne || ''} ${profile.AddressLineTwo || ''}`.trim(),
            landmark: profile.Landmark || '',
            pincode: profile.Pincode || '',
            membershipType: 'self', // Default to self
            relationshipId: '1' // Default to Self relationship
          }));
        } catch (error) {
          console.error("Failed to load customer profile:", error);
          setProfileError("Failed to load your profile information. Please fill the form manually.");
          toast.error("Failed to load your profile information.");
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    if (showModal && states.length > 0) {
      fetchCustomerProfile();
    }
  }, [showModal, states, districts]);

const handleGymCenterSelectClick = async () => {
  if (!formData.districtId) {
    toast.warning("Please select a district first to view available gym centers.");
    return;
  }

  setShowGymCenterModal(true);
  setLoadingGymCenters(true);
  setGymCenterError(null);

  try {
    console.log("Fetching gym centers for district ID:", formData.districtId, "District:", formData.district);
    const centers = await gymServiceAPI.LoadGymDropDown(parseInt(formData.districtId));
    console.log("API Response - Gym Centers:", centers);
    console.log("Number of centers found:", centers.length);
    
    setGymCenters(centers);
    
    if (centers.length === 0) {
      console.log("No gym centers found for district:", formData.district);
    }
  } catch (error) {
    console.error("Failed to load gym centers:", error);
    setGymCenterError(`Failed to load gym centers for ${formData.district}. Please try again.`);
    setGymCenters([]);
  } finally {
    setLoadingGymCenters(false);
  }
};

  const handlePrev = () => {
    setLocationCarouselIndex(prev =>
      prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1
    );
  };

  const handleNext = () => {
    setLocationCarouselIndex(prev =>
      prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
    );
  };

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  const handleBuyNowClick = (pkg: GymPackage) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPackage(null);
    setCustomerProfile(null);
    setProfileError(null);
    setSelectedGymCenterName("");
    setRelationshipPersons([]);
    setFormData({
      membershipType: 'self',
      name: '',
      contactNumber: '',
      email: '',
      state: '',
      stateId: '',
      district: '',
      districtId: '',
      address: '',
      gymCenter: '',
      landmark: '',
      pincode: '',
      relationshipId: '1',
      relationshipPersonId: ''
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, selectedOption: OptionType | null) => {
    if (selectedOption) {
      if (name === 'stateId') {
        const selectedState = states.find(state => state.StateId.toString() === selectedOption.value);
        setFormData(prev => ({
          ...prev,
          stateId: selectedOption.value,
          state: selectedState ? selectedState.StateName : '',
          district: '',
          districtId: '',
          gymCenter: ''
        }));
        setSelectedGymCenterName("");
      } else if (name === 'districtId') {
        const selectedDistrict = districts.find(district => district.DistrictId.toString() === selectedOption.value);
        setFormData(prev => ({
          ...prev,
          districtId: selectedOption.value,
          district: selectedDistrict ? selectedDistrict.DistrictName : '',
          gymCenter: ''
        }));
        setSelectedGymCenterName("");
      } else if (name === 'relationshipId') {
        // Reset relationship person when relationship changes
        setFormData(prev => ({
          ...prev,
          relationshipId: selectedOption.value,
          relationshipPersonId: '',
          name: '' // Reset name when relationship changes
        }));
      } else if (name === 'relationshipPersonId') {
        const selectedPerson = relationshipPersons.find(person => 
          person.EmployeeDependentDetailsId.toString() === selectedOption.value
        );
        setFormData(prev => ({
          ...prev,
          relationshipPersonId: selectedOption.value,
          name: selectedPerson ? selectedPerson.DependentName : ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: selectedOption.value
        }));
      }
    } else {
      // Handle clear/empty selection
      if (name === 'stateId') {
        setFormData(prev => ({
          ...prev,
          stateId: '',
          state: '',
          district: '',
          districtId: '',
          gymCenter: ''
        }));
      } else if (name === 'districtId') {
        setFormData(prev => ({
          ...prev,
          districtId: '',
          district: '',
          gymCenter: ''
        }));
      } else if (name === 'relationshipId') {
        setFormData(prev => ({
          ...prev,
          relationshipId: '',
          relationshipPersonId: '',
          name: ''
        }));
      } else if (name === 'relationshipPersonId') {
        setFormData(prev => ({
          ...prev,
          relationshipPersonId: '',
          name: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleMembershipTypeChange = (type: 'self' | 'dependent') => {
    if (type === 'self') {
      setFormData(prev => ({
        ...prev,
        membershipType: 'self',
        relationshipId: '1',
        relationshipPersonId: '',
        name: customerProfile?.EmployeeName || '' // Auto-fill with self name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        membershipType: 'dependent',
        relationshipId: '',
        relationshipPersonId: '',
        name: '' // Clear name for dependent
      }));
    }
    setRelationshipPersons([]); // Reset relationship persons
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for dependent selection
    if (formData.membershipType === 'dependent') {
      if (!formData.relationshipId) {
        toast.error("Please select a relationship.");
        return;
      }
      if (!formData.relationshipPersonId) {
        toast.error("Please select a dependent person.");
        return;
      }
    }
    
    console.log('Form submitted:', formData);
    console.log('Selected package:', selectedPackage);
    console.log('Customer profile:', customerProfile);
    handleRazorpayOpen();
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleGymCenterSelect = (center: any) => {
    console.log('Selected gym center:', center);
    
    // Set the GymDetailsId to formData.gymCenter
    setFormData(prev => ({
      ...prev,
      gymCenter: center.GymDetailsId ? center.GymDetailsId.toString() : ""
    }));
    
    setSelectedGymCenterName(center.GymCenterName);
    setShowGymCenterModal(false);
    toast.success(`Selected ${center.GymCenterName}`);
  };

  const handleMockSaveVoucher = async () => {
    try {
      console.log("Starting mock payment/test save process...");
      console.log("Form data:", formData);

      // Mock payment result
      const transactionId = "txn_mock_" + Math.random().toString(36).substr(2, 9);
      const paymentStatus = "completed";
      const corporateId = localStorage.getItem("CorporateId") || "0";
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const toNumberString = (value: any, defaultValue = "0") =>
        value === null || value === undefined || value === "" ? defaultValue : value.toString();

      const formDataPayload = new FormData();
      formDataPayload.append("MiscellaneousmCaseDetailsId", "0");
      formDataPayload.append("MiscellaneousProgramCaseId", "0");
      formDataPayload.append("CorporateId", corporateId);
      formDataPayload.append("CorporateBranchId", "5");
      formDataPayload.append("EmployeeDependentDetailsId", formData.membershipType === 'dependent' ? formData.relationshipPersonId : "0");
      formDataPayload.append("CaseFor", formData.membershipType === 'self' ? "1" : "2");
      formDataPayload.append("CustomerName", formData.name);
      formDataPayload.append("ContactNumber", formData.contactNumber);
      formDataPayload.append("EmailId", formData.email);
      formDataPayload.append("State", toNumberString(formData.stateId)); 
      formDataPayload.append("City", toNumberString(formData.districtId)); 
      formDataPayload.append("Address", formData.address);
      formDataPayload.append("CareProgramId", "1");
      formDataPayload.append("CaseStatus", "1");
      formDataPayload.append("IsActive", "1");
      formDataPayload.append("CreatedBy", createdBy);
      formDataPayload.append("Amount", toNumberString(selectedPackage?.DiscountPrice, "0"));
      formDataPayload.append("Status", paymentStatus);
      formDataPayload.append("TransactionId", transactionId);
      formDataPayload.append("GymCenterID", toNumberString(formData.gymCenter));
      formDataPayload.append("EmployeeRefId", employeeRefId);
      formDataPayload.append("PackagePrice", toNumberString(selectedPackage?.Duration, "0")); 
      
      console.log("FormData being sent:");
      Array.from(formDataPayload.entries()).forEach(([key, value]: [string, FormDataEntryValue]) => {
        console.log(`${key}: ${value}`);
      });
      
      const voucherResult = await gymServiceAPI.SaveGymVoucherDetails(formDataPayload);
      console.log("Voucher saved successfully:", voucherResult);

      const selectedGymCenter = gymCenters.find(center => center.GymDetailsId.toString() === formData.gymCenter);
      const voucherDisplayData = {
        voucherId: voucherResult.voucherId || Math.floor(Math.random() * 1000), 
        customerName: formData.name,
        contactNumber: formData.contactNumber,
        email: formData.email,
        packageDuration: selectedPackage?.Duration,
        packagePrice: selectedPackage?.DiscountPrice,
        gymCenterName: selectedGymCenterName,
        gymCenterAddress: selectedGymCenter?.GymAddress,
        gymCenterType: selectedGymCenter?.GymCenterType,
        transactionId: transactionId,
        purchaseDate: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      };

      toast.success("Voucher saved successfully!");
    
      navigate('/gym-voucher', { state: { voucherData: voucherDisplayData } });
      
      handleCloseModal();
    } catch (error) {
      console.error("Error saving voucher in test mode:", error);
      toast.error("Could not save voucher. Check console for details.");
    }
  };

  const handleRazorpayOpen = () => {
    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    const options = {
      key: "rzp_live_LWNsKcrWzYLuC7",
      amount: 1 * 100,
      currency: "INR",
      name: "Welleazy Fitness",
      description: `Gym Membership - ${selectedPackage?.Duration} Months`,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.contactNumber,
      },
      notes: {
        address: formData.address,
        gym_center: formData.gymCenter,
        package_duration: `${selectedPackage?.Duration} months`,
      },

      handler: async function (response: any) {
        try {
          console.log("Razorpay payment response:", response);
          const paymentResult = await gymServiceAPI.RazorpayPayment({
            PaymentId: response.razorpay_payment_id,
          });

          console.log("Payment confirmed from API:", paymentResult);

          const transactionId = paymentResult.transactionId;
          const paymentStatus =
            paymentResult.status || paymentResult.paymentStatus;
          const corporateId = localStorage.getItem("CorporateId") || "0";
          const createdBy = localStorage.getItem("LoginRefId") || "0";
          const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
          const toNumberString = (value: any, defaultValue = "0") =>
            value === null || value === undefined || value === ""
              ? defaultValue
              : value.toString();

          const formDataPayload = new FormData();
          formDataPayload.append("MiscellaneousmCaseDetailsId", "0");
          formDataPayload.append("MiscellaneousProgramCaseId", "0");
          formDataPayload.append("CorporateId", corporateId);
          formDataPayload.append("CorporateBranchId", "5");
          formDataPayload.append("EmployeeDependentDetailsId", formData.membershipType === 'dependent' ? formData.relationshipPersonId : "0");
          formDataPayload.append("CaseFor", formData.membershipType === 'self' ? "1" : "2");
          formDataPayload.append("CustomerName", formData.name);
          formDataPayload.append("ContactNumber", formData.contactNumber);
          formDataPayload.append("EmailId", formData.email);
          formDataPayload.append("State", toNumberString(formData.stateId));
          formDataPayload.append("City", toNumberString(formData.districtId));
          formDataPayload.append("Address", formData.address);
          formDataPayload.append("CareProgramId", "1");
          formDataPayload.append("CaseStatus", "1");
          formDataPayload.append("IsActive", "1");
          formDataPayload.append("CreatedBy", createdBy);
          formDataPayload.append(
            "Amount",
            toNumberString(selectedPackage?.DiscountPrice, "0")
          );
          formDataPayload.append("Status", paymentStatus);
          formDataPayload.append("TransactionId", transactionId);
          formDataPayload.append(
            "GymCenterID",
            toNumberString(formData.gymCenter)
          );
          formDataPayload.append("EmployeeRefId", employeeRefId);
          formDataPayload.append(
            "PackagePrice",
            toNumberString(selectedPackage?.DiscountPrice, "0")
          );

          console.log("FormData being sent for voucher:");
          Array.from(formDataPayload.entries()).forEach(([key, value]) =>
            console.log(`${key}: ${value}`)
          );
          const voucherResult = await gymServiceAPI.SaveGymVoucherDetails(
            formDataPayload
          );
          console.log("Voucher saved successfully:", voucherResult);
          const voucherId = voucherResult?.voucherId;

          if (!voucherId) {
            throw new Error("Voucher ID not returned from API.");
          }
          const selectedGymCenter = gymCenters.find(
            (center) => center.GymDetailsId.toString() === formData.gymCenter
          );
          const formattedVoucherId = `WX${voucherId.toString().padStart(4, '0')}`;

          const voucherDisplayData = {
            voucherId: formattedVoucherId,
            customerName: formData.name,
            contactNumber: formData.contactNumber,
            email: formData.email,
            packageDuration: selectedPackage?.Duration,
            packagePrice: selectedPackage?.DiscountPrice,
            gymCenterName: selectedGymCenter?.GymCenterName,
            gymCenterAddress: selectedGymCenter?.GymAddress,
            gymCenterType: selectedGymCenter?.GymCenterType,
            transactionId: transactionId,
            purchaseDate: new Date().toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }),
          };

          // ✅ 6️⃣ Redirect with voucher data
          toast.success(
            "Payment successful! Your gym membership voucher has been generated."
          );
          navigate("/gym-voucher", { state: { voucherData: voucherDisplayData } });
          handleCloseModal();
        } catch (error) {
          console.error("Error during payment or voucher process:", error);
          toast.error(
            "Payment was successful but there was an issue saving your voucher. Please contact support."
          );
        }
      },

      theme: { color: "#0d6efd" },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed by user");
          toast.info("Payment cancelled by user.");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="gym-services-page">
      {/* Location Bar */}

      {/* Header */}
      <div className="gym-service-card">
        <img src="/cult.fit.png" alt="GYM Services" className="gym-service-image" />
        <p className="fw-bold text-center fs-4 mt-3">Select Your Package</p>
      </div>
   
      {error && (
  <div
    className="alert alert-danger mt-3 mx-auto px-3 py-2"
    role="alert"
    style={{
      width: "fit-content",
      fontSize: "14px",
      color:'red'
    }}
  >
    {error}
  </div>
)}



      {/* Package Cards */}
      <div className="package-cards-container">
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            <div className="duration-section">
              <h3 className="duration">{pkg.Duration}</h3>
              <p className="months-text">MONTHS</p>
            </div>
            <p className="price-old">₹{pkg.ActualPrice.toFixed(2)}</p>
            <p className="price-new">₹{pkg.DiscountPrice.toFixed(2)}</p>
            <p className="discount">({pkg.Discount}%)</p>
            <hr />
            <ul className="package-benefits">
              <li>Access to cult centres</li>
              <li>Access to cult gyms</li>
              <li>Access to all centers</li>
              <li>Access to cult home</li>
              <li>45 days membership pause</li>
              <li>Unlimited access in your base city</li>
              <li>Access to 5 sessions outside your base city</li>
            </ul>
            <Button variant="light" className="buy-now-btn" onClick={() => handleBuyNowClick(pkg)}>
              BUY NOW
            </Button>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered contentClassName="modal-content-tall">
        <Modal.Header closeButton style={{ marginTop: '-20px' }}>
          <Modal.Title>Complete Your Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingProfile && <Alert variant="info">Loading your profile information...</Alert>}
          {profileError && <Alert variant="warning">{profileError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3"style={{ marginTop: '-5px' }} >
              <Form.Label as="legend" className="fw-bold">Membership For *</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Self"
                  name="membershipType"
                  value="self"
                  checked={formData.membershipType === 'self'}
                  onChange={() => handleMembershipTypeChange('self')}
                  className="me-3"
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Dependent"
                  name="membershipType"
                  value="dependent"
                  checked={formData.membershipType === 'dependent'}
                  onChange={() => handleMembershipTypeChange('dependent')}
                />
              </div>
            </Form.Group>

            {/* Self Mode - Show only name field */}
            {formData.membershipType === 'self' && (
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </Form.Group>
            )}

            {/* Dependent Mode - Show relationship dropdowns */}
            {formData.membershipType === 'dependent' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Relationship *</Form.Label>
                      <Select
                        name="relationshipId"
                        value={relationshipOptions.find(option => option.value === formData.relationshipId) || null}
                        onChange={(selectedOption) => handleSelectChange('relationshipId', selectedOption as OptionType)}
                        options={relationshipOptions}
                        placeholder="Select Relationship"
                        isDisabled={loadingRelationships}
                        isLoading={loadingRelationships}
                        isClearable
                        required
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      {loadingRelationships && <small className="text-muted">Loading relationships...</small>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {formData.relationshipId && (
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {relationshipPersons.length > 1 ? 'Select Dependent *' : 'Dependent Name *'}
                        </Form.Label>
                        {relationshipPersons.length > 1 ? (
                          <Select
                            name="relationshipPersonId"
                            value={relationshipPersonOptions.find(option => option.value === formData.relationshipPersonId) || null}
                            onChange={(selectedOption) => handleSelectChange('relationshipPersonId', selectedOption as OptionType)}
                            options={relationshipPersonOptions}
                            placeholder="Select Dependent"
                            isDisabled={loadingRelationshipPersons}
                            isLoading={loadingRelationshipPersons}
                            isClearable
                            required
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        ) : relationshipPersons.length === 1 ? (
                          <Input
                            type="text"
                            value={formData.name}
                            readOnly
                            placeholder="Dependent name will auto-fill"
                          />
                        ) : (
                          <Input
                            type="text"
                            value="No dependents found"
                            readOnly
                            className="text-muted"
                          />
                        )}
                        {loadingRelationshipPersons && <small className="text-muted">Loading dependents...</small>}
                        {!loadingRelationshipPersons && relationshipPersons.length === 0 && formData.relationshipId && (
                          <small className="text-warning">No dependents found for this relationship.</small>
                        )}
                      </Form.Group>
                    )}
                  </Col>
                </Row>

                {/* Name field for dependent (read-only when person is selected) */}
                {formData.relationshipId && (
                  <Form.Group className="mb-3">
                    <Form.Label>Dependent Name *</Form.Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Dependent name"
                      required
                      readOnly={!!formData.relationshipPersonId}
                    />
                    {formData.relationshipPersonId && (
                      <Form.Text className="text-muted">
                        Name is auto-filled from selected dependent.
                      </Form.Text>
                    )}
                  </Form.Group>
                )}
              </>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number *</Form.Label>
                  <Input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="Enter contact number"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Select
                    name="stateId"
                    value={stateOptions.find(option => option.value === formData.stateId) || null}
                    onChange={(selectedOption) => handleSelectChange('stateId', selectedOption as OptionType)}
                    options={stateOptions}
                    placeholder="Select State"
                    isDisabled={loadingStates}
                    isLoading={loadingStates}
                    isClearable
                    required
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {loadingStates && <small className="text-muted">Loading states...</small>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>District *</Form.Label>
                  <Select
                    name="districtId"
                    value={districtOptions.find(option => option.value === formData.districtId) || null}
                    onChange={(selectedOption) => handleSelectChange('districtId', selectedOption as OptionType)}
                    options={districtOptions}
                    placeholder="Select District"
                    isDisabled={loadingDistricts || !formData.stateId}
                    isLoading={loadingDistricts}
                    isClearable
                    required
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {loadingDistricts && <small className="text-muted">Loading districts...</small>}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Input
              type="textarea"
                
                name="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preferred Gym Center *</Form.Label>
              <Input
                type="text"
                name="gymCenterName"
                value={selectedGymCenterName || ""}
                readOnly
                onClick={handleGymCenterSelectClick}
                placeholder="Select gym center"
                required
              />
              {!formData.gymCenter && selectedGymCenterName && (
                <Form.Text className="text-warning">
                  Warning: Gym center selected but ID not set properly
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Proceed to Payment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showGymCenterModal} onHide={() => setShowGymCenterModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Gym Center</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingGymCenters && <Alert variant="info">Loading available gym centers...</Alert>}
          {gymCenterError && <Alert variant="danger">{gymCenterError}</Alert>}

          {/* District Information */}
          <div className="mb-3 p-2 border rounded bg-light">
            <small className="text-muted">
              <strong>Selected District:</strong> {formData.district || 'Not selected'}
              {formData.state && `, ${formData.state}`}
            </small>
          </div>

          {/* SIMPLIFIED CONDITION - No Gym Centers Available Message */}
          {!loadingGymCenters && 
          !gymCenterError && 
          Array.isArray(gymCenters) && 
          gymCenters.length === 0 && (
            <Alert variant="danger" className="text-center">
              <div className="fw-bold mb-2">🚫 No Gym Centers Available</div>
              <p className="mb-2">
                Sorry, there are no gym centers available in{" "}
                <strong>{formData.district || "this district"}</strong>.
              </p>
              <div className="small">
                Please try selecting a different district or contact support for assistance.
              </div>
              <div className="mt-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setShowGymCenterModal(false)}
                >
                  Change District
                </Button>
              </div>
            </Alert>
          )}

          {/* Gym Centers List */}
          {!loadingGymCenters && 
          !gymCenterError && 
          Array.isArray(gymCenters) && 
          gymCenters.length > 0 && (
            <div className="gym-center-list">
              <Alert variant="success" className="small mb-3">
                <strong>{gymCenters.length}</strong> gym center(s) found in{" "}
                <strong>{formData.district || "selected district"}</strong>
              </Alert>
              
              {gymCenters.map((center, idx) => (
                <div
                  key={idx}
                  className="gym-center-item p-3 border rounded mb-3 d-flex justify-content-between align-items-center"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: '4px solid #0d6efd'
                  }}
                  onClick={() => handleGymCenterSelect(center)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#0d6efd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <strong className="me-2">{center.GymCenterName}</strong>
                      {center.GymCenterType && (
                        <span className="badge bg-primary me-2">{center.GymCenterType}</span>
                      )}
                      {center.GymBusinessLine && (
                        <span className="badge bg-success">{center.GymBusinessLine}</span>
                      )}
                    </div>
                    
                    {center.GymAddress && (
                      <div className="mb-2">
                        <small className="text-muted">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                          {center.GymAddress}
                        </small>
                      </div>
                    )}
                    
                    {center.AddressURL && (
                      <div>
                        <a
                          href={center.AddressURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-1" />
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                  <Button variant="outline-primary" size="sm" className="ms-3">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 p-2 border rounded bg-warning bg-opacity-10">
            <small className="text-muted">
              Sorry, there are no gym centers available in <strong>{formData.district}</strong> district.
            </small>
          </div>
        </Modal.Body>
      </Modal>

      {/* Our Locations Carousel */}
      <Container>
        <section className="our-location-sections mb-5">
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

export default GymServices;