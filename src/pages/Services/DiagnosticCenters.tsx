import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Modal, Spinner, Alert, Table
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faClinicMedical, 
  faMapMarkerAlt, 
  faClock,
  faCar,
  faCheck,
  faChevronLeft,
  faFilter,
  faSortAmountDown,
  faSortAmountUp,
  faRupeeSign,
  faInfoCircle,
  faUser,
  faCalendarCheck,
  faUserFriends
} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { labTestsAPI } from "../../api/labtests";
import { 
  CRMFetchTestDetailsBasedUponCommonTestNameRequest,
  CRMFetchTestDetailsBasedUponCommonTestNameResponse,
  CRMLoadDCDetailsRequest,
  CRMLoadDCDetailsResponse,
  CrmDcTestPricesResponse,
  LocationState,
  DependentFormData
} from "../../types/labtests";
import './DiagnosticCenters.css';
import {Relationship, RelationshipPerson} from '../../types/GymServices'
import { gymServiceAPI } from '../../api/GymService';
import { toast } from "react-toastify";


interface CrmDcTestPricesResponseWithSelection extends CrmDcTestPricesResponse {
  selected?: boolean;
}

// Address Display Component
const SmartAddressDisplay = ({ address }: { address: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 40; // Adjust this value as needed
  
  if (!address || address === 'Address not available') {
    return (
      <div className="detail-item">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
        <span>Address not available</span>
      </div>
    );
  }
  
  const shouldTruncate = address.length > maxLength && !isExpanded;
  const displayText = shouldTruncate 
    ? `${address.substring(0, maxLength)}...` 
    : address;

  return (
    <div className="detail-item">
      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
      <div className="address-container">
        <span className="address-text" title={address}>
          {displayText}
        </span>
        {address.length > maxLength && (
          <button 
            className="read-more-address" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        )}
      </div>
    </div>
  );
};

const DiagnosticCenters: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as LocationState;
  const selectedTests = locationState?.selectedTests || [];
  const userLocation = locationState?.location || 'Bangalore/Bengaluru';
  

  const [testDetails, setTestDetails] = useState<CRMFetchTestDetailsBasedUponCommonTestNameResponse[]>([]);
  const [dcDetails, setDcDetails] = useState<CRMLoadDCDetailsResponse[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDC, setIsLoadingDC] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [pincode, setPincode] = useState('560102');
  const [selectedDC, setSelectedDC] = useState<number | null>(null);

  const [showPricesModal, setShowPricesModal] = useState(false);
  const [selectedDCDetails, setSelectedDCDetails] = useState<CRMLoadDCDetailsResponse | null>(null);
  const [dcTestPrices, setDcTestPrices] = useState<CrmDcTestPricesResponseWithSelection[]>([]);

  const [filterType, setFilterType] = useState<'all' | 'home' | 'clinic'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
 
  const cityId = Number(localStorage.getItem("DistrictId") || 0);
  const corporateId = Number(localStorage.getItem("CorporateId") || 0);
  const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";


  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [relationshipPersons, setRelationshipPersons] = useState<RelationshipPerson[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [loadingRelationshipPersons, setLoadingRelationshipPersons] = useState(false);


  const [formData, setFormData] = useState<DependentFormData>({
    serviceFor: 'self',
    relationshipId: '',
    relationshipPersonId: '',
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (selectedTests.length > 0) {
      fetchTestDetails(selectedTests[0]);
    }
    loadRelationships();
  }, [selectedTests]);

  const fetchTestDetails = async (testName: string) => {
    if (!testName) return;
    
    setIsLoading(true);
    setSelectedTest(testName);
    
    try {
      const request: CRMFetchTestDetailsBasedUponCommonTestNameRequest = {
        CorporateId: corporateId,
        EmployeeRefId: employeeRefId,
        CityId: cityId,
        CommonTestName: testName
      };
      
      const response = await labTestsAPI.CRMFetchTestDetailsBasedUponCommonTestName(request);
      console.log("Test details response:", response);
      
      if (response && response.length > 0) {
        setTestDetails(response);
        const testIds = response.map(test => test.TestId).join(',');
        setSelectedTestIds(testIds);
        await fetchDCDetails(testIds, testName);
      } else {
        setTestDetails([]);
        setSelectedTestIds('');
      }
    } catch (error) {
      console.error("Failed to fetch test details:", error);
      setTestDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDCDetails = async (testIds: string, testName: string) => {
    if (!testIds || !pincode) return;
    
    setIsLoadingDC(true);
    
    try {
      const request: CRMLoadDCDetailsRequest = {
        CorporateId: corporateId,
        EmployeeRefId: employeeRefId,
        CityId: cityId,
        TestId: testIds,
        PinCode: pincode,
        CommonTestName: testName
      };
      
      const response = await labTestsAPI.CRMLoadDCDetails(request);
      console.log("DC details response:", response);
      
      if (response && response.length > 0) {
        setDcDetails(response);
      } else {
        setDcDetails([]);
      }
    } catch (error) {
      console.error("Failed to fetch DC details:", error);
      setDcDetails([]);
    } finally {
      setIsLoadingDC(false);
    }
  };

  const fetchDCTestPrices = async (dcId: number, testIds: string) => {
    if (!dcId || !testIds) return;
    
    setIsLoadingPrices(true);
    
    try {
      const request: CRMLoadDCDetailsRequest = {
        CorporateId: corporateId,
        EmployeeRefId: employeeRefId,
        CityId: cityId,
        TestId: testIds,
        PinCode: pincode,
        CommonTestName: selectedTest
      };
      
      const response = await labTestsAPI.DCTestPrice(request);
      console.log("DC Test Prices response:", response);
      
      if (response && response.length > 0) {
        const filteredPrices = response
          .filter(price => price.dc_id === dcId)
          .map(price => ({
            ...price,
            selected: true
          }));
        
        setDcTestPrices(filteredPrices);
      } else {
        setDcTestPrices([]);
      }
    } catch (error) {
      setDcTestPrices([]);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const handleTestChange = (testName: string) => {
    fetchTestDetails(testName);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPincode = e.target.value;
    if (!/^\d*$/.test(newPincode)) return;
    setPincode(newPincode);
    if (newPincode.length === 6 && selectedTestIds) {
      fetchDCDetails(selectedTestIds, selectedTest);
    }
  };

  const handleSelectDC = async (dc: CRMLoadDCDetailsResponse) => {
    setSelectedDC(dc.dc_id);
    setSelectedDCDetails(dc);
    await fetchDCTestPrices(dc.dc_id, selectedTestIds);
    setFormData({
      serviceFor: 'self',
      relationshipId: '',
      relationshipPersonId: '',
      name: '',
      phone: '',
      email: ''
    });
    setShowPricesModal(true);
  };
  
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
  
  const loadRelationshipPersons = async (relationshipId: string) => {
    if (!relationshipId) {
      setRelationshipPersons([]);
      return;
    }
    
    setLoadingRelationshipPersons(true);
    try {
      const empRefId = localStorage.getItem("EmployeeRefId");
      if (!empRefId) {
        toast.error("Please log in to select dependents.");
        return;
      }
      
      const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
        parseInt(empRefId),
        parseInt(relationshipId)
      );
      setRelationshipPersons(personsData);
      setFormData(prev => ({
        ...prev,
        relationshipPersonId: '',
        name: '',
        phone: '',
        email: ''
      }));
      
    } catch (error) {
      toast.error("Failed to load dependents. Please try again.");
      setRelationshipPersons([]);
    } finally {
      setLoadingRelationshipPersons(false);
    }
  };
  
  const handleServiceTypeChange = (type: 'self' | 'dependent') => {
    setFormData({
      serviceFor: type,
      relationshipId: '',
      relationshipPersonId: '',
      name: '',
      phone: '',
      email: ''
    });
    setRelationshipPersons([]);
  };
  
  const handleRelationshipChange = (relationshipId: string) => {
    setFormData(prev => ({
      ...prev,
      relationshipId,
      relationshipPersonId: '',
      name: '',
      phone: '',
      email: ''
    }));
    if (relationshipId) {
      loadRelationshipPersons(relationshipId);
    } else {
      setRelationshipPersons([]);
    }
  };
  
  const handleDependentPersonChange = (personId: string) => {
    const selectedPerson = relationshipPersons.find(person => 
      person.EmployeeDependentDetailsId.toString() === personId
    );
    
    setFormData(prev => ({
      ...prev,
      relationshipPersonId: personId,
      name: selectedPerson?.DependentName || '',
    }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const filteredDCs = dcDetails.filter(dc => {
    if (filterType === 'all') return true;
    if (filterType === 'home') return dc.VisitType.toLowerCase().includes('home');
    if (filterType === 'clinic') return dc.VisitType.toLowerCase().includes('clinic');
    return true;
  });
  
  const sortedDCs = [...filteredDCs].sort((a, b) => {
    if (sortBy === 'distance') {
      const distanceA = parseFloat(a.DC_Distance?.replace(' km', '') || '0');
      const distanceB = parseFloat(b.DC_Distance?.replace(' km', '') || '0');
      return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.center_name.localeCompare(b.center_name)
        : b.center_name.localeCompare(a.center_name);
    }
    return 0;
  });
  
  const calculateTotalSelectedPrice = () => {
    return dcTestPrices
      .filter(price => price.selected)
      .reduce((total, price) => {
        const testPrice = price.CorporatePrice || price.NormalPrice || 0;
        return total + testPrice;
      }, 0);
  };
  
  const calculateTotalPrice = () => {
    return dcTestPrices.reduce((total, price) => {
      const testPrice = price.CorporatePrice || price.NormalPrice || 0;
      return total + testPrice;
    }, 0);
  };
  
  const handleSelectAll = (isChecked: boolean) => {
    setDcTestPrices(prev => prev.map(price => ({
      ...price,
      selected: isChecked
    })));
  };
  
  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    setDcTestPrices(prev => 
      prev.map((price, i) => 
        i === index ? { ...price, selected: isChecked } : price
      )
    );
  };
  
  const handleProceedToAppointment = () => {
    console.log('Proceeding to appointment booking');
    console.log('Selected tests:', dcTestPrices.filter(p => p.selected));
    console.log('Service for:', formData);
    const selectedTestsData = dcTestPrices.filter(p => p.selected);
    const cartData = {
      selectedTests: selectedTestsData,
      selectedDC: selectedDCDetails,
      totalAmount: calculateTotalSelectedPrice(),
      serviceFor: formData
    };
    
    navigate('/diagnostic-cart', {
      state: cartData
    });
    setShowPricesModal(false);
  };
  
  const validateDependentForm = () => {
    if (formData.serviceFor === 'dependent') {
      if (!formData.relationshipId) {
        toast.error("Please select a relationship");
        return false;
      }
      if (!formData.relationshipPersonId && !formData.name) {
        toast.error("Please select a dependent or enter name");
        return false;
      }
    }
    return true;
  };
  
  const uniqueTestNames = Array.from(new Set(selectedTests));

  return (
    <div className="diagnostic-centers-page">
      <Container>
        <div className="dc-header">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h1>Select Diagnostic Center</h1>
          <p className="dc-subtitle">
            Choose a diagnostic center for your selected tests
          </p>
        </div>
        
        <Card className="summary-card">
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="summary-item">
                  <h5>Selected Tests</h5>
                  <p>{selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''}</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="summary-item">
                  <h5>Location</h5>
                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {userLocation}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="summary-item">
                  <h5>Pincode</h5>
                  <Form.Control
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    placeholder="Enter pincode"
                    className="pincode-input"
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <Card className="test-selection-card mb-4">
          <Card.Body>
            <h5 className="mb-3">Select Test to View Centers</h5>
            <div className="test-buttons">
              {uniqueTestNames.map((testName, index) => (
                <button
                  key={index}
                  className={`test-btn ${selectedTest === testName ? 'active' : ''}`}
                  onClick={() => handleTestChange(testName)}
                  disabled={isLoading}
                >
                  {testName}
                  {selectedTest === testName && (
                    <span className="selected-indicator">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
        
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading test details...</p>
          </div>
        )}
        
        {testDetails.length > 0 && (
          <Card className="filters-card mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="filter-section">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    <strong>Filter by:</strong>
                    <div className="filter-buttons">
                      <button 
                        className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                      >
                        All Centers
                      </button>
                      <button 
                        className={`filter-btn ${filterType === 'home' ? 'active' : ''}`}
                        onClick={() => setFilterType('home')}
                      >
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        Home Collection
                      </button>
                      <button 
                        className={`filter-btn ${filterType === 'clinic' ? 'active' : ''}`}
                        onClick={() => setFilterType('clinic')}
                      >
                        <FontAwesomeIcon icon={faClinicMedical} className="me-2" />
                        Clinic Visit
                      </button>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="sort-section">
                    <FontAwesomeIcon 
                      icon={sortOrder === 'asc' ? faSortAmountUp : faSortAmountDown} 
                      className="me-2" 
                    />
                    <strong>Sort by:</strong>
                    <select 
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
                    >
                      <option value="distance">Distance</option>
                      <option value="name">Name</option>
                    </select>
                    <button 
                      className="sort-order-btn"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
        
        {isLoadingDC ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading diagnostic centers...</p>
          </div>
        ) : sortedDCs.length > 0 ? (
          <>
            <div className="dc-grid">
              <Row>
                {sortedDCs.map((dc) => (
                  <Col md={6} lg={4} key={dc.dc_id} className="mb-4">
                    <Card className={`dc-card ${selectedDC === dc.dc_id ? 'selected' : ''}`}>
                      <Card.Body>
                        <div className="dc-card-header">
                          <div className="dc-logo">
                            {dc.VisitType?.toLowerCase().includes('home') ? (
                              <FontAwesomeIcon icon={faHome} size="2x" />
                            ) : (
                              <FontAwesomeIcon icon={faClinicMedical} size="2x" />
                            )}
                          </div>
                          <div className="dc-info-center">
                            <h5 className="dc-name">{dc.center_name}</h5>
                          </div>
                        </div>
                        
                        <div className={`visit-type-badge ${dc.VisitType?.toLowerCase()}`}>
                          <FontAwesomeIcon 
                            icon={dc.VisitType?.toLowerCase().includes('home') ? faHome : faClinicMedical} 
                            className="me-1" 
                          />
                          {dc.VisitType}
                        </div>
                        
                        <div className="dc-details">
                          {/* Using the SmartAddressDisplay component */}
                          <SmartAddressDisplay 
                            address={dc.address || dc.Locality || dc.area || 'Address not available'}
                          />
                          
                          <div className="detail-item">
                            <FontAwesomeIcon icon={faCar} className="me-2" />
                            <span>{dc.DC_Distance || 'Distance not available'}</span>
                          </div>
                          
                          {dc.ISO_Type && dc.ISO_Type !== 'NA' && (
                            <div className="detail-item">
                              <div className="iso-badge">
                                ISO: {dc.ISO_Type}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="service-area">
                          <small>
                            <strong>Service Area:</strong> {dc.service_pincode?.split(',').length || 0} pincodes
                          </small>
                        </div>
                        
                        {dc.TestName && (
                          <div className="test-info">
                            <small>
                              <strong>Test Available:</strong> {dc.TestName}
                            </small>
                          </div>
                        )}
                        
                        <Button
                          className="select-dc-btn"
                          onClick={() => handleSelectDC(dc)}
                          disabled={isLoadingDC}
                        >
                          Select Center
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
            
            <Card className="action-card mt-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="selection-summary">
                      {selectedDC ? (
                        <>
                          <strong>Selected:</strong> {
                            dcDetails.find(dc => dc.dc_id === selectedDC)?.center_name
                          }
                          <br />
                          <small className="text-muted">
                            {dcDetails.find(dc => dc.dc_id === selectedDC)?.VisitType}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">No center selected</span>
                      )}
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={!selectedDC || isLoadingDC}
                      onClick={() => setShowPricesModal(true)}
                      className="confirm-btn"
                    >
                      Confirm Selection & Proceed
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        ) : testDetails.length > 0 && !isLoadingDC ? (
          <Alert variant="warning" className="text-center">
            <h5>No Diagnostic Centers Found</h5>
            <p>
              No diagnostic centers found for the selected test in your area.
              Try changing the pincode or selecting a different test.
            </p>
          </Alert>
        ) : null}
        
        {testDetails.length > 0 && (
          <Card className="test-details-card mt-4">
            <Card.Body>
              <h5>Available Tests for "{selectedTest}"</h5>
              <div className="test-variants">
                {testDetails.map((test, index) => (
                  <div key={index} className="test-variant">
                    <span className="test-id">ID: {test.TestId}</span>
                    <span className="test-name">{test.TestName}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
      
      {/* Prices Modal */}
      <Modal
        show={showPricesModal}
        onHide={() => setShowPricesModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Test Prices - {selectedDCDetails?.center_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingPrices ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading test prices...</p>
            </div>
          ) : dcTestPrices.length > 0 ? (
            <>
              <Table striped bordered hover responsive className="mb-4">
                <thead>
                  <tr>
                    <th>
                      <Form.Check 
                        type="checkbox"
                        checked={dcTestPrices.length > 0 && dcTestPrices.every(p => p.selected)}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        label="Select All"
                      />
                    </th>
                    <th>Test Name</th>
                    {/* <th>Package Code</th> */}
                    <th className="text-end">Corporate Price</th>
                  </tr>
                </thead>
                <tbody>
                  {dcTestPrices.map((price, index) => (
                    <tr key={index} className={price.selected ? 'table-primary' : ''}>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={price.selected || false}
                          onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                          aria-label={`Select ${price.TestName}`}
                        />
                      </td>
                      <td>
                        <strong>{price.TestName}</strong>
                      </td>
                      {/* <td>{price.TestPackageCode || 'N/A'}</td> */}
                      <td className="text-end text-success fw-bold">
                        <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                        {price.CorporatePrice?.toFixed(2) || price.NormalPrice?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {/* <tr>
                    <td colSpan={3} className="text-end fw-bold">Total Selected:</td>
                    <td className="text-end fw-bold text-success">
                      <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                      {calculateTotalSelectedPrice().toFixed(2)}
                    </td>
                  </tr> */}
                </tfoot>
              </Table>
              
              <Card className="mb-4">
                <Card.Body style={{ marginTop: -46 }}>

                  <h6 className="mb-3">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Please select for whom you are taking this service
                  </h6>
                  
                  <div className="d-flex align-items-center gap-4 mb-4">
                    <Form.Check
                      type="radio"
                      id="self-service"
                      name="serviceFor"
                      checked={formData.serviceFor === 'self'}
                      onChange={() => handleServiceTypeChange('self')}
                      label={
                        <div>
                          <strong>Self</strong>
                        </div>
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="dependent-service"
                      name="serviceFor"
                      checked={formData.serviceFor === 'dependent'}
                      onChange={() => handleServiceTypeChange('dependent')}
                      label={
                        <div>
                          <FontAwesomeIcon icon={faUserFriends} className="me-2" />
                          <strong>Dependent</strong>
                        </div>
                      }
                    />
                  </div>

                  {/* Dependent Form */}
                  {formData.serviceFor === 'dependent' && (
                    <div className="dependent-form mt-4 p-3 border rounded">
                      <h6 className="mb-3">Dependent Details</h6>
                      <div className="mb-3">
                        <Form.Label>
                          <strong>Relationship <span className="text-danger">*</span></strong>
                        </Form.Label>
                        <Form.Select
                          value={formData.relationshipId}
                          onChange={(e) => handleRelationshipChange(e.target.value)}
                          disabled={loadingRelationships}
                        >
                          <option value="">Select Relationship</option>
                          {loadingRelationships ? (
                            <option disabled>Loading relationships...</option>
                          ) : (
                            relationships.map((relationship) => (
                              <option 
                                key={relationship.RelationshipId} 
                                value={relationship.RelationshipId}
                              >
                                {relationship.Relationship}
                              </option>
                            ))
                          )}
                        </Form.Select>
                      </div>

                      {/* Dependent Person Selection */}
                      {formData.relationshipId && (
                        <div className="mb-3">
                          <Form.Label>
                            <strong>Select Dependent</strong>
                          </Form.Label>
                          <Form.Select
                            value={formData.relationshipPersonId}
                            onChange={(e) => handleDependentPersonChange(e.target.value)}
                            disabled={loadingRelationshipPersons}
                          >
                            <option value="">Select Dependent</option>
                            {loadingRelationshipPersons ? (
                              <option disabled>Loading dependents...</option>
                            ) : (
                              relationshipPersons.map((person) => (
                                <option 
                                  key={person.EmployeeDependentDetailsId} 
                                  value={person.EmployeeDependentDetailsId}
                                >
                                  {person.DependentName} 
                                </option>
                              ))
                            )}
                          </Form.Select>
                        </div>
                      )}

                      {/* Display selected dependent info */}
                      {formData.relationshipPersonId && 
                       formData.relationshipPersonId !== 'new' && 
                       formData.name && (
                        <Alert variant="info" className="mt-3">
                          <strong>Selected Dependent:</strong> {formData.name}
                          {formData.phone && <div><strong>Phone:</strong> {formData.phone}</div>}
                          {formData.email && <div><strong>Email:</strong> {formData.email}</div>}
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="px-5"
                      onClick={() => {
                        if (validateDependentForm()) {
                          handleProceedToAppointment();
                        }
                      }}
                      disabled={dcTestPrices.filter(p => p.selected).length === 0}
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                      Proceed for Appointment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </>
          ) : (
            <Alert variant="info" className="text-center">
              <h5>No Price Details Available</h5>
              <p>
                Price information is not available for the selected diagnostic center.
              </p>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPricesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DiagnosticCenters;