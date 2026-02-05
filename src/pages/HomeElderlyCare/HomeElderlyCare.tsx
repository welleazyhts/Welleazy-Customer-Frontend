import React, { useEffect, useState } from 'react';
import './HomeElderlyCare.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { gymServiceAPI } from '../../api/GymService';
import { CustomerProfile, State, District, Relationship, RelationshipPerson } from '../../types/GymServices';
import { toast } from "react-toastify";
import { HomeElderlyCareAPI } from '../../api/HomeElderlyCare';
import { HomeElderlyCareCaseDetails } from '../../types/HomeElderlyCare';

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

const cards = [
  {
    id: 1,
    title: 'Elderly Care Attendants',
    img: '/ElderlyCareAttendent.png',
    fullText: `Provide compassionate, reliable care for seniors or patients in the comfort of their own homes. Our trained and partially qualified attendants assist with activities of daily living, ensuring safety, comfort, and dignity.

They serve as companions who support essential daily tasks such as:

• Personal grooming and hygiene
• Mobility assistance
• Oral medication support (as directed by the family or physician)
• Meal assistance and basic monitoring

Whether for short-term recovery or long-term support, our attendants offer dependable, day-to-day care tailored to the needs of your loved ones.`
  },
  {
    id: 2,
    title: 'Elderly Care Program',
    img: '/ElderlyCareProgram.png',
    fullText: `Our Elderly Care Program is a thoughtfully designed, holistic care solution for seniors who require support with health, wellness, and daily living — all in the comfort of their own homes.

This program includes:

• Personalized care plans tailored to individual health needs
• Regular health monitoring (vitals, chronic conditions, etc.)
• Assistance with daily activities such as mobility, grooming, and medication reminders
• Emotional and companionship support to reduce isolation
• Access to medical consultations, diagnostics, and home visits when required

Our goal is to promote independence, dignity, and overall well-being for your elderly loved ones through compassionate and consistent care.`
  },
  {
    id: 3,
    title: 'Home Nursing Services',
    img: '/Nursing.png',
    fullText: `Our Home Nursing Services provide professional medical care in the comfort and safety of your home. Delivered by qualified and experienced nurses, these services are ideal for patients recovering from illness, surgery, or those requiring ongoing medical support.

Key features include:

• Post-surgical care and wound management
• Injection administration and IV infusions
• Vital monitoring and chronic condition management
• Support with mobility, hygiene, and medication
• Palliative and elderly care

Whether short-term or long-term, our nurses ensure compassionate, hospital-like care tailored to each patient's needs — right at home.`
  },
];

const statesData = [
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Telangana',
  'Tamil Nadu',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh'
];

const cities = {
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi']
};

