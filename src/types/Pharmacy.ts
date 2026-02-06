export interface PharmacyCategory {
  id: number;
  name: string;
  image?: string;
  slug?: string;
}

// Raw API Response Interface
export interface PharmacyMedicineResponse {
  id: number;
  name: string;
  description: string;
  mrp_price: string;
  selling_price: string;
  discount_percent: number;
  stock_count: number;
  image: string;
  vendor_id: number;
  vendor_name: string;
  category_id: number;
  category_name: string;
  pack_size?: string;
  created_at: string;
  details?: {
    id: number;
    introduction?: string;
    uses?: string;
    benefits?: string;
    side_effects?: string;
    safety_advice?: string;
    quick_tips?: string;
    faqs?: string;
    marketer_name?: string;
  } | null;
}

// Transformed Interface for UI
export interface PharmacyMedicine {
  id: number;
  name: string;
  slug?: string; // Optional as not in new API
  manufacturer: string;
  price: number; // Mapped from selling_price
  mrp: number; // Mapped from mrp_price
  discount: number; // Mapped from discount_percent
  image: string;
  description?: string;
  stock?: number; // Mapped from stock_count
  pack_size?: string;

  // Additional details from 'details' object
  composition?: string;
  uses?: string;
  benefits?: string;
  side_effects?: string;
  safety_advice?: string;
  introduction?: string;

  // Legacy aliases
  OneMGSearchAllResultDetailsId?: number;
}

export interface CartItem {
  id: number;
  medicine: PharmacyMedicine;
  quantity: number;
  total_price: number;
  OneMGSearchAllResultDetailsId?: string;
}

export interface CartSummary {
  items: CartItem[];
  total_amount: number;
  discount_amount: number;
  coupon_code?: string;
  final_amount: number;
  delivery_charges: number;
}

export interface PharmacyCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value?: number;
  description?: string;
}

export interface PharmacyAddress {
  id: number;
  type: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  is_default?: boolean;
}

export interface EmployeeDeliveryAddress {
  EmployeeAddressDetailsId: number;
  EmployeeRefId?: number;
  Relationship?: string;
  RelationShip?: number;
  AddressType: string;
  AddressLineOne: string;
  AddressLineTwo?: string;
  Landmark?: string;
  StateId?: number;
  StateName?: string;
  CityId?: number;
  DistrictName?: string;
  Pincode: string;
  MobileNo?: string;
  ContactNo?: string;
  IsDefault: boolean;
  EmployeeName?: string;
  EmployeeDependentDetailsId?: number;
  Latitude?: string;
  Longitude?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  message: string;
  status: string;
}

export type ProductDetailsData = any;
export type StoredProductDetails = any;
export type PillowMedicine = any;
export type OneMGPharmacyAddToCartDetailsRequest = any;