import { api } from '../services/api';
import { api } from '../services/api';
import { EmployeeAddressDetails, SaveCustomerAddressRequest } from '../types/AddressBook';

export const mapAddressTypeToId = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'home': return 1;
    case 'office': return 2;
    case 'other': return 3;
    default: return 1;
  }
};

export const mapIdToAddressType = (id: number): string => {
  switch (id) {
    case 1: return 'Home';
    case 2: return 'Office';
    case 3: return 'Other';
    default: return 'Home';
  }
};
export const mapAddressTypeToId = (type: string): number => {
  switch (type.toLowerCase()) {
    case 'home': return 1;
    case 'office': return 2;
    case 'other': return 3;
    default: return 1;
  }
};

export const mapIdToAddressType = (id: number): string => {
  switch (id) {
    case 1: return 'Home';
    case 2: return 'Office';
    case 3: return 'Other';
    default: return 'Home';
  }
};

export const AddressBookAPI = {

  CRMGetCustomerAddressDetails: async (employeeRefId: number): Promise<EmployeeAddressDetails[]> => {
    try {
      // We fetch both self and dependants to match the consolidated UI view if needed
      // But usually, common patterns use the unified list if available
      const response = await api.get('/api/addresses/');
      const data = response.data as any;

      const normalizedData = Array.isArray(data) ? data : data?.data ?? [];

      return normalizedData.map((addr: any) => ({
        EmployeeAddressDetailsId: addr.id,
        EmployeeRefId: employeeRefId,
        EmployeeName: addr.person_name || '',
        Relationship: addr.relationship_name || 'Self',
        RelationType: addr.address_type,
        AddressType: mapIdToAddressType(addr.address_type),
        AddressLineOne: addr.address_line1,
        AddressLineTwo: addr.address_line2 || '',
        Landmark: addr.landmark || '',
        StateId: typeof addr.state === 'string' ? parseInt(addr.state) : addr.state,
        CityId: typeof addr.city === 'string' ? parseInt(addr.city) : addr.city,
        StateName: addr.state_name || '',
        DistrictName: addr.city_name || '',
        Pincode: addr.pincode,
        ContactNo: addr.contact_no || '', // JSON doesn't show this, but keeping for UI compatibility
        IsDefault: addr.is_default || false,
        IsDefaultValue: addr.is_default ? 'Yes' : 'No',
        EmployeeDependentDetailsId: addr.dependant_id || 0
      }));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    try {
      // We fetch both self and dependants to match the consolidated UI view if needed
      // But usually, common patterns use the unified list if available
      const response = await api.get('/api/addresses/');
      const data = response.data as any;

      const normalizedData = Array.isArray(data) ? data : data?.data ?? [];

      return normalizedData.map((addr: any) => ({
        EmployeeAddressDetailsId: addr.id,
        EmployeeRefId: employeeRefId,
        EmployeeName: addr.person_name || '',
        Relationship: addr.relationship_name || 'Self',
        RelationType: addr.address_type,
        AddressType: mapIdToAddressType(addr.address_type),
        AddressLineOne: addr.address_line1,
        AddressLineTwo: addr.address_line2 || '',
        Landmark: addr.landmark || '',
        StateId: typeof addr.state === 'string' ? parseInt(addr.state) : addr.state,
        CityId: typeof addr.city === 'string' ? parseInt(addr.city) : addr.city,
        StateName: addr.state_name || '',
        DistrictName: addr.city_name || '',
        Pincode: addr.pincode,
        ContactNo: addr.contact_no || '', // JSON doesn't show this, but keeping for UI compatibility
        IsDefault: addr.is_default || false,
        IsDefaultValue: addr.is_default ? 'Yes' : 'No',
        EmployeeDependentDetailsId: addr.dependant_id || 0
      }));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },

  CRMSaveCustomerAddressDetails: async (payload: SaveCustomerAddressRequest): Promise<{ Message: string }> => {
    try {
      const isUpdate = payload.EmployeeAddressDetailsId > 0;
      const isDependant = payload.EmployeeDependentDetailsId > 0;

      let url = isDependant
        ? `/api/addresses/dependants/${payload.EmployeeDependentDetailsId}/addresses/`
        : '/api/addresses/';

      if (isUpdate) {
        url = `/api/addresses/${payload.EmployeeAddressDetailsId}/`;
      }

      const body = {
        address_type: mapAddressTypeToId(payload.AddressType),
        address_line1: payload.AddressLineOne,
        address_line2: payload.AddressLineTwo || "",
        landmark: payload.Landmark || "",
        state: payload.StateId.toString(),
        city: payload.CityId.toString(),
        pincode: payload.Pincode,
        is_default: payload.IsDefault
      };

      if (isUpdate) {
        await api.put(url, body);
      } else {
        await api.post(url, body);
      }

      return { Message: "Customer Address Details Saved Successfully" };
    } catch (error) {
      console.error("Error saving address:", error);
      throw error;
    try {
      const isUpdate = payload.EmployeeAddressDetailsId > 0;
      const isDependant = payload.EmployeeDependentDetailsId > 0;

      let url = isDependant
        ? `/api/addresses/dependants/${payload.EmployeeDependentDetailsId}/addresses/`
        : '/api/addresses/';

      if (isUpdate) {
        url = `/api/addresses/${payload.EmployeeAddressDetailsId}/`;
      }

      const body = {
        address_type: mapAddressTypeToId(payload.AddressType),
        address_line1: payload.AddressLineOne,
        address_line2: payload.AddressLineTwo || "",
        landmark: payload.Landmark || "",
        state: payload.StateId.toString(),
        city: payload.CityId.toString(),
        pincode: payload.Pincode,
        is_default: payload.IsDefault
      };

      if (isUpdate) {
        await api.put(url, body);
      } else {
        await api.post(url, body);
      }

      return { Message: "Customer Address Details Saved Successfully" };
    } catch (error) {
      console.error("Error saving address:", error);
      throw error;
    }
  },

  CRMGetCustomerIndividualAddressDetails: async (employeeAddressDetailsId: number): Promise<EmployeeAddressDetails[]> => {
    try {
      const response = await api.get(`/api/addresses/${employeeAddressDetailsId}/`);
      const addr = response.data as any;

      return [{
        EmployeeAddressDetailsId: addr.id,
        EmployeeRefId: 0,
        EmployeeName: addr.person_name || '',
        Relationship: addr.relationship_name || 'Self',
        RelationType: addr.address_type,
        AddressType: mapIdToAddressType(addr.address_type),
        AddressLineOne: addr.address_line1,
        AddressLineTwo: addr.address_line2 || '',
        Landmark: addr.landmark || '',
        StateId: typeof addr.state === 'string' ? parseInt(addr.state) : addr.state,
        CityId: typeof addr.city === 'string' ? parseInt(addr.city) : addr.city,
        StateName: addr.state_name || '',
        DistrictName: addr.city_name || '',
        Pincode: addr.pincode,
        ContactNo: addr.contact_no || '',
        IsDefault: addr.is_default || false,
        IsDefaultValue: addr.is_default ? 'Yes' : 'No',
        EmployeeDependentDetailsId: addr.dependant_id || 0
      }];
    } catch (error) {
      console.error("Error fetching individual address:", error);
      throw error;
  CRMGetCustomerIndividualAddressDetails: async (employeeAddressDetailsId: number): Promise<EmployeeAddressDetails[]> => {
    try {
      const response = await api.get(`/api/addresses/${employeeAddressDetailsId}/`);
      const addr = response.data as any;

      return [{
        EmployeeAddressDetailsId: addr.id,
        EmployeeRefId: 0,
        EmployeeName: addr.person_name || '',
        Relationship: addr.relationship_name || 'Self',
        RelationType: addr.address_type,
        AddressType: mapIdToAddressType(addr.address_type),
        AddressLineOne: addr.address_line1,
        AddressLineTwo: addr.address_line2 || '',
        Landmark: addr.landmark || '',
        StateId: typeof addr.state === 'string' ? parseInt(addr.state) : addr.state,
        CityId: typeof addr.city === 'string' ? parseInt(addr.city) : addr.city,
        StateName: addr.state_name || '',
        DistrictName: addr.city_name || '',
        Pincode: addr.pincode,
        ContactNo: addr.contact_no || '',
        IsDefault: addr.is_default || false,
        IsDefaultValue: addr.is_default ? 'Yes' : 'No',
        EmployeeDependentDetailsId: addr.dependant_id || 0
      }];
    } catch (error) {
      console.error("Error fetching individual address:", error);
      throw error;
    }
  },


  CRMDeleteCustomerIndividualAddressDetails: async (employeeAddressDetailsId: number): Promise<{ Message: string }> => {
    try {
      await api.delete(`/api/addresses/${employeeAddressDetailsId}/`);
      return { Message: "Address deleted successfully" };
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  getAddressTypes: async () => {
    const response = await api.get('/api/addresses/types/');
    return response.data as any;
  }
    try {
      await api.delete(`/api/addresses/${employeeAddressDetailsId}/`);
      return { Message: "Address deleted successfully" };
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  getAddressTypes: async () => {
    const response = await api.get('/api/addresses/types/');
    return response.data as any;
  }
};