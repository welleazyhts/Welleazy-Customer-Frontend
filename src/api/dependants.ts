import { api } from '../services/api';
import {
  CRMInsertUpdateEmployeeDependantDetailsRequest, CRMInsertUpdateEmployeeDependantDetailsResponse,
  CRMFetchDependentDetailsForEmployeeRequest, CRMFetchDependentDetailsForEmployeeResponse, District
} from '../types/dependants';

// Helper function to get relationship name from ID
const getRelationshipName = (relationshipId: number): string => {
  const relationships: { [key: number]: string } = {
    1: "Self",
    2: "Spouse",
    3: "Son",
    4: "Daughter",
    5: "Father",
    6: "Mother",
    7: "Brother",
    8: "Sister"
  };
  return relationships[relationshipId] || "Unknown";
};

export const DependantsAPI = {
  // New function to fetch relationship types
  getRelationshipTypes: async (): Promise<any> => {
    try {
      const response = await api.get('/api/dependants/relationship-types/');
      return response.data;
    } catch (error) {
      console.error('Error fetching relationship types:', error);
      throw error;
    }
  },

  CRMInsertUpdateEmployeeDependantDetails: async (requestData: CRMInsertUpdateEmployeeDependantDetailsRequest): Promise<CRMInsertUpdateEmployeeDependantDetailsResponse> => {
    try {
      const convertDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      };

      const payload = {
        name: requestData.DependentName,
        gender: requestData.DependentGender,
        dob: convertDate(requestData.DependentDOB),
        relationship: requestData.DependentRelationShip,
        mobile_number: requestData.DependentMobileNo,
        email: requestData.DependentEmailId || "",
        occupation: requestData.Occupation,
        marital_status: requestData.MaritalStatus,
        is_active: requestData.IsActive
      };

      let response;
      if (requestData.EmployeeDependentDetailsId && requestData.EmployeeDependentDetailsId > 0) {
        // Update existing dependent - PUT /api/dependants/:id/
        console.log(`Updating dependent ${requestData.EmployeeDependentDetailsId} with payload:`, payload);
        response = await api.put(`/api/dependants/${requestData.EmployeeDependentDetailsId}/`, payload);
      } else {
        // Create new dependent - POST /api/dependants/
        console.log("Creating new dependent with payload:", payload);
        response = await api.post('/api/dependants/', payload);
      }

      console.log("Dependent save response:", response.data);

      const responseData = response.data as any;

      return {
        Message: responseData.message || "Success",
        data: responseData.data
      } as CRMInsertUpdateEmployeeDependantDetailsResponse;
    } catch (error) {
      console.error('Error inserting/updating employee dependent details:', error);
      throw error;
    }
  },

  // Function to fetch dependents list
  GetDependents: async (): Promise<CRMFetchDependentDetailsForEmployeeResponse[]> => {
    try {
      const response = await api.get('/api/dependants/');
      console.log("GetDependents Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      // Map backend response to frontend format
      // We need to match the CRMFetchDependentDetailsForEmployeeResponse interface
      const mappedData: CRMFetchDependentDetailsForEmployeeResponse[] = rawData.map((item: any) => ({
        EmployeeDependentDetailsId: item.id || 0,
        EmployeeId: 0, // Not always returned?
        DependentId: item.member_id || "",
        Relationship: getRelationshipName(item.relationship),
        DependentRelationShip: item.relationship || 0,
        DependentName: item.name || "",
        DependentMobileNo: item.mobile_number || "",
        Description: "",
        DependentGender: item.gender || "",
        DependentDOB: item.dob || "",
        DOB: item.dob || "",
        AccessProfilePermission: false,
        MaritalStatus: item.marital_status || "",
        Occupation: item.occupation || "",
        DependentEmailId: item.email || "",
        IsActive: item.is_active !== undefined ? item.is_active : true,
        DependentMemberId: item.member_id || ""
      }));

      return mappedData;
    } catch (error) {
      console.error('Error fetching dependents:', error);
      throw error;
    }
  },

  CRMFetchDependentDetailsForEmployee: async (requestData: CRMFetchDependentDetailsForEmployeeRequest): Promise<CRMFetchDependentDetailsForEmployeeResponse[]> => {
    // Reusing GetDependents logic since the endpoint is generic /api/dependants/
    // If filtering by employee is needed, checking if backend supports query param or if it returns only for logged in user.
    // Assuming backend filters by token user context as per common practice.
    return DependantsAPI.GetDependents();
  },

  DeactivateEmployeeDependent: async (employeeDependentDetailsId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/api/dependants/${employeeDependentDetailsId}/`);
      console.log("Delete dependent response:", response.data);

      return {
        success: true,
        message: (response.data as any)?.message || "Dependent deleted successfully"
      };

    } catch (error) {
      console.error('Error deleting employee dependent:', error);
      throw error;
    }
  },

  CRMLoadCitys: async (): Promise<District[]> => {
    try {
      const response = await api.get('/api/location/cities/');
      const data = response.data;

      if (Array.isArray(data)) {
        if (typeof data[0] === 'string') {
          return data.map((city: string, index: number) => ({
            DistrictId: index,
            DistrictName: city,
            StateId: 0,
            StateName: "",
            IsActive: "true",
            CityType: null
          }));
        }
      }
      return data as District[];

    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },
};