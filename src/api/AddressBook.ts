import { EmployeeAddressDetails, SaveCustomerAddressRequest } from '../types/AddressBook';

const API_URL = '';

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


};