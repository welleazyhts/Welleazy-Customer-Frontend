import { GymPackage, CustomerProfile, State, District, GymCenter, Relationship, RelationshipPerson } from "../types/GymServices";
import { api } from "../services/api";
const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const gymServiceAPI = {

  LoadGymCardDetails: async (districtId: string = "0"): Promise<GymPackage[]> => {
    try {
      localStorage.setItem("DistrictId", districtId);

      const response = await fetch(`${API_URL}/LoadGymCardDetails/${districtId}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: GymPackage[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching gym service data:", error);
      throw error;
    }
  },
  CRMLoadCustomerProfileDetails: async (employeeRefId: number): Promise<CustomerProfile> => {
    try {
      const response = await api.get(`/api/accounts/profile/`);
      const data = response.data as any;

      const profile: CustomerProfile = {
        EmployeeRefId: data.id || employeeRefId,
        EmployeeId: data.employee_id || "",
        EmployeeName: data.name || data.EmployeeName || "",
        Emailid: data.email || data.Emailid || "",
        MobileNo: data.mobile_number || data.MobileNo || "",
        Gender: data.gender || "",
        Employee_DOB: data.dob || "",
        StateId: data.state || 0,
        CityId: data.city || 0,
        Address: data.address || "",
        Pincode: data.pincode || "",
        CorporateName: data.corporate_name || "",
        Branch: data.branch || "",
        BloodGroup: data.blood_group || "",
        MemberId: data.member_id || "",
        PackageId: data.package || "",
        Services: data.services || "",
        ProductId: data.product || "",
        ...data
      };

      // Save to localStorage
      localStorage.setItem("employeeName", profile.EmployeeName || "");
      localStorage.setItem("email", profile.Emailid || "");
      localStorage.setItem("mobile", profile.MobileNo || "");
      localStorage.setItem("Gender", profile.Gender || "");
      localStorage.setItem("DOB", profile.Employee_DOB || "");
      localStorage.setItem("StateId", profile.StateId?.toString() || "");
      localStorage.setItem("CityId", profile.CityId?.toString() || "");
      localStorage.setItem("address", profile.Address || "");
      localStorage.setItem("pincode", profile.Pincode || "");

      localStorage.setItem("CorporateName", profile.CorporateName || "");
      localStorage.setItem("Branch", profile.Branch || "");
      localStorage.setItem("BloodGroup", profile.BloodGroup || "");
      localStorage.setItem("MemberId", profile.MemberId || "");
      localStorage.setItem("PackageId", profile.PackageId || "");
      localStorage.setItem("Services", profile.Services || "");
      localStorage.setItem("ProductId", profile.ProductId || "");
      return profile;
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },
  CRMStateList: async (): Promise<State[]> => {
    try {
      const response = await api.get(`/api/location/states/`);
      const data = (response.data as any)?.results || response.data || [];
      return (data as any[]).map((item: any) => ({
        StateId: item.id || item.StateId,
        StateName: item.name || item.StateName
      }));
    } catch (error) {
      console.error("Error fetching state list:", error);
      throw error;
    }
  },

  CRMDistrictList: async (stateId: number): Promise<District[]> => {
    try {
      const response = await api.get(`/api/location/cities/by-state/`, {
        params: { state_id: stateId }
      });
      const data = (response.data as any)?.results || response.data || [];
      return (data as any[]).map((item: any, index: number) => ({
        DistrictId: item.id || item.DistrictId || index,
        DistrictName: item.name || item.DistrictName || (typeof item === 'string' ? item : ""),
      })) as District[];
    } catch (error) {
      console.error("Error fetching district list:", error);
      throw error;
    }
  },
  LoadGymDropDown: async (districtId: number): Promise<GymCenter[]> => {
    try {
      const response = await fetch(`${API_URL}/LoadGymDropDown/${districtId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: GymCenter[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching gym centers:", error);
      throw error;
    }
  },
  RazorpayPayment: async (paymentData: { PaymentId: string }): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/RazorpayPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error processing Razorpay payment:", error);
      throw error;
    }
  },
  SaveGymVoucherDetails: async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/SaveGymVocherDetails`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving gym voucher details:", error);
      throw error;
    }
  },
  CRMRelationShipList: async (): Promise<Relationship[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/dependants/relationship-types/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const responseData = await response.json();
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
        RelationshipId: item.id || item.RelationshipId || item.pk,
        Relationship: item.name || item.Relationship || item.RelationshipName || item.relationship_name || "Unknown Relation",
      })) as Relationship[];
    } catch (error) {
      console.error("Error fetching relationship list:", error);
      throw error;
    }
  },
  CRMRelationShipPersonNames: async (employeeRefId: number, relationshipId: number): Promise<RelationshipPerson[]> => {
    try {
      const token = localStorage.getItem('token');
      // Use the standard dependants endpoint and filter client-side
      const response = await fetch(`${API_URL}/api/dependants/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Relationship Person Response:", responseData);

      let rawData: any[] = [];
      if (Array.isArray(responseData)) {
        rawData = responseData;
      } else if (responseData && Array.isArray((responseData as any).data)) {
        rawData = (responseData as any).data;
      } else if (responseData && Array.isArray((responseData as any).results)) {
        rawData = (responseData as any).results;
      }

      // Filter by relationship ID if provided (0 means All)
      const filteredData = relationshipId === 0 ? rawData : rawData.filter((item: any) => {
        // As per provided JSON, the field is 'relationship'.
        // We prioritizing checking 'relationship' directly.
        const itemRelId = item.relationship;

        // Also support legacy/alternative fields just in case
        const derivedRelId = itemRelId || item.DependentRelationShip || item.RelationshipId;

        // Perform strict numeric comparison
        return Number(derivedRelId) === Number(relationshipId);
      });

      console.log(`Filtered Dependents for Relationship ID ${relationshipId}:`, filteredData);

      return filteredData.map((item: any) => ({
        EmployeeDependentDetailsId: item.id || item.EmployeeDependentDetailsId || item.pk,
        DependentName: item.name || item.DependentName || item.dependant_name || "Unknown Name",
      })) as RelationshipPerson[];

    } catch (error) {
      console.error("Error fetching relationship person names:", error);
      return [];
    }
  },


}
