import {
  PharmacyProductList, SearchPharmacyProductList, SearchAllResponse, InventoryCheckRequest, InventoryCheckResponse, OneMGGenerateOrderRequest, OneMGGenerateOrderResponse
  , DrugStaticRequest, DrugStaticResponse, OneMGPharmacyAddToCartDetailsRequest, OneMGPharmacyAddToCartDetailsResponse,
  EmployeeDeliveryAddress
} from '../types/Pharmacy';


const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const PharmacyAPI = {
  //tata one mg pharmacy apis
  LoadPharmacyProductList: async (): Promise<PharmacyProductList[]> => {
    try {
      const response = await fetch(`${API_URL}/LoadPharmacyProductList`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading pharmacy product list:', error);
      throw error;
    }
  },
  SearchAllProducts: async (searchTerm: string = ""): Promise<SearchPharmacyProductList[]> => {
    try {
      const response = await fetch(`${API_URL}/SearchAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchTerm || "medicine",
          type: "sku,udp,otc,drug",
          per_page: "10"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchAllResponse = await response.json();

      if (!data.data.result_found) {
        return [];
      }

      const sortedProducts = data.data.search_results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return sortedProducts;
    } catch (error) {
      console.error('Error searching pharmacy products:', error);
      throw error;
    }
  },
  GenerateOfflineMedicineCoupon: async (couponData: any): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('ApolloId', couponData.ApolloId?.toString() || '0');
      formData.append('ApolloSKU', couponData.ApolloSKU || '');
      formData.append('Relation', couponData.Relation?.toString() || '1');
      formData.append('Name', couponData.Name || '');
      formData.append('ContactNo', couponData.ContactNo || '');
      formData.append('Email', couponData.Email || '');
      formData.append('State', couponData.State?.toString() || '0');
      formData.append('City', couponData.City?.toString() || '0');
      formData.append('Address', couponData.Address || '');
      formData.append('CouponName', couponData.CouponName || '');
      formData.append('CreatedBy', couponData.CreatedBy?.toString() || '0');
      formData.append('MedicineName', couponData.MedicineName || '');
      if (couponData.prescriptionFile) {
        formData.append('prescriptionFile', couponData.prescriptionFile);
      }

      const response = await fetch(`${API_URL}/Pharmacyofflinemedicine`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating offline medicine coupon:', error);
      throw error;
    }
  },
  InventoryCheck: async (inventoryData: InventoryCheckRequest): Promise<InventoryCheckResponse> => {
    try {
      const response = await fetch(`${API_URL}/InventoryCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: InventoryCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking inventory:', error);
      throw error;
    }
  },
  OneMGGenerateOrder: async (orderData: OneMGGenerateOrderRequest): Promise<OneMGGenerateOrderResponse> => {
    try {
      const response = await fetch(`${API_URL}/OneMGGenerateOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OneMGGenerateOrderResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating order:', error);
      throw error;
    }
  },
  DrugStatic: async (requestData: DrugStaticRequest): Promise<DrugStaticResponse> => {
    try {
      const response = await fetch(`${API_URL}/DrugStatic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DrugStaticResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading drug static data:', error);
      throw error;
    }
  },
  OneMGPharmacyAddToCartDetails: async (cartData: OneMGPharmacyAddToCartDetailsRequest): Promise<OneMGPharmacyAddToCartDetailsResponse> => {
    try {

      const requestData = {
        MedicineName: cartData.MedicineName,
        SKUID: cartData.SKUID,
        SKUIdQuantity: cartData.SKUIdQuantity.toString(),
        EmployeeRefId: cartData.EmployeeRefId.toString(),
        LoginRefId: cartData.LoginRefId.toString(),
        PharmacyCartDetailsId: cartData.PharmacyCartDetailsId
      };
      const response = await fetch(`${API_URL}/OneMGPharmacyAddToCartDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add to Cart API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OneMGPharmacyAddToCartDetailsResponse = await response.json();
      console.log('Add to Cart response received:', data);
      return data;
    } catch (error) {
      console.error('Error adding to cart details:', error);
      throw error;
    }
  },
  LoadEmployeeDeliveryAddressDetails: async (employeeRefId: number): Promise<EmployeeDeliveryAddress[]> => {
    try {
      const response = await fetch(
        `${API_URL}/LoadEmployeeDeliveryAddressDetails/${employeeRefId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EmployeeDeliveryAddress[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading employee delivery address details:", error);
      throw error;
    }
  },
  //pillow apis 

  PillowSearchMedicnemsearch: async (searchTerm: string = ""): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("apikey", "Uw2rCf9sS5ZWktHLzRENKYl1wb8IHytJ");
      formData.append("searchstring", searchTerm || "medicine");

      const response = await fetch(
        "https://dev-api.evitalrx.in/v1/fulfillment/medicines/search",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Pillo API raw response:", data);

      // Return the FULL response object, not just data.result
      return data;

    } catch (error) {
      console.error("Error searching pillow medicine products:", error);
      throw error;
    }
  },
  Pillowmedicinesview: async (medicineId: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("apikey", "Uw2rCf9sS5ZWktHLzRENKYl1wb8IHytJ");
      formData.append("medicine_id", medicineId);

      const response = await fetch(
        "https://dev-api.evitalrx.in/v1/fulfillment/medicines/view",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Pillo API raw response:", data);

      // Return the FULL response object, not just data.result
      return data;

    } catch (error) {
      console.error("Error viewing pillow medicine details:", error);
      throw error;
    }
  },
};
