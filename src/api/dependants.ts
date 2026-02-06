import { api } from '../services/api';
import {
  CRMGenerateDependentMemberIdResponse, CRMInsertUpdateEmployeeDependantDetailsRequest, CRMInsertUpdateEmployeeDependantDetailsResponse
  , CRMFetchDependentDetailsForEmployeeRequest, CRMFetchDependentDetailsForEmployeeResponse, District
} from '../types/dependants';


const API_URL = "http://3.110.32.224";

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

      return rawData as CRMFetchDependentDetailsForEmployeeResponse[];
    } catch (error) {
      console.error('Error fetching dependents:', error);
      throw error;
    }
  },

  CRMFetchDependentDetailsForEmployee: async (requestData: CRMFetchDependentDetailsForEmployeeRequest): Promise<CRMFetchDependentDetailsForEmployeeResponse[]> => {
    try {
      const response = await api.post('/CRMFetchDependentDetailsForEmployee', requestData);
      return response.data as CRMFetchDependentDetailsForEmployeeResponse[];
    } catch (error) {
      console.error('Error fetching dependent details for employee:', error);
      throw error;
    }
  },

  DeactivateEmployeeDependent: async (employeeDependentDetailsId: number): Promise<any> => {
    try {
      const response = await api.post('/DeactivateEmployeeDependent', { employeeDependentDetailsId });
      return response.data;

    } catch (error) {
      console.error('Error deactivating employee dependent:', error);
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