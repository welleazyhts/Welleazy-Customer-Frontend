import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PharmacyCart.css';
import { PharmacyAPI } from '../../api/Pharmacy'; 
import { VASCharge, CartItem, InventoryResult, CartBreakdown, OneMGGenerateOrderRequest, EmployeeDeliveryAddress } from '../../types/Pharmacy';
import { gymServiceAPI } from '../../api/GymService';

const PharmacyCart: React.FC = () => {
  const [showStorePanel, setShowStorePanel] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<EmployeeDeliveryAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const ePrescriptionInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [selectedAddressType, setSelectedAddressType] = useState<'home' | 'office' | 'other'>('home');
const [filteredAddresses, setFilteredAddresses] = useState<EmployeeDeliveryAddress[]>([]);

const [autoOpenModal, setAutoOpenModal] = useState(false);

const [isPlacingOrder,setIsPlacingOrder]=useState(false);

  const navigate = useNavigate();

useEffect(() => {
  if (addresses.length > 0) {
    // First, filter by relationship - only show "Self"
    let filtered = addresses.filter(addr => 
      addr.Relationship && addr.Relationship.toLowerCase() === 'self'
    );
    
    // Then filter by address type
    if (selectedAddressType === 'home') {
      filtered = filtered.filter(addr => 
        addr.AddressType && addr.AddressType.toLowerCase().includes('home')
      );
    } else if (selectedAddressType === 'office') {
      filtered = filtered.filter(addr => 
        addr.AddressType && addr.AddressType.toLowerCase().includes('office')
      );
    } else if (selectedAddressType === 'other') {
      filtered = filtered.filter(addr => {
        const addressType = addr.AddressType ? addr.AddressType.toLowerCase() : '';
        return !addressType.includes('home') && 
               !addressType.includes('residence') && 
               !addressType.includes('office') && 
               !addressType.includes('work');
      });
    }
    
    setFilteredAddresses(filtered);
  }
}, [addresses, selectedAddressType]);

  const getUserCartKey = () => {
    const loginRefId = localStorage.getItem("LoginRefId");
    if (loginRefId) {
      return `pharmacyCart_${loginRefId}`;
    }
    return `pharmacyCart_guest`;
  };

  const getUserCartBreakdownKey = () => {
    const loginRefId = localStorage.getItem("LoginRefId");
    if (loginRefId) {
      return `pharmacyCartBreakdown_${loginRefId}`;
    }
    return `pharmacyCartBreakdown_guest`;
  };

  const getUserDetails = () => {
    const mobile = localStorage.getItem("mobile") || '';
    const email = localStorage.getItem("email") || '';
    const firstName = localStorage.getItem("employeeName") || '';
    
    return {
      mobile,
      email,
      firstName
    };
  };

  const saveCartBreakdown = (breakdown: Omit<CartBreakdown, 'timestamp'>) => {
    const cartBreakdown: CartBreakdown = {
      ...breakdown,
      timestamp: Date.now()
    };
    const breakdownKey = getUserCartBreakdownKey();
    localStorage.setItem(breakdownKey, JSON.stringify(cartBreakdown));
  };

  const loadCartBreakdown = (): CartBreakdown | null => {
    try {
      const breakdownKey = getUserCartBreakdownKey();
      const stored = localStorage.getItem(breakdownKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cart breakdown:', error);
    }
    return null;
  };

  const getAllPharmacyCartDetailsIds = (): string => {
    if (cartItems.length === 0) return '0';
    
    const ids = cartItems
      .filter(item => item.PharmacyCartDetailsId && item.PharmacyCartDetailsId !== 0)
      .map(item => item.PharmacyCartDetailsId?.toString() || '');
    
    console.log('All PharmacyCartDetailsIds found:', ids);
    
    if (ids.length > 0 && ids.every(id => id !== '')) {
      const result = ids.join(',');
      console.log('Returning comma-separated IDs:', result);
      return result;
    }
    
    console.warn('No valid PharmacyCartDetailsIds found');
    return '0';
  };

  const getFirstPharmacyCartDetailsId = (): number => {
    if (cartItems.length === 0) return 0;
    
    const firstItemWithId = cartItems.find(item => 
      item.PharmacyCartDetailsId && item.PharmacyCartDetailsId !== 0
    );
    
    if (firstItemWithId?.PharmacyCartDetailsId) {
      console.log('Using PharmacyCartDetailsId as CartUniqueId:', firstItemWithId.PharmacyCartDetailsId);
      return firstItemWithId.PharmacyCartDetailsId;
    }
    
    console.warn('No PharmacyCartDetailsId found in cart items, using timestamp');
    return Date.now();
  };

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const employeeRefId = localStorage.getItem("EmployeeRefId");
        
        if (!employeeRefId) {
          throw new Error("EmployeeRefId not found in localStorage");
        }

        const profileData = await gymServiceAPI.CRMLoadCustomerProfileDetails(parseInt(employeeRefId));
        setProfile(profileData);
        
        if (profileData) {
          setName(profileData.EmployeeName || '');
          setMobile(profileData.MobileNo || '');
          setAddress(profileData.Address || '');
          
          if (profileData.EmployeeName) {
            localStorage.setItem("employeeName", profileData.EmployeeName);
          }
          if (profileData.MobileNo) {
            localStorage.setItem("mobile", profileData.MobileNo);
          }
          if (profileData.Address) {
            localStorage.setItem("address", profileData.Address);
          }
        }
        
        localStorage.setItem("customerProfile", JSON.stringify(profileData));
        
      } catch (error) {
        console.error("Failed to load customer profile:", error);
        setProfileError(error instanceof Error ? error.message : "Failed to load profile");
        
        const storedName = localStorage.getItem("employeeName") || '';
        const storedMobile = localStorage.getItem("mobile") || '';
        const storedAddress = localStorage.getItem("address") || '';
        
        setName(storedName);
        setMobile(storedMobile);
        setAddress(storedAddress);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchCustomerProfile();
  }, []);

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      
      if (!employeeRefId) {
        throw new Error("EmployeeRefId not found in localStorage");
      }

      const addressList = await PharmacyAPI.LoadEmployeeDeliveryAddressDetails(Number(employeeRefId));
      setAddresses(addressList);
          updateFilteredAddresses(addressList, selectedAddressType);

      // Find if current address matches any saved address
      const currentAddress = address || profile?.Address || '';
      const matchingAddress = addressList.find(addr => 
        addr.Address === currentAddress || 
        (addr.AddressLineOne && currentAddress.includes(addr.AddressLineOne))
      );
      
      if (matchingAddress) {
        setSelectedAddressId(matchingAddress.EmployeeAddressDetailsId);
      }
      
    } catch (err: unknown) {
      console.error("Failed to load employee delivery addresses:", err);
      setProfileError(
        err instanceof Error
          ? err.message
          : "Failed to load delivery addresses"
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  const updateFilteredAddresses = (addressList: EmployeeDeliveryAddress[], addressType: 'home' | 'office' | 'other') => {
  // First, filter by relationship - only show "Self"
  let filtered = addressList.filter(addr => 
    addr.Relationship && addr.Relationship.toLowerCase() === 'self'
  );
  
  // Then filter by address type
  if (addressType === 'home') {
    filtered = filtered.filter(addr => 
      addr.AddressType && addr.AddressType.toLowerCase().includes('home')
    );
  } else if (addressType === 'office') {
    filtered = filtered.filter(addr => 
      addr.AddressType && addr.AddressType.toLowerCase().includes('office')
    );
  } else if (addressType === 'other') {
    filtered = filtered.filter(addr => {
      const addressType = addr.AddressType ? addr.AddressType.toLowerCase() : '';
      return !addressType.includes('home') && 
             !addressType.includes('residence') && 
             !addressType.includes('office') && 
             !addressType.includes('work');
    });
  }
  
  setFilteredAddresses(filtered);
};
useEffect(() => {
  if (addresses.length > 0) {
    updateFilteredAddresses(addresses, selectedAddressType);
  }
}, [addresses, selectedAddressType]);

  const handleOpenAddressModal = async () => {
    setShowAddressModal(true);
    await loadAddresses();
  };

const handleCloseAddressModal = () => {
  setShowAddressModal(false);
  setAutoOpenModal(false);
};

  const handleSelectAddress = (selectedAddress: EmployeeDeliveryAddress) => {
    // Update the address fields
    setAddress(selectedAddress.Address || '');
    setName(selectedAddress.EmployeeName || '');
    // Update localStorage
    localStorage.setItem("address", selectedAddress.Address || '');
    localStorage.setItem("employeeName", selectedAddress.EmployeeName || '');
    
    // Update selected address ID
    setSelectedAddressId(selectedAddress.EmployeeAddressDetailsId);
    
    // Close the modal
    setShowAddressModal(false);
    
    // Update profile state
    if (profile) {
      setProfile({
        ...profile,
        Address: selectedAddress.Address || ''
      });
    }
    
    // Refresh inventory if cart has items
    if (cartItems.length > 0) {
      checkInventoryForCart();
    }
  };

  const checkInventoryForCart = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      const userDetails = getUserDetails();      
      const inventoryPromises = cartItems.map(async (item): Promise<InventoryResult> => {
        const inventoryRequest = {
          SkuId: item.OneMGSearchAllResultDetailsId,
          Quantity: item.quantity || 1,
          FirstName: userDetails.firstName,
          Mobile: userDetails.mobile,
          Email: userDetails.email
        };

        try {
          const result = await PharmacyAPI.InventoryCheck(inventoryRequest);
          return {
            itemId: item.OneMGSearchAllResultDetailsId,
            inventoryData: result.data,
            success: result.is_success
          };
        } catch (error) {
          console.error(`Inventory check failed for ${item.name}:`, error);
          return {
            itemId: item.OneMGSearchAllResultDetailsId,
            inventoryData: null,
            success: false
          };
        }
      });

      const inventoryResults = await Promise.all(inventoryPromises);
      const updatedCart = cartItems.map(item => {
        const inventoryResult = inventoryResults.find(
          result => result.itemId === item.OneMGSearchAllResultDetailsId
        );
        
        if (inventoryResult && inventoryResult.success && inventoryResult.inventoryData) {
          const skuData = inventoryResult.inventoryData.skus?.[item.OneMGSearchAllResultDetailsId];
          return {
            ...item,
            inventoryData: inventoryResult.inventoryData,
            price: skuData?.discounted_price || item.price || 0,
            DiscountedPrice: skuData?.discounted_price?.toString() || item.DiscountedPrice || '0'
          };
        }
        return item;
      });

      setCartItems(updatedCart);
      const cartKey = getUserCartKey();
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      
      const successfulResult = inventoryResults.find(result => result.success && result.inventoryData);
      if (successfulResult && successfulResult.inventoryData) {
        setInventoryData(successfulResult.inventoryData);
      }

    } catch (error) {
      console.error('Error checking inventory for cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cartKey = getUserCartKey();
    
    const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');    
    const transformedCart = storedCart.map((item: any) => {
      let pharmacyCartDetailsId = 0;
      
      if (item.PharmacyCartDetailsId !== undefined) {
        pharmacyCartDetailsId = Number(item.PharmacyCartDetailsId);
        if (isNaN(pharmacyCartDetailsId)) {
          pharmacyCartDetailsId = 0;
        }
      }
      
      const transformedItem: CartItem = {
        ...item,
        name: item.name || item.Name || 'Unknown Product',
        img: item.img || item.Image || '/default-medicine.png',
        OneMGSearchAllResultDetailsId: item.OneMGSearchAllResultDetailsId || item.productId || '',
        MRP: item.MRP || '0',
        DiscountedPrice: item.DiscountedPrice || '0',
        Discount: item.Discount || '0',
        Available: item.Available !== undefined ? item.Available : true,
        quantity: item.quantity || 1,
        price: item.price || 0,
        inventoryData: item.inventoryData || null,
        totalPayable: item.totalPayable || 0,
        PharmacyCartDetailsId: pharmacyCartDetailsId
      };
      
      console.log('Loaded cart item:', {
        name: transformedItem.name,
        PharmacyCartDetailsId: transformedItem.PharmacyCartDetailsId,
        type: typeof transformedItem.PharmacyCartDetailsId
      });
      
      return transformedItem;
    });
    
    setCartItems(transformedCart);
    console.log('Total cart items loaded:', transformedCart.length);
    
    if (transformedCart.length > 0) {
      checkInventoryForCart();
    }
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      setCouponError('');
      setDiscountAmount(10);
      const breakdown = calculateTotals();
      saveCartBreakdown({
        ...breakdown,
        appliedCoupon: 'SAVE10',
        discountAmount: 10
      });
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      const breakdown = calculateTotals();
      saveCartBreakdown({
        ...breakdown,
        appliedCoupon: null,
        discountAmount: 0
      });
    }
  };

  const updateQuantity = async (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    
    setCartItems(updatedCart);
    const cartKey = getUserCartKey();
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    
    const item = updatedCart[index];
    const userDetails = getUserDetails();
    
    try {
      const inventoryRequest = {
        SkuId: item.OneMGSearchAllResultDetailsId,
        Quantity: newQuantity,
        FirstName: userDetails.firstName,
        Mobile: userDetails.mobile,
        Email: userDetails.email
      };

      const result = await PharmacyAPI.InventoryCheck(inventoryRequest);
      if (result.is_success && result.data) {
        const updatedCartWithInventory = [...updatedCart];
        const skuData = result.data.skus?.[item.OneMGSearchAllResultDetailsId];
        updatedCartWithInventory[index].inventoryData = result.data;
        updatedCartWithInventory[index].price = skuData?.discounted_price || item.price || 0;
        updatedCartWithInventory[index].DiscountedPrice = skuData?.discounted_price?.toString() || item.DiscountedPrice || '0';
        
        setCartItems(updatedCartWithInventory);
        localStorage.setItem(cartKey, JSON.stringify(updatedCartWithInventory));
        
        setInventoryData(result.data);

        const breakdown = calculateTotals();
        saveCartBreakdown({
          ...breakdown,
          appliedCoupon,
          discountAmount
        });
      }
    } catch (error) {
      console.error('Error updating inventory for quantity change:', error);
    }
  };

  const handleDeleteItem = (index: number) => {
    const cartKey = getUserCartKey();
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    
    setCartItems(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    
    const breakdown = calculateTotals();
    saveCartBreakdown({
      ...breakdown,
      appliedCoupon,
      discountAmount
    });

    if (updatedCart.length === 0) {
      setInventoryData(null);
      const breakdownKey = getUserCartBreakdownKey();
      localStorage.removeItem(breakdownKey);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };
  
  const handleEPrescriptionClick = () => {
    ePrescriptionInputRef.current?.click();
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleContinue = () => {
    console.log("Continue button clicked");
    setShowPrescriptionPopup(false);
  };
  
  const handleClosePopup = () => {
    setShowPrescriptionPopup(false);
  };

  const handleAddMoreItems = () => {
    navigate('/pharmacy');
  };

  const calculateTotals = () => {
    const totalOriginalPrice = cartItems.reduce((sum, item) => {
      const originalPrice = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId]?.price || parseFloat(item.MRP || '0') || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (originalPrice * quantity);
    }, 0);
    
    const totalDiscountedPrice = cartItems.reduce((sum, item) => {
      const discountedPrice = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId]?.discounted_price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (discountedPrice * quantity);
    }, 0);
    
    const totalDiscountAmount = totalOriginalPrice - totalDiscountedPrice;
    let handlingFee = 12;
    let platformFee = 0;
    let deliveryCharge = 79;

    if (inventoryData) {
      const handlingCharge = inventoryData.vas_charges?.details?.find((charge: VASCharge) => charge.type === 'handling_fee');
      const platformCharge = inventoryData.vas_charges?.details?.find((charge: VASCharge) => charge.type === 'platform_fee');
      
      handlingFee = handlingCharge?.amount || 9;      
 platformFee = platformCharge?.amount || 0;
    }
    
    const subtotalAfterDiscount = totalDiscountedPrice;
    const totalPayable = Math.max(0, subtotalAfterDiscount + handlingFee + platformFee + deliveryCharge - discountAmount);

    return { 
      totalOriginalPrice,           
      totalDiscountedPrice,       
      totalDiscountAmount,         
      subtotalAfterDiscount,      
      handlingFee, 
      platformFee, 
      deliveryCharge, 
      totalPayable 
    };
  };

  const { 
    totalOriginalPrice,
    totalDiscountedPrice,        
    totalDiscountAmount,        
    handlingFee, 
    platformFee, 
    deliveryCharge, 
    totalPayable 
  } = calculateTotals();

  useEffect(() => {
    if (cartItems.length > 0) {
      const breakdown = calculateTotals();
      saveCartBreakdown({
        ...breakdown,
        appliedCoupon,
        discountAmount
      });
    }
  }, [cartItems, inventoryData, appliedCoupon, discountAmount]);

  // const handlePlaceOrder = async () => {
  //   if (cartItems.length === 0) {
  //     alert('Your cart is empty!');
  //     return;
  //   }

  //   console.log('Cart items before placing order:', cartItems.map(item => ({
  //     name: item.name,
  //     PharmacyCartDetailsId: item.PharmacyCartDetailsId,
  //     OneMGSearchAllResultDetailsId: item.OneMGSearchAllResultDetailsId,
  //     quantity: item.quantity
  //   })));

  //   const itemsWithoutCartId = cartItems.filter(item => !item.PharmacyCartDetailsId || item.PharmacyCartDetailsId === 0);
  //   if (itemsWithoutCartId.length > 0) {
  //     alert('Some items are not synced with server. Please go back to pharmacy page and add items again.');
  //     console.log('Items without PharmacyCartDetailsId:', itemsWithoutCartId);
  //     return;
  //   }

  //   const mobile = localStorage.getItem("mobile") || '';
  //   const email = localStorage.getItem("email") || '';
  //   const name = localStorage.getItem("employeeName") || '';
  //   const address = localStorage.getItem("address") || '';
  //   const pincode = localStorage.getItem("pincode") || '';

  //   const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";
  //   const loginRefId = localStorage.getItem("LoginRefId") || "0";
    
  //   if (!employeeRefId || employeeRefId === "0" || !loginRefId || loginRefId === "0") {
  //     alert('User session information is missing. Please login again.');
  //     return;
  //   }

  //   try {
  //     const pharmacyCartDetailsIds = getAllPharmacyCartDetailsIds();
  //     const cartUniqueId = getFirstPharmacyCartDetailsId();

  //     const orderData: OneMGGenerateOrderRequest = {
  //       EmployeeRefId: employeeRefId,
  //       CartUniqueId: cartUniqueId.toString(),
  //       LoginRefId: loginRefId,
  //       PharmacyOrderId: "0",
  //       PayableAmount: totalPayable.toFixed(2),
  //       EmailId: email,
  //       MobileNo: mobile,
  //       CustomerName: name,
  //       Pincode: pincode,
  //       Address: address,
  //       PharmacyCartDetailsId: pharmacyCartDetailsIds
  //     };
      
  //     console.log('Placing order with data:', orderData);
  //     console.log('PharmacyCartDetailsIds being sent:', pharmacyCartDetailsIds);
  //     console.log('CartUniqueId:', cartUniqueId);
      
  //     const result = await PharmacyAPI.OneMGGenerateOrder(orderData);
      
  //     console.log('Order API response:', result);
      
  //     if (result.Success || (result.Message && result.Message.toLowerCase().includes('success')) || result.OrderId) {
  //       alert(`Order placed successfully! Order ID: ${result.OrderId || 'N/A'}`);
        
  //       const cartKey = getUserCartKey();
  //       const breakdownKey = getUserCartBreakdownKey();
  //       localStorage.removeItem(cartKey);
  //       localStorage.removeItem(breakdownKey);
        
  //       setCartItems([]);
  //       setInventoryData(null);
  //       setAppliedCoupon(null);
  //       setDiscountAmount(0);
        
  //       navigate('/order-confirmation', { state: { orderId: result.OrderId } });
  //     } else {
  //       alert(`Order failed: ${result.Message || 'Unknown error'}`);
  //     }
      
  //   } catch (error) {
  //     console.error('Error placing order:', error);
  //     alert('Failed to place order. Please try again.');
  //   }
  // };


const handlePlaceOrder = async () => {
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const itemsWithoutCartId = cartItems.filter(
    item => !item.PharmacyCartDetailsId || item.PharmacyCartDetailsId === 0
  );

  if (itemsWithoutCartId.length > 0) {
    alert(
      'Some items are not synced with server. Please go back to pharmacy page and add items again.'
    );
    return;
  }

  const mobile = localStorage.getItem('mobile') || '';
  const email = localStorage.getItem('email') || '';
  const name = localStorage.getItem('employeeName') || '';
  const address = localStorage.getItem('address') || '';
  const pincode = localStorage.getItem('pincode') || '';

  const employeeRefId = localStorage.getItem('EmployeeRefId');
  const loginRefId = localStorage.getItem('LoginRefId');

  if (!employeeRefId || !loginRefId) {
    alert('User session information is missing. Please login again.');
    return;
  }
    setIsPlacingOrder(true);

  try {
    const pharmacyCartDetailsIds = getAllPharmacyCartDetailsIds();
    const cartUniqueId = getFirstPharmacyCartDetailsId();

    const orderData: OneMGGenerateOrderRequest = {
      EmployeeRefId: employeeRefId,
      CartUniqueId: cartUniqueId.toString(),
      LoginRefId: loginRefId,
      PharmacyOrderId: '0',
      PayableAmount: totalPayable.toFixed(2),
      EmailId: email,
      MobileNo: mobile,
      CustomerName: name,
      Pincode: pincode,
      Address: address,
      PharmacyCartDetailsId: pharmacyCartDetailsIds
    };

    console.log('Placing order with data:', orderData);
    const result = await PharmacyAPI.OneMGGenerateOrder(orderData);
    console.log('Order API response:', result);
    const orderId = result?.order_id || result?.OrderId;
    if (orderId) {
      // alert(`Order placed successfully! Order ID: ${orderId}`);

      const cartKey = getUserCartKey();
      const breakdownKey = getUserCartBreakdownKey();
      localStorage.removeItem(cartKey);
      localStorage.removeItem(breakdownKey);

      setCartItems([]);
      setInventoryData(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);

      navigate('/my-bookings');
      return;
    }

    alert('Order failed: Unknown error');
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order. Please try again.');
  }finally{
    setIsPlacingOrder(false);
  }

};


const handleAddNewAddress = () => {
  // Save the current tab
  localStorage.setItem('lastSelectedAddressTab', selectedAddressType);
  // Set flag to open modal when returning
  localStorage.setItem('shouldOpenAddressModal', 'true');
  
  navigate('/my-address', { 
    state: { 
      openForm: true,
      fromPharmacyCart: true
    } 
  });
};


useEffect(() => {
  // Check if we're returning from AddressBook edit
  const shouldOpenModal = localStorage.getItem('shouldOpenAddressModal') === 'true';
  const savedTab = localStorage.getItem('lastSelectedAddressTab');
  
  if (shouldOpenModal) {
    // Clear the flag
    localStorage.removeItem('shouldOpenAddressModal');
    
    // Set the tab if saved
    if (savedTab) {
      setSelectedAddressType(savedTab as 'home' | 'office' | 'other');
    }
    
    // Open the modal
    setShowAddressModal(true);
    setAutoOpenModal(true);
    
    // Refresh addresses from API
    loadAddresses(); // Call the function that loads addresses from API
    
    // Also refresh inventory if cart has items
    if (cartItems.length > 0) {
      checkInventoryForCart();
    }
  }
}, []);


const handleEditAddress = (address: EmployeeDeliveryAddress, addressType: 'home' | 'office' | 'other') => {
  // Save the current tab
  localStorage.setItem('lastSelectedAddressTab', addressType);
  // Set flag to open modal when returning
  localStorage.setItem('shouldOpenAddressModal', 'true');
  
  // Close the modal first
  handleCloseAddressModal();
  
  // Navigate to AddressBook
  navigate('/my-address', { 
    state: { 
      editAddress: true,
      addressData: address,
      selectedTab: addressType,
      fromPharmacyCart: true
    }
  });
};



  if (profileLoading) {
    return (
      <div className="pharmacy-cart-wrapper">
        <div className="pharmacy-cart-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-cart-wrapper">
      <div className="pharmacy-cart-container">
        <div className="pharmacy-cart-address-section">
          <h2 className="pharmacy-cart-section-title">Shipping Address</h2>
          <div className="pharmacy-cart-address-content">
            <div className="pharmacy-cart-address-details">
              <div className="pharmacy-cart-address-display">
                <strong className="pharmacy-cart-customer-name">
                  {name || (profile?.EmployeeName || 'Not specified')}
                </strong>
                <div className="pharmacy-cart-customer-mobile">
                  Mobile Number: {mobile || profile?.MobileNo || 'Not specified'}
                </div>
                <strong className="pharmacy-cart-address-label">Shipping Address</strong>
                <div className="pharmacy-cart-address-text">
                  <span className="pharmacy-cart-address-icon">📍</span> 
                  {address || profile?.Address || 'No address specified'}
                </div>
              </div>
            </div>

            <div className="pharmacy-cart-delivery-info">
              <span className="pharmacy-cart-delivery-estimate">🚚 Deliver by: {inventoryData?.eta || '--'}</span>
              <button className="pharmacy-cart-change-btn" onClick={handleOpenAddressModal}>
                CHANGE
              </button>
            </div>
          </div>
        </div>

       
{/* Address Modal */}
{showAddressModal && (
  <div className="pharmacy-cart-address-modal-overlay">
    <div className="pharmacy-cart-address-modal">
      <div className="pharmacy-cart-address-modal-header">
        <h3>Change Delivery Address</h3>
        <button 
          className="pharmacy-cart-address-modal-close" 
          onClick={handleCloseAddressModal}
        >
          ×
        </button>
      </div>
      
      {/* Address Type Tabs */}
      <div className="pharmacy-cart-address-tabs">
        <button 
          className={`pharmacy-cart-address-tab ${selectedAddressType === 'home' ? 'active' : ''}`}
          onClick={() => setSelectedAddressType('home')}
        >
          🏠 Home
        </button>
        <button 
          className={`pharmacy-cart-address-tab ${selectedAddressType === 'office' ? 'active' : ''}`}
          onClick={() => setSelectedAddressType('office')}
        >
          🏢 Office
        </button>
        <button 
          className={`pharmacy-cart-address-tab ${selectedAddressType === 'other' ? 'active' : ''}`}
          onClick={() => setSelectedAddressType('other')}
        >
          📍 Others
        </button>
      </div>

       <div className="pharmacy-cart-add-new-address-link">
        <span 
          className="pharmacy-cart-add-new-link-text"
           onClick={handleAddNewAddress}
        >
          Add New Address
        </span>
      </div>
      
      <div className="pharmacy-cart-address-modal-content">
        {addressesLoading ? (
          <div className="pharmacy-cart-address-loading">
            <div className="loading-spinner"></div>
            <p>Loading addresses...</p>
          </div>
        ) : filteredAddresses.length === 0 ? (
          <div className="pharmacy-cart-no-addresses">
            <p>No {selectedAddressType} addresses found.</p>
            <p>Please add an address in your profile.</p>
          </div>
        ) : (
          <div className="pharmacy-cart-address-list">
            {filteredAddresses.map((addr) => (
              <div 
                key={addr.EmployeeAddressDetailsId}
                className={`pharmacy-cart-address-item ${selectedAddressId === addr.EmployeeAddressDetailsId ? 'pharmacy-cart-address-selected' : ''}`}
                onClick={() => handleSelectAddress(addr)}
              >
                {/* Single row: Name + (Relation) + Edit button */}
                <div className="pharmacy-cart-address-item-header">
                  <div className="pharmacy-cart-address-name-container">
                    <strong className="pharmacy-cart-address-item-name">
                      {addr.EmployeeName}
                    </strong>
                    <span className="pharmacy-cart-address-item-relation">
                      ({addr.Relationship})
                    </span>
                  </div>
                  
                  <button 
                    className="pharmacy-cart-address-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
                       handleEditAddress(addr, selectedAddressType);
                    }}
                    title="Edit this address"
                  >
                    <span className="pharmacy-cart-address-edit-icon">✏️</span>
                    Edit
                  </button>
                </div>
                
                {/* Full address only - removed phone number */}
                <div className="pharmacy-cart-address-item-address">
                  <div className="pharmacy-cart-address-icon">📍</div>
                  <div className="pharmacy-cart-address-details">
                    <strong>Full Address:</strong> {addr.Address}
                  </div>
                </div>
                
                <button 
                  className="pharmacy-cart-address-select-btn"
                  onClick={() => handleSelectAddress(addr)}
                >
                  {selectedAddressId === addr.EmployeeAddressDetailsId ? 'Selected' : 'Select This Address'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pharmacy-cart-address-modal-footer">
        <button 
          className="pharmacy-cart-address-cancel-btn"
          onClick={handleCloseAddressModal}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}



        <div className="pharmacy-cart-action-buttons">
          <button
            onClick={() => setShowPrescriptionPopup(true)}
            className="pharmacy-cart-add-items-btn">
            Upload Prescription
          </button>
           <button
            onClick={() => setShowPrescriptionPopup(true)}
            className="pharmacy-cart-add-items-btn">
            View Prescription
          </button>
          <button 
            className="pharmacy-cart-add-items-btn" 
            onClick={handleAddMoreItems}>
            Add more items
          </button>
        </div>

        {showPrescriptionPopup && (
          <div className="pharmacy-cart-prescription-popup">
            <div className="pharmacy-cart-popup-content">
              <button className="pharmacy-cart-popup-close" onClick={handleClosePopup}>×</button>
              <div className="pharmacy-cart-upload-section">
                <div className="pharmacy-cart-upload-illustration">
                  <div className="pharmacy-cart-upload-header">
                    <h4>Uploaded Prescriptions will be shown here</h4>
                    <h4>Preview section</h4>
                  </div>
                  <div className="pharmacy-cart-upload-buttons">
                    <button onClick={handleGalleryClick}>Choose from Gallery</button>
                    <button onClick={handleEPrescriptionClick}>Select from E-Prescription</button>
                  </div>
                </div>
              </div>
              <div className="pharmacy-cart-preview-section">
                <div className="pharmacy-cart-preview-images">
                  {uploadedFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="pharmacy-cart-preview-image"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="pharmacy-cart-popup-footer">
              <button className="pharmacy-cart-continue-btn" onClick={handleContinue}>Continue</button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <input
              type="file"
              accept="image/*"
              ref={ePrescriptionInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </div>
        )}

        <div className="pharmacy-cart-main">
          <div className="pharmacy-cart-items-section">
            {loading && <div className="pharmacy-cart-loading">Updating prices...</div>}
            {cartItems.length === 0 ? (
              <div className="pharmacy-cart-empty">
                <p>Your cart is empty</p>
                <button className="pharmacy-cart-primary-btn" onClick={handleAddMoreItems}>
                  Add Items
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const itemInventory = item.inventoryData?.skus?.[item.OneMGSearchAllResultDetailsId];
                const itemPrice = itemInventory?.discounted_price || item.price || 0;
                const originalPrice = itemInventory?.price || parseFloat(item.MRP || '0') || item.price || 0;                
                const roundedItemPrice = Math.round(itemPrice * 100) / 100;
                const roundedOriginalPrice = Math.round(originalPrice * 100) / 100;
                const totalPrice = roundedItemPrice * (item.quantity || 0);
                const totalOriginalPrice = roundedOriginalPrice * (item.quantity || 0);
                const itemDiscount = totalOriginalPrice - totalPrice;

                return (
                  <div className="pharmacy-cart-item-card" key={index}>
                    <div className="pharmacy-cart-image-container">
                      <div className="pharmacy-cart-item-image-box">
                        {item.img && item.img !== '/default-medicine.png' ? (
                          <img 
                            src={item.img} 
                            alt={item.name} 
                            className="pharmacy-cart-item-image" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-medicine.png';
                            }}
                          />
                        ) : (
                          <div className="pharmacy-cart-image-placeholder">
                            Medicine Image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pharmacy-cart-item-content">
                      <div className="pharmacy-cart-item-info">
                        <p className="pharmacy-cart-item-name">{item.name}</p>
                        
                        <div className="pharmacy-cart-price-info">
                          <span className="pharmacy-cart-current-price">
                            ₹{roundedItemPrice.toFixed(2)}
                          </span>
                          {roundedOriginalPrice > roundedItemPrice && (
                            <span className="pharmacy-cart-original-price">
                              ₹{roundedOriginalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="pharmacy-cart-price-unit">per item</span>
                        </div>

                        <div className="pharmacy-cart-item-actions">
                          <button 
                            className="pharmacy-cart-action-btn" 
                            onClick={() => handleDeleteItem(index)}
                            title="Remove item"
                          >
                            🗑
                          </button>
                          <button 
                            className="pharmacy-cart-action-btn" 
                            onClick={() => updateQuantity(index, (item.quantity || 0) - 1)}
                            disabled={(item.quantity || 0) <= 1}
                          >
                            -
                          </button>
                          <span className="pharmacy-cart-quantity">{item.quantity || 0}</span>
                          <button 
                            className="pharmacy-cart-action-btn" 
                            onClick={() => updateQuantity(index, (item.quantity || 0) + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="pharmacy-cart-item-total">
                          <strong>Total: ₹{totalPrice.toFixed(2)}</strong>
                          {itemDiscount > 0 && (
                            <div className="pharmacy-cart-item-savings">
                              You save: ₹{itemDiscount.toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div className="pharmacy-cart-item-server-id">
                          <small>Server ID: {item.PharmacyCartDetailsId && item.PharmacyCartDetailsId > 0 ? item.PharmacyCartDetailsId : 'Not synced'}</small>
                        </div>

                        {itemInventory && (
                          <div className="pharmacy-cart-inventory-info">
                            <small>Min order: {itemInventory.min_order_qty} | Max order: {itemInventory.max_order_qty}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pharmacy-cart-summary-section">
            <h4 className="pharmacy-cart-summary-title">Delivery Choice</h4>
            <div className="pharmacy-cart-delivery-options">
              <button 
                className={`pharmacy-cart-delivery-option ${!showStorePanel ? 'pharmacy-cart-option-selected' : ''}`} 
                onClick={() => setShowStorePanel(false)}
              >
                🏠 Home Delivery
              </button>
            </div>

            {showStorePanel && (
              <div className="pharmacy-cart-store-panel pharmacy-cart-store-panel-open">
                <div className="pharmacy-cart-store-panel-header">
                  <h5>Select a Store</h5>
                  <button className="pharmacy-cart-store-panel-close" onClick={() => setShowStorePanel(false)}>✖</button>
                </div>
              </div>
            )}

            <div className="pharmacy-cart-payment-options">
              <button
                className="pharmacy-cart-payment-option pharmacy-cart-option-selected"
                onClick={() => setPaymentMethod('COD')}
              >
                COD
              </button>
            </div>

            <div className="pharmacy-cart-breakdown">
              <h4 className="pharmacy-cart-breakdown-title">Cart Breakdown</h4>
              <div className="pharmacy-cart-breakdown-line">
                <span>Cart Total</span>
                <span>₹{totalOriginalPrice.toFixed(2)}</span>
              </div>
              {totalDiscountAmount > 0 && (
                <div className="pharmacy-cart-breakdown-line pharmacy-cart-discount-line">
                  <span>Discount on MRP</span>
                  <span>- ₹{totalDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              {handlingFee > 0 && (
                <div className="pharmacy-cart-breakdown-line">
                  <span>Handling Fee</span>
                  <span>₹{handlingFee.toFixed(2)}</span>
                </div>
              )}
              {platformFee > 0 && (
                <div className="pharmacy-cart-breakdown-line">
                  <span>Platform Fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
              )}
              {deliveryCharge > 0 && (
                <div className="pharmacy-cart-breakdown-line">
                  <span>Delivery Charge</span>
                  <span>₹{deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="pharmacy-cart-coupon-section">
                <div className="pharmacy-cart-coupon-header">
                  <span>Coupon Discount</span>
                  <button className="pharmacy-cart-apply-coupon-btn" onClick={() => setShowCouponInput(!showCouponInput)}>
                    {showCouponInput ? 'Hide' : 'Apply Coupon'}
                  </button>
                </div>

                {showCouponInput && (
                  <div className="pharmacy-cart-coupon-input-group">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pharmacy-cart-coupon-input"
                    />
                    <button className="pharmacy-cart-coupon-apply-btn" onClick={handleApplyCoupon}>Apply</button>
                    {couponError && <div className="pharmacy-cart-coupon-error">{couponError}</div>}
                    {appliedCoupon && <div className="pharmacy-cart-coupon-success">✅ {appliedCoupon} applied!</div>}
                </div>
                )}
              </div>
              {appliedCoupon && (
                <div className="pharmacy-cart-breakdown-line pharmacy-cart-discount-line">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pharmacy-cart-breakdown-total">
                <strong>To Pay</strong>
                <strong>₹{totalPayable.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="pharmacy-cart-footer">
        <button className="pharmacy-cart-add-items-btn" onClick={() => navigate('/pharmacy')}>Back</button>
  <button 
    className="pharmacy-cart-add-items-btn" 
    onClick={handlePlaceOrder}
    disabled={cartItems.length === 0 || isPlacingOrder}
  >
    {isPlacingOrder ? (
      <span className="pharmacy-cart-order-loading">
        <span className="pharmacy-cart-order-spinner"></span>
        Processing...
      </span>
    ) : (
      paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'
    )}
  </button>
</div>


      </div>
    </div>
  );
};

export default PharmacyCart;