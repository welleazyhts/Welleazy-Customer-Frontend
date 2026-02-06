import { api } from '../services/api';
import { CustomerAppointment, PharmacyOrder, PharmacyCouponAddress } from '../types/MyBookings';

export const MyBookingsAPI = {
  // Main bookings list with various filters
  getBookings: async (filters?: {
    status?: string;
    service?: string;
    from?: string;
    to?: string
  }): Promise<any[]> => {
    try {
      const response = await api.get('/api/my-bookings/', { params: filters });
      return response.data as any[];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  // Legacy/Specific methods mapped to new API
  CRMGetCustomerAppointmentDetails: async (payload: { fromDate: string; toDate: string }): Promise<CustomerAppointment[]> => {
    try {
      // Use the generic getBookings but filter by appointment service if required
      // For now, let's just use the same logic as before but through the main helper
      const response = await api.get('/api/my-bookings/', {
        params: {
          from: payload.fromDate,
          to: payload.toDate,
          service: 'appointment' // Force appointment service to match expectation
        }
      });
      return response.data as CustomerAppointment[];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  FetchPharmacyListDetails: async (): Promise<PharmacyOrder[]> => {
    try {
      const response = await api.get('/api/my-bookings/', {
        params: {
          service: 'pharmacy'
        }
      });
      return response.data as PharmacyOrder[];
    } catch (error) {
      console.error("Error fetching pharmacy orders:", error);
      throw error;
    }
  },

  FetchPharmacyCouponListDetails: async (): Promise<PharmacyCouponAddress[]> => {
    try {
      const response = await api.get('/api/my-bookings/', {
        params: {
          service: 'pharmacy-coupon'
        }
      });
      return response.data as PharmacyCouponAddress[];
    } catch (error) {
      console.error("Error fetching pharmacy coupons:", error);
      throw error;
    }
  },

  // Report Upload
  uploadHealthReport: async (appointmentId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/my-bookings/appointments/${appointmentId}/upload-report/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Vouchers and Invoices
  getAppointmentVoucher: async (appointmentId: number): Promise<any> => {
    return api.get(`/api/my-bookings/appointments/${appointmentId}/voucher`);
  },

  downloadInvoice: async (appointmentId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/appointment/${appointmentId}/invoice/pdf/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getPharmacyOrderMedicines: async (orderId: number): Promise<any> => {
    return api.get(`/api/my-bookings/pharmacy/order/${orderId}/medicines/`);
  },

  getPharmacyOrderVoucher: async (orderId: number): Promise<any> => {
    return api.get(`/api/my-bookings/pharmacy/order/${orderId}/voucher`);
  },

  downloadPharmacyVoucherPdf: async (orderId: number): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/my-bookings/pharmacy/order/${orderId}/voucher/download/pdf/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getPharmacyCouponVoucher: async (couponId: number): Promise<any> => {
    return api.get(`/api/my-bookings/pharmacy-coupon/${couponId}/voucher`);
  },

  getLabtestVoucher: async (labtestId: number): Promise<any> => {
    return api.get(`/api/my-bookings/labtest/${labtestId}/voucher/`);
  },

  getSponsoredPackageVoucher: async (packageId: number): Promise<any> => {
    return api.get(`/api/my-bookings/sponsored-package/${packageId}/voucher/`);
  },

  getHealthPackageVoucher: async (packageId: number): Promise<any> => {
    return api.get(`/api/my-bookings/health-package/${packageId}/voucher/`);
  }
};
