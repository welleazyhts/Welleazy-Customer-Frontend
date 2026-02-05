
import {
  CRMFetchDoctorSpecializationDetails, CRMFetchDoctorLanguagesDetails, CRMFetchDoctorTypesDetails, CRMFetchDoctorPincodeDetails
  , CRMConsultationDoctorDetailsRequest, CRMConsultationDoctorDetailsResponse, TimeSlotRequest, TimeSlotResponse, BookAppointmentRequest, CRMSaveBookAppointmentResponse, InsertCartResponse,
  DependentRequest,
  DependentResponse, CRMSponsoredServicesRequest, CRMSponsoredStatusResponse, ApolloClinic,
  ApolloDoctorsSlotRequest, ApolloDoctorSlotsApiResponse
} from '../types/Consultation';
import { api } from '../services/api';

export const ConsultationAPI = {

  LoadVendorListDetailsForEye: async (): Promise<CRMFetchDoctorSpecializationDetails[]> => {
    try {
      // Reverted to original endpoint as requested
      const response = await api.get('/api/consultation/doctor-specializations/');
      console.log("LoadVendorListDetailsForEye Raw Response:", response.data);

      let rawData: any[] = [];
      const data: any = response.data;

      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.data)) {
        rawData = data.data;
      } else if (data && Array.isArray(data.results)) {
        rawData = data.results;
      }

      console.log("Raw Data Array Length:", rawData.length);

      const mappedData = rawData.map((item: any) => ({
        DoctorSpecializationsId: item.id !== undefined ? item.id : (item.DoctorSpecializationsId || 0),
        Specializations: item.name || item.Name || item.Specializations || "Unknown Specialization",
        ImageName: item.image || item.ImageName || null,
        Imagepath: item.image || item.Imagepath || null,
        Description: item.description || item.Description || "",
        IsActive: (item.is_active === true || item.IsActive === 1 || item.IsActive === true) ? 1 : 0,
        ...item
      })) as CRMFetchDoctorSpecializationDetails[];

      console.log("Mapped Specializations Data:", mappedData);
      return mappedData;
    } catch (error: any) {
      console.error('Error loading vendor list details for eye:', error.response || error);
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
      // Updated to use the correct doctor availability endpoint (GET method)
      const response = await api.get('/api/appointments/doctor-availability/', {
        params: {
          dc_unique_name: requestData.DCUniqueName,
          time_zone: requestData.TimeZone,
          doctor_id: requestData.doctorId
        }
      });

      console.log("Doctor Availability Raw Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      // Helper function to convert 24-hour time to 12-hour format with AM/PM
      const formatTime = (time24: string): string => {
        if (!time24) return '';

        // time24 format: "09:00:00" or "14:30:00"
        const [hoursStr, minutesStr] = time24.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = minutesStr || '00';

        const modifier = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

        return `${hours}:${minutes} ${modifier}`;
      };

      const mappedSlots = rawData.map((item: any) => {
        // New API structure has start_time and end_time
        const startTime = item.start_time || item.time || item.Time;
        const endTime = item.end_time;

        // Format the time for display
        let displayTime = '';
        if (startTime) {
          displayTime = formatTime(startTime);
          if (endTime) {
            displayTime += ` - ${formatTime(endTime)}`;
          }
        }

        return {
          TimeId: item.id || item.slot_id || item.TimeId,
          Time: displayTime,
          TimeZone: item.time_zone || item.TimeZone || true
        };
      }) as TimeSlotResponse[];

      console.log("Mapped Time Slots:", mappedSlots);
      return mappedSlots;

    } catch (error: any) {
      console.error("Error loading time slots:", error.response || error);
      throw error;
    }
  },

  CRMSaveBookAppointmentDetails: async (appointmentData: BookAppointmentRequest): Promise<CRMSaveBookAppointmentResponse> => {
    try {
      const formData = new FormData();
      formData.append('CaseLeadId', appointmentData.CaseLeadId.toString());
      formData.append('LeadType', appointmentData.LeadType);
      formData.append('CaseRecMode', appointmentData.CaseRecMode);
      formData.append('ServicesOffered', appointmentData.ServicesOffered);
      formData.append('CorporateId', appointmentData.CorporateId.toString());
      formData.append('BranchId', appointmentData.BranchId.toString());
      formData.append('ProductId', appointmentData.ProductId.toString());
      formData.append('EmployeeRefId', appointmentData.EmployeeRefId.toString());
      formData.append('MedicalTest', appointmentData.MedicalTest);
      formData.append('PaymentType', appointmentData.PaymentType);
      formData.append('CaseFor', appointmentData.CaseFor.toString());
      formData.append('EmployeeToPay', appointmentData.EmployeeToPay);
      formData.append('IsActive', appointmentData.IsActive.toString());
      formData.append('LeadStatus', appointmentData.LeadStatus.toString());
      formData.append('VisitType', appointmentData.VisitType);
      formData.append('DCId', appointmentData.DCId.toString());
      formData.append('TestPackageTypeId', appointmentData.TestPackageTypeId.toString());
      formData.append('SponsoredStatus', appointmentData.SponsoredStatus.toString());
      formData.append('DoctorId', appointmentData.DoctorId.toString());
      formData.append('Symptoms', appointmentData.Symptoms);
      formData.append('CreatedBy', appointmentData.CreatedBy.toString());
      formData.append('EmployeeDependentDetailsId', appointmentData.EmployeeDependentDetailsId.toString());
      formData.append('EmployeeAddressDetailsId', appointmentData.EmployeeAddressDetailsId.toString());
      formData.append('PreferredAppointmentDateTime', appointmentData.PreferredAppointmentDateTime || "");
      formData.append('CaseLeadCompletionDateTime', appointmentData.CaseLeadCompletionDateTime || "");

      // Handle files
      if (!appointmentData.Files || appointmentData.Files.length === 0) {
        const dummyFile = new File([new Blob(["dummy file"])], "dummy.txt");
        formData.append('Files', dummyFile);
      } else {
        appointmentData.Files.forEach(file => formData.append('Files', file));
      }

      console.log("📤 [API] Sending POST to /CRMSaveBookAppointmentDetails");

      // Axios handles Content-Type for FormData automatically
      const response = await api.post('/CRMSaveBookAppointmentDetails', formData);

      console.log("✅ [API] Response received:", response.data);

      const result = response.data as any;

      // Check if response indicates failure
      if (result.Success === false) {
        console.error("❌ [API] Appointment creation failed:", result.Message);
        return {
          Success: false,
          Message: result.Message || "Appointment booking failed",
          CaseLead_Id: "0"
        };
      }

      return {
        Success: true,
        Message: result.Message || "Appointment booked successfully",
        CaseLead_Id: result.CaseLead_Id || result.caseLead_Id || result.CaseLeadId || "0"
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
    }
  ): Promise<InsertCartResponse> => {
    try {
      const payload = {
        CaseLead_Id: appointmentData.CaseLead_Id,
        EmployeeRefId: appointmentData.EmployeeRefId,
        CaseFor: appointmentData.CaseFor,
        EmployeeDependentDetailsId: appointmentData.EmployeeDependentDetailsId,
        CaseType: appointmentData.CaseType,
        ProductId: appointmentData.ProductId,
        DCId: appointmentData.DCId,
        SponsoredStatus: appointmentData.SponsoredStatus,
        TestPackageTypeId: appointmentData.TestPackageTypeId,
        CartUniqueId: appointmentData.CartUniqueId
      };

      console.log("Sending appointment cart payload:", payload);

      const response = await api.post('/api/appointments/cart/add/', payload);

      const result = response.data as any;
      console.log("Server response:", result);

      return {
        Success: true,
        Message: result.Message,
        CartDetailsId: result.CartDetailsId,
        CartUniqueId: result.CartUniqueId
      };
    } catch (error: any) {
      console.error("Error saving appointment cart item:", error.response || error);
      return {
        Success: false,
        Message: error.response?.data?.Message || error.message || "Failed to save cart item"
      };
    }
  },

  CRMLoadDoctorListDetails: async (specialityId: number, employeeRefId: number, districtId: number): Promise<CRMConsultationDoctorDetailsResponse[]> => {
    try {
      // Fetch from BOTH Professional and Personal endpoints to ensure all doctors are captured
      const params: any = {};
      if (specialityId) params.specialityId = specialityId;
      if (employeeRefId) params.employeeRefId = employeeRefId;
      if (districtId) params.city = districtId;

      const [professionalResponse, personalResponse] = await Promise.all([
        api.get('/api/doctors_details/professional/search', { params }).catch(() => ({ data: [] })),
        api.get('/api/doctors_details/personal/').catch(() => ({ data: [] }))
      ]);

      console.log("Professional Response:", professionalResponse.data);
      console.log("Personal Response:", personalResponse.data);

      // Extract professional doctors
      let professionalData: any[] = [];
      const profData: any = professionalResponse.data;
      if (Array.isArray(profData)) {
        professionalData = profData;
      } else if (profData && Array.isArray(profData.data)) {
        professionalData = profData.data;
      } else if (profData && Array.isArray(profData.results)) {
        professionalData = profData.results;
      }

      // Extract personal doctors
      let personalData: any[] = [];
      const persData: any = personalResponse.data;
      if (Array.isArray(persData)) {
        personalData = persData;
      } else if (persData && Array.isArray(persData.data)) {
        personalData = persData.data;
      } else if (persData && Array.isArray(persData.results)) {
        personalData = persData.results;
      }

      // Create a map of professional doctors by ID for quick lookup
      const professionalMap = new Map<number, any>();
      professionalData.forEach(doc => {
        const id = doc.id || doc.doctor;
        if (id) professionalMap.set(id, doc);
      });

      // Collect all unique doctor IDs from both sources
      const allDoctorIds = new Set<number>();
      professionalData.forEach(doc => {
        const id = doc.id || doc.doctor;
        if (id) allDoctorIds.add(id);
      });
      personalData.forEach(doc => {
        if (doc.id) allDoctorIds.add(doc.id);
      });

      // Merge: For each doctor ID, prefer professional data if available, otherwise use personal
      const rawData: any[] = [];
      allDoctorIds.forEach(id => {
        const professionalDoc = professionalMap.get(id);
        const personalDoc = personalData.find(d => d.id === id);

        // Prefer professional data (more complete), fallback to personal
        if (professionalDoc) {
          rawData.push(professionalDoc);
        } else if (personalDoc) {
          rawData.push(personalDoc);
        }
      });

      console.log(`✅ [API] Fetched ${rawData.length} doctors from backend (${professionalData.length} professional, ${personalData.length} personal)`);

      // Validate that we only have real doctors from backend
      // Also filtering out known test data like "Dr. Hari" as requested
      const validDoctors = rawData.filter(item => {
        const hasId = item.id || item.DoctorId;
        const name = item.name || item.Name || item.DoctorName || "";
        const isExcluded = name.includes("Dr. Hari") || name === "Doctor";
        return hasId && !isExcluded;
      });
      const invalidCount = rawData.length - validDoctors.length;
      if (invalidCount > 0) {
        console.warn(`⚠️ [API] Filtered out ${invalidCount} doctors without valid IDs`);
      }


      // Map ONLY valid backend doctors to frontend interface
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

        if (Array.isArray(item.specialization)) {
          // If array of objects
          if (item.specialization.length > 0 && typeof item.specialization[0] === 'object') {
            specName = item.specialization[0].name || item.specialization[0].Name || "";
            specIds = item.specialization.map((s: any) => s.id || s.Id).filter((id: any) => id).join(",");
          }
          // If array of strings/numbers
          else if (item.specialization.length > 0) {
            specName = String(item.specialization[0]);
            specIds = item.specialization.join(",");
          }
        }
        else if (typeof item.specialization === 'string') {
          specName = item.specialization;
          specIds = item.specialization; // Fallback to name if not array
        }
        else if (typeof item.specialization === 'object' && item.specialization !== null) {
          specName = item.specialization.name || item.specialization.Name || "";
          specIds = (item.specialization.id || item.specialization.Id || "").toString();
        }

        const mappedDoc = {
          DoctorId: item.id || item.DoctorId,
          DoctorName: docName,
          Experience: item.experience_years?.toString() || item.Experience?.toString() || "",
          Experience1: item.experience_years || item.Experience || 0,
          Age: item.age || item.Age || 0,
          DOB: item.dob || item.DOB || "",

          // Map Specializations
          Specialization: specName || item.Specialization || "General Physician",
          DoctorSpecializations: specIds || item.DoctorSpecializations || "",

          // Map Languages
          Language: item.language ? (Array.isArray(item.language) ? item.language.map((l: any) => typeof l === 'object' ? l.name : l).join(", ") : item.language) : (item.Language || ""),

          // Map Location/Address
          CityName: item.city_name || item.CityName || "India",
          Address: item.address || item.clinic_address || item.Address || "",
          Pincode: item.clinic_address || item.Pincode || "",

          // Map Vendor/Doctor Type
          DoctorTypeDescription: vendorName || item.DoctorTypeDescription || "Welleazy",
          DoctorTypeId: (item.vendor && item.vendor.id) ? item.vendor.id : (item.DoctorTypeId || 0),

          // Map Fees
          Fee: item.consultation_fee || item.Fee || "0",

          // Map Other details
          DoctorRegistrationId: item.license_number || item.DoctorRegistrationId || "",
          ConsultationMode: item.e_consultation ? "Video Consultation" : (item.in_clinic ? "In-Clinic" : (item.ConsultationMode || "")),

          // Default/Missing fields
          DoctorImage: item.profile_photo || item.image || item.DoctorImage || null,
          VendorImageUrl: "",
          DoctorImageUrl: item.image || item.DoctorImageUrl || "",
          ServiceProvider: "",
          EmpanelFor: "",
          Service: [
            item.e_consultation ? "Video Consultation" : "",
            (item.in_clinic || vendorName === "Apollo" || vendorName === "Appolo") ? "In-Person Consultation" : "",
            item.service || item.Service || ""
          ].filter(Boolean).join(", ") || (item.Service || "Consultation"),
          Qualification: item.qualification || item.Qualification || "",
          DistrictId: districtId || item.DistrictId || 0,
          FromTime: "",
          ToTime: "",
          ConsultationCount: 0,
          ClinicId: item.clinic_id || item.ClinicId || 0,
          ClinicName: item.clinic_name || item.ClinicName || "",
          DCUniqueName: vendorName || item.DCUniqueName || "Welleazy",
          DoctorURL: "",
        };

        return mappedDoc;
      });

      console.log(`✅ [API] Returning ${mappedData.length} valid doctors to display`);
      console.log("📋 [API] Sample doctor data:", mappedData.slice(0, 2));
      return mappedData as CRMConsultationDoctorDetailsResponse[];
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

      const response = await api.post('/CRMSaveCustomerCartDetails', payload);

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
      const response = await api.post('/CRMSponsoredServices', payload);
      return response.data as { ServiceAvailable: boolean };
    } catch (error: any) {
      console.error('Error fetching sponsored services:', error.response || error);
      throw error;
    }
  },

  CRMLoadApolloClinics: async (doctorId: number, DoctorTypeDescription: string): Promise<ApolloClinic[]> => {
    try {
      const response = await api.get(`/CRMLoadApolloClinics/${doctorId}/${DoctorTypeDescription}`);
      return response.data as ApolloClinic[];
    } catch (error: any) {
      console.error('Error loading Apollo clinics:', error.response || error);
      throw error;
    }
  },

  ApolloHospitalDoctorSlotDetails: async (payload: ApolloDoctorsSlotRequest): Promise<ApolloDoctorSlotsApiResponse> => {
    try {
      const response = await api.post('/ApolloHospitalDoctorSlotDetails', {
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
};