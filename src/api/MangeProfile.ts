import {CRMMaritalStatusResponse,CustomerProfile,CRMStateListResponse,CRMCityListResponse
    ,CRMAddressByTypeResponse,CRMUpdateMangeProfileRequest,CRMUpdateMangeProfileAddressRequest,CRMFetchCustomerProfilePictureRequest,
    CustomerProfilePicture,SaveProfilePictureResponse
} from '../types/MangeProfile';

const API_URL = "https://api.welleazy.com";

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
          const response = await fetch(`${API_URL}/CRMLoadCustomerProfileDetails/${employeeRefId}`);
    
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data: CustomerProfile = await response.json();
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
          localStorage.setItem("Branch", data.Branch || "");
          localStorage.setItem("BloodGroup", data.BloodGroup || "");
          localStorage.setItem("MemberId", data.MemberId || "");
          localStorage.setItem("PackageId", data.PackageId || "");
          localStorage.setItem("Services", data.Services || "");
          localStorage.setItem("ProductId", data.ProductId || "");
        return data;
        } catch (error) {
          console.error("Error fetching customer profile:", error);
          throw error;
        }
    },
    CRMStateList: async (): Promise<CRMStateListResponse[]> => {
    try {
        const response = await fetch(`${API_URL}/CRMStateList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CRMStateListResponse[] = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching State list:', error);
        throw error;
    }
    },
    CRMCityList: async (stateId: number): Promise<CRMCityListResponse[]> => {
    try {
        const response = await fetch(`${API_URL}/CRMCityList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                StateId: stateId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CRMCityListResponse[] = await response.json();
        return data;

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

   CRMFetchCustomerProfilePicture: async ( requestData: CRMFetchCustomerProfilePictureRequest): Promise<CustomerProfilePicture[]> => {
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
    'https://api.welleazy.com/CRMSaveCustomerProfilePicture',
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