const HomeElderlyCare: React.FC = () => {
  const [location, setLocation] = useState('Bangalore/Bengaluru');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(1); // Track selected service ID

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

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

  // Loading state for form submission
  const [submitting, setSubmitting] = useState(false);

  // Appointment form state
  const [appointmentType, setAppointmentType] = useState('Self');
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    state: '',
    city: '',
    address: '',
    requirements: '',
    stateId: '',
    district: '',
    districtId: '',
    landmark: '',
    pincode: '',
    membershipType: 'self',
    relationshipId: '',
    relationshipPersonId: ''
  });

  const handleShowModal = (idx: number) => {
    setSelectedCard(idx);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleShowAppointmentModal = (serviceId?: number) => {
    // If serviceId is provided, set the selected service
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    // Reset form when modal closes
    setFormData({
      name: '',
      contactNumber: '',
      email: '',
      state: '',
      city: '',
      address: '',
      requirements: '',
      stateId: '',
      district: '',
      districtId: '',
      landmark: '',
      pincode: '',
      membershipType: 'self',
      relationshipId: '',
      relationshipPersonId: ''
    });
    setAppointmentType('Self');
    setSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'appointmentType') {
      setAppointmentType(value);
      // Reset dependent fields when switching between self and dependent
      if (value === 'Self') {
        setFormData(prev => ({
          ...prev,
          membershipType: 'self',
          relationshipId: '',
          relationshipPersonId: '',
          name: customerProfile?.EmployeeName || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          membershipType: 'dependent',
          relationshipId: '',
          relationshipPersonId: '',
          name: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      city: '', // Reset city when state changes
      district: '', // Reset district when state changes
      districtId: '' // Reset districtId when state changes
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const selectedDistrict = districts.find(d => d.DistrictId.toString() === value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
      district: selectedDistrict ? selectedDistrict.DistrictName : '',
      districtId: value
    }));
  };

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      relationshipId: value,
      relationshipPersonId: '',
      name: '' // Reset name when relationship changes
    }));
  };

  const handleRelationshipPersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const selectedPerson = relationshipPersons.find(p => p.EmployeeDependentDetailsId.toString() === value);
    
    setFormData(prev => ({
      ...prev,
      relationshipPersonId: value,
      name: selectedPerson ? selectedPerson.DependentName : ''
    }));
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!formData.contactNumber.trim()) {
      toast.error("Please enter your contact number");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    if (!formData.stateId) {
      toast.error("Please select your state");
      return;
    }
    
    if (!formData.districtId) {
      toast.error("Please select your district");
      return;
    }
    
    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    setSubmitting(true);

    const corporateId = localStorage.getItem("CorporateId") || "0";
    const createdBy = localStorage.getItem("LoginRefId") || "0";
    const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";

    // Prepare the case data with the selected service ID
    const caseData: HomeElderlyCareCaseDetails = {
      CorporateId: Number(corporateId),
      CareProgramCaseId: "",
      CorporateBranchId: 5, // Default branch ID
      EmployeeRefId: Number(employeeRefId),
      EmployeeDependentDetailsId: appointmentType === "Dependant" && formData.relationshipPersonId 
        ? Number(formData.relationshipPersonId) 
        : 0,
      CaseFor: appointmentType === "Self" ? 1 : 2,
      CustomerName: formData.name.trim(),
      ContactNumber: formData.contactNumber.trim(),
      EmailId: formData.email.trim(),
      State: Number(formData.stateId),
      City: Number(formData.districtId),
      Address: formData.address.trim(),
      CareProgramId: selectedServiceId, // Use the selected service ID
      CaseStatus: 1, // New case status
      IsActive: 1,
      Requirements: formData.requirements.trim(),
      CreatedBy: Number(createdBy),
    };

    console.log("Submitting case data:", caseData); // For debugging
    console.log("Selected Service ID:", selectedServiceId); // For debugging

    try {
      const response = await HomeElderlyCareAPI.HEPSaveCareProgramsCaseDetails(caseData);
      
      if (response && response.Message) {
        toast.success("We have received your request, Our team will get back to you soon");
        handleCloseAppointmentModal();
      } else {
        toast.success("Appointment request submitted successfully!");
        handleCloseAppointmentModal();
      }
    } catch (error: any) {
      console.error("Failed to submit appointment:", error);
      toast.error(error?.response?.data?.Message || "Failed to submit appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  useEffect(() => {
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const statesData = await gymServiceAPI.CRMStateList();
        setStates(statesData);
      } catch (error) {
        console.error("Failed to load states:", error);
        toast.error("Failed to load states. Please try again.");
        // Fallback to static states if API fails
        setStates(statesData.map((stateName, index) => ({
          StateId: index + 1,
          StateName: stateName,
          CountryId: 1
        })));
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

  // Load relationships on mount
  useEffect(() => {
    const loadRelationships = async () => {
      setLoadingRelationships(true);
      try {
        const relationshipsData = await gymServiceAPI.CRMRelationShipList();
        const filteredRelationships = relationshipsData.filter(
        relationship => relationship.RelationshipId !== 1 && 
                       relationship.RelationshipId !== 2 && 
                       relationship.RelationshipId !== 3
      );
        setRelationships(filteredRelationships);
      } catch (error) {
        console.error("Failed to load relationships:", error);
        toast.error("Failed to load relationships. Please try again.");
      } finally {
        setLoadingRelationships(false);
      }
    };
    loadRelationships();
  }, []);

  // Load relationship persons when relationship changes (for dependent mode)
  useEffect(() => {
    const loadRelationshipPersons = async () => {
      if (appointmentType === 'Dependant' && formData.relationshipId) {
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
  }, [appointmentType, formData.relationshipId]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (showAppointmentModal) {
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
            name: profile.EmployeeName || '',
            contactNumber: profile.MobileNo || '',
            email: profile.Emailid || '',
            state: profile.StateName || '',
            stateId: userState ? userState.StateId.toString() : profile.State?.toString() || '',
            district: profile.DistrictName || '',
            districtId: userDistrict ? userDistrict.DistrictId.toString() : profile.City?.toString() || '',
            city: profile.DistrictName || '', // Using DistrictName as city
            address: `${profile.AddressLineOne || ''} ${profile.AddressLineTwo || ''}`.trim(),
            landmark: profile.Landmark || '',
            pincode: profile.Pincode || '',
            membershipType: 'self',
            relationshipId: '1'
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

    if (showAppointmentModal && states.length > 0) {
      fetchCustomerProfile();
    }
  }, [showAppointmentModal, states, districts]);

  return (
    <div className="home-elderly-care-page">
      
      
      <div className="home-elderly-care-row">
        {cards.map((card, idx) => {
          const truncatedText = card.fullText.slice(0, 100) + (card.fullText.length > 100 ? '...' : '');
          return (
            <div className="home-elderly-care-card medium" key={idx}>
              <h2 className="home-elderly-care-title">{card.title}</h2>
              <div className="home-elderly-care-body-row">
                <img src={card.img} alt={card.title} className="home-elderly-care-small-image" />
                <div className="home-elderly-care-content">
                  <p>
                    {truncatedText}
                    {card.fullText.length > 150 && (
                      <span
                        onClick={() => handleShowModal(idx)}
                        className="read-more-toggle"
                      >
                        See more..
                      </span>
                    )}
                  </p>
               <button
  onClick={() => handleShowAppointmentModal(card.id)}
  style={{
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(180deg, #E64E15 0%, #E9950B 100%)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
  }}
>
  BOOK APPOINTMENT
</button>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for showing service details */}
     <Modal 
  show={showModal} 
  onHide={handleCloseModal} 
  size="lg" 
  centered
  className="service-modal"
>
  <div  className='blue-text fw-bold' style={{marginTop:'-5px'}}>View Details</div>
<div className="modal-close-button" onClick={handleCloseModal} style={{ cursor: 'pointer', position: 'absolute', top: '15px', right: '15px', zIndex: 1051 }}>
  <FontAwesomeIcon icon={faTimes} size="lg" />
</div>


  <Modal.Body>
    {selectedCard !== null && (
      <div style={{ marginTop: "-40px" }}>
        <div className="modal-text">
          {cards[selectedCard].fullText.split("\n").map((line, index) => (
            <p
              key={index}
              className={line.startsWith("•") ? "bullet-point" : ""}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer style={{ marginTop: "-20px" }}>
    <button
      onClick={handleCloseModal}
      style={{
        padding: "10px 20px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Close
    </button>
  </Modal.Footer>

</Modal>


      {/* Book Appointment Modal */}
      <Modal 
        show={showAppointmentModal} 
        onHide={handleCloseAppointmentModal} 
        size="lg" 
        centered
        className="appointment-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment - {cards.find(card => card.id === selectedServiceId)?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileError && (
            <div className="alert alert-warning" role="alert">
              {profileError}
            </div>
          )}
          
          {/* <div className="selected-service-info mb-3 p-3 bg-light rounded">
            <strong>Selected Service:</strong> {cards.find(card => card.id === selectedServiceId)?.title}
          </div> */}
          
          <Form onSubmit={handleSubmitAppointment} style={{marginTop:'-29px'}}>
            {/* Appointment Type - Radio Buttons */}
            <Form.Group className="mb-0">
              <div className="d-flex gap-4">
                <Form.Check
                  type="radio"
                  id="self"
                  name="appointmentType"
                  label="Self"
                  value="Self"
                  checked={appointmentType === 'Self'}
                  onChange={handleInputChange}
                  className=""
                />
                <Form.Check
                  type="radio"
                  id="dependant"
                  name="appointmentType"
                  label="Dependant"
                  value="Dependant"
                  checked={appointmentType === 'Dependant'}
                  onChange={handleInputChange}
                  className=""
                />
              </div>
            </Form.Group>

            {/* Name and Contact Number Section */}
            <div className="row mb-2">
              {/* Self Appointment */}
              {appointmentType === 'Self' && (
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                      disabled={loadingProfile}
                    />
                  </Form.Group>
                </div>
              )}

              {/* Dependent Appointment */}
              {appointmentType === 'Dependant' && (
                <>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Relationship *</Form.Label>
                      <Form.Select
                        name="relationshipId"
                        value={formData.relationshipId}
                        onChange={handleRelationshipChange}
                        required
                        disabled={loadingRelationships}
                      >
                        <option value="">Select Relationship</option>
                        {relationships
                          .filter(rel => rel.RelationshipId !== 1) // Exclude "Self"
                          .map((relationship) => (
                            <option key={relationship.RelationshipId} value={relationship.RelationshipId}>
                              {relationship.Relationship}
                            </option>
                          ))
                        }
                      </Form.Select>
                      {loadingRelationships && <small className="text-muted">Loading relationships...</small>}
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Contact Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your contact number"
                        required
                        disabled={loadingProfile}
                      />
                    </Form.Group>
                  </div>

                  {/* Dependent Selection */}
                  {formData.relationshipId && (
                    <div className="col-12 mt-2">
                      <Form.Group>
                        <Form.Label>
                          {relationshipPersons.length > 1 ? 'Select Dependent *' : 'Dependent Name *'}
                        </Form.Label>
                        {relationshipPersons.length > 1 ? (
                          <Form.Select
                            name="relationshipPersonId"
                            value={formData.relationshipPersonId}
                            onChange={handleRelationshipPersonChange}
                            required
                            disabled={loadingRelationshipPersons}
                          >
                            <option value="">Select Dependent</option>
                            {relationshipPersons.map((person) => (
                              <option key={person.EmployeeDependentDetailsId} value={person.EmployeeDependentDetailsId}>
                                {person.DependentName}
                              </option>
                            ))}
                          </Form.Select>
                        ) : relationshipPersons.length === 1 ? (
                          <Form.Control
                            type="text"
                            value={formData.name}
                            readOnly
                            placeholder="Dependent name will auto-fill"
                          />
                        ) : (
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter dependent name"
                            required
                          />
                        )}
                        {loadingRelationshipPersons && <small className="text-muted">Loading dependents...</small>}
                        {!loadingRelationshipPersons && relationshipPersons.length === 0 && formData.relationshipId && (
                          <small className="text-warning">No dependents found for this relationship. Please enter the name manually.</small>
                        )}
                      </Form.Group>
                    </div>
                  )}
                </>
              )}

              {/* Contact Number for Self */}
              {appointmentType === 'Self' && (
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label>Contact Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your contact number"
                      required
                      disabled={loadingProfile}
                    />
                  </Form.Group>
                </div>
              )}
            </div>

            {/* Email and State in one row */}
            <div className="row mb-2">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>State *</Form.Label>
                  <Form.Select
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleStateChange}
                    required
                    disabled={loadingStates || loadingProfile}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.StateId} value={state.StateId}>
                        {state.StateName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {/* District and Address in one row */}
            <div className="row mb-2">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>District *</Form.Label>
                  <Form.Select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleDistrictChange}
                    required
                    disabled={!formData.stateId || loadingDistricts || loadingProfile}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.DistrictId} value={district.DistrictId}>
                        {district.DistrictName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                    disabled={loadingProfile}
                  />
                </Form.Group>
              </div>
            </div>

            {/* Requirements */}
            <Form.Group className="mb-2">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Please describe your requirements..."
                disabled={loadingProfile}
              />
            </Form.Group>

            {/* Loading indicator */}
            {loadingProfile && (
              <div className="text-center mb-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading profile...</span>
                </div>
                <p className="mt-2">Loading your profile information...</p>
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                type="submit" 
                variant="primary" 
                className="submit-appointment-btn flex-fill"
                disabled={submitting || loadingProfile}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    SUBMITTING...
                  </>
                ) : (
                  "REQUEST CALL BACK"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline-secondary" 
                className="cancel-btn flex-fill"
                onClick={handleCloseAppointmentModal}
                disabled={submitting || loadingProfile}
              >
                CANCEL
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Our Locations Section */}
      <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px'}}>
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

export default HomeElderlyCare;