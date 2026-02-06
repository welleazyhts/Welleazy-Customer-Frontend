import {
  PharmacyMedicine,
  PharmacyMedicineResponse,
  PharmacyCategory,
  CartSummary,
  PharmacyCoupon,
  PharmacyAddress,
  CreateOrderResponse
} from '../types/Pharmacy';
import { api } from '../services/api';

// Helper for API calls using the centralized axios instance
const apiCall = async (endpoint: string, method: string = 'GET', body?: any, isFormData: boolean = false) => {
  try {
    const response = await api({
      url: endpoint,
      method: method,
      data: body,
      // Let axios handle multipart headers automatically if body is FormData
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  } catch (error: any) {
    // Error is logged/handled in centralized api service interceptors
    throw error;
  }
};


const mapMedicine = (m: PharmacyMedicineResponse): PharmacyMedicine => ({
  id: m.id,
  name: m.name,
  description: m.description,
  manufacturer: m.vendor_name || 'Unknown',
  price: parseFloat(m.selling_price),
  mrp: parseFloat(m.mrp_price),
  discount: m.discount_percent,
  stock: m.stock_count,
  image: m.image,
  slug: m.id.toString(),
  // Map details if present
  introduction: m.details?.introduction,
  uses: m.details?.uses,
  benefits: m.details?.benefits,
  side_effects: m.details?.side_effects,
  safety_advice: m.details?.safety_advice,
  pack_size: m.pack_size
});

// Helper to map flat cart items from API
const mapCartItem = (item: any): any => ({
  id: item.id,
  medicine: {
    id: item.medicine, // ID is provided directly
    name: item.medicine_name,
    manufacturer: item.vendor_name,
    price: parseFloat(item.selling_price),
    mrp: parseFloat(item.mrp_price),
    discount: 0, // Calculated in UI if needed (mrp > price)
    image: item.image,
    slug: item.medicine.toString(),
    stock: 0
  },
  quantity: item.quantity,
  total_price: parseFloat(item.selling_price) * item.quantity
});

export const PharmacyAPI = {
  // Categories
  getCategories: async (): Promise<PharmacyCategory[]> => {
    return apiCall('/api/pharmacy/categories/');
  },

  // Medicines
  getMedicines: async (): Promise<PharmacyMedicine[]> => {
    const response = await apiCall('/api/pharmacy/medicines/');
    const data = Array.isArray(response) ? response : (response as any).data || [];
    return data.map((m: any) => mapMedicine(m));
  },

  filterMedicines: async (search: string, sort?: string): Promise<PharmacyMedicine[]> => {
    const response = await apiCall('/api/pharmacy/medicines/filter/', 'POST', { search, sort });
    const data = Array.isArray(response) ? response : (response as any).data || [];
    return data.map((m: any) => mapMedicine(m));
  },

  getMedicineDetail: async (slug: string): Promise<PharmacyMedicine> => {
    // Fallback to searching detail since slug == id in our logic
    const response = await apiCall(`/api/pharmacy/medicines/detail/${slug}/`);
    return mapMedicine(response);
  },

  // Cart
  getCart: async (): Promise<CartSummary> => {
    const response = await apiCall('/api/pharmacy/cart/');

    let items = [];
    if (response && response.items) {
      items = response.items.map((item: any) => mapCartItem(item));
    }

    return {
      items: items,
      total_amount: parseFloat(response.total_mrp || '0'),
      discount_amount: parseFloat(response.discount_on_mrp || '0'),
      final_amount: parseFloat(response.total_pay || '0'),
      delivery_charges: parseFloat(response.delivery_charge || '0'),
      coupon_code: response.coupon
    };
  },

  addToCart: async (medicineId: number, quantity: number = 1): Promise<any> => {
    return apiCall('/api/pharmacy/cart/add/', 'POST', { medicine_id: medicineId, quantity });
  },

  removeFromCart: async (itemId: number): Promise<any> => {
    return apiCall(`/api/pharmacy/cart/item/${itemId}/remove/`, 'DELETE');
  },

  increaseQuantity: async (itemId: number): Promise<any> => {
    return apiCall('/api/pharmacy/cart/increase/', 'POST', { item_id: itemId });
  },

  decreaseQuantity: async (itemId: number): Promise<any> => {
    return apiCall('/api/pharmacy/cart/decrease/', 'POST', { item_id: itemId });
  },

  // Coupons
  getCoupons: async (): Promise<PharmacyCoupon[]> => {
    return apiCall('/api/pharmacy/coupons/');
  },

  createCoupon: async (couponData: any): Promise<any> => {
    const formData = new FormData();
    Object.keys(couponData).forEach(key => {
      if (key === 'document' && couponData[key]) {
        formData.append('document', couponData[key]);
      } else if (couponData[key] !== null && couponData[key] !== undefined) {
        formData.append(key, couponData[key]);
      }
    });
    return apiCall('/api/pharmacy/coupons/create/', 'POST', formData, true);
  },

  applyCoupon: async (couponCode: string): Promise<any> => {
    return apiCall('/api/pharmacy/cart/coupon/apply/', 'POST', { coupon: couponCode });
  },

  removeCoupon: async (): Promise<any> => {
    return apiCall('/api/pharmacy/cart/coupon/remove/', 'POST');
  },

  // Address
  getAddresses: async (): Promise<PharmacyAddress[]> => {
    return apiCall('/api/pharmacy/cart/addresses/');
  },

  getAddressTypes: async (): Promise<any> => {
    return apiCall('/api/pharmacy/cart/addresses/types/');
  },

  selectAddressType: async (typeId: number): Promise<any> => {
    return apiCall('/api/pharmacy/cart/addresses/type/select/', 'POST', { address_type_id: typeId });
  },

  selectAddress: async (addressId: number): Promise<any> => {
    return apiCall('/api/pharmacy/cart/addresses/select/', 'POST', { address_id: addressId });
  },

  // Delivery
  estimateDelivery: async (pincode: string): Promise<any> => {
    return apiCall('/api/pharmacy/cart/delivery/estimate/', 'POST', { pincode });
  },

  setDeliveryMode: async (mode: 'cod' | 'online'): Promise<any> => {
    return apiCall('/api/pharmacy/cart/delivery_mode/', 'POST', { delivery_mode: mode });
  },

  // Order
  createOrder: async (): Promise<CreateOrderResponse> => {
    return apiCall('/api/pharmacy/cart/order/create/', 'POST');
  },

  // Prescriptions
  uploadPrescription: async (file: File, notes?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);
    return apiCall('/api/pharmacy/cart/prescription/upload/', 'POST', formData, true);
  },

  getPrescriptions: async (): Promise<any> => {
    return apiCall('/api/pharmacy/cart/prescriptions/');
  },

  downloadPrescription: async (id: number): Promise<any> => {
    const response = await api.get(`/api/pharmacy/cart/prescription/download/${id}/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getEPrescriptions: async (): Promise<any> => {
    return apiCall('/api/pharmacy/cart/e-prescription/');
  }
};