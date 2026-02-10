import { api } from '../services/api';

export const HomeElderlyCareAPI = {
  // 1. Get user data based on service type
  CRMGetCareProgramBookingOptions: async (serviceType: string): Promise<any> => {
    try {
      const response = await api.get(`/api/care-programs/bookings/options/`, {
        params: { service_type: serviceType }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching care program booking options:", error);
      throw error;
    }
  },

  // 2. Create appointment
  CRMCreateCareProgramBooking: async (bookingData: any): Promise<any> => {
    try {
      const response = await api.post(`/api/care-programs/bookings/`, bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating care program booking:", error);
      throw error;
    }
  },

  // 3. List appointments
  CRMListCareProgramBookings: async (): Promise<any> => {
    try {
      const response = await api.get(`/api/care-programs/bookings/`);
      return response.data;
    } catch (error) {
      console.error("Error listing care program bookings:", error);
      throw error;
    }
  },

  // 4. Get single appointment
  CRMGetCareProgramBookingById: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`/api/care-programs/bookings/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching single care program booking:", error);
      throw error;
    }
  },

  // 5. Edit appointment
  CRMUpdateCareProgramBooking: async (id: number, bookingData: any): Promise<any> => {
    try {
      const response = await api.put(`/api/care-programs/bookings/${id}/`, bookingData);
      return response.data;
    } catch (error) {
      console.error("Error updating care program booking:", error);
      throw error;
    }
  },

  // Legacy method - kept for temporary compatibility if needed during transition
  HEPSaveCareProgramsCaseDetails: async (caseData: any): Promise<any> => {
    // We will map this to the new CRMCreateCareProgramBooking in the component
    // but keeping the signature for now to avoid breaking changes immediately
    return HomeElderlyCareAPI.CRMCreateCareProgramBooking(caseData);
  },

  // 7. Get cities by state ID
  CRMGetCitiesByState: async (stateId: number): Promise<any> => {
    try {
      const response = await api.get(`/api/location/cities/by-state/`, {
        params: { state_id: stateId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  },

  // 8. Get all states
  CRMGetStates: async (): Promise<any> => {
    try {
      const response = await api.get(`/api/location/states/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  }
};
