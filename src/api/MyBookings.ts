import { api } from '../services/api';
import { CustomerAppointment, PharmacyOrder, PharmacyCouponAddress } from '../types/MyBookings';

const API_URL = 'http://3.110.32.224';

export const MyBookingsAPI = {

  CRMGetCustomerAppointmentDetails: async (payload: { fromDate: string; toDate: string }): Promise<CustomerAppointment[]> => {
    try {
      const response = await api.get('/api/my-bookings/', {
        params: {
          from: payload.fromDate,
          to: payload.toDate
        }
      });
      return response.data as CustomerAppointment[];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },
  FetchPharmacyListDetails: async (EmployeeRefId: number): Promise<PharmacyOrder[]> => {

    const response = await fetch(
      `${API_URL}/FetchPharmacyListDetails/${EmployeeRefId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pharmacy orders');
    }

    return response.json();
  },

  FetchPharmacyCouponListDetails: async (EmployeeRefId: number): Promise<PharmacyCouponAddress[]> => {

    const response = await fetch(
      `${API_URL}/FetchPharmacyCouponListDetails/${EmployeeRefId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pharmacy orders');
    }

    return response.json();
  },


};
