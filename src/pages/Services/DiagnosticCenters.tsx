import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button, Form,
  Modal, Spinner, Alert, Table, Badge
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
import { labTestsAPI, mapDCToLegacy } from "../../api/labtests";
import {
  CRMFetchTestDetailsBasedUponCommonTestNameRequest,
  CRMFetchTestDetailsBasedUponCommonTestNameResponse,
  CRMLoadDCDetailsRequest,
  CRMLoadDCDetailsResponse,
  CrmDcTestPricesResponse,
  LocationState,
  DependentFormData,
  VisitType,
  FilterDiagnosticCenterParams,
  AddToCartRequest,
  DiagnosticCenterSearchRequest
} from "../../types/labtests";
import './DiagnosticCenters.css';
import { Relationship, RelationshipPerson } from '../../types/GymServices'
import { gymServiceAPI } from '../../api/GymService';
import { AddressBookAPI } from '../../api/AddressBook';
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
  const selectedTests = useMemo(() => {
    const raw = (locationState?.selectedTests || []) as any[];
    return raw.map(t => typeof t === 'string' ? t : (t.TestName || t.name || ''));
  }, [locationState?.selectedTests]);

  // Initialize userLocation from localStorage (priority) or location state
  const [userLocation, setUserLocation] = useState<string>(
    localStorage.getItem("SelectedDistrictName") ||
    locationState?.location ||
    'Bangalore/Bengaluru'
  );


  const [testDetails, setTestDetails] = useState<CRMFetchTestDetailsBasedUponCommonTestNameResponse[]>([]);
  const [dcDetails, setDcDetails] = useState<CRMLoadDCDetailsResponse[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDC, setIsLoadingDC] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [searchName, setSearchName] = useState('');
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [filterVisitType, setFilterVisitType] = useState<string | number>('');
  const [sortPrice, setSortPrice] = useState<'high' | 'low' | ''>('');
  const [selectedDC, setSelectedDC] = useState<number | null>(null);

  const [showPricesModal, setShowPricesModal] = useState(false);
  const [selectedDCDetails, setSelectedDCDetails] = useState<CRMLoadDCDetailsResponse | null>(null);
  const [dcTestPrices, setDcTestPrices] = useState<CrmDcTestPricesResponseWithSelection[]>([]);

  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [cityId, setCityId] = useState<number>(Number(localStorage.getItem("DistrictId") || 0));
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

  const [availableAddresses, setAvailableAddresses] = useState<any[]>([]);
  const [bookingVisitType, setBookingVisitType] = useState<number>(1); // 1 = Home, 2 = Center
  const [userAddressId, setUserAddressId] = useState<number>(0);

  // Listen for global location changes
  useEffect(() => {
    const handleDistrictChange = (e: CustomEvent) => {
      if (e.detail) {
        if (e.detail.districtId) setCityId(Number(e.detail.districtId));
        if (e.detail.districtName) setUserLocation(e.detail.districtName);
      }
    };

    window.addEventListener('districtChanged', handleDistrictChange as EventListener);
    return () => {
      window.removeEventListener('districtChanged', handleDistrictChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (selectedTests.length > 0) {
      loadAllSelectedTests();
    } else {
      fetchAllCenters();
    }
    loadRelationships();
    loadVisitTypes();
    loadUserProfile();
  }, [selectedTests, cityId]);

  const loadUserProfile = async () => {
    try {
      if (employeeRefId) {
        const profile = await gymServiceAPI.CRMLoadCustomerProfileDetails(Number(employeeRefId));
        if (profile && profile.EmployeeAddressDetailsId) {
          setUserAddressId(profile.EmployeeAddressDetailsId);
        }
      }
    } catch (error) {
      console.error("Failed to load user profile for address:", error);
    }
  };

  const fetchAllCenters = async () => {
    setIsLoadingDC(true);
    try {
      const data = await labTestsAPI.fetchDiagnosticCenters();
      if (data && data.length > 0) {
        // Map DiagnosticCenterDetailed to CRMLoadDCDetailsResponse
        const mappedData: CRMLoadDCDetailsResponse[] = data.map(mapDCToLegacy);

        // Deduplicate by Name + Pincode to show unique locations
        const uniqueData = mappedData.filter((dc, index, self) =>
          index === self.findIndex((t) => (
            t.center_name === dc.center_name &&
            (t.service_pincode === dc.service_pincode || t.DistrictName === dc.DistrictName)
          ))
        );

        setDcDetails(uniqueData);
      }
    } catch (error) {
      console.error("Failed to fetch all centers:", error);
    } finally {
      setIsLoadingDC(false);
    }
  };

  const loadVisitTypes = async () => {
    try {
      const data = await labTestsAPI.fetchVisitTypes();
      if (data) setVisitTypes(data);
    } catch (error) {
      console.error("Failed to load visit types:", error);
    }
  };

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
        // Filter to only include tests that match the search name to avoid showing unrelated tests
        const filteredResponse = response.filter(test =>
          test.TestName.toLowerCase().includes(testName.toLowerCase())
        );

        setTestDetails(filteredResponse);
        const testIds = filteredResponse.map(test => test.TestId).join(',');
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

  const fetchDCDetails = async (testIds: string, testName: string, overridePincode?: string, overrideArea?: string) => {
    if (!testIds) return;

    setIsLoadingDC(true);

    try {
      const currentPincode = overridePincode !== undefined ? overridePincode : pincode;
      const currentArea = overrideArea !== undefined ? overrideArea : area;

      const request: CRMLoadDCDetailsRequest = {
        CorporateId: corporateId,
        EmployeeRefId: employeeRefId,
        CityId: cityId,
        TestId: testIds,
        PinCode: currentPincode,
        Area: currentArea,
        CommonTestName: testName
      };

      // Since we updated CRMLoadDCDetails to handle search parameters, 
      // we can now use it as our primary data source.
      const response = await labTestsAPI.CRMLoadDCDetails(request);

      if (response && response.length > 0) {
        // Deduplicate response by Name + Pincode to avoid showing same center multiple times
        const uniqueResponse = response.filter((dc, index, self) =>
          index === self.findIndex((t) => (
            t.center_name === dc.center_name &&
            (t.service_pincode === dc.service_pincode || t.DistrictName === dc.DistrictName)
          ))
        );
        setDcDetails(uniqueResponse);
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



  const handleTestChange = (testName: string) => {
    fetchTestDetails(testName);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPincode = e.target.value;
    if (!/^\d*$/.test(newPincode)) return;
    setPincode(newPincode);
    if (newPincode.length === 6 && selectedTestIds) {
      fetchDCDetails(selectedTestIds, selectedTest, newPincode);
    } else if (newPincode.length === 0 && selectedTestIds) {
      fetchDCDetails(selectedTestIds, selectedTest, '');
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArea(e.target.value);
  };

  const handleSearchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const applyFilters = () => {
    fetchDCDetails(selectedTestIds, selectedTest, pincode, area);
  }

  const handleSelectDC = async (dc: CRMLoadDCDetailsResponse) => {
    setSelectedDC(dc.dc_id);
    setSelectedDCDetails(dc);

    setFormData({
      serviceFor: 'self',
      relationshipId: '',
      relationshipPersonId: '',
      name: '',
      phone: '',
      email: ''
    });

    // Default to Home (1) if available, otherwise Center (2)
    let defaultVisitType = 1;
    if (dc.VisitType && dc.VisitType.toLowerCase().includes('center') && !dc.VisitType.toLowerCase().includes('home')) {
      defaultVisitType = 2;
    }
    setBookingVisitType(defaultVisitType);

    setShowPricesModal(true);
  };

  const loadAllSelectedTests = async () => {
    if (selectedTests.length === 0) {
      fetchAllCenters();
      return;
    }

    setIsLoading(true);
    let allTestDetails: CRMFetchTestDetailsBasedUponCommonTestNameResponse[] = [];
    let allTestIds: number[] = [];

    try {
      // Fetch details for all selected tests in parallel
      const fetchPromises = selectedTests.map(testName =>
        labTestsAPI.CRMFetchTestDetailsBasedUponCommonTestName({
          CorporateId: corporateId,
          EmployeeRefId: employeeRefId,
          CityId: cityId,
          CommonTestName: testName
        })
      );

      const responses = await Promise.all(fetchPromises);

      responses.forEach((response, index) => {
        if (response && response.length > 0) {
          const testName = selectedTests[index];
          // Filter to match the requested test name
          const filtered = response.filter(test =>
            test.TestName.toLowerCase().includes(testName.toLowerCase())
          );

          allTestDetails = [...allTestDetails, ...filtered];
          allTestIds = [...allTestIds, ...filtered.map(t => t.TestId)];
        }
      });

      setTestDetails(allTestDetails);
      const testIdsStr = Array.from(new Set(allTestIds)).join(',');
      setSelectedTestIds(testIdsStr);

      // Update selected test display
      setSelectedTest(selectedTests.join(' + '));

      // Load centers for all tests
      await fetchDCDetails(testIdsStr, selectedTests.join(', '));
    } catch (error) {
      console.error("Failed to load all selected tests:", error);
      toast.error("Failed to load test details. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  const loadDependents = async (relationshipId: number = 0) => {
    setLoadingRelationshipPersons(true);
    try {
      const empRefId = localStorage.getItem("EmployeeRefId");
      if (!empRefId) return;

      // Pass 0 to fetch ALL dependents, or specific ID to filter
      const personsData = await gymServiceAPI.CRMRelationShipPersonNames(
        parseInt(empRefId),
        relationshipId
      );
      setRelationshipPersons(personsData);
    } catch (error) {
      console.error("Failed to load dependents:", error);
      setRelationshipPersons([]);
    } finally {
      setLoadingRelationshipPersons(false);
    }
  };

  const loadUserAddresses = async () => {
    try {
      let addresses = [];
      if (formData.serviceFor === 'self') {
        addresses = await AddressBookAPI.getSelfAddresses(1); // address_type=1 for self
      } else if (formData.serviceFor === 'dependent' && formData.relationshipPersonId) {
        addresses = await AddressBookAPI.getDependentAddresses(Number(formData.relationshipPersonId), 2); // address_type=2 for dependent
      }

      setAvailableAddresses(addresses);
      if (addresses.length > 0) {
        setUserAddressId(addresses[0].id || addresses[0].EmployeeAddressDetailsId);
      } else {
        setUserAddressId(0);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setAvailableAddresses([]);
      setUserAddressId(0);
    }
  };

  useEffect(() => {
    if (bookingVisitType === 1) {
      loadUserAddresses();
    }
  }, [bookingVisitType, formData.serviceFor, formData.relationshipPersonId]);

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

    if (type === 'dependent') {
      loadDependents(0); // Load ALL by default
    }
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

    // If empty string (Select Relationship), load ALL (0)
    // Otherwise load specific
    const relId = relationshipId ? parseInt(relationshipId) : 0;
    loadDependents(relId);
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
    // 1. Visit Type filter
    const matchesVisitType = !filterVisitType || dc.VisitType.toLowerCase().includes(filterVisitType.toString().toLowerCase());

    // 2. Strict Pincode Filter - only apply if pincode is 6 digits
    let matchesPincode = true;
    if (pincode && pincode.length === 6) {
      const currentPincode = pincode.trim();
      // Check if center's own pincode matches OR if it covers it in service_pincode
      const servicePincodes = dc.service_pincode ? dc.service_pincode.split(',').map(p => p.trim()) : [];
      matchesPincode = servicePincodes.includes(currentPincode) ||
        !!(dc.address && dc.address.includes(currentPincode)) ||
        !!(dc.service_pincode && dc.service_pincode.includes(currentPincode));
    }

    // 3. Strict Area Filter
    let matchesArea = true;
    if (area && area.trim().length > 2) {
      const searchArea = area.toLowerCase().trim();
      const dcArea = (dc.area || '').toLowerCase();
      const dcLocality = (dc.Locality || '').toLowerCase();
      const dcAddress = (dc.address || '').toLowerCase();

      matchesArea = dcArea.includes(searchArea) ||
        dcLocality.includes(searchArea) ||
        dcAddress.includes(searchArea);
    }

    // 4. Test Availability Filter
    let matchesTests = true;
    if (selectedTestIds) {
      const requestedIds = selectedTestIds.split(',').map(Number).filter(id => !isNaN(id));
      const dcSupportedTests = (dc.tests || []).map(Number);
      if (requestedIds.length > 0) {
        // Only show centers that support ALL selected tests for accuracy
        matchesTests = requestedIds.every(id => dcSupportedTests.includes(id));
      }
    }

    return matchesVisitType && matchesPincode && matchesArea && matchesTests;
  });

  const sortedDCs = [...filteredDCs].sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = a.DC_Distance || 'N/A';
      const distB = b.DC_Distance || 'N/A';
      if (distA === 'N/A' && distB === 'N/A') return 0;
      if (distA === 'N/A') return 1;
      if (distB === 'N/A') return -1;

      const distanceA = parseFloat(distA.replace(' km', ''));
      const distanceB = parseFloat(distB.replace(' km', ''));
      return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
    } else if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.center_name.localeCompare(b.center_name)
        : b.center_name.localeCompare(a.center_name);
    }
    return 0;
  });

  const calculateTotalSelectedPrice = () => {
    if (dcTestPrices.length > 0) {
      return dcTestPrices
        .filter(price => price.selected)
        .reduce((total, price) => {
          const testPrice = price.CorporatePrice || price.NormalPrice || 0;
          return total + Number(testPrice);
        }, 0);
    }

    // Fallback to testDetails if dcTestPrices is empty
    return testDetails.reduce((total, test) => {
      const testPrice = (test as any).CorporatePrice || (test as any).NormalPrice || 0;
      return total + Number(testPrice);
    }, 0);
  };

  const calculateTotalPrice = () => {
    return dcTestPrices.reduce((total, price) => {
      const testPrice = price.CorporatePrice || price.NormalPrice || 0;
      return total + Number(testPrice);
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

  const handleProceedToAppointment = async () => {
    setIsLoadingPrices(true);
    try {
      console.log('Proceeding to appointment booking');
      let selectedTestsData = dcTestPrices.filter(p => p.selected);

      // FALLBACK: If dcTestPrices is empty (fallback mode), use testDetails matching the selected test
      if (selectedTestsData.length === 0 && testDetails.length > 0) {
        selectedTestsData = testDetails.map(t => ({
          TestId: t.TestId,
          TestName: t.TestName,
          CorporatePrice: t.CorporatePrice || t.NormalPrice || 0,
          NormalPrice: t.NormalPrice || 0,
          selected: true
        })) as any;
      }

      const totalAmount = selectedTestsData.reduce((sum, test) => {
        const p = (test as any).CorporatePrice || (test as any).NormalPrice || 0;
        return sum + Number(p);
      }, 0);

      // Valid Test IDs parsing: ensure valid positive numbers
      let parsedTestIds = selectedTestIds
        .split(',')
        .map(s => s.trim())
        .map(Number)
        .filter(id => !isNaN(id) && id > 0);


      if (parsedTestIds.length === 0) {
        toast.error("No valid tests selected.");
        setIsLoadingPrices(false);
        return;
      }

      const addToCartRequest: AddToCartRequest = {
        diagnostic_center_id: selectedDCDetails?.dc_id || 0,
        visit_type_id: bookingVisitType,
        test_ids: parsedTestIds,
        for_whom: formData.serviceFor === 'dependent' ? 'dependant' : 'self',
        dependant_id: formData.serviceFor === 'dependent' ? Number(formData.relationshipPersonId) : null,
        address_id: bookingVisitType === 1 ? (userAddressId || 0) : null, // Send address only for Home Visit
        note: "",
        appointment_date: new Date().toISOString().split('T')[0], // Default today
        appointment_time: "10:00 AM" // Default slot
      };

      console.log('Clearing existing diagnostic items from cart to prevent duplicates...');
      await labTestsAPI.clearDiagnosticCart();

      console.log('Calling addToCart API with payload:', addToCartRequest);
      const cartResponse = await labTestsAPI.addToCart(addToCartRequest);

      console.log('addToCart API Response:', cartResponse);

      if (cartResponse) {
        if (cartResponse.alreadyExists) {
          toast.info("Item already in cart. Proceeding to checkout.");
        } else {
          toast.success("Added to cart successfully!");
        }

        const selectedAddressObj = bookingVisitType === 1
          ? availableAddresses.find(addr => (addr.id || addr.EmployeeAddressDetailsId) === userAddressId)
          : null;

        const cartData = {
          selectedTests: selectedTestsData,
          selectedDC: selectedDCDetails,
          totalAmount: totalAmount,
          serviceFor: formData,
          selectedVisitType: bookingVisitType === 1 ? 'Home Visit' : 'Center Visit',
          selectedAddress: selectedAddressObj,
          cartResponse: cartResponse
        };
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Create cart item for the common cart
        const commonCartItem = {
          id: `diagnostic_${parsedTestIds.join('_')}_${Date.now()}`,
          type: 'diagnostic',
          testName: selectedTestsData.map(t => t.TestName).join(', '), // For Cart page
          ItemName: selectedTestsData.map(t => t.TestName).join(', '), // For Checkout page
          price: totalAmount,
          ItemAmount: totalAmount,
          Quantity: 1,
          testId: parsedTestIds.join(','),
          dcId: selectedDCDetails?.dc_id,
          center_name: selectedDCDetails?.center_name,
          PersonName: formData.serviceFor === 'dependent' ? formData.name : (localStorage.getItem("DisplayName") || 'Self'),
          Relationship: formData.serviceFor === 'dependent' ? (relationships.find(r => r.RelationshipId.toString() === formData.relationshipId)?.Relationship || 'Dependent') : 'Self',
          appointmentTime: "", // Empty until selected in cart
          AppointmentTime: "", // Empty until selected in cart
          AppointmentDate: "", // Empty until selected in cart
          MobileNo: formData.phone || localStorage.getItem("MobileNo") || '+91 9876543210',
          Emailid: formData.email || localStorage.getItem("Emailid") || '',
          DCSelection: selectedDCDetails?.dc_id.toString(),
          DCAddress: selectedDCDetails?.address
        };

        const currentLocalCart = JSON.parse(localStorage.getItem(`app_cart_${localStorage.getItem("EmployeeRefId")}`) || '[]');
        const updatedLocalCart = [...currentLocalCart.filter((i: any) => i.id !== commonCartItem.id), commonCartItem];
        localStorage.setItem(`app_cart_${localStorage.getItem("EmployeeRefId")}`, JSON.stringify(updatedLocalCart));

        // Delay navigation slightly to ensure toast is visible and data is synced
        setTimeout(() => {
          navigate('/CommonCartDcAndConsultation', {
            state: {
              cartItems: [commonCartItem],
              cartUniqueId: cartResponse.cart_unique_id || cartResponse.CartUniqueId
            }
          });
          setShowPricesModal(false);
        }, 800);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error during cart addition:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoadingPrices(false);
    }
  };


  const validateDependentForm = () => {
    if (formData.serviceFor === 'dependent') {
      // relationshipId check removed as UI no longer uses it
      if (!formData.relationshipPersonId && !formData.name) {
        toast.error("Please select a dependent");
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
              <Col md={3}>
                <div className="summary-item">
                  <h5>Selected Tests</h5>
                  <p>{selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''}</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="summary-item">
                  <h5>Location</h5>
                  <p>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {userLocation}
                  </p>
                </div>
              </Col>
              <Col md={3}>
                <div className="summary-item">
                  <h5>Pincode</h5>
                  <Form.Control
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    placeholder="Pincode"
                    className="pincode-input"
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="summary-item">
                  <h5>Area</h5>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      value={area}
                      onChange={handleAreaChange}
                      placeholder="Search Area"
                      className="me-2"
                    />
                    <Button size="sm" onClick={applyFilters}>Go</Button>
                  </div>
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
                        className={`filter-btn ${filterVisitType === '' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterVisitType('');
                          fetchDCDetails(selectedTestIds, selectedTest);
                        }}
                      >
                        All
                      </button>
                      {visitTypes.map((vt) => (
                        <button
                          key={vt.id || vt.name}
                          className={`filter-btn ${filterVisitType === vt.name ? 'active' : ''}`}
                          onClick={() => {
                            setFilterVisitType(vt.name);
                            fetchDCDetails(selectedTestIds, selectedTest);
                          }}
                        >
                          {vt.name === 'Home' ? <FontAwesomeIcon icon={faHome} className="me-2" /> :
                            (vt.name === 'Clinic' || vt.name === 'Center') ? <FontAwesomeIcon icon={faClinicMedical} className="me-2" /> : null}
                          {vt.name}
                        </button>
                      ))}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'high' || val === 'low') {
                          setSortPrice(val);
                          setSortBy('price');
                          fetchDCDetails(selectedTestIds, selectedTest);
                        } else {
                          setSortPrice('');
                          setSortBy(val as 'distance' | 'name' | 'price');
                        }
                      }}
                    >
                      <option value="distance">Distance</option>
                      <option value="name">Name</option>
                      <option value="high">Price: High to Low</option>
                      <option value="low">Price: Low to High</option>
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

                          {dc.DC_Distance && dc.DC_Distance !== 'N/A' && (
                            <div className="detail-item">
                              <FontAwesomeIcon icon={faCar} className="me-2" />
                              <span>{dc.DC_Distance}</span>
                            </div>
                          )}

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
                            <strong>Service Area:</strong> {
                              !dc.service_pincode ? 'Not specified' :
                                dc.service_pincode.split(',').length === 1
                                  ? dc.service_pincode
                                  : `${dc.service_pincode.split(',').length} pincodes`
                            }
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
                    <span className="test-id">{index + 1}</span>
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
                        <Row>
                          <Col md={6}>
                            <Form.Label>
                              <strong>Relationship</strong>
                            </Form.Label>
                            <Form.Select
                              value={formData.relationshipId}
                              onChange={(e) => handleRelationshipChange(e.target.value)}
                              disabled={loadingRelationships}
                            >
                              <option value="">All Relationships</option>
                              {loadingRelationships ? (
                                <option disabled>Loading...</option>
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
                          </Col>
                          <Col md={6}>
                            <Form.Label>
                              <strong>Select Dependent Name <span className="text-danger">*</span></strong>
                            </Form.Label>
                            <Form.Select
                              value={formData.relationshipPersonId}
                              onChange={(e) => handleDependentPersonChange(e.target.value)}
                              disabled={loadingRelationshipPersons}
                            >
                              <option value="">Select Dependent</option>
                              {loadingRelationshipPersons ? (
                                <option disabled>Loading...</option>
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
                          </Col>
                        </Row>
                      </div>

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
            <div className="text-center py-4">
              {/* No prices but valid tests selected - Show confirmation UI instead of Empty State */}
              <div className="mb-4">
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Price details will be calculated at checkout based on your profile.
                </Alert>

                <div className="selected-tests-list text-start mb-4">
                  <h6>Selected Tests:</h6>
                  <ul>
                    {selectedTests.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="booking-form text-start border-top pt-3">
                  {/* Visit Type Selection */}
                  <div className="mb-4">
                    <h6 className="mb-2">Select Visit Type:</h6>
                    <div className="d-flex gap-4">
                      {((selectedDCDetails?.VisitType || '').toLowerCase().includes('home') || (selectedDCDetails?.VisitType || '').includes('Home/Center')) && (
                        <Form.Check
                          type="radio"
                          id="visit-home"
                          name="bookingVisitType"
                          label={
                            <span>
                              <FontAwesomeIcon icon={faHome} className="me-2" /> Home Visit
                            </span>
                          }
                          checked={bookingVisitType === 1}
                          onChange={() => setBookingVisitType(1)}
                        />
                      )}
                      {((selectedDCDetails?.VisitType || '').toLowerCase().includes('center') || (selectedDCDetails?.VisitType || '').includes('Home/Center')) && (
                        <Form.Check
                          type="radio"
                          id="visit-center"
                          name="bookingVisitType"
                          label={
                            <span>
                              <FontAwesomeIcon icon={faClinicMedical} className="me-2" /> Center Visit
                            </span>
                          }
                          checked={bookingVisitType === 2}
                          onChange={() => setBookingVisitType(2)}
                        />
                      )}
                    </div>

                    {bookingVisitType === 1 && (
                      <div className="mt-3 p-3 bg-light rounded text-start">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />Service Address:</h6>
                        </div>
                        {availableAddresses.length > 0 ? (
                          <Form.Select
                            value={userAddressId}
                            onChange={(e) => setUserAddressId(Number(e.target.value))}
                          >
                            {availableAddresses.map((addr, idx) => (
                              <option key={addr.id || addr.EmployeeAddressDetailsId || idx} value={addr.id || addr.EmployeeAddressDetailsId}>
                                {addr.address_line1 || addr.AddressLineOne}, {addr.pincode || addr.Pincode || ''}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <div className="text-danger">
                            {formData.serviceFor === 'dependent' && !formData.relationshipPersonId ? (
                              <small>Please select a dependent below to view their saved addresses.</small>
                            ) : (
                              <small>No addresses found. Please add an address in your profile.</small>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h5 className="mb-3">Who is this test for?</h5>
                  <Form>
                    <div className="d-flex gap-4 mb-3">
                      <Form.Check
                        type="radio"
                        id="service-self-fallback"
                        label="Self"
                        name="serviceForFallback"
                        checked={formData.serviceFor === 'self'}
                        onChange={() => handleServiceTypeChange('self')}
                      />
                      <Form.Check
                        type="radio"
                        id="service-dependent-fallback"
                        label="Dependent"
                        name="serviceForFallback"
                        checked={formData.serviceFor === 'dependent'}
                        onChange={() => handleServiceTypeChange('dependent')}
                      />
                    </div>

                    {formData.serviceFor === 'dependent' && (
                      <div className="dependent-section p-3 bg-light rounded mb-3">
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Relationship</Form.Label>
                              <Form.Select
                                value={formData.relationshipId}
                                onChange={(e) => handleRelationshipChange(e.target.value)}
                              >
                                <option value="">All Relationships</option>
                                {relationships.map(rel => (
                                  <option key={rel.RelationshipId} value={rel.RelationshipId}>
                                    {rel.Relationship}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Dependent Name</Form.Label>
                              {loadingRelationshipPersons ? (
                                <div><Spinner size="sm" /> Loading...</div>
                              ) : (
                                <Form.Select
                                  value={formData.relationshipPersonId}
                                  onChange={(e) => handleDependentPersonChange(e.target.value)}
                                >
                                  <option value="">Select Dependent</option>
                                  {relationshipPersons.map(person => (
                                    <option key={person.EmployeeDependentDetailsId} value={person.EmployeeDependentDetailsId}>
                                      {person.DependentName}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Form>

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
                      disabled={selectedTests.length === 0}
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                      Proceed for Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPricesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div >
  );
};

export default DiagnosticCenters;