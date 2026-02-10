import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Dropdown, Modal, Spinner } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faClinicMedical,
  faTimes,
  faPlus,
  faMapMarkerAlt,
  faStethoscope,
  faVial,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faShoppingCart,
  faTag,
  faEye,
  faCalendarAlt,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import './LabTests.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { labTestsAPI } from "../../api/labtests";
import { CRMFetchCommonTestNameDetailsRequest, CRMFetchCommonTestNameDetailsResponse, HealthPackage, VisitType } from "../../types/labtests";
import { useNavigate } from 'react-router-dom';
import { DependantsAPI } from '../../api/dependants';
import { District } from '../../types/dependants';
import { DiagnosticCenterDetailed, APIHealthPackage } from '../../types/labtests';

const LabTests: React.FC = () => {
  // Router
  const navigate = useNavigate();

  // State management
  // const [selectedTests, setSelectedTests] = useState<string[]>(() => {
  //   const savedTests = localStorage.getItem('selectedLabTests');
  //   return savedTests ? JSON.parse(savedTests) : [];
  // });
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [location, setLocation] = useState('Bangalore/Bengaluru');
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);

  // Test names state
  const [testNames, setTestNames] = useState<CRMFetchCommonTestNameDetailsResponse[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTestNames, setFilteredTestNames] = useState<CRMFetchCommonTestNameDetailsResponse[]>([]);

  // Health packages state with pagination
  const [healthPackages, setHealthPackages] = useState<APIHealthPackage[]>([]);
  const [specialPackages, setSpecialPackages] = useState<APIHealthPackage[]>([]);
  const [regularPackages, setRegularPackages] = useState<APIHealthPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isLoadingSpecialPackages, setIsLoadingSpecialPackages] = useState(false);
  const [isLoadingRegularPackages, setIsLoadingRegularPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<'annual' | 'special' | 'regular'>('annual');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [dynamicCities, setDynamicCities] = useState<District[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [diagnosticCenters, setDiagnosticCenters] = useState<DiagnosticCenterDetailed[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);

  // Modal state
  const [showTestsModal, setShowTestsModal] = useState(false);
  const [selectedPackageTests, setSelectedPackageTests] = useState<string[]>([]);
  const [selectedPackageName, setSelectedPackageName] = useState<string>('');

  // Save selected tests to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('selectedLabTests', JSON.stringify(selectedTests));
  // }, [selectedTests]);

  useEffect(() => {
    fetchCommonTestNames();
    fetchHealthPackages();
    loadVisitTypes();
    fetchCities();
    fetchDiagnosticCenters();
  }, []);

  const fetchCities = async () => {
    setIsLoadingCities(true);
    try {
      const data = await DependantsAPI.CRMLoadCitys();
      if (data && data.length > 0) {
        setDynamicCities(data);
        console.log("Loaded cities:", data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setIsLoadingCities(false);
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

  const fetchCommonTestNames = async () => {
    setIsLoadingTests(true);
    try {
      const cityid = Number(localStorage.getItem("DistrictId") || 0);
      const corporateId = Number(localStorage.getItem("CorporateId") || 37);
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const request: CRMFetchCommonTestNameDetailsRequest = {
        CorporateId: corporateId,
        EmployeeRefId: employeeRefId,
        CityId: cityid
      };

      const response = await labTestsAPI.fetchCommonTestNameDetails(request);
      console.log("Test names response", response);

      if (response && response.length > 0) {
        setTestNames(response);
        setFilteredTestNames(response);

        console.log(`Loaded ${response.length} tests from API`);
      } else {
        console.log("No tests found in API response");
        setTestNames([]);
        setFilteredTestNames([]);
      }
    } catch (error) {
      console.error("Failed to fetch test names:", error);
      setTestNames([]);
      setFilteredTestNames([]);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const fetchDiagnosticCenters = async () => {
    setIsLoadingCenters(true);
    try {
      const data = await labTestsAPI.fetchDiagnosticCenters();
      if (data && data.length > 0) {
        setDiagnosticCenters(data);
        console.log("Loaded diagnostic centers:", data);
      }
    } catch (error) {
      console.error("Failed to fetch diagnostic centers:", error);
    } finally {
      setIsLoadingCenters(false);
    }
  };

  const fetchHealthPackages = async () => {
    setIsLoadingPackages(true);
    try {
      const response = await labTestsAPI.fetchHealthPackagesByType('annual');
      console.log("Health packages response", response);

      if (response && response.length > 0) {
        // Filter for annual type
        const filtered = response.filter(pkg => pkg.package_type?.toLowerCase().includes('annual'));
        setHealthPackages(filtered);
      } else {
        setHealthPackages([]);
      }
    } catch (error) {
      console.error("Failed to fetch health packages:", error);
      setHealthPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchSpecialPackages = async () => {
    setIsLoadingSpecialPackages(true);
    try {
      const response = await labTestsAPI.fetchSponsoredPackages();
      console.log("Sponsored packages response", response);

      if (response && response.length > 0) {
        // Map SponsoredPackage to APIHealthPackage format
        const mapped: APIHealthPackage[] = response.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          code: pkg.code,
          description: pkg.description,
          price: pkg.price,
          validity_till: pkg.validity_till,
          tests: pkg.test_ids || [], // Map test_ids to tests
          package_type: 'special',
          active: true
        }));
        setSpecialPackages(mapped);
      } else {
        setSpecialPackages([]);
      }
    } catch (error) {
      console.error("Failed to fetch special packages:", error);
      setSpecialPackages([]);
    } finally {
      setIsLoadingSpecialPackages(false);
    }
  };

  const fetchRegularPackages = async () => {
    setIsLoadingRegularPackages(true);
    try {
      const response = await labTestsAPI.fetchHealthPackagesByType('regular');
      if (response && response.length > 0) {
        // Filter for regular type
        const filtered = response.filter(pkg => pkg.package_type?.toLowerCase() === 'regular');
        setRegularPackages(filtered);
      } else {
        setRegularPackages([]);
      }
    } catch (error) {
      console.error("Failed to fetch regular packages:", error);
      setRegularPackages([]);
    } finally {
      setIsLoadingRegularPackages(false);
    }
  };

  // Handle package type button click
  const handlePackageTypeClick = (type: 'annual' | 'special' | 'regular') => {
    if (selectedPackageType === type) return;

    setSelectedPackageType(type);
    setCurrentPage(1);
    setSelectedPackage(null);

    // Fetch packages if not already loaded
    if (type === 'special' && specialPackages.length === 0) {
      fetchSpecialPackages();
    } else if (type === 'regular' && regularPackages.length === 0) {
      fetchRegularPackages();
    }
  };

  // Get packages to display based on selected type
  const getPackagesToDisplay = () => {
    switch (selectedPackageType) {
      case 'annual':
        return healthPackages;
      case 'special':
        return specialPackages;
      case 'regular':
        return regularPackages;
      default:
        return healthPackages;
    }
  };

  // Get loading state based on selected type
  const getIsLoading = () => {
    switch (selectedPackageType) {
      case 'annual':
        return isLoadingPackages;
      case 'special':
        return isLoadingSpecialPackages;
      case 'regular':
        return isLoadingRegularPackages;
      default:
        return isLoadingPackages;
    }
  };

  // Handle search in dropdown
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredTestNames(testNames);
    } else {
      const filtered = testNames.filter(test => {
        const name = (test.name || test.TestName || '').toLowerCase();
        const code = (test.code || '').toLowerCase();
        return name.includes(query.toLowerCase()) || code.includes(query.toLowerCase());
      });
      setFilteredTestNames(filtered);
    }
  };

  // Handle adding a test
  const handleAddTest = (test: CRMFetchCommonTestNameDetailsResponse) => {
    const testName = test.name || test.TestName || "Unknown Test";
    if (selectedTests.includes(testName)) {
      alert(`"${testName}" is already in your selected tests list.`);
      return;
    }

    setSelectedTests(prev => [...prev, testName]);

    // Show appointment popup when first test is selected
    if (selectedTests.length === 0) {
      setTimeout(() => {
        setShowAppointmentPopup(true);
      }, 100);
    }
  };

  // Handle adding a health package
  const handleAddPackage = (packageId: number) => {
    const packagesToDisplay = getPackagesToDisplay();
    const selectedPkg = packagesToDisplay.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    if (selectedPackage === packageId) {
      // Deselect if already selected
      setSelectedPackage(null);
    } else {
      // Select new package
      setSelectedPackage(packageId);

      // Add package tests to selected tests
      // Resolved names from IDs
      const packageTestNames: string[] = [];
      if (selectedPkg.tests && selectedPkg.tests.length > 0) {
        selectedPkg.tests.forEach(id => {
          const testFound = testNames.find(t => t.id === id || t.TestId === id);
          if (testFound && (testFound.name || testFound.TestName)) {
            packageTestNames.push(testFound.name || testFound.TestName || "");
          }
        });
      }

      const newTests = packageTestNames.filter(test => !selectedTests.includes(test));

      if (newTests.length > 0) {
        setSelectedTests(prev => [...prev, ...newTests]);
      }

      // Show appointment popup if this is the first selection
      if (selectedTests.length === 0) {
        setTimeout(() => {
          setShowAppointmentPopup(true);
        }, 100);
      }
    }
  };

  // Handle viewing package tests
  const handleViewTests = (packageId: number) => {
    const packagesToDisplay = getPackagesToDisplay();
    const selectedPkg = packagesToDisplay.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    // Extract test names from tests
    const tests: string[] = [];
    if (selectedPkg.tests && selectedPkg.tests.length > 0) {
      selectedPkg.tests.forEach(id => {
        const testFound = testNames.find(t => t.id === id || t.TestId === id);
        if (testFound && (testFound.name || testFound.TestName)) {
          tests.push(testFound.name || testFound.TestName || "");
        }
      });
    }

    setSelectedPackageTests(tests);
    setSelectedPackageName(selectedPkg.name);
    setShowTestsModal(true);
  };

  // Handle adding multiple tests at once
  const handleAddMultipleTests = () => {
    // Add all filtered tests that aren't already selected
    const newTests = filteredTestNames
      .map(test => test.name || test.TestName || "")
      .filter((name): name is string => !!name && !selectedTests.includes(name));

    if (newTests.length === 0) {
      alert('All tests are already selected.');
      return;
    }

    setSelectedTests(prev => [...prev, ...newTests]);

    // Show appointment popup when first test is selected
    if (selectedTests.length === 0 && newTests.length > 0) {
      setTimeout(() => {
        setShowAppointmentPopup(true);
      }, 100);
    }
  };

  const handleRemoveTest = (testName: string) => {
    setSelectedTests(selectedTests.filter(test => test !== testName));
  };

  // Clear all tests
  const handleClearAllTests = () => {
    if (window.confirm('Are you sure you want to clear all selected tests?')) {
      setSelectedTests([]);
      setSelectedPackage(null);
      localStorage.removeItem('selectedLabTests');
    }
  };

  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return `₹ ${price.toFixed(2)}`;
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (normalPrice: number, discount: number) => {
    const discountAmount = (normalPrice * discount) / 100;
    return normalPrice - discountAmount;
  };

  // Pagination logic
  const packagesToDisplay = getPackagesToDisplay();
  const totalPages = Math.ceil(packagesToDisplay.length / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPackages = packagesToDisplay.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of packages section
      const packagesSection = document.querySelector('.health-packages-section');
      if (packagesSection) {
        packagesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const labLogos = [
    '/Agilus.png',
    '/Lal path.jpg',
    '/Orange Health.jpg',
    '/Healthians.jpg',
    '/PathKind.png',
    '/Red_cliff.jpg',
    '/Tata_1mg.png',
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  // Carousel logic for locations
  const staticLocationData = [
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

  // Merge dynamic cities with static images
  const locationData = dynamicCities.length > 0
    ? dynamicCities.map(city => {
      const staticMatch = staticLocationData.find(s => s.name.toLowerCase() === city.DistrictName.toLowerCase());
      return {
        name: city.DistrictName,
        img: staticMatch ? staticMatch.img : '/BANGALORE-8.png', // Default image
        id: city.DistrictId
      };
    })
    : staticLocationData;

  const LOCATIONS_VISIBLE = 4;
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);

  const handlePrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  // Auto-rotate carousel every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLocationCarouselIndex(prev =>
        prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  return (
    <div className="lab-tests-page">
      <div className="lab-tests-hero">
        <Container>

          <Row className="mb-3">
            <Col xs={12} md={12}>
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 600 }}>
                  Search And Add Test
                </h4>

                <div className="mb-4">
                  <div style={{ marginBottom: '20px' }}>
                    <div className="d-flex align-items-center">
                      {/* Custom Dropdown with search and Add buttons */}
                      <Dropdown
                        show={dropdownOpen}
                        onToggle={(isOpen) => setDropdownOpen(isOpen)}
                        style={{ flex: 1 }}
                      >
                        <Dropdown.Toggle
                          variant="outline-primary"
                          id="dropdown-test-search"
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            border: '2px solid #1976d2',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#333',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '16px',
                            fontWeight: 500
                          }}
                        >
                          <span>
                            {searchQuery ? `Search: "${searchQuery}"` : 'Select or Search for Tests'}
                          </span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            overflow: 'hidden',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        >
                          {/* Search input inside dropdown */}
                          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            <Form.Control
                              type="text"
                              placeholder="Search tests..."
                              value={searchQuery}
                              onChange={handleSearchChange}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>

                          {/* Add All Button */}
                          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            <Button
                              variant="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddMultipleTests();
                              }}
                              disabled={isLoadingTests || filteredTestNames.length === 0}
                              style={{
                                width: '100%',
                                padding: '8px',
                                background: 'linear-gradient(to right, #4CAF50, #66bb6a)',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '14px'
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-2" />
                              Add All {filteredTestNames.length} Tests
                            </Button>
                          </div>

                          {/* Test list with Add buttons */}
                          <div style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            paddingRight: '5px'
                          }}>
                            {isLoadingTests ? (
                              <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#666'
                              }}>
                                Loading tests...
                              </div>
                            ) : filteredTestNames.length === 0 ? (
                              <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#666'
                              }}>
                                No tests found
                              </div>
                            ) : (
                              filteredTestNames.map((test, index) => {
                                const testName = test.name || test.TestName || "Unknown Test";
                                const isAlreadyAdded = selectedTests.includes(testName);

                                return (
                                  <div
                                    key={index}
                                    style={{
                                      padding: '12px 15px',
                                      borderBottom: '1px solid #f0f0f0',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      minHeight: '60px',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#f5f5f5';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'white';
                                    }}
                                  >
                                    {/* Test Name */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      flex: 1,
                                      paddingRight: '10px'
                                    }}>
                                      <FontAwesomeIcon
                                        icon={faVial}
                                        style={{
                                          marginRight: '12px',
                                          color: isAlreadyAdded ? '#4CAF50' : '#1976d2',
                                          fontSize: '14px',
                                          minWidth: '20px'
                                        }}
                                      />
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{
                                          fontSize: '14px',
                                          fontWeight: 500,
                                          color: isAlreadyAdded ? '#4CAF50' : '#333',
                                          lineHeight: '1.4'
                                        }}>
                                          {testName}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                          {test.code && <small style={{ color: '#888' }}>{test.code}</small>}
                                          {test.price && <small style={{ color: '#1976d2', fontWeight: 600 }}>₹{test.price}</small>}
                                        </div>
                                        {isAlreadyAdded && (
                                          <div style={{
                                            fontSize: '11px',
                                            color: '#4CAF50',
                                            fontWeight: 600,
                                            backgroundColor: '#e8f5e9',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                          }}>
                                            ✓ Already Added
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Add Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isAlreadyAdded) {
                                          handleAddTest(test);
                                        }
                                      }}
                                      style={{
                                        padding: '8px 16px',
                                        backgroundColor: isAlreadyAdded ? '#e0e0e0' : '#1976d2',
                                        color: isAlreadyAdded ? '#666' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                                        minWidth: '80px',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        opacity: isAlreadyAdded ? 0.7 : 1,
                                        flexShrink: 0
                                      }}
                                      title={isAlreadyAdded ? "Already added to your list" : "Add to selected tests"}
                                      disabled={isAlreadyAdded}
                                    >
                                      {isAlreadyAdded ? (
                                        <>
                                          <FontAwesomeIcon icon={faCheck} size="sm" />
                                          Added
                                        </>
                                      ) : (
                                        <>
                                          <FontAwesomeIcon icon={faPlus} size="sm" />
                                          Add
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    {/* Info text */}
                    <div style={{
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>
                        {testNames.length} tests available
                      </span>
                      <span>
                        {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show selected tests */}
              {selectedTests.length > 0 && (
                <div style={{
                  padding: '20px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  marginTop: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontWeight: 700,
                      color: '#1976d2',
                      fontSize: '18px'
                    }}>
                      Selected Tests <span style={{ color: '#4CAF50' }}>({selectedTests.length})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {selectedTests.length > 0 && (
                        <button
                          onClick={handleClearAllTests}
                          style={{
                            background: 'transparent',
                            color: '#f44336',
                            border: '1px solid #f44336',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            fontWeight: 500
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f44336';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#f44336';
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} size="sm" />
                          Clear All
                        </button>
                      )}

                      <Button
                        variant="primary"
                        style={{
                          padding: '8px 24px',
                          background: 'linear-gradient(to right, #ff8c00, #ff6b1c)',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(255, 107, 28, 0.3)'
                        }}
                        onClick={() => {
                          if (selectedTests.length > 0) {
                            navigate('/diagnostic-centers', {
                              state: {
                                selectedTests,
                                location: location
                              }
                            });
                          }
                        }}
                        disabled={selectedTests.length === 0}
                      >
                        <FontAwesomeIcon icon={faClinicMedical} className="me-2" />
                        Select Diagnostic Center
                      </Button>
                    </div>
                  </div>

                  {/* Selected tests list */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    {selectedTests.length === 0 ? (
                      <div style={{
                        color: '#999',
                        fontStyle: 'italic',
                        padding: '20px',
                        width: '100%',
                        textAlign: 'center',
                        gridColumn: '1 / -1'
                      }}>
                        No tests selected yet. Select tests from the dropdown above.
                      </div>
                    ) : (
                      selectedTests.map((test, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#e3f2fd',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            border: '1px solid #bbdefb'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              background: '#1976d2',
                              color: 'white',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                            <FontAwesomeIcon
                              icon={faVial}
                              style={{
                                color: '#1976d2',
                                fontSize: '14px'
                              }}
                            />
                            <span style={{
                              fontWeight: 500,
                              color: '#1976d2'
                            }}>
                              {test}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveTest(test)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#f44336',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f44336';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#f44336';
                            }}
                            title="Remove this test"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Health Packages Section with Three Buttons */}
              <div className='HealthPackages-Section-lab' style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                marginBottom: '20px',
                marginTop: '20px'
              }}>
                <h4 style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
                  Health Packages
                </h4>

                {/* Three Button Tabs */}
                <div className='health-packages-button' style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '30px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handlePackageTypeClick('annual')}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: selectedPackageType === 'annual' ? '#1976d2' : '#f0f0f0',
                      color: selectedPackageType === 'annual' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      boxShadow: selectedPackageType === 'annual' ? '0 4px 12px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPackageType !== 'annual') {
                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                        e.currentTarget.style.color = '#1976d2';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPackageType !== 'annual') {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.color = '#333';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Annual Health Check Up
                    {selectedPackageType === 'annual' && (
                      <span style={{
                        marginLeft: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}>
                        ({healthPackages.length})
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handlePackageTypeClick('special')}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: selectedPackageType === 'special' ? '#ff5722' : '#f0f0f0',
                      color: selectedPackageType === 'special' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      boxShadow: selectedPackageType === 'special' ? '0 4px 12px rgba(255, 87, 34, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPackageType !== 'special') {
                        e.currentTarget.style.backgroundColor = '#ffe0d6';
                        e.currentTarget.style.color = '#ff5722';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPackageType !== 'special') {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.color = '#333';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faStethoscope} />
                    Special Packages
                    {selectedPackageType === 'special' && (
                      <span style={{
                        marginLeft: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}>
                        ({specialPackages.length})
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handlePackageTypeClick('regular')}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: selectedPackageType === 'regular' ? '#4CAF50' : '#f0f0f0',
                      color: selectedPackageType === 'regular' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '30px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '200px',
                      boxShadow: selectedPackageType === 'regular' ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPackageType !== 'regular') {
                        e.currentTarget.style.backgroundColor = '#e8f5e9';
                        e.currentTarget.style.color = '#4CAF50';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPackageType !== 'regular') {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.color = '#333';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faVial} />
                    Regular Packages
                    {selectedPackageType === 'regular' && (
                      <span style={{
                        marginLeft: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}>
                        ({regularPackages.length})
                      </span>
                    )}
                  </button>
                </div>



                {getIsLoading() ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading packages...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#666' }}>
                      Loading {selectedPackageType} packages...
                    </p>
                  </div>
                ) : packagesToDisplay.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    border: '2px dashed #ddd'
                  }}>
                    <FontAwesomeIcon
                      icon={selectedPackageType === 'annual' ? faCalendarAlt :
                        selectedPackageType === 'special' ? faStethoscope : faVial}
                      size="3x"
                      style={{
                        color: '#ccc',
                        marginBottom: '20px'
                      }}
                    />
                    <h5 style={{ color: '#999', marginBottom: '10px' }}>
                      No {selectedPackageType} packages available
                    </h5>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>
                      {selectedPackageType === 'annual' ?
                        'Annual health checkup packages will be available soon.' :
                        selectedPackageType === 'special' ?
                          'Special packages are currently being updated.' :
                          'Regular packages will be added shortly.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Packages Grid - 2 rows of 4 cards each (8 total) */}
                    <div className="packages-grid">
                      <Row>
                        {currentPackages.map((pkg) => {
                          const isSelected = selectedPackage === pkg.id;
                          const packagePrice = parseFloat(pkg.price);
                          // Fake discount for UI consistent look if not provided properly
                          const fakeDiscount = 10;
                          const originalPrice = Math.round(packagePrice / (1 - (fakeDiscount / 100)));

                          return (
                            <Col xs={12} md={6} lg={3} key={pkg.id} className="mb-4">
                              <Card
                                className={`package-card-labtest ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleAddPackage(pkg.id)}
                                style={{
                                  borderColor: selectedPackageType === 'annual' ? '#1976d2' :
                                    selectedPackageType === 'special' ? '#ff5722' : '#4CAF50',
                                  borderWidth: isSelected ? '2px' : '1px'
                                }}
                              >
                                {/* Discount Badge */}
                                <div className='package-discount-badge'>
                                  {fakeDiscount}% OFF
                                </div>
                                {/* View Tests Button */}
                                <div
                                  className='packege-view-test'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTests(pkg.id);
                                  }}
                                  style={{
                                    background: selectedPackageType === 'annual' ? '#e3f2fd' :
                                      selectedPackageType === 'special' ? '#ffe0d6' : '#e8f5e9',
                                    color: selectedPackageType === 'annual' ? '#1976d2' :
                                      selectedPackageType === 'special' ? '#ff5722' : '#4CAF50'
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} className="me-1" size="sm" />
                                  View Tests ({pkg.tests.length})
                                </div>

                                <Card.Body className="package-card-body">
                                  <div className="package-header-labtest">
                                    <div>
                                      <Card.Title className="package-title">
                                        {pkg.name}
                                      </Card.Title>
                                    </div>
                                    {isSelected && (
                                      <div className="package-selected-indicator" style={{
                                        background: selectedPackageType === 'annual' ? '#1976d2' :
                                          selectedPackageType === 'special' ? '#ff5722' : '#4CAF50'
                                      }}>
                                        ✓
                                      </div>
                                    )}
                                  </div>

                                  <div className="package-pricing">
                                    <div>
                                      <div className="package-discounted-price">
                                        {formatPrice(packagePrice)}
                                        <div className="package-original-price">
                                          {formatPrice(originalPrice)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    className="add-package-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddPackage(pkg.id);
                                    }}
                                    style={{
                                      background: isSelected ?
                                        (selectedPackageType === 'annual' ? '#1976d2' :
                                          selectedPackageType === 'special' ? '#ff5722' : '#4CAF50') :
                                        (selectedPackageType === 'annual' ? '#e3f2fd' :
                                          selectedPackageType === 'special' ? '#ffe0d6' : '#e8f5e9'),
                                      color: isSelected ? 'white' :
                                        (selectedPackageType === 'annual' ? '#1976d2' :
                                          selectedPackageType === 'special' ? '#ff5722' : '#4CAF50'),
                                      border: `1px solid ${selectedPackageType === 'annual' ? '#1976d2' :
                                        selectedPackageType === 'special' ? '#ff5722' : '#4CAF50'
                                        }`
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTag} className="me-2" />
                                    {isSelected ? 'Selected' : 'Select Tests'}
                                  </Button>
                                  <div className='validatedate-labtest'>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" size="sm" />
                                    Valid till {pkg.validity_till ? (pkg.validity_till) : ''}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="packages-pagination">
                        <button
                          className="pagination-btn prev-btn"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} /> Prev
                        </button>

                        <div className="pagination-numbers">
                          {getPageNumbers().map((pageNum, index) => (
                            pageNum === '...' ? (
                              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                ...
                              </span>
                            ) : (
                              <button
                                key={pageNum}
                                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => handlePageChange(pageNum as number)}
                              >
                                {pageNum}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          className="pagination-btn next-btn"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    )}

                    {/* Page Info */}
                    <div className="pagination-info">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, packagesToDisplay.length)} of {packagesToDisplay.length} packages
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Lab Test From The Comfort of Your Home Section */}
      <div style={{ background: '#f8fafd', padding: '40px 0 60px 0', marginBottom: '30px' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '8px' }}>Lab Test From The Comfort of Your Home</h2>
            <div style={{ fontSize: '1.1rem', color: '#444', marginBottom: '8px' }}>
              50,00,000+ lab tests booked | 20,00,000+ satisfied customers
            </div>
            <div style={{ width: '60px', height: '3px', background: '#ff6b35', margin: '16px auto 0 auto', borderRadius: '2px' }}></div>
          </div>
          <Row className="justify-content-center" style={{ marginTop: '32px' }}>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-stretch mb-4">
              <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderRadius: '24px', width: '100%' }} className="text-center">
                <Card.Body>
                  <div style={{ background: '#ffe5e0', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faHome} size="2x" style={{ color: '#ff6b35' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: '#b48b8b', fontSize: '1.1rem' }}>HOME SAMPLE PICK UP</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-stretch mb-4">
              <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderRadius: '24px', width: '100%' }} className="text-center">
                <Card.Body>
                  <div style={{ background: '#e0f7fa', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faStethoscope} size="2x" style={{ color: '#00bfae' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: '#b48b8b', fontSize: '1.1rem' }}>SAFE & HYGIENIC</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-stretch mb-4">
              <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderRadius: '24px', width: '100%' }} className="text-center">
                <Card.Body>
                  <div style={{ background: '#ffe5f0', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.3rem', color: '#ff6b35' }}>BEST<br />PRICE</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#b48b8b', fontSize: '1.1rem' }}>BEST PRICE COMPARISON</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-stretch mb-4">
              <Card style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderRadius: '24px', width: '100%' }} className="text-center">
                <Card.Body>
                  <div style={{ background: '#e0eaff', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faClinicMedical} size="2x" style={{ color: '#3f51b5' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: '#b48b8b', fontSize: '1.1rem' }}>DOCTOR CONSULTATION</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Our Partners Labs Section */}
      <div style={{ background: '#fff', padding: '32px 0 40px 0', marginBottom: '30px' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.7rem', marginBottom: 0 }}>Our Partners Labs</h2>
          </div>
          <Slider {...sliderSettings}>
            {labLogos.map((logo, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <img
                  src={logo}
                  alt={`Partner Lab ${idx + 1}`}
                  style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'contain' }}
                />
              </div>
            ))}
          </Slider>
        </Container>
      </div>

      {/* Featured Diagnostic Centers Section */}
      <div style={{ background: '#f8fafd', padding: '48px 0', marginBottom: '30px' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.8rem', marginBottom: '8px' }}>Featured Diagnostic Centers</h2>
              <p style={{ color: '#666', marginBottom: 0 }}>Top-rated labs for accurate results and care</p>
            </div>
            <Button
              variant="outline-primary"
              onClick={() => navigate('/diagnostic-centers')}
              style={{ borderRadius: '8px', padding: '8px 20px' }}
            >
              View All Centers
            </Button>
          </div>

          {isLoadingCenters ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading diagnostic centers...</p>
            </div>
          ) : diagnosticCenters.length > 0 ? (
            <Row>
              {diagnosticCenters.slice(0, 4).map((dc, idx) => (
                <Col key={dc.id || idx} md={3} className="mb-4">
                  <Card style={{
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: '16px',
                    height: '100%',
                    transition: 'transform 0.3s ease'
                  }} className="h-100 dc-hover-card">
                    <Card.Body>
                      <div style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        marginBottom: '12px'
                      }}>
                        {dc.area || 'Premium Lab'}
                      </div>
                      <Card.Title style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>
                        {dc.name}
                      </Card.Title>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: '#ff6b35' }} />
                        {dc.address.length > 60 ? dc.address.substring(0, 60) + '...' : dc.address}
                      </div>
                      <div className="mt-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-100"
                          style={{ borderRadius: '8px' }}
                          onClick={() => navigate('/diagnostic-centers', { state: { selectedTests: [], selectedDC: dc } })}
                        >
                          Book Appointment
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-4">
              <p style={{ color: '#888' }}>No diagnostic centers available at the moment.</p>
            </div>
          )}
        </Container>
      </div>

      {/* Our Locations Section */}
      <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px' }}>
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

      {/* Modal for displaying package tests */}
      <Modal
        show={showTestsModal}
        onHide={() => setShowTestsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{
          background: selectedPackageType === 'annual' ? '#1976d2' :
            selectedPackageType === 'special' ? '#ff5722' : '#4CAF50',
          color: 'white'
        }}>
          <Modal.Title>
            <FontAwesomeIcon icon={faVial} className="me-2" />
            Tests Included in {selectedPackageName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="package-tests-list-container">
            <div className="mb-3" style={{ color: '#666', fontSize: '14px' }}>
              <strong>{selectedPackageTests.length}</strong> tests included in this package
            </div>

            <div className="tests-grid">
              {selectedPackageTests.map((test, index) => (
                <div
                  key={index}
                  className="test-item"
                  style={{
                    padding: '12px 15px',
                    marginBottom: '10px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${selectedPackageType === 'annual' ? '#1976d2' :
                      selectedPackageType === 'special' ? '#ff5722' : '#4CAF50'
                      }`,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      background: selectedPackageType === 'annual' ? '#1976d2' :
                        selectedPackageType === 'special' ? '#ff5722' : '#4CAF50',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 500,
                      color: '#333',
                      fontSize: '15px',
                      lineHeight: '1.4'
                    }}>
                      {test}
                    </div>
                    {selectedTests.includes(test) && (
                      <div style={{
                        fontSize: '12px',
                        color: '#4CAF50',
                        fontWeight: 600,
                        backgroundColor: '#e8f5e9',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        display: 'inline-block',
                        marginTop: '4px'
                      }}>
                        ✓ Already in your selection
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTestsModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // Add all tests from package to selection
              const newTests = selectedPackageTests.filter(test => !selectedTests.includes(test));
              if (newTests.length > 0) {
                setSelectedTests(prev => [...prev, ...newTests]);
              }
              setShowTestsModal(false);
            }}
            disabled={selectedPackageTests.every(test => selectedTests.includes(test))}
            style={{
              background: selectedPackageType === 'annual' ? '#1976d2' :
                selectedPackageType === 'special' ? '#ff5722' : '#4CAF50',
              border: 'none'
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add All Tests to Selection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LabTests;