import { api } from '../services/api';
import {
  CRMInsertUpdateEmployeeDependantDetailsRequest, CRMInsertUpdateEmployeeDependantDetailsResponse,
  CRMFetchDependentDetailsForEmployeeRequest, CRMFetchDependentDetailsForEmployeeResponse, District
} from '../types/dependants';



const API_URL = "http://3.110.32.224";

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

// Helper function to get occupation ID from string
const getOccupationId = (occupation: string): number => {
  const occupations: { [key: string]: number } = {
    "Self Employed": 1,
    "Government Employee": 2,
    "Private Employee": 3,
    "Business": 4,
    "Student": 5,
    "Housewife": 6,
    "Retired": 7,
    "Unemployed": 8
  };
  return occupations[occupation] || 0;
};


export const DependantsAPI = {

  CRMGenerateDependentMemberId: async (): Promise<CRMGenerateDependentMemberIdResponse> => {
    try {
      const response = await api.get('/CRMGenerateDependentMemberId');
      return response.data as CRMGenerateDependentMemberIdResponse;

    } catch (error) {
      console.error('Error generating dependent member id:', error);
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
        employee: requestData.EmployeeId,
        relationship: requestData.DependentRelationShip,
        name: requestData.DependentName,
        mobile_no: requestData.DependentMobileNo,
        gender: requestData.DependentGender,
        dob: convertDate(requestData.DependentDOB),
        email: requestData.DependentEmailId || "",
        marital_status: requestData.MaritalStatus,
        occupation: requestData.Occupation
      };

      console.log("Sending dependent payload:", payload);
      const response = await api.post('/api/dependants/', payload);
      console.log("Dependent creation response:", response.data);

      // Type the response data properly
      const responseData = response.data as any;

      // Return the full response with both message and data
      return {
        Message: responseData.message || "Success",
        data: responseData.data
      } as CRMInsertUpdateEmployeeDependantDetailsResponse;
    } catch (error) {
      console.error('Error inserting/updating employee dependent details:', error);
      throw error;
    }
  },

  // New function to fetch dependents list for dropdown
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

      return rawData as CRMFetchDependentDetailsForEmployeeResponse[];
    } catch (error) {
      console.error('Error fetching dependents:', error);
      throw error;
    }
  },

  CRMFetchDependentDetailsForEmployee: async (requestData: CRMFetchDependentDetailsForEmployeeRequest): Promise<CRMFetchDependentDetailsForEmployeeResponse[]> => {
    try {
      // Use the correct endpoint - GET /api/dependants/
      const response = await api.get('/api/dependants/');
      console.log("Fetch Dependents Response:", response.data);

      let rawData: any[] = [];

      // Handle different response formats
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      // Map backend response to frontend format
      const mappedData: CRMFetchDependentDetailsForEmployeeResponse[] = rawData.map((item: any) => ({
        EmployeeDependentDetailsId: item.id || 0,
        EmployeeId: requestData.EmployeeRefId,
        DependentId: item.member_id || "",
        Relationship: getRelationshipName(item.relationship),
        DependentRelationShip: item.relationship || 0,
        DependentName: item.name || "",
        DependentMobileNo: item.mobile_number || "",
        Description: "",
        DependentGender: parseInt(item.gender) || 0,
        DependentDOB: item.dob || "",
        DOB: item.dob || "",
        AccessProfilePermission: false,
        MaritalStatus: parseInt(item.marital_status) || 0,
        Occupation: item.occupation ? getOccupationId(item.occupation) : 0,
        DependentEmailId: item.email || "",
        IsActive: item.is_active !== undefined ? item.is_active : true,
        DependentMemberId: item.member_id || ""
      }));

      console.log("Mapped Dependents Data:", mappedData);
      return mappedData;
    } catch (error) {
      console.error('Error fetching dependent details for employee:', error);
      throw error;
    }
  },

  DeactivateEmployeeDependent: async (employeeDependentDetailsId: number): Promise<{ success: boolean; message: string }> => {
    try {
      // Use DELETE method on /api/dependants/{id}/
      const response = await api.delete(`/api/dependants/${employeeDependentDetailsId}/`);
      console.log("Delete dependent response:", response.data);

      // Return success message
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
      // Updated to use the axios api instance which handles token refresh
      const response = await api.get('/api/location/cities/');

      const data = response.data;

      // Map response to District interface
      // If the data is just a list of strings, we map it:
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