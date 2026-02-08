import { EmployeeAddressDetails, SaveCustomerAddressRequest } from '../types/AddressBook';

const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const AddressBookAPI = {

  CRMGetCustomerAddressDetails: async (employeeRefId: number): Promise<EmployeeAddressDetails[]> => {
    const response = await fetch(
      `${API_URL}/CRMGetCustomerAddressDetails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
        }),
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
  },


  CRMSaveCustomerAddressDetails: async (payload: SaveCustomerAddressRequest): Promise<{ Message: string }> => {
    const response = await fetch(
      `${API_URL}/CRMSaveCustomerAddressDetails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error('Invalid JSON:', text);
      throw new Error('Invalid API response');
    }
  },

  CRMGetCustomerIndividualAddressDetails: async (
    employeeAddressDetailsId: number
  ): Promise<EmployeeAddressDetails[]> => {
    const response = await fetch(
      `${API_URL}/CRMGetCustomerIndividualAddressDetails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeAddressDetailsId: employeeAddressDetailsId,
        }),
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
  },
  CRMDeleteCustomerIndividualAddressDetails: async (employeeAddressDetailsId: number): Promise<{ Message: string }> => {
    const response = await fetch(
      `${API_URL}/CRMDeleteCustomerIndividualAddressDetails`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeAddressDetailsId: employeeAddressDetailsId,
        }),
      }
    );

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error('Invalid JSON:', text);
      throw new Error('Invalid API response');
    }
  },


  // New APIs based on Postman collection
  getSelfAddresses: async (addressType?: number): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_URL}/api/addresses/`);
    if (addressType) url.searchParams.append('address_type', addressType.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch addresses');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  getDependentAddresses: async (dependantId: number, addressType?: number): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_URL}/api/addresses/dependants/${dependantId}/addresses/`);
    if (addressType) url.searchParams.append('address_type', addressType.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch dependent addresses');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  saveSelfAddress: async (addressData: any): Promise<any> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/addresses/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });

    if (!response.ok) throw new Error('Failed to save self address');
    return await response.json();
  },

  saveDependentAddress: async (dependantId: number, addressData: any): Promise<any> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/addresses/dependants/${dependantId}/addresses/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });

    if (!response.ok) throw new Error('Failed to save dependent address');
    return await response.json();
  },

  getAddressTypes: async (): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/addresses/types/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch address types');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  }
};
