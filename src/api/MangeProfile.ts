import {
    CRMMaritalStatusResponse, CustomerProfile, CRMStateListResponse, CRMCityListResponse
    , CRMAddressByTypeResponse, CRMUpdateMangeProfileRequest, CRMUpdateMangeProfileAddressRequest, CRMFetchCustomerProfilePictureRequest,
    CustomerProfilePicture, SaveProfilePictureResponse
} from '../types/MangeProfile';
import { api } from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const MangeProfileApi = {

    CRMMaritalStatus: async (): Promise<CRMMaritalStatusResponse[]> => {
        try {
            const response = await fetch(`${API_URL}/CRMMaritalStatus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CRMMaritalStatusResponse[] = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching Marital Status list:', error);
            throw error;
        }
    },
    CRMLoadCustomerProfileDetails: async (employeeRefId: number): Promise<CustomerProfile> => {
        try {
            const response = await api.get(`/api/accounts/profile/`);
            const data = response.data as any;

            const profile: CustomerProfile = {
                EmployeeRefId: data.id || employeeRefId,
                EmployeeId: data.employee_id || "",
                EmployeeName: data.name || data.EmployeeName || "",
                Address: data.address || "",
                Emailid: data.email || data.Emailid || "",
                MobileNo: data.mobile_number || data.MobileNo || "",
                MaskedMobileNo: data.mobile_number || "",
                GenderDescription: data.gender || "",
                Gender: data.gender || "",
                DOB: data.dob || "",
                Employee_DOB: data.dob || "",
                State: data.state || 0,
                StateId: data.state || 0,
                City: data.city || 0,
                CityId: data.city || 0,
                Area: data.area || null,
                StateName: data.state_name || "",
                DistrictName: data.city_name || "",
                AddressLineOne: data.address || "",
                AddressLineTwo: "",
                Landmark: data.landmark || "",
                Pincode: data.pincode || "",
                longitude: "",
                latitude: "",
                GeoLocation: "",
                CorporateId: data.corporate || 0,
                CorporateName: data.corporate_name || "",
                BranchId: data.branch || 0,
                Branch: data.branch_name || "",
                ProductId: data.product || "",
                Services: data.services || "",
                AccountActivationURL: "",
                CreatedBy: 0,
                CreatedOn: "",
                ModifiedBy: 0,
                ModifiedOn: "",
                LastActiveDate: "",
                LastInactiveDate: "",
                InActiveReason: "",
                IsActive: true,
                PersonalEmailid: data.email || "",
                MemberId: data.member_id || "",
                AddressType: data.address_type || "",
                MaritalStatus: data.marital_status || 0,
                EmployeeAddressDetailsId: 0,
                PackageId: data.package || "",
                BloodGroup: data.blood_group || "",
                EmployeeDependentDetailsId: 0,
                TwoFAEnabled: ""
            };

            localStorage.setItem("employeeName", profile.EmployeeName || "");
            localStorage.setItem("email", profile.Emailid || "");
            localStorage.setItem("mobile", profile.MobileNo || "");
            localStorage.setItem("Gender", profile.Gender || "");
            localStorage.setItem("DOB", profile.Employee_DOB || "");
            localStorage.setItem("StateId", profile.StateId?.toString() || "");
            localStorage.setItem("CityId", profile.CityId?.toString() || "");
            localStorage.setItem("address", profile.Address || "");
            localStorage.setItem("pincode", profile.Pincode || "");
            localStorage.setItem("CorporateName", profile.CorporateName || "");
            localStorage.setItem("Branch", profile.Branch || "");
            localStorage.setItem("BloodGroup", profile.BloodGroup || "");
            localStorage.setItem("MemberId", profile.MemberId || "");
            localStorage.setItem("PackageId", profile.PackageId || "");
            localStorage.setItem("Services", profile.Services || "");
            localStorage.setItem("ProductId", profile.ProductId || "");
            return profile;
        } catch (error) {
            console.error("Error fetching customer profile:", error);
            throw error;
        }
    },
    CRMStateList: async (): Promise<CRMStateListResponse[]> => {
        try {
            const response = await api.get('/api/location/states/');
            const data = (response.data as any)?.results || response.data || [];
            return (data as any[]).map((item: any) => ({
                StateId: item.id || item.StateId,
                StateName: item.name || item.StateName,
                IsActive: "true"
            })) as CRMStateListResponse[];

        } catch (error) {
            console.error('Error fetching State list:', error);
            throw error;
        }
    },
    CRMCityList: async (stateId: number): Promise<CRMCityListResponse[]> => {
        try {
            const response = await api.get('/api/location/cities/by-state/', {
                params: { state_id: stateId }
            });
            const data = (response.data as any)?.results || response.data || [];

            return (data as any[]).map((item: any, index: number) => ({
                DistrictId: item.id || item.DistrictId || index,
                DistrictName: item.name || item.DistrictName || (typeof item === 'string' ? item : ""),
                StateId: item.state || item.StateId || stateId,
            })) as CRMCityListResponse[];

        } catch (error) {
            console.error('Error fetching city/district list:', error);
            throw error;
        }
    },
    CRMLoadCustomerProfileDetailsByType: async (employeeRefId: number, addressType: string): Promise<CRMAddressByTypeResponse[]> => {
        try {
            const response = await fetch(`${API_URL}/CRMLoadCustomerProfileDetailsByType`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    EmployeeRefId: employeeRefId,
                    AddressType: addressType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CRMAddressByTypeResponse[] = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching address details by type:', error);
            throw error;
        }
    },
    CRMUpdateMangeProfileDetails: async (requestData: CRMUpdateMangeProfileRequest) => {
        try {
            const response = await fetch(`${API_URL}/CRMUpdateMangeProfileDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },
    CRMUpdateMangeProfileAddressDetails: async (requestData: CRMUpdateMangeProfileAddressRequest) => {
        try {
            const response = await fetch(`${API_URL}/CRMUpdateMangeProfileAddressDetails`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error("Error updating address:", error);
            throw error;
        }
    },

    CRMFetchCustomerProfilePicture: async (requestData: CRMFetchCustomerProfilePictureRequest): Promise<CustomerProfilePicture[]> => {
        try {
            const response = await fetch(
                `${API_URL}/CRMFetchCustomerProfilePicture`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                }
            );

            const text = await response.text();

            try {
                const parsed = JSON.parse(text);
                return Array.isArray(parsed) ? parsed : parsed?.data ?? [];
            } catch {
                console.error('Invalid JSON:', text);
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            throw error;
        }
    },


    CRMSaveCustomerProfilePicture: async (
        employeeProfileId: number,
        employeeRefId: number,
        imageFile: File
    ): Promise<{ Message: string }> => {
        const formData = new FormData();

        // MUST MATCH Request.Params[]
        formData.append('EmployeeProfileId', employeeProfileId.toString());
        formData.append('EmployeeRefId', employeeRefId.toString());
        formData.append('UploadedBy', employeeRefId.toString()); // optional but safe

        // 🔥 FILE MUST BE UNNAMED
        formData.append('', imageFile);

        const response = await fetch(
            `${API_URL}/CRMSaveCustomerProfilePicture`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const text = await response.text();

        try {
            return JSON.parse(text);
        } catch {
            console.error('Invalid JSON:', text);
            throw new Error('Invalid response');
        }
    }


};
