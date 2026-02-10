

import { api } from "../services/api";
import { GymPackage, CustomerProfile, State, District, GymCenter, Relationship, RelationshipPerson } from "../types/GymServices";

export const gymServiceAPI = {

  LoadGymCardDetails: async (): Promise<GymPackage[]> => {
 
    try {
      const response = await api.get("/api/gym_service/packages/");
      const data = response.data;

      // Map potential snake_case keys to CamelCase used in UI
      const packages = (Array.isArray(data) ? data : []).map((p: any) => {
        // Parse features string if it's a string like "\"sdhcbgs\" , \"JKSDHkjs\""
        let featuresArr: string[] = [];
        if (p.features && typeof p.features === 'string') {
          try {
            featuresArr = p.features.split(',').map((f: string) => f.trim().replace(/^"|"$/g, '').replace(/^\\"|\\"$/g, ''));
          } catch (e) {
            featuresArr = [p.features];
          }
        } else if (Array.isArray(p.features)) {
          featuresArr = p.features;
        }

        return {
          PackageId: p.id ?? p.PackageId ?? p.package_id,
          Duration: p.duration_months ?? p.Duration ?? p.duration ?? 0,
          ActualPrice: parseFloat(p.original_price ?? p.ActualPrice ?? p.actual_price ?? 0),
          Discount: p.discount_percent ?? p.Discount ?? p.discount ?? 0,
          DiscountPrice: parseFloat(p.discounted_price ?? p.DiscountPrice ?? p.discount_price ?? 0),
          PackageName: p.title ?? p.PackageName ?? p.package_name ?? "",
          City: p.City ?? p.city ?? 0,
          VendorName: p.vendor_name ?? p.VendorName ?? "Vendor",
          VendorLogo: p.vendor_logo ?? "",
          Features: featuresArr
        };
      });

      return packages as GymPackage[];
      const response = await api.get("/api/gym_service/packages/");
      const data = response.data;

      // Map potential snake_case keys to CamelCase used in UI
      const packages = (Array.isArray(data) ? data : []).map((p: any) => {
        // Parse features string if it's a string like "\"sdhcbgs\" , \"JKSDHkjs\""
        let featuresArr: string[] = [];
        if (p.features && typeof p.features === 'string') {
          try {
            featuresArr = p.features.split(',').map((f: string) => f.trim().replace(/^"|"$/g, '').replace(/^\\"|\\"$/g, ''));
          } catch (e) {
            featuresArr = [p.features];
          }
        } else if (Array.isArray(p.features)) {
          featuresArr = p.features;
        }

        return {
          PackageId: p.id ?? p.PackageId ?? p.package_id,
          Duration: p.duration_months ?? p.Duration ?? p.duration ?? 0,
          ActualPrice: parseFloat(p.original_price ?? p.ActualPrice ?? p.actual_price ?? 0),
          Discount: p.discount_percent ?? p.Discount ?? p.discount ?? 0,
          DiscountPrice: parseFloat(p.discounted_price ?? p.DiscountPrice ?? p.discount_price ?? 0),
          PackageName: p.title ?? p.PackageName ?? p.package_name ?? "",
          City: p.City ?? p.city ?? 0,
          VendorName: p.vendor_name ?? p.VendorName ?? "Vendor",
          VendorLogo: p.vendor_logo ?? "",
          Features: featuresArr
        };
      });

      return packages as GymPackage[];
    } catch (error) {
      console.error("Error fetching gym packages:", error);
      console.error("Error fetching gym packages:", error);
      throw error;
    }
  },


  CRMLoadCustomerProfileDetails: async (employeeRefId: number): Promise<CustomerProfile> => {
    try {
      const response = await api.get("/api/accounts/profile/");
      return response.data as CustomerProfile;
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },


  CRMStateList: async (): Promise<State[]> => {
    try {
      const response = await api.get("/api/location/states/");
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      return rawData.map((s: any) => ({
        StateId: s.id || s.StateId,
        StateName: s.name || s.StateName
      })) as State[];
      const response = await api.get("/api/location/states/");
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      return rawData.map((s: any) => ({
        StateId: s.id || s.StateId,
        StateName: s.name || s.StateName
      })) as State[];
    } catch (error) {
      console.error("Error fetching state list:", error);
      throw error;
    }
  },

  CRMDistrictList: async (stateId: number): Promise<District[]> => {
    try {
      const response = await api.get(`/api/location/cities/?state_id=${stateId}`);
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      const response = await api.get(`/api/location/cities/?state_id=${stateId}`);
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      return rawData.map((c: any) => ({
        DistrictId: c.id || c.DistrictId,
        DistrictName: c.name || c.DistrictName,
        StateId: stateId,
        StateName: ""
      })) as District[];
      return rawData.map((c: any) => ({
        DistrictId: c.id || c.DistrictId,
        DistrictName: c.name || c.DistrictName,
        StateId: stateId,
        StateName: ""
      })) as District[];
    } catch (error) {
      console.error("Error fetching district list:", error);
      throw error;
    }
  },

  LoadGymDropDown: async (): Promise<GymCenter[]> => {

  LoadGymDropDown: async (): Promise<GymCenter[]> => {
    try {
      const response = await api.get("/api/gym_service/centers/");
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      const response = await api.get("/api/gym_service/centers/");
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      return rawData.map((center: any) => ({
        GymDetailsId: center.id || center.GymDetailsId,
        GymCenterName: center.name || center.GymCenterName,
        GymCenterType: center.type || center.GymCenterType,
        GymBusinessLine: center.business_line || center.GymBusinessLine,
        GymStateId: center.state || center.GymStateId,
        GymCityId: center.city || center.GymCityId,
        GymAddress: center.address || center.GymAddress,
        Logo: center.logo || "",
        GymLocality: center.address || center.GymLocality || ""
      })) as GymCenter[];

      return rawData.map((center: any) => ({
        GymDetailsId: center.id || center.GymDetailsId,
        GymCenterName: center.name || center.GymCenterName,
        GymCenterType: center.type || center.GymCenterType,
        GymBusinessLine: center.business_line || center.GymBusinessLine,
        GymStateId: center.state || center.GymStateId,
        GymCityId: center.city || center.GymCityId,
        GymAddress: center.address || center.GymAddress,
        Logo: center.logo || "",
        GymLocality: center.address || center.GymLocality || ""
      })) as GymCenter[];
    } catch (error) {
      console.error("Error fetching gym centers:", error);
      throw error;
    }
  },

  FetchVouchers: async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/gym_service/vouchers/");
      return (response.data as any[]) || [];
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      throw error;
    }
  },


  FetchVouchers: async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/gym_service/vouchers/");
      return (response.data as any[]) || [];
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      throw error;
    }
  },

  RazorpayPayment: async (paymentData: { PaymentId: string }): Promise<any> => {
    try {
      const response = await api.post("/api/payments/razorpay/", paymentData);
      return response.data;
      const response = await api.post("/api/payments/razorpay/", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error processing Razorpay payment:", error);
      throw error;
    }
  },

  SaveGymVoucherDetails: async (voucherData: any): Promise<any> => {

  SaveGymVoucherDetails: async (voucherData: any): Promise<any> => {
    try {
      // Aligning with Postman: package_id, booking_for, gym_center_id, etc.
      // If it's a FormData object, api service should handle it.
      const response = await api.post("/api/gym_service/vouchers/", voucherData);
      return response.data;
      // Aligning with Postman: package_id, booking_for, gym_center_id, etc.
      // If it's a FormData object, api service should handle it.
      const response = await api.post("/api/gym_service/vouchers/", voucherData);
      return response.data;
    } catch (error) {
      console.error("Error saving gym voucher details:", error);
      throw error;
    }
  },

  ActivateVoucher: async (voucherId: number): Promise<any> => {
    try {
      const response = await api.post(`/api/gym_service/vouchers/${voucherId}/activate/`, {});
      return response.data;
    } catch (error) {
      console.error("Error activating voucher:", error);
      throw error;
    }
  },


  ActivateVoucher: async (voucherId: number): Promise<any> => {
    try {
      const response = await api.post(`/api/gym_service/vouchers/${voucherId}/activate/`, {});
      return response.data;
    } catch (error) {
      console.error("Error activating voucher:", error);
      throw error;
    }
  },

  CRMRelationShipList: async (): Promise<Relationship[]> => {
    try {
      const response = await api.get("/api/dependants/relationship-types/");
      const responseData = response.data;
      const response = await api.get("/api/dependants/relationship-types/");
      const responseData = response.data;

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      return rawData.map((item: any) => ({
        RelationshipId: item.id || item.RelationshipId,
        Relationship: item.name || item.Relationship,
      })) as Relationship[];
    } catch (error) {
      console.error("Error fetching relationship list:", error);
      throw error;
    }
  },


  CRMRelationShipPersonNames: async (employeeRefId: number, relationshipId: number): Promise<RelationshipPerson[]> => {
    try {
      const response = await api.get("/api/dependants/");
      const data = response.data as any;
      const rawData = Array.isArray(data) ? data : (data.results || []);

      const filtered = rawData.filter((item: any) =>
        (item.relationship === relationshipId) ||
        (item.relationship_id === relationshipId) ||
        (item.relationship?.id === relationshipId)
      );

      return filtered.map((item: any) => ({
        EmployeeDependentDetailsId: item.id,
        DependentName: item.name,
        RelationshipId: relationshipId
      }));
      const response = await api.get("/api/dependants/");
      const data = response.data as any;
      const rawData = Array.isArray(data) ? data : (data.results || []);

      const filtered = rawData.filter((item: any) =>
        (item.relationship === relationshipId) ||
        (item.relationship_id === relationshipId) ||
        (item.relationship?.id === relationshipId)
      );

      return filtered.map((item: any) => ({
        EmployeeDependentDetailsId: item.id,
        DependentName: item.name,
        RelationshipId: relationshipId
      }));
    } catch (error) {
      console.error("Error fetching relationship person names:", error);
      throw error;
    }
  },
};
};
