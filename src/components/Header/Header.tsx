import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { DependantsAPI } from '../../api/dependants';
import { District } from '../../types/dependants';
import { CheckOutAPI } from '../../api/CheckOut';

import {
  faShoppingCart,
  faUser,
  faPills,
  faHome,
  faTrashAlt,
  faHeartbeat,
  faFlask,
  faFileMedical,
  faFileInvoiceDollar,
  faStethoscope,
  faHeartCirclePlus
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';

interface CartItem {
  OneMGSearchAllResultDetailsId: string;
  name: string;
  price: number;
  quantity: number;
  img?: string;
  MRP?: string;
  DiscountedPrice?: string;
  Discount?: string;
  Available?: boolean;
  inventoryData?: any;
  totalPayable: number;
}

interface CartBreakdown {
  totalOriginalPrice: number;
  totalDiscountedPrice: number;
  totalDiscountAmount: number;
  handlingFee: number;
  platformFee: number;
  deliveryCharge: number;
  totalPayable: number;
  appliedCoupon: string | null;
  discountAmount: number;
  timestamp: number;
}

interface AppointmentCartItem {
  id: string;
  type: 'appointment';
  name: string;
  price: number;
  quantity: number;
  doctorName?: string;
  doctorImage?: string;
  consultationType?: string;
  appointmentTime?: string;
  caseLeadId?: string;
  cartUniqueId?: number;
  PersonName?: string;
  relationship?: string;
  appointmentDate?: string | null;
  doctorCity?: string;
  doctorSpeciality?: string;
  clinicName?: string;
  mobileNo?: string;
  emailId?: string;
  DCSelection: string;
  DoctorId: number;
}

interface DiagnosticCartItem {
  id: string;
  type: 'diagnostic';
  testId: string;
  testName: string;
  price: number;
  quantity: number;
  selectedFor: 'self' | 'dependent';
  dependentName?: string;
  relation?: string;
  dcId?: string;
  dcName?: string;
  packageCode?: string;
}

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCartMenu, setShowCartMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartBreakdown, setCartBreakdown] = useState<CartBreakdown | null>(null);
  const [appointmentCartItems, setAppointmentCartItems] = useState<AppointmentCartItem[]>([]);
  const [diagnosticCartItems, setDiagnosticCartItems] = useState<DiagnosticCartItem[]>([]);
  const [cartUniqueId, setCartUniqueId] = useState<number>(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getUserCartKey = React.useCallback(() => {
    if (user && user.loginRefId) {
      return `pharmacyCart_${user.loginRefId}`;
    }
    return `pharmacyCart_guest`;
  }, [user]);

  const getUserCartBreakdownKey = React.useCallback(() => {
    if (user && user.loginRefId) {
      return `pharmacyCartBreakdown_${user.loginRefId}`;
    }
    return `pharmacyCartBreakdown_guest`;
  }, [user]);

  const [locations, setLocations] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Select Location");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter((district) =>
    (district?.DistrictName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  // Auto-select user's district based on DistrictId from localStorage
  useEffect(() => {
    const loadDistrictsAndAutoSelect = async () => {
      try {
        // Load all districts
        const data = await DependantsAPI.CRMLoadCitys();
        setLocations(data);

        // Get DistrictId from localStorage (set during login) - This is ORIGINAL
        const storedDistrictId = localStorage.getItem("DistrictId");

        // Get SELECTED district from localStorage (user's choice)
        const selectedDistrictId = localStorage.getItem("SelectedDistrictId");

        // Priority: Use SELECTED district if exists, otherwise use ORIGINAL district
        if (selectedDistrictId) {
          // User has previously selected a district
          const districtId = parseInt(selectedDistrictId);
          const userDistrict = data.find(district => district.DistrictId === districtId);

          if (userDistrict) {
            setSelectedDistrict(userDistrict.DistrictName);
            setSelectedDistrictId(userDistrict.DistrictId);

            // Update the main DistrictId in localStorage for backward compatibility
            localStorage.setItem("DistrictId", districtId.toString());
          } else {
            // Fallback to original district
            fallbackToOriginalDistrict(data, storedDistrictId);
          }
        } else if (storedDistrictId) {
          // First time - use original district from login
          fallbackToOriginalDistrict(data, storedDistrictId);

          // Also set as selected district
          localStorage.setItem("SelectedDistrictId", storedDistrictId);
          const originalName = localStorage.getItem("DistrictName") || "";
          localStorage.setItem("SelectedDistrictName", originalName);
        } else {
          // If no DistrictId in localStorage, use first district
          if (data.length > 0) {
            setSelectedDistrict(data[0].DistrictName);
            localStorage.setItem("DistrictId", data[0].DistrictId.toString());
            localStorage.setItem("SelectedDistrictId", data[0].DistrictId.toString());
            localStorage.setItem("SelectedDistrictName", data[0].DistrictName);
          }
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        // toast.error("Failed to load locations");
      }
    };

    const fallbackToOriginalDistrict = (data: District[], storedDistrictId: string | null) => {
      if (storedDistrictId) {
        const districtId = parseInt(storedDistrictId);
        const userDistrict = data.find(district => district.DistrictId === districtId);

        if (userDistrict) {
          setSelectedDistrict(userDistrict.DistrictName);
          setSelectedDistrictId(userDistrict.DistrictId);

          // Store original district if not already stored
          if (!localStorage.getItem("OriginalDistrictId")) {
            localStorage.setItem("OriginalDistrictId", districtId.toString());
            localStorage.setItem("OriginalDistrictName", userDistrict.DistrictName);
          }
        } else {
          // If district not found, fallback to first district or default
          if (data.length > 0) {
            setSelectedDistrict(data[0].DistrictName);
            setSelectedDistrictId(data[0].DistrictId);
            localStorage.setItem("DistrictId", data[0].DistrictId.toString());
          }
        }
      } else {
        // If no DistrictId in localStorage, use first district
        if (data.length > 0) {
          setSelectedDistrict(data[0].DistrictName);
          setSelectedDistrictId(data[0].DistrictId);
          localStorage.setItem("DistrictId", data[0].DistrictId.toString());
        }
      }
    };

    loadDistrictsAndAutoSelect();
  }, []);

  // Load cartUniqueId from localStorage
  useEffect(() => {
    const storedCartUniqueId = localStorage.getItem("CartUniqueId");
    if (storedCartUniqueId) {
      setCartUniqueId(parseInt(storedCartUniqueId) || 0);
    }
  }, []);

  // Load all cart items from localStorage
  useEffect(() => {
    const loadAllCartItems = () => {
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
      const cartKey = `app_cart_${employeeRefId}`;
      const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      console.log("Header: Loaded cart from LS:", storedCart);

      // Separate items by type
      const pharmacyItems = storedCart.filter((item: any) =>
        item.type === 'pharmacy' || !item.type ||
        (item.OneMGSearchAllResultDetailsId && !item.type)
      );
      const appointmentItems = storedCart.filter((item: any) => item.type === 'appointment');
      const diagnosticItems = storedCart.filter((item: any) => item.type === 'diagnostic');

      setCartItems(pharmacyItems);
      setAppointmentCartItems(appointmentItems);
      setDiagnosticCartItems(diagnosticItems);
    };

    loadAllCartItems();

    const handleCartUpdate = () => {
      loadAllCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Fetch appointment cart from API
  useEffect(() => {
    console.log("Header: Cart Effect Triggered", { user, cartUniqueId });
    const fetchAppointmentCartFromAPI = async () => {
      console.log("Header: fetchAppointmentCartFromAPI started");
      if (!user) {
        console.log("Header: User not logged in, skipping cart fetch");
        return;
      }

      try {
        const employeeRefId = localStorage.getItem("EmployeeRefId");
        const storedCartUniqueId = localStorage.getItem("CartUniqueId");
        console.log("Header: LocalStorage vals", { employeeRefId, storedCartUniqueId });

        if (employeeRefId && storedCartUniqueId) {
          const employeeId = parseInt(employeeRefId);
          const cartUniqueId = parseInt(storedCartUniqueId);

          if (employeeId && cartUniqueId) {
            console.log("Header: Calling CheckOutAPI.CRMGetCustomerCartDetails", { employeeId, cartUniqueId });
            const cartDetails = await CheckOutAPI.CRMGetCustomerCartDetails(employeeId, cartUniqueId);

            if (cartDetails && cartDetails.length > 0) {
              const apiAppointmentItems = cartDetails.map((item: any) => ({
                id: (item.id || item.CaseRefId)?.toString() || Math.random().toString(),
                type: 'appointment' as const,
                name: item.note || item.ItemName || 'Consultation', // Use note or ItemName or default
                price: parseFloat(item.final_price || item.price || item.ItemAmount?.toString() || '0'),
                quantity: item.Quantity || 1,
                consultationType: item.item_type || item.ItemName,
                doctorName: item.doctor?.full_name || item.doctor?.name || item.DoctorName || 'Doctor',
                appointmentTime: item.appointment_time || item.AppointmentDateTime || undefined,
                caseLeadId: (item.id || item.CaseRefId)?.toString(),
                cartUniqueId: cartUniqueId,
                PersonName: item.dependant_name || item.PersonName, // Assuming dependant_name might exist or fallback
                relationship: item.Relationship || '',
                appointmentDate: item.appointment_date || item.AppointmentDate || null,
                doctorCity: item.doctor?.city || item.DoctorCity || '',
                doctorSpeciality: item.doctor?.specialization || item.DoctorSpeciality || '',
                clinicName: item.ClinicName || item.DCAddress || item.DRAddress || '',
                mobileNo: item.MobileNo || '',
                emailId: item.Emailid || '',
                DCSelection: item.DCSelection || '',
                DoctorId: item.doctor?.id || item.DoctorId || 0,
              }));

              const cartKey = `app_cart_${employeeRefId}`;
              const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
              const nonAppointmentItems = existingCart.filter((item: any) => item.type !== 'appointment');
              const updatedCart = [...nonAppointmentItems, ...apiAppointmentItems];

              localStorage.setItem(cartKey, JSON.stringify(updatedCart));
              setAppointmentCartItems(apiAppointmentItems);
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
              const cartKey = `app_cart_${employeeRefId}`;
              const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
              const nonAppointmentItems = existingCart.filter((item: any) => item.type !== 'appointment');
              localStorage.setItem(cartKey, JSON.stringify(nonAppointmentItems));
              setAppointmentCartItems([]);
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching appointment cart from API:', error);
        toast.error('Failed to load appointment cart data');
      }
    };

    if (user && cartUniqueId > 0) {
      fetchAppointmentCartFromAPI();
    } else if (user) {
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      if (employeeRefId) {
        const cartKey = `app_cart_${employeeRefId}`;
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const nonAppointmentItems = existingCart.filter((item: any) => item.type !== 'appointment');
        localStorage.setItem(cartKey, JSON.stringify(nonAppointmentItems));
        setAppointmentCartItems([]);
      }
    }
  }, [user, cartUniqueId]);

  // Calculate counts based on current page
  const isOnPharmacyPage = location.pathname === '/pharmacy';
  const isOnDiagnosticPage = location.pathname.includes('/diagnostic') ||
    location.pathname.includes('/lab-test') ||
    location.pathname.includes('/diagnostic-cart');

  const pharmacyCartCount = cartItems.length;
  const appointmentCartCount = appointmentCartItems.length;
  const diagnosticCartCount = diagnosticCartItems.length;

  // Determine which count to show based on current page
  const totalCartCount = isOnPharmacyPage
    ? pharmacyCartCount
    : isOnDiagnosticPage
      ? diagnosticCartCount
      : appointmentCartCount;

  // Calculate totals
  const pharmacyCartTotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId]?.discounted_price || item.price || 0;
    return sum + (itemPrice * (item.quantity || 1));
  }, 0);

  const appointmentCartTotal = appointmentCartItems.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0);

  const diagnosticCartTotal = diagnosticCartItems.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0);

  const totalCartAmount = isOnPharmacyPage
    ? pharmacyCartTotal
    : isOnDiagnosticPage
      ? diagnosticCartTotal
      : appointmentCartTotal;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && profileRef.current &&
        !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }

      if (showCartMenu && cartRef.current &&
        !cartRef.current.contains(event.target as Node)) {
        setShowCartMenu(false);
      }

      if (showNotifications && notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showProfileMenu || showCartMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showCartMenu, showNotifications]);

  // Close dropdowns when navigating
  useEffect(() => {
    setShowProfileMenu(false);
    setShowCartMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);



  const menuItems = [
    { name: 'Consultation', link: '/consultation', icon: faStethoscope, color: '#FF8C00' },
    { name: 'Book Lab Test', link: '/lab-test', icon: faFlask, color: '#FF8C00' },
    { name: 'Health Records', link: '/health-records', icon: faFileMedical, color: '#FF8C00' },
    { name: 'Insurance Records', link: '/insurance-record', icon: faFileInvoiceDollar, color: '#FF8C00' },
    { name: 'Pharmacy', link: '/pharmacy', icon: faPills, color: '#FF8C00' },
    { name: 'Health Assessment', link: '/health-assessment', icon: faHeartbeat, color: '#FF8C00' },
    { name: 'Care Program', link: '/home-elderly-care', icon: faHeartCirclePlus, color: '#FF8C00' }
  ];

  const profileMenuItems = [
    { name: 'Manage Profile', link: '/MangeProfile' },
    { name: 'Switch Profile', link: '/switch-profile' },
    { name: 'My Plans', link: '/lab-test' },
    { name: 'My Bookings', link: '/my-bookings' },
    { name: 'My Address Book', link: '/my-address' },
    { name: 'My Payments', link: '/my-payments' },
    { name: 'My Health Records', link: '/health-records' },
    { name: 'My Health Assessment', link: '/health-assessment' },
    { name: 'Logout', link: '/logout' },
  ];

  const calculateTotalPayable = (items: CartItem[]): number => {
    return items.reduce((total: number, item: CartItem) => {
      if (item.totalPayable) {
        return total + item.totalPayable;
      } else {
        const itemPrice = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId]?.discounted_price || item.price;
        return total + (itemPrice * item.quantity);
      }
    }, 0);
  };

  // Load pharmacy cart items and breakdown from localStorage
  useEffect(() => {
    const loadAndTransformCart = () => {
      const cartKey = getUserCartKey();
      const breakdownKey = getUserCartBreakdownKey();

      const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');

      const storedBreakdown = localStorage.getItem(breakdownKey);
      if (storedBreakdown) {
        try {
          const breakdown = JSON.parse(storedBreakdown);
          setCartBreakdown(breakdown);
        } catch (error) {
          console.error('Error parsing cart breakdown:', error);
        }
      }

      const transformedCart = storedCart.map((item: any) => {
        const itemPrice = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId]?.discounted_price || item.price || 0;
        const quantity = item.quantity || 1;
        const totalPayable = itemPrice * quantity;

        const transformedItem = {
          ...item,
          name: item.name || item.Name || 'Unknown Product',
          img: item.img || item.Image || '/default-medicine.png',
          OneMGSearchAllResultDetailsId: item.OneMGSearchAllResultDetailsId || item.productId || '',
          MRP: item.MRP || '0',
          DiscountedPrice: item.DiscountedPrice || '0',
          Discount: item.Discount || '0',
          Available: item.Available !== undefined ? item.Available : true,
          quantity: quantity,
          price: item.price || 0,
          inventoryData: item.inventoryData || null,
          totalPayable: item.totalPayable || totalPayable
        };

        return transformedItem;
      });

      setCartItems(transformedCart);

      if (cartBreakdown) {
        // setCartTotal(cartBreakdown.totalPayable); // Removed
      } else {
        // const total = calculateTotalPayable(transformedCart); // Removed
        // setCartTotal(total); // Removed
      }
    };

    loadAndTransformCart();

    const handleStorageChange = (e: StorageEvent) => {
      const cartKey = getUserCartKey();
      const breakdownKey = getUserCartBreakdownKey();

      if (e.key === cartKey || e.key === breakdownKey) {
        loadAndTransformCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadAndTransformCart, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [getUserCartKey, getUserCartBreakdownKey, user]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // SAVE DISTRICT DATA BEFORE CLEARING
      // const originalDistrictId = localStorage.getItem("OriginalDistrictId"); // Removed
      // const originalDistrictName = localStorage.getItem("OriginalDistrictName"); // Removed

      // Clear all user-specific data
      const itemsToKeep = [
        'OriginalDistrictId',
        'OriginalDistrictName',
      ];

      // Get all keys to remove
      const allKeys = Object.keys(localStorage);
      const itemsToRemove = allKeys.filter(key =>
        !itemsToKeep.includes(key) &&
        !key.startsWith('app_cart_') &&
        !key.startsWith('pharmacyCart_')
      );

      // Remove items
      itemsToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Rest of your logout logic
      setAppointmentCartItems([]);
      setDiagnosticCartItems([]);
      setShowProfileMenu(false);
      logout();
      toast.success("Logged out successfully!");
      navigate('/login');

    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error during logout. Please try again.");
    }
  };

  const handleRemoveCartItem = (index: number) => {
    const cartKey = getUserCartKey();
    const breakdownKey = getUserCartBreakdownKey();

    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);

    setCartItems(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));

    // const total = calculateTotalPayable(updatedCart); // Removed
    // setCartTotal(total); // Removed

    if (updatedCart.length === 0) {
      localStorage.removeItem(breakdownKey);
      setCartBreakdown(null);
    }
  };

  // handleRemoveAppointmentCartItem and handleRemoveDiagnosticCartItem functions removed

  const handleProceedToCheckout = async () => {
    setShowCartMenu(false);

    if (isOnPharmacyPage) {
      navigate('/pharmacy/cart');
    } else if (isOnDiagnosticPage) {
      // Navigate to diagnostic cart page
      if (diagnosticCartItems.length > 0) {
        // Extract test data from diagnostic cart items
        const selectedTests = diagnosticCartItems.map(item => ({
          TestId: item.testId,
          TestName: item.testName,
          TestPackageCode: item.packageCode,
          CorporatePrice: item.price,
          NormalPrice: item.price
        }));

        // You might need to get the diagnostic center from localStorage or navigate to selection
        navigate('/diagnostic-cart', {
          state: {
            selectedTests: selectedTests,
            // You might need to pass additional data like diagnostic center
          }
        });
      }
    } else {
      try {
        const employeeRefId = localStorage.getItem("EmployeeRefId");
        const storedCartUniqueId = localStorage.getItem("CartUniqueId");

        if (!employeeRefId || !storedCartUniqueId) {
          toast.warning("Please log in to view your cart");
          return;
        }

        const employeeId = parseInt(employeeRefId);
        const cartUniqueId = parseInt(storedCartUniqueId);

        if (!employeeId || !cartUniqueId) {
          toast.warning("Invalid cart information");
          return;
        }

        const loadingToast = toast.loading("Checking your appointment cart...");
        const cartDetails = await CheckOutAPI.CRMGetCustomerCartDetails(employeeId, cartUniqueId);
        toast.dismiss(loadingToast);

        if (!cartDetails || cartDetails.length === 0) {
          toast.warning("No appointments found in your cart");
          return;
        }

        const apiAppointmentItems = cartDetails.map((item: any) => ({
          id: item.CaseRefId?.toString() || Math.random().toString(),
          type: 'appointment' as const,
          name: item.ItemName || 'Consultation',
          price: parseFloat(item.ItemAmount?.toString() || '0'),
          quantity: item.Quantity || 1,
          consultationType: item.ItemName,
          doctorName: item.DoctorName,
          appointmentTime: item.AppointmentDateTime || undefined,
          caseLeadId: item.CaseRefId?.toString(),
          cartUniqueId: cartUniqueId,
          PersonName: item.PersonName || '',
          relationship: item.Relationship || '',
          appointmentDate: item.AppointmentDate || undefined,
          doctorCity: item.DoctorCity || '',
          doctorSpeciality: item.DoctorSpeciality || '',
          clinicName: item.ClinicName || item.DCAddress || item.DRAddress || '',
          mobileNo: item.MobileNo || '',
          emailId: item.Emailid || '',
          DCSelection: item.DCSelection || '',
          DoctorId: item.DoctorId || 0,
        }));

        const cartKey = `app_cart_${employeeRefId}`;
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const nonAppointmentItems = existingCart.filter((item: any) => item.type !== 'appointment');
        const updatedCart = [...nonAppointmentItems, ...apiAppointmentItems];
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        const totalAmount = apiAppointmentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        navigate("/CommonCartDcAndConsultation", {
          state: {
            cartItems: apiAppointmentItems,
            totalAmount: totalAmount,
            fromAppointment: true
          }
        });

      } catch (error) {
        console.error('Error fetching cart details:', error);
        toast.error("Failed to load your appointment cart");
      }
    }
  };

  // Function to handle district selection
  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district.DistrictName);
    setSelectedDistrictId(district.DistrictId);
    setSearchText("");

    // Store selected district in localStorage for persistence
    localStorage.setItem("SelectedDistrictId", district.DistrictId.toString());
    localStorage.setItem("SelectedDistrictName", district.DistrictName);

    // Store original district from login separately (if not already stored)
    const originalDistrictId = localStorage.getItem("OriginalDistrictId");
    if (!originalDistrictId) {
      const defaultDistrictId = localStorage.getItem("DistrictId");
      const defaultDistrictName = localStorage.getItem("DistrictName");
      if (defaultDistrictId && defaultDistrictName) {
        localStorage.setItem("OriginalDistrictId", defaultDistrictId);
        localStorage.setItem("OriginalDistrictName", defaultDistrictName);
      }
    }

    // Update the main DistrictId for backward compatibility
    localStorage.setItem("DistrictId", district.DistrictId.toString());

    // Show success message
    toast.success(`Location changed to ${district.DistrictName}`);

    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('districtChanged', {
      detail: {
        districtId: district.DistrictId,
        districtName: district.DistrictName
      }
    }));

    console.log(`Selected district: ${district.DistrictName} (ID: ${district.DistrictId})`);
  };

  return (
    <header>
      <Navbar expand="lg" className={`welleazy-header ${isScrolled ? 'scrolled' : ''}`} fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src="/images/logo.svg" alt="Welleazy" className="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">

            <NavDropdown
              title={
                <span>
                  <i className="location-dot"></i> {selectedDistrict}
                </span>
              }
              id="location-dropdown"
              className="location-dropdown-menu"
            >
              {/* Search Box */}
              <div className="px-3 py-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search location..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>

              <NavDropdown.Divider />

              {/* District List */}
              <div className="location-list-scroll">
                {filteredLocations.length === 0 ? (
                  <NavDropdown.Item disabled>No results found</NavDropdown.Item>
                ) : (
                  filteredLocations.map((district) => (
                    <NavDropdown.Item
                      key={district.DistrictId}
                      onClick={() => handleDistrictSelect(district)}
                      className={selectedDistrictId === district.DistrictId ? 'active-location' : ''}
                    >
                      {district.DistrictName}
                      {selectedDistrictId === district.DistrictId && (
                        <span className="selected-tick"> ✓</span>
                      )}
                    </NavDropdown.Item>
                  ))
                )}
              </div>
            </NavDropdown>

            <Nav className="main-menu">
              {menuItems.map((item, idx) => (
                <Nav.Link
                  key={idx}
                  as={Link}
                  to={item.link}
                  className={`nav-link-item ${location.pathname === item.link ? 'active' : ''}`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`menu-icon ${location.pathname === item.link ? 'active' : ''}`}
                    style={{
                      color: location.pathname === item.link ? '#FF8C00' : item.color
                    }}
                  />
                  <span className="menu-label">{item.name}</span>
                </Nav.Link>
              ))}
            </Nav>

            <div className="header-actions">
              <div className="home-section">
                <Link to="/" className="icon-container" title="Home">
                  <FontAwesomeIcon icon={faHome} />
                </Link>
              </div>
              <div className="cart-section" ref={cartRef}>
                <div className="icon-container" onClick={() => {
                  setShowCartMenu(!showCartMenu);
                  setShowProfileMenu(false);
                  setShowNotifications(false);
                }}>
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {totalCartCount > 0 && (
                    <Badge bg="danger" pill className="cart-badge" style={{ marginLeft: '-13px', marginTop: '-35px' }}>
                      {totalCartCount}
                    </Badge>
                  )}
                  <div className="cart-info"></div>
                  {showCartMenu && (
                    <div className="dropdown-menu cart-dropdown show">
                      <div className="cart-header">
                        <h6>Cart</h6>
                      </div>
                      <div className="cart-body">
                        {isOnPharmacyPage ? (
                          pharmacyCartCount === 0 ? (
                            <p className="empty-cart-message">Your pharmacy cart is empty</p>
                          ) : (
                            <div className="cart-items-list">
                              {cartItems.map((item, index) => (
                                <div key={`pharmacy_${index}`} className="cart-item pharmacy-item">
                                  <div className="cart-item-details">
                                    <div className="cart-item-name">
                                      <FontAwesomeIcon icon={faPills} className="me-2" />
                                      {item.name} (Qty: {item.quantity})
                                    </div>
                                    <div className="cart-item-price">
                                      :₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                  <button
                                    className="cart-item-remove"
                                    onClick={() => handleRemoveCartItem(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </button>
                                </div>
                              ))}

                              <div className="cart-total-section">
                                <div className="total-amount">
                                  <strong>Total: ₹{totalCartAmount.toFixed(2)}</strong>
                                </div>
                              </div>
                            </div>
                          )
                        ) : isOnDiagnosticPage ? (
                          diagnosticCartCount === 0 ? (
                            <p className="empty-cart-message">No diagnostic tests in cart</p>
                          ) : (
                            <div className="cart-items-list">


                            </div>
                          )
                        ) : (
                          appointmentCartCount === 0 ? (
                            <p className="empty-cart-message">No appointments in cart</p>
                          ) : (
                            <div className="cart-items-list">
                              {appointmentCartItems.map((item, index) => (
                                <div key={`appointment_${index}`} className="cart-item appointment-item">
                                  <div className="cart-item-details">
                                    <div className="cart-item-name">
                                      {item.consultationType || 'Consultation'}
                                      :₹{item.price.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}



                              <div className="cart-total-section">
                                <div className="total-amount">
                                  <strong>Total: ₹{totalCartAmount.toFixed(2)}</strong>
                                </div>
                              </div>

                              {diagnosticCartItems.map((item, index) => (
                                <div key={`diagnostic_${index}`} className="cart-item diagnostic-item">
                                  <div className="cart-item-details">
                                    <div className="cart-item-name">
                                      {item.testName}- {item.price}
                                    </div>

                                  </div>

                                </div>
                              ))}

                            </div>
                          )
                        )}
                      </div>

                      {totalCartCount > 0 && (
                        <div className="cart-footer">
                          <div className="cart-buttons">
                            <Button
                              variant="primary"
                              size="sm"
                              className="checkout-btn"
                              onClick={handleProceedToCheckout}
                            >
                              {isOnPharmacyPage ? 'View Cart' :
                                isOnDiagnosticPage ? 'View Cart' :
                                  'View Cart'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-section" ref={profileRef}>
                <div className="icon-container" onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowCartMenu(false);
                  setShowNotifications(false);
                }}>
                  <div className="avatar"><FontAwesomeIcon icon={faUser} /></div>
                  <span className="member-id"></span>
                  {showProfileMenu && (
                    <div className="dropdown-menu profile-dropdown show">
                      <div className="profile-header">
                        <div className="profile-avatar"><FontAwesomeIcon icon={faUser} size="2x" /></div>
                        <div className="profile-info">
                          <h6>Welcome, {user?.displayName ?? "Guest"}</h6>
                          <span>Member ID: {user?.memberId ?? "-"}</span>
                          <small className="text-muted d-block mt-1">
                            Location: {selectedDistrict}
                          </small>
                        </div>
                      </div>
                      <div className="profile-links">
                        {profileMenuItems.map((item, idx) => {
                          if (item.name === 'Logout') {
                            return (
                              <button
                                key={idx}
                                className="dropdown-item logout-button"
                                onClick={handleLogout}
                              >
                                {item.name}
                              </button>
                            );
                          } else {
                            return (
                              <Link key={idx} to={item.link} className="dropdown-item">{item.name}</Link>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;