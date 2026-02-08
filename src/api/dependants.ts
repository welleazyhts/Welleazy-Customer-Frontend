import { api } from '../services/api';
import {
  CRMGenerateDependentMemberIdResponse, CRMInsertUpdateEmployeeDependantDetailsRequest, CRMInsertUpdateEmployeeDependantDetailsResponse
  , CRMFetchDependentDetailsForEmployeeRequest, CRMFetchDependentDetailsForEmployeeResponse, District
} from '../types/dependants';


const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const DependantsAPI = {

  CRMGenerateDependentMemberId: async (): Promise<CRMGenerateDependentMemberIdResponse> => {
    try {
      const response = await fetch(`${API_URL}/CRMGenerateDependentMemberId`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CRMGenerateDependentMemberIdResponse = await response.json();
      return data;

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
      return response.data as CRMInsertUpdateEmployeeDependantDetailsResponse;
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

      // Map the new API response structure to the frontend interface
      return rawData.map((item: any) => ({
        EmployeeDependentDetailsId: item.id || item.EmployeeDependentDetailsId,
        DependentName: item.name || item.DependentName,
        DependentRelationShip: item.relationship || item.DependentRelationShip,
        DependentMemberId: item.member_id || item.DependentMemberId,
        DependentGender: item.gender ? parseInt(item.gender.toString()) : (item.DependentGender || 0),
        DependentDOB: item.dob || item.DependentDOB,
        DependentMobileNo: item.mobile_number || item.DependentMobileNo || "",
        DependentEmailId: item.email || item.DependentEmailId || "",
        IsActive: item.is_active !== undefined ? item.is_active : (item.IsActive || true),
        // Add other required fields with defaults if missing
        EmployeeId: item.employee || item.EmployeeId || 0,
        DependentId: item.DependentId || "",
        Relationship: item.relationship_name || "", // Assuming backend might send this, or we handle name retrieval elsewhere
        Description: "",
        DOB: item.dob || item.DependentDOB,
        AccessProfilePermission: false,
        MaritalStatus: item.marital_status ? parseInt(item.marital_status.toString()) : 0,
        Occupation: 0
      })) as CRMFetchDependentDetailsForEmployeeResponse[];

    } catch (error) {
      console.error('Error fetching dependents:', error);
      throw error;
    }
  },

  CRMFetchDependentDetailsForEmployee: async (requestData: CRMFetchDependentDetailsForEmployeeRequest): Promise<CRMFetchDependentDetailsForEmployeeResponse[]> => {
    try {
      // Replaced old POST endpoint with new GET endpoint /api/dependants/
      const response = await api.get('/api/dependants/');
      console.log("CRMFetchDependentDetailsForEmployee Response:", response.data);

      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      // Map the new API response structure to the frontend interface
      return rawData.map((item: any) => ({
        EmployeeDependentDetailsId: item.id || item.EmployeeDependentDetailsId,
        DependentName: item.name || item.DependentName,
        DependentRelationShip: item.relationship || item.DependentRelationShip,
        DependentMemberId: item.member_id || item.DependentMemberId,
        DependentGender: item.gender ? parseInt(item.gender.toString()) : (item.DependentGender || 0),
        DependentDOB: item.dob || item.DependentDOB,
        DependentMobileNo: item.mobile_number || item.DependentMobileNo || "",
        DependentEmailId: item.email || item.DependentEmailId || "",
        IsActive: item.is_active !== undefined ? item.is_active : (item.IsActive || true),
        EmployeeId: item.employee || item.EmployeeId || 0,
        DependentId: item.DependentId || "",
        Relationship: item.relationship_name || "",
        Description: "",
        DOB: item.dob || item.DependentDOB,
        AccessProfilePermission: false,
        MaritalStatus: item.marital_status ? parseInt(item.marital_status.toString()) : 0,
        Occupation: 0
      })) as CRMFetchDependentDetailsForEmployeeResponse[];

    } catch (error) {
      console.error('Error fetching dependent details for employee:', error);
      throw error;
    }
  },

  DeactivateEmployeeDependent: async (employeeDependentDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/DeactivateEmployeeDependent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeDependentDetailsId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error deactivating employee dependent:', error);
      throw error;
    }
  },

  CRMLoadCitys: async (): Promise<District[]> => {
    try {
      // Updated to use the new cities endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/location/cities/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let rawData: any[] = [];
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray((data as any).data)) {
        rawData = (data as any).data;
      } else if (data && Array.isArray((data as any).results)) {
        rawData = (data as any).results;
      }

      return rawData.map((item: any, index: number) => ({
        DistrictId: item.id || item.DistrictId || index,
        DistrictName: item.name || item.DistrictName || (typeof item === 'string' ? item : ""),
        StateId: item.state || item.StateId || 0,
        StateName: item.state_name || item.StateName || "",
        IsActive: item.is_active !== undefined ? String(item.is_active) : (item.IsActive || "true"),
        CityType: item.CityType || null
      })) as District[];

    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },
};
