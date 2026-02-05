import { api } from '../services/api';
import { CartItemDetails, CartStatusResponse } from '../types/CheckOut';

const API_URL = '';

export const CheckOutAPI = {

  CRMGetCustomerCartDetails: async (employeeRefId: number, cartUniqueId: number): Promise<CartItemDetails[]> => {
    try {
      // Use the new endpoint for fetching cart details
      const response = await api.get('/api/appointments/cart/', {
        params: {
          employeeRefId,
          cartUniqueId
        }
      });

      console.log("CRMGetCustomerCartDetails Response:", response.data);

      const data: any = response.data;
      let items: any[] = [];

      // Handle various response structures
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.items)) {
        items = data.items;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
      } else if (data && Array.isArray(data.results)) {
        items = data.results;
      }

      // Map backend items to frontend CartItemDetails interface
      return items.map((item: any) => ({
        CartDetailsId: item.id || 0,
        CartItemDetailsId: item.id || 0,
        PersonName: item.dependant_name || item.PersonName || "Patient", // Fallback if name missing
        Relationship: item.relationship || item.Relationship || "Self",
        ItemName: item.note || item.ItemName || item.item_type || "Consultation",
        ItemId: item.health_package || item.tests?.[0] || 0,
        TestPackageType: item.visit_type || 0,
        ItemAmount: parseFloat(item.final_price || item.price || "0"),
        Quantity: 1, // Default to 1 as API doesn't seem to have qty
        AppointmentDate: item.appointment_date || item.AppointmentDate || null,
        AppointmentTime: item.appointment_time || item.AppointmentTime || null,
        DeliveryDateTime: null,
        TotalAmount: parseFloat(item.final_price || item.price || "0"),
        DCId: item.diagnostic_center || item.DCId || 0,
        CaseRefId: item.id || 0, // Using ID as ref if missing
        AppointmentId: null,
        center_name: item.center_name || null,
        city: item.doctor?.city || item.DoctorCity || null,
        DistrictName: item.doctor?.city || item.DistrictName || null,
        DistrictId: 0,
        DoctorCity: item.doctor?.city || item.DoctorCity || null,
        SponsoredStatus: item.sponsored_package ? 1 : 0,
        MobileNo: item.mobile_no || item.MobileNo || "",
        Emailid: item.email || item.Emailid || "",
        CartUniqueId: cartUniqueId,
        DoctorId: item.doctor?.id || item.DoctorId || 0,
        DoctorName: item.doctor?.full_name || item.doctor?.name || item.DoctorName || "Doctor",
        DCAddress: item.address || item.DCAddress || null,
        DRAddress: item.address || item.DRAddress || null,
        DoctorSpeciality: item.doctor?.specialization || item.DoctorSpeciality || "",
        ClinicName: item.clinic_name || item.ClinicName || "",
        VisitType: item.visit_type?.toString() || "1",
        StMId: null,
        DCSelection: item.DCSelection || null,
        AppointmentDateTime: item.appointment_date && item.appointment_time ? `${item.appointment_date}T${item.appointment_time}` : null,
        TestPackageCode: null,
        VendorId: 0,
        Message: "",
        ...item // Spread original item to keep any other props
      })) as CartItemDetails[];
    } catch (error) {
      console.error('Error fetching cart details:', error);
      throw new Error('Failed to fetch cart details');
    }
  },
  // In your CheckOutAPI file
  CRMCustomerCarStatustUpdation: async (
    payload: {
      CaseLeadId: number | string;
      CaseType: number | string;
      CartUniqueId: number;
      CartDetailsId: number | string;
      STMId?: string;
      CollectionDate: string;
      DCSelection?: string;
    }
  ): Promise<CartStatusResponse> => {
    try {
      console.log("Sending payload to API:", payload);

      const response = await fetch(
        `${API_URL}/CRMCustomerCartStatustUpdation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            CaseLeadId: payload.CaseLeadId,
            CaseType: payload.CaseType,
            CartUniqueId: payload.CartUniqueId,
            CartDetailsId: payload.CartDetailsId,
            STMId: payload.STMId || "",
            CollectionDate: payload.CollectionDate,
            DCSelection: payload.DCSelection || ""
          })
        }
      );

      console.log("API Response Status:", response.status);
      console.log("API Response Headers:", response.headers);

      const textResponse = await response.text();
      console.log("API RAW TEXT RESPONSE:", textResponse);

      if (!response.ok) {
        console.error("API Error Response:", textResponse);
        throw new Error(`HTTP ${response.status}: ${textResponse}`);
      }

      // Try to parse as JSON
      try {
        const jsonResponse = JSON.parse(textResponse);
        console.log("API JSON RESPONSE:", jsonResponse);
        return jsonResponse;
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

    } catch (error) {
      console.error("API Call Error:", error);
      throw error;
    }
  }



};
