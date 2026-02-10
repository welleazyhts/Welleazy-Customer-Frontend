import { api } from '../services/api';
import { CartItemDetails, CartStatusResponse } from '../types/CheckOut';

const API_URL = process.env.REACT_APP_API_URL || "";

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
        CartDetailsId: item.id || item.CartDetailsId || 0,
        CartItemDetailsId: item.id || item.CartItemDetailsId || 0,
        PersonName: item.PersonName || item.patient_name || item.dependant_name || item.dependant?.name || item.beneficiary_name || "Patient",
        Relationship: item.Relationship || item.relationship || item.dependant?.relationship || "Self",
        ItemName: item.ItemName || item.item_type || item.note || "Consultation",
        ItemId: item.ItemId || item.health_package || item.tests?.[0] || 0,
        TestPackageType: item.visit_type || item.TestPackageType || 0,
        ItemAmount: parseFloat(item.final_price || item.price || item.ItemAmount || "0"),
        Quantity: item.Quantity || 1,
        AppointmentDate: item.AppointmentDate || item.appointment_date || null,
        AppointmentTime: item.AppointmentTime || item.appointment_time || null,
        DeliveryDateTime: null,
        TotalAmount: parseFloat(item.final_price || item.price || item.TotalAmount || "0"),
        DCId: item.DCId || item.diagnostic_center || 0,
        CaseRefId: item.CaseRefId || item.id || 0,
        AppointmentId: item.AppointmentId || null,
        center_name: item.center_name || item.center?.name || null,
        city: item.city || item.doctor?.city || item.DoctorCity || null,
        DistrictName: item.DistrictName || item.doctor?.city || null,
        DistrictId: item.DistrictId || 0,
        DoctorCity: item.DoctorCity || item.doctor?.city || null,
        SponsoredStatus: item.SponsoredStatus || (item.sponsored_package ? 1 : 0),
        MobileNo: item.MobileNo || item.mobile_no || item.patient_mobile || "",
        Emailid: item.Emailid || item.email || item.patient_email || "",
        CartUniqueId: cartUniqueId,
        DoctorId: item.DoctorId || item.doctor?.id || 0,
        DoctorName: item.DoctorName || item.doctor_name || item.doctor?.full_name || item.doctor?.name || "Doctor",
        DCAddress: item.DCAddress || item.address || item.center?.address || null,
        DRAddress: item.DRAddress || item.address || null,
        DoctorSpeciality: item.DoctorSpeciality || item.specialization || item.doctor_specialization || item.doctor?.specialization || item.speciality_name || "",
        ClinicName: item.ClinicName || item.clinic_name || item.doctor?.clinic_name || "",
        VisitType: item.VisitType?.toString() || item.visit_type?.toString() || "1",
        StMId: item.StMId || null,
        DCSelection: item.DCSelection || null,
        AppointmentDateTime: item.AppointmentDateTime || (item.appointment_date && item.appointment_time ? `${item.appointment_date}T${item.appointment_time}` : null),
        TestPackageCode: item.TestPackageCode || null,
        VendorId: item.VendorId || 0,
        Message: item.Message || "",
        ...item
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
