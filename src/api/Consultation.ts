
import {
  CRMFetchDoctorSpecializationDetails, CRMFetchDoctorLanguagesDetails, CRMFetchDoctorTypesDetails, CRMFetchDoctorPincodeDetails
  , CRMConsultationDoctorDetailsRequest, CRMConsultationDoctorDetailsResponse, TimeSlotRequest, TimeSlotResponse, BookAppointmentRequest, CRMSaveBookAppointmentResponse, InsertCartResponse,
  DependentRequest,
  DependentResponse, CRMSponsoredServicesRequest, CRMSponsoredStatusResponse, ApolloClinic,
  ApolloDoctorsSlotRequest, ApolloDoctorSlotsApiResponse
} from '../types/Consultation';
import { api } from '../services/api';

export const ConsultationAPI = {

  LoadDoctorSpecializations: async (): Promise<CRMFetchDoctorSpecializationDetails[]> => {
    try {
      const response = await api.get('/api/consultation/doctor-specializations/');
      console.log("LoadDoctorSpecializations Raw Response:", response.data);

      let rawData: any[] = [];
      const data: any = response.data;

      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.data)) {
        rawData = data.data;
      } else if (data && Array.isArray(data.results)) {
        rawData = data.results;
      }

      const mappedData = rawData.map((item: any) => ({
        DoctorSpecializationsId: item.id !== undefined ? item.id : (item.DoctorSpecializationsId || 0),
        Specializations: item.name || item.Name || item.Specializations || "Unknown Specialization",
        ImageName: item.image || item.ImageName || null,
        Imagepath: item.image || item.Imagepath || null,
        Description: item.description || item.Description || "",
        IsActive: (item.is_active === true || item.is_active === 1 || item.IsActive === 1 || item.IsActive === true) ? 1 : 0,
      })) as CRMFetchDoctorSpecializationDetails[];

      console.log("Mapped Specializations Data:", mappedData);
      return mappedData;
    } catch (error: any) {
      console.error('Error loading doctor specializations:', error.response || error);
      throw error;
    }
  },

  GetDoctorLanguages: async (): Promise<CRMFetchDoctorLanguagesDetails[]> => {
    try {
      const response = await api.get('/api/consultation/languages/');
      console.log("GetDoctorLanguages Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      return rawData.map((item: any) => ({
        LanguageId: item.id || item.LanguageId,
        LanguageDescription: item.name || item.LanguageDescription,
        ...item
      })) as CRMFetchDoctorLanguagesDetails[];
    } catch (error: any) {
      console.error('Error loading doctor languages:', error.response || error);
      throw error;
    }
  },

  GetDoctorPincodes: async (): Promise<CRMFetchDoctorPincodeDetails[]> => {
    try {
      const response = await api.get('/api/consultation/pincodes/');
      console.log("GetDoctorPincodes Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      return rawData.map((item: any) => ({
        PincodeId: item.id || item.PincodeId,
        Pincode: item.code || item.Pincode,
        ...item
      })) as CRMFetchDoctorPincodeDetails[];
    } catch (error: any) {
      console.error('Error loading doctor pincodes:', error.response || error);
      throw error;
    }
  },

  GetDoctorTypes: async (): Promise<CRMFetchDoctorTypesDetails[]> => {
    try {
      const response = await api.get('/api/consultation/vendors/');
      console.log("GetDoctorTypes Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      return rawData.map((item: any) => ({
        DoctorTypeDetailsId: item.id || item.DoctorTypeDetailsId,
        DoctorTypeDescription: item.name || item.DoctorTypeDescription,
        ...item
      })) as CRMFetchDoctorTypesDetails[];
    } catch (error: any) {
      console.error('Error loading doctor types:', error.response || error);
      throw error;
    }
  },

  CRMLoadTimeSlots: async (requestData: TimeSlotRequest): Promise<TimeSlotResponse[]> => {
    try {
      // User explicitly requested ONLY the endpoint shown in the 2nd image: /api/appointments/doctor-availability/
      // The 1st image showed unwanted parameters like dc_unique_name
      const params = {
        doctor: requestData.doctorId,
        date: requestData.Date
      };

      console.log("🚀 [API] Fetching Doctor Availability (GET Request):", params);

      // Changed from POST to GET as per user request to fix 400 error
      const response = await api.get('/api/appointments/doctor-availability/', {
        params: params
      });

      console.log("Doctor Availability Raw Response:", response.data);

      // Handle different response structures aggressively
      let rawData: any[] = [];
      const resVal: any = response.data;

      if (Array.isArray(resVal)) {
        rawData = resVal;
      } else if (resVal && typeof resVal === 'object') {
        // Check common keys
        if (Array.isArray(resVal.data)) rawData = resVal.data;
        else if (Array.isArray(resVal.results)) rawData = resVal.results;
        else if (Array.isArray(resVal.slots)) rawData = resVal.slots;
        else if (Array.isArray(resVal.availability)) rawData = resVal.availability;
        else if (Array.isArray(resVal.doctor_slots)) rawData = resVal.doctor_slots;
        else if (Array.isArray(resVal.appointment_slots)) rawData = resVal.appointment_slots;
        else if (Array.isArray(resVal.doctorAvailability)) rawData = resVal.doctorAvailability;
        else if (Array.isArray(resVal.items)) rawData = resVal.items;

        // If still empty, try to find any array in the object
        if (rawData.length === 0) {
          const firstArrayKey = Object.keys(resVal).find(key => Array.isArray(resVal[key]));
          if (firstArrayKey) {
            console.log(`🔍 [API] Found array in key: ${firstArrayKey}`);
            rawData = resVal[firstArrayKey];
          }
        }
      }

      console.log(`✅ [API] Final Raw Data Count: ${rawData.length}`);

      // Helper function to format time
      const formatTime = (time24: string): string => {
        if (!time24) return '';
        const [hoursStr, minutesStr] = time24.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = minutesStr || '00';
        const modifier = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${modifier}`;
      };

      const mappedSlots = rawData.map((item: any) => {
        // Support both new (start_time) and legacy (time) fields
        const startTime = item.start_time || item.SlotTime || item.time || item.Time || item.startTime;
        const endTime = item.end_time || item.endTime || item.SlotEndTime;

        let displayTime = '';
        if (startTime) {
          // If already has period, use as is, otherwise format
          if (startTime.includes('AM') || startTime.includes('PM')) {
            displayTime = startTime;
          } else {
            displayTime = formatTime(startTime);
          }

          if (endTime && !displayTime.includes('-')) {
            if (endTime.includes('AM') || endTime.includes('PM')) {
              displayTime += ` - ${endTime}`;
            } else {
              displayTime += ` - ${formatTime(endTime)}`;
            }
          }
        }

        return {
          TimeId: item.id || item.slot_id || item.SlotId || item.TimeId || Math.random(), // Ensure ID exists
          Time: displayTime || startTime || "00:00",
          TimeZone: true,
          Date: item.date || item.Date || item.slot_date || requestData.Date // Fallback to requested date if missing in slot
        };
      }) as TimeSlotResponse[];

      console.log("Mapped Time Slots:", mappedSlots);
      return mappedSlots;

    } catch (error: any) {
      console.error("Error loading time slots:", error.response || error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  },

  CRMSaveBookAppointmentDetails: async (appointmentData: BookAppointmentRequest): Promise<CRMSaveBookAppointmentResponse> => {
    try {
      // Determine speciality_id
      let specialityIdNum = 0;
      if (appointmentData.Specialization) {
        const specIds = appointmentData.Specialization.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
        specialityIdNum = specIds[0] || 0;
      }

      // BACK TO JSON - Postman used JSON for this call
      const payload = {
        doctor_id: Number(appointmentData.DoctorId || 0),
        speciality_id: specialityIdNum
      };

      console.log("📤 [API] Sending JSON to /api/appointments/select-doctor/", payload);

      const response = await api.post('/api/appointments/select-doctor/', payload, {
        withCredentials: true
      });

      console.log("✅ [API] select-doctor response:", response.data);

      const result = response.data as any;

      // Check if response indicates failure, but ignore "Doctor & specialization selected successfully"
      // which is actually a success message despite potential Success: false or missing flag
      const successMessage = (result.Message || result.message || "").toLowerCase();
      const isSuccessMessage = successMessage.includes("selected successfully") ||
        successMessage.includes("doctor & specialization selected");

      if (result.Success === false && !isSuccessMessage) {
        console.error("❌ [API] Appointment creation failed:", result.Message);
        return {
          Success: false,
          Message: result.Message || "Appointment booking failed",
          CaseLead_Id: "0"
        };
      }

      // Helper to safely extract CaseLeadId from various possible locations
      const extractCaseLeadId = (res: any): string => {
        // Log all keys to help debugging
        try {
          console.log("🔍 [API] Response Keys:", Object.keys(res));
          if (res.data) console.log("🔍 [API] Nested Data Keys:", Object.keys(res.data));
        } catch (e) { }

        // Level 1 checks
        if (res.CaseLead_Id) return res.CaseLead_Id.toString();
        if (res.caseLead_Id) return res.caseLead_Id.toString();
        if (res.CaseLeadId) return res.CaseLeadId.toString();
        if (res.case_lead_id) return res.case_lead_id.toString();
        if (res.case_id) return res.case_id.toString();
        if (res.lead_id) return res.lead_id.toString();
        if (res.id) return res.id.toString();

        // Level 2 checks (nested data)
        if (res.data) {
          if (res.data.CaseLead_Id) return res.data.CaseLead_Id.toString();
          if (res.data.case_lead_id) return res.data.case_lead_id.toString();
          if (res.data.case_id) return res.data.case_id.toString();
          if (res.data.lead_id) return res.data.lead_id.toString();
          if (res.data.id) return res.data.id.toString();
        }

        return "0";
      };

      const extractedId = extractCaseLeadId(result);
      console.log(`🔍 [API] Extracted CaseLeadId: ${extractedId} from response`, result);

      return {
        Success: true,
        Message: result.Message || result.message || "Appointment booked successfully",
        CaseLead_Id: extractedId
      };
    } catch (error: any) {
      console.error('❌ [API ERROR] Error in CRMSaveBookAppointmentDetails:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      const errorMsg = error.response?.data?.Message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to book appointment";

      return {
        Success: false,
        Message: errorMsg,
        CaseLead_Id: "0"
      };
    }
  },

  CRMCustomerInsertCartItemDetails: async (
    appointmentData: {
      CaseLead_Id: string | number;
      EmployeeRefId: number;
      CaseFor: number;
      EmployeeDependentDetailsId: number;
      CaseType: string;
      ProductId: number;
      DCId: number;
      SponsoredStatus: number;
      TestPackageTypeId: number;
      CartUniqueId: number;
      DoctorId?: number;
      AppointmentDate?: string;
      Symptoms?: string;
      Specialization?: string;
      documents?: File[];
    }
  ): Promise<InsertCartResponse> => {
    try {
      const fullDateTime = appointmentData.AppointmentDate || "";
      let datePart = fullDateTime.split(' ')[0] || "";
      let timePart = fullDateTime.split(' ').slice(1).join(' ') || "";

      const isSelf = (appointmentData.CaseFor as any) === 1 || (appointmentData.CaseFor as any) === "1";

      const formatTo12Hour = (timeStr: string) => {
        if (!timeStr) return "";
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        let [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      };

      const doctorIdNum = Number(appointmentData.DoctorId || 0);
      const prodIdNum = Number(appointmentData.ProductId);

      // Mapping mode correctly: 1=video, 2=tele, 3=clinic (in-person)
      const modeVal = prodIdNum === 1 ? 'video' : (prodIdNum === 2 ? 'tele' : 'clinic');
      const timeVal = formatTo12Hour(timePart);

      let specialityIdNum = 0;
      if (appointmentData.Specialization) {
        const specValue = String(appointmentData.Specialization);
        const specIds = specValue.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
        specialityIdNum = specIds[0] || 0;
      }

      // JSON PAYLOAD - Backend expects JSON for this endpoint with required fields.
      const jsonPayload: any = {
        doctor: doctorIdNum,
        doctor_id: doctorIdNum,
        case_lead_id: Number(appointmentData.CaseLead_Id || 0),
        employee_id: Number(appointmentData.EmployeeRefId || 0),
        appointment_date: datePart,
        appointment_time: timeVal,
        mode: modeVal,
        symptoms: appointmentData.Symptoms || "General Consultation",
        specialization: specialityIdNum,
        speciality_id: specialityIdNum,
        for_whom: isSelf ? "self" : "dependant"
      };

      // Include dependant_id only if not self
      if (!isSelf) {
        // Backend strictly requires dependant_id if for_whom is 'dependant'
        jsonPayload.dependant_id = Number(appointmentData.EmployeeDependentDetailsId || 0);
      }

      console.log("� [API] Prepared Base Payload:", jsonPayload);

      let response;
      const hasDocuments = appointmentData.documents && appointmentData.documents.length > 0;

      if (hasDocuments) {
        // Use FormData only if files are present
        const formData = new FormData();
        Object.keys(jsonPayload).forEach(key => {
          formData.append(key, jsonPayload[key].toString());
        });
        appointmentData.documents?.forEach((file: any) => {
          formData.append('documents', file);
        });

        console.log("📤 [API] Sending FormData (with files) to /api/appointments/add-appointment-to-cart/");
        response = await api.post('/api/appointments/add-appointment-to-cart/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      } else {
        // Use strict JSON for standard requests to satisfy backend requirements
        console.log("📤 [API] Sending strict JSON to /api/appointments/add-appointment-to-cart/");
        response = await api.post('/api/appointments/add-appointment-to-cart/', jsonPayload, {
          withCredentials: true
        });
      }

      const result = response.data as any;
      console.log("✅ [API] Cart Insertion Response:", result);

      return {
        Success: true,
        Message: result.Message || result.message || "Item added to cart",
        CartDetailsId: result.CartDetailsId || result.cart_details_id,
        CartUniqueId: result.CartUniqueId || result.cart_unique_id
      };
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorStatus = error.response?.status;

      console.error("❌ [API ERROR] Error in CRMCustomerInsertCartItemDetails:", {
        status: errorStatus,
        statusText: error.response?.statusText,
        data: errorData,
        message: error.message,
        payload: appointmentData
      });

      let errorMsg = "Failed to add item to cart";
      if (errorData) {
        if (typeof errorData === 'object') {
          errorMsg = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ');
        } else if (typeof errorData === 'string') {
          // If it's an HTML error page from backend, don't show the whole thing
          if (errorData.includes('<!DOCTYPE') || errorData.includes('<html')) {
            errorMsg = `Server Error (${errorStatus})`;
          } else {
            errorMsg = errorData.substring(0, 200); // Truncate just in case
          }
        }
      }

      return {
        Success: false,
        Message: errorMsg
      };
    }
  },

  CRMLoadDoctorListDetails: async (specialityId: number, employeeRefId: number, districtId: number): Promise<CRMConsultationDoctorDetailsResponse[]> => {
    try {
      // User requested to use ONLY /api/doctors_details/professional/
      // and remove the personal details endpoint.
      const params: any = {};
      if (specialityId) params.specialityId = specialityId;
      if (employeeRefId) params.employeeRefId = employeeRefId;
      if (districtId) params.city = districtId;

      console.log("🚀 [API] Fetching Doctors from /api/doctors_details/professional/", params);

      const response = await api.get('/api/doctors_details/professional/', { params });

      console.log("Doctors Raw Response:", response.data);

      let rawData: any[] = [];
      const resData: any = response.data;
      if (Array.isArray(resData)) {
        rawData = resData;
      } else if (resData && Array.isArray(resData.data)) {
        rawData = resData.data;
      } else if (resData && Array.isArray(resData.results)) {
        rawData = resData.results;
      }

      console.log(`✅ [API] Fetched ${rawData.length} doctors from professional endpoint`);

      // Validate that we only have real doctors from backend
      // RELAXED FILTER: Show everything returned by the professional API
      const validDoctors = rawData.filter(item => {
        // Just ensure it has an ID
        const hasId = item.id || item.DoctorId;
        return hasId;
      });

      // Map doctors to frontend interface
      const mappedData = validDoctors.map((item: any) => {
        let vendorName = "";
        if (item.vendor && typeof item.vendor === 'object') {
          vendorName = item.vendor.name || item.vendor.Name || "";
        } else if (typeof item.vendor === 'string') {
          vendorName = item.vendor;
        }

        // Check for name variations
        const docName = item.name || item.Name || item.full_name || item.DoctorName || "Doctor";

        // Handle specialization mapping robustly
        let specName = "";
        let specIds = "";

        // Collect all possible specialization fields
        const possibleSpecFields = [
          item.specialization, item.speciality, item.Specialization, item.Speciality,
          item.specialization_name, item.speciality_name, item.specializations, item.specialities
        ].filter(Boolean);

        for (const s of possibleSpecFields) {
          if (Array.isArray(s) && s.length > 0) {
            if (typeof s[0] === 'object') {
              specName = s[0].name || s[0].Name || s[0].specialization || s[0].speciality || "";
              specIds = s.map((obj: any) => obj.id || obj.Id || obj.specialization_id || obj.speciality_id).filter(Boolean).join(",");
            } else if (typeof s[0] === 'string' && isNaN(Number(s[0]))) {
              specName = s[0];
              specIds = s.join(",");
            } else if (s[0]) {
              specIds = s.map(String).join(",");
            }
          } else if (typeof s === 'object') {
            specName = s.name || s.Name || s.specialization || s.speciality || "";
            specIds = String(s.id || s.Id || s.specialization_id || s.speciality_id || "");
          } else if (typeof s === 'string' && isNaN(Number(s))) {
            specName = s;
            specIds = s;
          } else if (s) {
            // It's a number or numeric string (ID)
            specIds = String(s);
          }
          if (specName) break; // Stop if we found a name
        }

        // Final safety override based on user provided mapping
        if (specIds.includes("2")) {
          specName = "Dentist";
          specIds = "2"; // Force only dentist if ID 2 is present
        } else if (specIds.includes("1") && (!specName || specName.toLowerCase().includes("general"))) {
          specName = "Cardiologist";
        } else if (specIds.includes("3") && (!specName || specName.toLowerCase().includes("general"))) {
          specName = "Ophthalmologist";
        }

        // Map qualification
        let qualification = "";
        if (Array.isArray(item.qualification)) {
          // Mapping based on user provided JSON: item.qualification is just a string "MBBS", but if it were an array
          // The current user JSON shows "qualification": "MBBS" directly.
          // But keeping array check just in case.
          qualification = item.qualification.map((q: any) => q.name || q.qualification || q).join(", ");
        } else if (typeof item.qualification === 'string') {
          qualification = item.qualification;
        }

        // Map languages
        let language = "";
        if (Array.isArray(item.language)) {
          // Backend returns array of objects: [{id: 1, name: "English", ...}, ...]
          language = item.language.map((l: any) => l.name || l.language || l.LanguageDescription || "").filter(Boolean).join(", ");
        } else if (typeof item.language === 'string') {
          language = item.language;
        }

        // Map fees (Backend returns string "1500.00")
        const fees = item.consultation_fee ? parseFloat(item.consultation_fee) : 0; // Convert string to number

        const extractDoctorId = (item: any) => {
          if (item.id) return Number(item.id);
          if (item.DoctorId) return Number(item.DoctorId);
          if (item.doctor_id) return Number(item.doctor_id);
          if (item.doctor) {
            if (typeof item.doctor === 'object') return Number(item.doctor.id || item.doctor.DoctorId || 0);
            return Number(item.doctor);
          }
          return 0;
        };

        // Construct final object
        return {
          DoctorId: extractDoctorId(item),
          DoctorName: docName,
          DoctorDetails: item.bio || item.details || item.DoctorDetails || "",
          DoctorMobileNumber: item.mobile_no || item.DoctorMobileNumber || "",
          DoctorEmailId: item.email || item.DoctorEmailId || "",
          DoctorTypeDescription: vendorName || item.DoctorTypeDescription || "Welleazy",
          DoctorRegistrationId: item.license_number || item.DoctorRegistrationId || "",
          ConsultationMode: item.e_consultation ? "Video Consultation" : (item.in_clinic ? "In-Clinic" : (item.ConsultationMode || "")),

          // Default/Missing fields
          DoctorImage: item.profile_photo || item.image || item.DoctorImage || null,
          VendorImageUrl: "",
          DoctorImageUrl: item.image || item.DoctorImageUrl || "",
          ServiceProvider: "",
          EmpanelFor: "",
          Service: [
            (item.e_consultation === true || item.e_consultation === 1) ? "Video Consultation" : "",
            (item.in_clinic === true || item.in_clinic === 1) ? "In-Person Consultation" : "",
            item.service || item.Service || ""
          ].filter(Boolean).join(", ") || "Consultation",
          Qualification: qualification || item.Qualification || "",
          Specialization: specName || "General Physician",
          DoctorSpecializations: specIds,
          Language: language || item.Language || "English",
          DistrictId: districtId || item.DistrictId || 0,
          FromTime: "",
          ToTime: "",
          ConsultationCount: 0,
          ClinicId: item.clinic_id || item.ClinicId || (item.doctor && typeof item.doctor === 'object' ? (item.doctor.clinic_id || item.doctor.ClinicId || 0) : 0) || item.hospital_id || 0,
          ClinicName: item.clinic_name || item.ClinicName || (item.hospital_name) || "",
          DCUniqueName: vendorName || item.DCUniqueName || "Welleazy",
          DoctorURL: "",
          ConsultationFees: fees // Mapping the fee correctly
        };
      });

      console.log(`✅ [API] Returning ${mappedData.length} valid doctors to display`);
      console.log("📋 [API] Sample doctor data:", mappedData.slice(0, 2));
      return mappedData as unknown as CRMConsultationDoctorDetailsResponse[];
    } catch (err: any) {
      console.error("Error fetching doctor details:", err);
      return [];
    }
  },

  CRMSaveCustomerCartDetails: async (
    appointmentData: {
      CaseleadId: number | string;
      AppointmentDateTime: string;
      DCId: number;
      CreatedBy: number;
      CartDetailsId: number;
      StMId?: string;
      DCSelection?: string;
      TestPackageCode?: string;
    }
  ): Promise<InsertCartResponse> => {
    try {
      const payload = {
        CaseleadId: appointmentData.CaseleadId,
        AppointmentDateTime: appointmentData.AppointmentDateTime,
        DCId: appointmentData.DCId,
        CreatedBy: appointmentData.CreatedBy,
        CartDetailsId: appointmentData.CartDetailsId,
        StMId: appointmentData.StMId ?? "",
        DCSelection: appointmentData.DCSelection ?? "",
        TestPackageCode: appointmentData.TestPackageCode ?? ""
      };

      const response = await api.post('/api/appointments/cart/finalize/', payload);

      const result = response.data as any;
      console.log("Server response:", result);

      return {
        Success: true,
        Message: result.Message,
        CartDetailsId: result.CartDetailsId
      };
    } catch (error: any) {
      console.error("Error saving appointment cart item:", error.response || error);
      return {
        Success: false,
        Message: error.response?.data?.Message || error.message || "Failed to save cart item"
      };
    }
  },

  CRMInsertUpdateEmployeeDependantDetails: async (payload: DependentRequest): Promise<DependentResponse> => {
    try {
      // Helper to convert DD/MM/YYYY to YYYY-MM-DD
      const convertDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      };

      const requestBody = {
        employee_id: payload.EmployeeId,
        relationship_id: payload.DependentRelationShip,
        name: payload.DependentName,
        mobile_no: payload.DependentMobileNo,
        gender: payload.DependentGender,
        dob: convertDate(payload.DependentDOB),
        email: payload.DependentEmailId || "",
        // Optional fields if backend requires them, but likely inferred or optional
        marital_status: payload.MaritalStatus,
        occupation: payload.Occupation
      };

      const response = await api.post('/api/dependants/', requestBody);
      return response.data as DependentResponse;
    } catch (error: any) {
      console.error("Error in CRMInsertUpdateEmployeeDependantDetails:", error.response || error);
      throw error;
    }
  },

  CRMSponsoredServices: async (payload: { EmployeeRefId: number; ServiceOfferedId: string }): Promise<{ ServiceAvailable: boolean }> => {
    try {
      const response = await api.post('/api/sponsored-packages/check-eligibility/', payload);
      return response.data as { ServiceAvailable: boolean };
    } catch (error: any) {
      console.error('Error fetching sponsored services:', error.response || error);
      // Return false instead of throwing to allow the booking flow to continue with standard pricing
      if (error.response?.status === 404) {
        console.warn("Sponsored services check endpoint not found, continuing with standard booking.");
        return { ServiceAvailable: false };
      }
      throw error;
    }
  },

  CRMLoadApolloClinics: async (doctorId: number, DoctorTypeDescription: string): Promise<ApolloClinic[]> => {
    try {
      const url = `/api/appointments/apollo-clinics/${doctorId}/${DoctorTypeDescription}/`;
      console.log(`📡 [API] Requesting Apollo Clinics: ${url}`);
      const response = await api.get(url);
      console.log(`✅ [API] Clinics Response:`, response.data);
      return response.data as ApolloClinic[];
    } catch (error: any) {
      console.error('Error loading Apollo clinics:', error.response || error);
      throw error;
    }
  },

  ApolloHospitalDoctorSlotDetails: async (payload: ApolloDoctorsSlotRequest): Promise<ApolloDoctorSlotsApiResponse> => {
    try {
      const response = await api.post('/api/appointments/apollo-slots/', {
        hospitalId: payload.clinicId,
        doctorId: payload.doctorId,
        appointmentDate: payload.appointmentDate,
      });
      return response.data as ApolloDoctorSlotsApiResponse;
    } catch (error: any) {
      console.error('Error loading Apollo doctor slots:', error.response || error);
      throw error;
    }
  },

  // Added new function for filtering doctors by multiple criteria
  SearchDoctors: async (filters: {
    specialization?: string,
    vendor?: string,
    language?: string,
    name?: string,
    city?: string,
    pincode?: string
  }): Promise<CRMConsultationDoctorDetailsResponse[]> => {
    try {
      console.log(`🔍 [API] Searching doctors with filters:`, filters);
      const response = await api.get('/api/doctors_details/professional/search', {
        params: filters
      });
      console.log("✅ [API] Data received:", response.data);

      let rawData: any[] = [];
      const data: any = response.data;

      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.data)) {
        rawData = data.data;
      } else if (data && Array.isArray(data.results)) {
        rawData = data.results;
      }

      return rawData.map((item: any) => {
        let vendorName = "";
        if (item.vendor && typeof item.vendor === 'object') {
          vendorName = item.vendor.name || item.vendor.Name || "";
        } else if (typeof item.vendor === 'string') {
          vendorName = item.vendor;
        }

        const docName = item.name || item.Name || item.full_name || item.DoctorName || "Doctor";

        let specName = "";
        let specIds = "";

        const possibleSpecFields = [
          item.specialization, item.speciality, item.Specialization, item.Speciality,
          item.specialization_name, item.speciality_name, item.specializations, item.specialities
        ].filter(Boolean);

        for (const s of possibleSpecFields) {
          if (Array.isArray(s) && s.length > 0) {
            if (typeof s[0] === 'object') {
              specName = s[0].name || s[0].Name || s[0].specialization || s[0].speciality || "";
              specIds = s.map((obj: any) => obj.id || obj.Id || obj.specialization_id || obj.speciality_id).filter(Boolean).join(",");
            } else if (typeof s[0] === 'string' && isNaN(Number(s[0]))) {
              specName = s[0];
              specIds = s.join(",");
            } else if (s[0]) {
              specIds = s.map(String).join(",");
            }
          } else if (typeof s === 'object') {
            specName = s.name || s.Name || s.specialization || s.speciality || "";
            specIds = String(s.id || s.Id || s.specialization_id || s.speciality_id || "");
          } else if (typeof s === 'string' && isNaN(Number(s))) {
            specName = s;
            specIds = s;
          } else if (s) {
            specIds = String(s);
          }
          if (specName) break;
        }

        // Final safety override based on user provided mapping
        if (specIds.includes("2")) {
          specName = "Dentist";
          specIds = "2"; // Force only dentist if ID 2 is present
        } else if (specIds.includes("1") && (!specName || specName.toLowerCase().includes("general"))) {
          specName = "Cardiologist";
        } else if (specIds.includes("3") && (!specName || specName.toLowerCase().includes("general"))) {
          specName = "Ophthalmologist";
        }
        const extractDoctorIdForSearch = (item: any) => {
          if (item.id) return Number(item.id);
          if (item.DoctorId) return Number(item.DoctorId);
          if (item.doctor_id) return Number(item.doctor_id);
          if (item.doctor) {
            if (typeof item.doctor === 'object') return Number(item.doctor.id || item.doctor.DoctorId || 0);
            return Number(item.doctor);
          }
          return 0;
        };

        return {
          DoctorId: extractDoctorIdForSearch(item),
          DoctorName: docName,
          Experience: item.experience_years?.toString() || item.Experience?.toString() || "",
          Experience1: item.experience_years || 0,
          Age: item.age || 0,
          DOB: item.dob || "",
          Specialization: specName || "General Physician",
          DoctorSpecializations: specIds,
          Language: item.language ? (Array.isArray(item.language) ? item.language.map((l: any) => typeof l === 'object' ? l.name : l).join(", ") : item.language) : "",
          CityName: item.city_name || "India",
          Address: item.address || item.clinic_address || "",
          Pincode: item.clinic_address || "",
          DoctorTypeDescription: vendorName || "Welleazy",
          DoctorTypeId: (item.vendor && item.vendor.id) ? item.vendor.id : 0,
          Fee: item.consultation_fee || "0",
          DoctorRegistrationId: item.license_number || "",
          ConsultationMode: item.e_consultation ? "Video Consultation" : (item.in_clinic ? "In-Clinic" : "Consultation"),
          DoctorImage: item.profile_photo || item.image || null,
          VendorImageUrl: "",
          DoctorImageUrl: item.image || "",
          ServiceProvider: "",
          EmpanelFor: "",
          Service: [
            (item.e_consultation === true || item.e_consultation === 1) ? "Video Consultation" : "",
            (item.in_clinic === true || item.in_clinic === 1) ? "In-Person Consultation" : "",
            item.service || item.Service || ""
          ].filter(Boolean).join(", ") || "Consultation",
          Qualification: item.qualification || "",
          DistrictId: 0,
          FromTime: "",
          ToTime: "",
          ConsultationCount: 0,
          ClinicId: item.clinic_id || (item.hospital_id) || 0,
          ClinicName: item.clinic_name || (item.hospital_name) || "",
          DCUniqueName: vendorName || "Welleazy",
          DoctorURL: "",
          ConsultationFees: item.consultation_fee ? parseFloat(item.consultation_fee) : 0,
        };
      }) as unknown as CRMConsultationDoctorDetailsResponse[];
    } catch (error: any) {
      console.error('❌ [API ERROR] Error searching doctors:', error.response || error);
      return [];
    }
  },

  // View all cart items
  ViewCartItems: async (): Promise<any> => {
    try {
      const response = await api.get('/api/appointments/cart/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cart items:', error.response || error);
      throw error;
    }
  },

  // Reschedule appointment
  RescheduleAppointment: async (appointmentId: number, data: { appointment_date: string, appointment_time: string }): Promise<any> => {
    try {
      const response = await api.patch(`/api/appointments/reschedule/${appointmentId}/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error.response || error);
      throw error;
    }
  },

  // Create voucher
  CreateVoucher: async (appointmentId: number): Promise<any> => {
    try {
      const response = await api.post(`/api/appointments/voucher/create/${appointmentId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error creating voucher:', error.response || error);
      throw error;
    }
  },

  // Delete cart item
  RemoveCartItem: async (itemId: number): Promise<any> => {
    try {
      const response = await api.delete(`/api/appointments/cart/item/${itemId}/remove/`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing cart item:', error.response || error);
      throw error;
    }
  },

  // Get doctors by language (maintained for backward compatibility)
  GetDoctorsByLanguage: async (language: string): Promise<CRMConsultationDoctorDetailsResponse[]> => {
    return ConsultationAPI.SearchDoctors({ language });
  },
};
