
import { api } from "../services/api";
import { GymPackage, CustomerProfile, State, District, GymCenter, Relationship, RelationshipPerson } from "../types/GymServices";

export const gymServiceAPI = {

  LoadGymCardDetails: async (districtId: string = "0"): Promise<GymPackage[]> => {
    try {
      const response = await api.get(`/LoadGymCardDetails/${districtId}`);
      return response.data as GymPackage[];
    } catch (error) {
      console.error("Error fetching gym service data:", error);
      throw error;
    }
  },

  CRMLoadCustomerProfileDetails: async (employeeRefId: number): Promise<CustomerProfile> => {
    try {
      const response = await api.get(`/CRMLoadCustomerProfileDetails/${employeeRefId}`);
      const data: CustomerProfile = response.data as CustomerProfile;

      // Save to localStorage (Keeping existing behavior but note this might depend on user context)
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

  CRMStateList: async (): Promise<State[]> => {
    try {
      const response = await api.get("/CRMStateList");
      return response.data as State[];
    } catch (error) {
      console.error("Error fetching state list:", error);
      throw error;
    }
  },

  CRMDistrictList: async (stateId: number): Promise<District[]> => {
    try {
      const response = await api.post("/CRMCityList", { StateId: stateId });
      return response.data as District[];
    } catch (error) {
      console.error("Error fetching district list:", error);
      throw error;
    }
  },

  LoadGymDropDown: async (districtId: number): Promise<GymCenter[]> => {
    try {
      const response = await api.get(`/LoadGymDropDown/${districtId}`);
      return response.data as GymCenter[];
    } catch (error) {
      console.error("Error fetching gym centers:", error);
      throw error;
    }
  },

  RazorpayPayment: async (paymentData: { PaymentId: string }): Promise<any> => {
    try {
      const response = await api.post("/RazorpayPayment", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error processing Razorpay payment:", error);
      throw error;
    }
  },

  SaveGymVoucherDetails: async (formData: FormData): Promise<any> => {
    try {
      const response = await api.post("/SaveGymVocherDetails", formData);
      return response.data;
    } catch (error) {
      console.error("Error saving gym voucher details:", error);
      throw error;
    }
  },

  CRMRelationShipList: async (): Promise<Relationship[]> => {
    try {
      const response = await api.get("/api/dependants/relationship-types/");
      const responseData = response.data;
      console.log("Relationship List Response:", responseData);

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

      // Filter by relationship ID
      // supporting multiple potential key names from backend
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
