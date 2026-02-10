import { api } from '../services/api';

export const EyeDentalCareAPI = {
    // 1. Get dental treatments
    // New location and profile APIs based on updated backend structure
    getStates: async (): Promise<any[]> => {
        try {
            const response = await api.get('/api/location/states/');
            const data = (response.data as any)?.results || response.data || [];
            return (data as any[]).map((item: any) => ({
                StateId: item.id || item.StateId,
                StateName: item.name || item.StateName
            }));
        } catch (error) {
            console.error("Error fetching states:", error);
            throw error;
        }
    },

    getCities: async (stateId: number | string): Promise<any[]> => {
        try {
            const response = await api.get('/api/location/cities/by-state/', {
                params: { state_id: stateId }
            });
            const data = (response.data as any)?.results || response.data || [];
            return (data as any[]).map((item: any) => ({
                DistrictId: item.id || item.DistrictId,
                DistrictName: item.name || item.DistrictName
            }));
        } catch (error) {
            console.error("Error fetching cities:", error);
            throw error;
        }
    },

    getRelationships: async (): Promise<any[]> => {
        try {
            const response = await api.get('/api/dependants/relationship-types/');
            const data = (response.data as any)?.results || response.data || [];
            return (data as any[]).map((item: any) => ({
                RelationshipId: item.id || item.RelationshipId,
                Relationship: item.name || item.Relationship || item.relationship_name
            }));
        } catch (error) {
            console.error("Error fetching relationships:", error);
            throw error;
        }
    },

    getDependents: async (relationshipId?: number | string): Promise<any[]> => {
        try {
            const response = await api.get('/api/dependants/');
            const data = (response.data as any)?.results || response.data || [];

            // Filter by relationship if provided
            const filteredData = relationshipId
                ? (data as any[]).filter((item: any) => Number(item.relationship) === Number(relationshipId))
                : (data as any[]);

            return filteredData.map((item: any) => ({
                EmployeeDependentDetailsId: item.id || item.EmployeeDependentDetailsId,
                DependentName: item.name || item.DependentName || item.dependant_name
            }));
        } catch (error) {
            console.error("Error fetching dependents:", error);
            return [];
        }
    },

    getCustomerProfile: async (employeeRefId: number | string): Promise<any> => {
        const mapProfile = (data: any) => {
            if (!data) return null;
            // Some legacy APIs return data as an array [profile]
            const profile = Array.isArray(data) ? data[0] : data;

            // Map common fields with robust fallbacks
            const mapped = {
                EmployeeName: profile?.name || profile?.EmployeeName || "",
                Emailid: profile?.email || profile?.Emailid || "",
                MobileNo: profile?.mobile_number || profile?.MobileNo || "",
                Gender: profile?.gender || "",
                Employee_DOB: profile?.dob || profile?.Employee_DOB || "",
                // Robust mapping for state ID
                StateId: profile?.state_id || (typeof profile?.state === 'object' ? profile.state.id : profile?.state) || profile?.StateId || "",
                // Robust mapping for city/district ID
                CityId: profile?.city_id || profile?.district_id || (typeof profile?.city === 'object' ? profile.city.id : profile?.city) || profile?.CityId || "",
                // Robust mapping for address
                Address: profile?.address_text || profile?.address || profile?.Address || profile?.AddressLineOne || "",
                Pincode: profile?.pincode || profile?.Pincode || "",
                CorporateName: profile?.corporate_name || profile?.CorporateName || "",
                Branch: profile?.branch || profile?.Branch || "",
                BloodGroup: profile?.blood_group || profile?.BloodGroup || "",
                MemberId: profile?.member_id || profile?.MemberId || "",
                PackageId: profile?.package || profile?.PackageId || "",
                Services: profile?.services || profile?.Services || "",
                ProductId: profile?.product || profile?.ProductId || ""
            };

            return {
                ...profile,
                ...mapped
            };
        };

        try {
            // First try the new standardized profiles endpoint
            const response = await api.get(`/api/accounts/profile/`);
            return mapProfile(response.data);
        } catch (error) {
            console.warn("Failed to fetch profile from /api/accounts/profile/, attempting fallback", error);
            try {
                // Fallback to gym service old endpoint
                const response = await api.get(`/CRMLoadCustomerProfileDetails/${employeeRefId}`);
                return mapProfile(response.data);
            } catch (e) {
                console.error("All profile fetch attempts failed:", e);
                // Provide a minimal profile from localStorage as last resort
                return mapProfile({
                    EmployeeName: localStorage.getItem("DisplayName") || "User",
                    Emailid: localStorage.getItem("email") || "",
                    MobileNo: localStorage.getItem("mobile") || "",
                    Gender: localStorage.getItem("Gender") || "Male",
                    Employee_DOB: localStorage.getItem("DOB") || "",
                    StateId: localStorage.getItem("StateId") || "",
                    CityId: localStorage.getItem("CityId") || "",
                    Address: localStorage.getItem("address") || "",
                    Pincode: localStorage.getItem("pincode") || ""
                });
            }
        }
    },

    getDentalTreatments: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/dental-treatments/');
            return response.data;
        } catch (error) {
            console.error("Error fetching dental treatments:", error);
            throw error;
        }
    },

    // 2. Get eye treatments
    getEyeTreatments: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/eye-treatments/');
            return response.data;
        } catch (error) {
            console.error("Error fetching eye treatments:", error);
            throw error;
        }
    },

    // 3. Select booking type
    selectBookingType: async (data: { care_program_type: string; booking_type: string }): Promise<any> => {
        try {
            const response = await api.post('/api/eyedentalcare/select-booking-type/', data);
            return response.data;
        } catch (error) {
            console.error("Error selecting booking type:", error);
            throw error;
        }
    },

    // 4. Select service type (PATCH) - Match Postman Item 4
    selectServiceType: async (bookingId: number | string, data: { service_type: string }): Promise<any> => {
        try {
            const response = await api.patch(`/api/eyedentalcare/${bookingId}/select-service-type/`, data);
            return response.data;
        } catch (error) {
            console.error("Error selecting service type:", error);
            throw error;
        }
    },

    // 5. Final submit (PATCH) - Match Postman Item 5
    finalSubmit: async (bookingId: number | string, data: {
        for_whom: string;
        dependant?: number;
        state: number;
        city: number;
        address_text: string;
        requirements: string;
    }): Promise<any> => {
        try {
            const response = await api.patch(`/api/eyedentalcare/${bookingId}/final-submit/`, data);
            return response.data;
        } catch (error) {
            console.error("Error in final submit:", error);
            throw error;
        }
    },

    // 6. Get options (GET) - Match Postman Item 6
    getOptions: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/options/');
            return response.data;
        } catch (error) {
            console.error("Error fetching options:", error);
            throw error;
        }
    },

    // 7. Get confirmed bookings (GET) - Match Postman Item 7
    getConfirmedBookings: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/confirmed-bookings/');
            return response.data;
        } catch (error) {
            console.error("Error listing confirmed bookings:", error);
            throw error;
        }
    },

    // 8. Eye Vendors (GET) - Match Postman Item 8
    getEyeVendors: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/eye-vendors/');
            return response.data;
        } catch (error) {
            console.error("Error fetching eye vendors:", error);
            throw error;
        }
    },

    // 9. Eye Vendor Centers (GET) - Match Postman Item 9
    getEyeVendorCenters: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/eye-vendor-centers/');
            return response.data;
        } catch (error) {
            console.error("Error fetching eye vendor centers:", error);
            throw error;
        }
    },

    // 10. Eye Request For Treatment (POST) - Match Postman Item 10
    createEyeTreatmentRequest: async (data: any): Promise<any> => {
        try {
            // Note: Postman shows formdata, but we'll send as JSON if possible, 
            // otherwise use FormData if the backend requires it.
            const response = await api.post('/api/eyedentalcare/eye-treatment-requests/', data);
            return response.data;
        } catch (error) {
            console.error("Error creating eye treatment request:", error);
            throw error;
        }
    },

    // 11. Dental Vendors (GET) - Match Postman Item 11
    getDentalVendors: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/dental-vendors/');
            return response.data;
        } catch (error) {
            console.error("Error fetching dental vendors:", error);
            throw error;
        }
    },

    // 12. Dental Vendor Centers (GET) - Match Postman Item 12
    getDentalVendorCentersList: async (): Promise<any> => {
        try {
            const response = await api.get('/api/eyedentalcare/dental-vendor-centers/');
            return response.data;
        } catch (error) {
            console.error("Error fetching dental vendor centers:", error);
            throw error;
        }
    },

    getDentalVendorCenters: async (vendorId: number | string): Promise<any> => {
        try {
            const response = await api.get(`/api/eyedentalcare/dental-vendor-centers/${vendorId}/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching dental vendor centers:", error);
            throw error;
        }
    },

    // 13. Dental Request For Treatment (POST) - Match Postman Item 13
    createDentalTreatmentRequest: async (data: any): Promise<any> => {
        try {
            const response = await api.post('/api/eyedentalcare/dental-treatment-requests/', data);
            return response.data;
        } catch (error) {
            console.error("Error creating dental treatment request:", error);
            throw error;
        }
    },

    // 14. Send appointment email (restored for compatibility)
    SendEyeDentalCareAppointmentEmail: async (emailData: any): Promise<any> => {
        try {
            const response = await api.post('/SendEyeDentalCareAppointmentEmail', emailData);
            return response.data;
        } catch (error) {
            console.error("Error sending appointment email:", error);
            throw error;
        }
    },

    // Helper methods for UI compatibility
    EDLoadEyeTreatmentDetails: async (): Promise<any> => {
        return EyeDentalCareAPI.getEyeTreatments();
    },

    EDLoadDentalTreatmentDetails: async (): Promise<any> => {
        return EyeDentalCareAPI.getDentalTreatments();
    },

    LoadVendorListForEye: async (): Promise<any> => {
        try {
            // We'll try to get centers as they have the address info needed for the UI
            // match Postman item 9
            const response = await EyeDentalCareAPI.getEyeVendorCenters();
            const data = response.results || response.data || response || [];

            // Map and deduplicate by vendor_id
            const uniqueVendors = new Map();
            data.forEach((item: any) => {
                const vendorId = item.vendor || item.id || 0;
                if (!uniqueVendors.has(vendorId)) {
                    uniqueVendors.set(vendorId, {
                        vendor_id: vendorId,
                        vendor_name: item.vendor_name || (item.vendor && item.vendor.name) || item.name || "Eye Vendor",
                        vendor_address: item.address || item.vendor_address || "",
                        vendor_Type: item.vendor_type || "Eye Care",
                        operatingHours: item.operating_hours || item.operatingHours || "09:00 AM - 08:00 PM",
                        conMobile_no: item.contact_number || item.conMobile_no || "",
                        emailid: item.email || item.emailid || "",
                        ...item
                    });
                }
            });
            return Array.from(uniqueVendors.values());
        } catch (error) {
            console.warn("Error fetching eye vendor centers, falling back to eye-vendors", error);
            try {
                // match Postman item 8
                const response = await EyeDentalCareAPI.getEyeVendors();
                const data = response.results || response.data || response || [];

                const uniqueVendors = new Map();
                data.forEach((item: any) => {
                    const vendorId = item.id || item.vendor_id || 0;
                    if (!uniqueVendors.has(vendorId)) {
                        uniqueVendors.set(vendorId, {
                            vendor_id: vendorId,
                            vendor_name: item.name || item.vendor_name || "Eye Vendor",
                            vendor_address: item.address || item.vendor_address || "",
                            vendor_Type: item.vendor_type || "Eye Care",
                            ...item
                        });
                    }
                });
                return Array.from(uniqueVendors.values());
            } catch (e) {
                // match Postman item 6 fallback
                const options = await EyeDentalCareAPI.getOptions();
                return options.vendors || [];
            }
        }
    },

    LoadVendorListForDental: async (): Promise<any> => {
        try {
            // Priority: use centers endpoint to get addresses
            const response = await EyeDentalCareAPI.getDentalVendorCentersList();
            const data = response.results || response.data || response || [];

            const uniqueVendors = new Map();
            data.forEach((item: any) => {
                const vendorId = item.vendor || item.id || 0;
                if (!uniqueVendors.has(vendorId)) {
                    uniqueVendors.set(vendorId, {
                        vendor_id: vendorId,
                        vendor_name: item.vendor_name || (item.vendor && item.vendor.name) || item.name || "Dental Vendor",
                        vendor_address: item.address || item.vendor_address || "",
                        vendor_Type: item.vendor_type || "Dental Care",
                        operatingHours: item.operating_hours || item.operatingHours || "09:00 AM - 08:00 PM",
                        conMobile_no: item.contact_number || item.conMobile_no || "",
                        emailid: item.email || item.emailid || "",
                        ...item
                    });
                }
            });
            return Array.from(uniqueVendors.values());
        } catch (error) {
            console.warn("Error fetching dental vendor centers, falling back to dental-vendors", error);
            try {
                // match Postman item 11 fallback
                const response = await EyeDentalCareAPI.getDentalVendors();
                const data = response.results || response.data || response || [];

                const uniqueVendors = new Map();
                data.forEach((item: any) => {
                    const vendorId = item.id || item.vendor_id || 0;
                    if (!uniqueVendors.has(vendorId)) {
                        uniqueVendors.set(vendorId, {
                            vendor_id: vendorId,
                            vendor_name: item.name || item.vendor_name || "Dental Vendor",
                            vendor_address: item.address || item.vendor_address || "",
                            vendor_Type: item.vendor_type || "Dental Care",
                            ...item
                        });
                    }
                });
                return Array.from(uniqueVendors.values());
            } catch (e) {
                const options = await EyeDentalCareAPI.getOptions();
                return options.vendors || [];
            }
        }
    },

    LoadDoctorSpecializations: async (): Promise<any> => {
        try {
            const response = await api.get('/api/consultation/doctor-specializations/');
            let rawData: any[] = [];
            const data: any = response.data;

            if (Array.isArray(data)) {
                rawData = data;
            } else if (data && Array.isArray(data.data)) {
                rawData = data.data;
            } else if (data && Array.isArray(data.results)) {
                rawData = data.results;
            }

            return rawData.map((item: any) => ({
                DoctorSpecializationsId: item.id !== undefined ? item.id : (item.DoctorSpecializationsId || 0),
                Specializations: item.name || item.Name || item.Specializations || "Unknown Specialization",
                ImageName: item.image || item.ImageName || null,
                Imagepath: item.image || item.Imagepath || null,
                Description: item.description || item.Description || "",
                IsActive: (item.is_active === true || item.is_active === 1 || item.IsActive === 1 || item.IsActive === true) ? 1 : 0,
            }));
        } catch (error) {
            console.error('Error loading doctor specializations:', error);
            return [];
        }
    },

    getDoctorAvailability: async (data: { doctor_id: number | string; date: string }): Promise<any> => {
        try {
            // Changed from POST to GET to fix 400 error
            const response = await api.get('/api/appointments/doctor-availability/', { params: data });
            return response.data;
        } catch (error) {
            console.error("Error fetching doctor availability:", error);
            throw error;
        }
    }
};
