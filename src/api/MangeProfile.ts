import {
    CRMMaritalStatusResponse,
    CustomerProfile,
    CRMStateListResponse,
    CRMCityListResponse,
    CRMAddressByTypeResponse,
    CRMUpdateMangeProfileRequest,
    CRMUpdateMangeProfileAddressRequest,
    CRMFetchCustomerProfilePictureRequest,
    CustomerProfilePicture,
    SaveProfilePictureResponse
} from '../types/MangeProfile';
import { api } from '../services/api';
import { mapAddressTypeToId } from './AddressBook';

export const MangeProfileApi = {

    CRMMaritalStatus: async (): Promise<CRMMaritalStatusResponse[]> => {
        try {
            const response = await api.get<any[]>('/api/location/marital-statuses/');
            const data = response.data;
            const rawData = Array.isArray(data) ? data : (data as any)?.results || (data as any)?.data || [];

            return rawData.map((m: any) => ({
                MaritalStatusId: m.id || 0,
                MaritalDescription: m.name || m.description || "Unknown"
            }));
        } catch (error) {
            console.error('Error fetching Marital Status list:', error);
            throw error;
        }
    },

    CRMLoadCustomerProfileDetails: async (employeeRefId: number): Promise<CustomerProfile> => {
        try {
            const response = await api.get<any>(`/api/accounts/profile/`);
            const rawData = response.data;

            // Map snake_case from backend to PascalCase for the UI
            const data: CustomerProfile = {
                EmployeeRefId: employeeRefId,
                EmployeeId: rawData.employee_id || "",
                EmployeeName: rawData.employee_name || rawData.user_name || "",
                Address: rawData.address || "",
                Emailid: rawData.corporate_email || rawData.email || "",
                MobileNo: rawData.mobile_no || "",
                MaskedMobileNo: rawData.mobile_no || "",
                GenderDescription: rawData.gender || "",
                Gender: rawData.gender || "",
                DOB: rawData.dob || "",
                Employee_DOB: rawData.dob || "",
                State: rawData.state ? parseInt(rawData.state) : 0,
                StateId: rawData.state ? parseInt(rawData.state) : 0,
                City: rawData.city ? parseInt(rawData.city) : 0,
                CityId: rawData.city ? parseInt(rawData.city) : 0,
                Area: rawData.landmark || "",
                StateName: rawData.state_name || "",
                DistrictName: rawData.city_name || "",
                AddressLineOne: rawData.address_line1 || "",
                AddressLineTwo: rawData.address_line2 || "",
                Landmark: rawData.landmark || "",
                Pincode: rawData.pincode || "",
                longitude: "0",
                latitude: "0",
                GeoLocation: "",
                CorporateId: 0,
                CorporateName: rawData.corporate_name || "",
                BranchId: 0,
                Branch: "",
                ProductId: "",
                Services: "",
                AccountActivationURL: "",
                CreatedBy: 0,
                CreatedOn: "",
                ModifiedBy: 0,
                ModifiedOn: "",
                LastActiveDate: "",
                LastInactiveDate: "",
                InActiveReason: "",
                IsActive: true,
                PersonalEmailid: rawData.personal_email || "",
                MemberId: rawData.member_id || "",
                AddressType: rawData.address_type || "home",
                MaritalStatus: rawData.marital_status || 0,
                EmployeeAddressDetailsId: 0,
                PackageId: "",
                BloodGroup: rawData.blood_group || "",
                EmployeeDependentDetailsId: 0,
                TwoFAEnabled: "false"
            };

            // Save to localStorage as per existing behavior
            localStorage.setItem("employeeName", data.EmployeeName || "");
            localStorage.setItem("email", data.Emailid || "");
            localStorage.setItem("mobile", data.MobileNo || "");
            localStorage.setItem("Gender", data.Gender || "");
            localStorage.setItem("DOB", data.Employee_DOB || "");
            localStorage.setItem("StateId", data.StateId?.toString() || "");
            localStorage.setItem("CityId", data.CityId?.toString() || "");
            localStorage.setItem("address", data.Address || "");
            localStorage.setItem("pincode", data.Pincode || "");
            localStorage.setItem("CorporateName", data.CorporateName || "");
            localStorage.setItem("BloodGroup", data.BloodGroup || "");
            localStorage.setItem("MemberId", data.MemberId || "");

            console.log("Mapped Profile Details:", data);
            return data;
        } catch (error) {
            console.error("Error fetching customer profile:", error);
            throw error;
        }
    },

    CRMStateList: async (): Promise<CRMStateListResponse[]> => {
        try {
            const response = await api.get<any[]>('/api/location/states/');
            return response.data.map((state: any) => ({
                StateId: state.id,
                StateName: state.name
            }));
        } catch (error) {
            console.error('Error fetching State list:', error);
            throw error;
        }
    },

    CRMCityList: async (stateId: number): Promise<CRMCityListResponse[]> => {
        try {
            const response = await api.get<any[]>(`/api/location/cities/?state_id=${stateId}`);
            return response.data.map((city: any) => ({
                DistrictId: city.id,
                DistrictName: city.name
            }));
        } catch (error) {
            console.error('Error fetching city/district list:', error);
            throw error;
        }
    },

    CRMLoadCustomerProfileDetailsByType: async (employeeRefId: number, addressType: string): Promise<CRMAddressByTypeResponse[]> => {
        try {
            const typeId = mapAddressTypeToId(addressType);
            const response = await api.get<any[]>(`/api/addresses/?address_type=${typeId}`);

            const rawData = response.data;

            return rawData.map((addr: any) => ({
                EmployeeAddressDetailsId: addr.id,
                EmployeeRefId: employeeRefId,
                RelationType: addr.address_type,
                AddressType: addressType,
                AddressLineOne: addr.address_line1 || "",
                AddressLineTwo: addr.address_line2 || "",
                Landmark: addr.landmark || "",
                StateId: typeof addr.state === 'string' ? parseInt(addr.state) : addr.state,
                CityId: typeof addr.city === 'string' ? parseInt(addr.city) : addr.city,
                Pincode: addr.pincode || "",
                IsDefault: addr.is_default || false,
                EmployeeDependentDetailsId: addr.dependant_id || 0,
                Latitude: "0",
                Longitude: "0"
            }));
        } catch (error) {
            console.error('Error fetching address details by type:', error);
            throw error;
        }
    },

    CRMUpdateMangeProfileDetails: async (requestData: CRMUpdateMangeProfileRequest): Promise<string> => {
        // Transform the frontend request to match the new API nested structure
        const payload = {
            profile: {
                personal_email: requestData.personalEmailid,
                gender: requestData.gender.toLowerCase(),
                dob: requestData.dob,
                marital_status: requestData.maritalStatus, // Backend might expect string description now or ID
                blood_group: requestData.bloodGroup,
                corporate_name: requestData.employeeName // Mapped from UI employee name field
            }
        };

        return api.put<any>('/api/accounts/profile/', payload).then(res => res.data?.Message || "Profile updated successfully");
    },

    CRMUpdateMangeProfileAddressDetails: async (requestData: CRMUpdateMangeProfileAddressRequest): Promise<string> => {
        const isUpdate = requestData.employeeAddressDetailsId > 0;
        const url = isUpdate
            ? `/api/addresses/${requestData.employeeAddressDetailsId}/`
            : '/api/addresses/';

        const payload = {
            address_type: mapAddressTypeToId(requestData.addressType),
            address_line1: requestData.addressLineOne,
            address_line2: requestData.addressLineTwo || "",
            landmark: requestData.landmark || "",
            state: requestData.stateId.toString(),
            city: requestData.cityId.toString(),
            pincode: requestData.pincode,
            is_default: false
        };

        if (isUpdate) {
            return api.put<any>(url, payload).then(res => res.data?.Message || "Address updated successfully");
        } else {
            return api.post<any>(url, payload).then(res => res.data?.Message || "Address saved successfully");
        }
    },

    CRMFetchCustomerProfilePicture: async (requestData: CRMFetchCustomerProfilePictureRequest): Promise<CustomerProfilePicture[]> => {
        const response = await api.post<any>('/api/CRMFetchCustomerProfilePicture/', requestData);
        const data = response.data;
        return Array.isArray(data) ? data : data?.data ?? [];
    },

    CRMSaveCustomerProfilePicture: async (
        employeeProfileId: number,
        employeeRefId: number,
        imageFile: File
    ): Promise<{ Message: string }> => {
        const formData = new FormData();
        formData.append('EmployeeProfileId', employeeProfileId.toString());
        formData.append('EmployeeRefId', employeeRefId.toString());
        formData.append('UploadedBy', employeeRefId.toString());
        formData.append('', imageFile);

        const response = await api.post<{ Message: string }>('/api/CRMSaveCustomerProfilePicture/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
