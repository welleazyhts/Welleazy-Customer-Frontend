import { api } from "../services/api";

export const homeAPI = {
  // Main API for all health basic details
  CRMCustomerHealthBasicDetails: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMCustomerHealthBasicDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching health basic details:", error);
      return null;
    }
  },

  // Individual metric history APIs
  GetBMIMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerBMIDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching BMI history:", error);
      return [];
    }
  },

  GetBloodPressureMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerBloodPressureDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Blood Pressure history:", error);
      return [];
    }
  },

  GetHeartRateMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerHeartRateDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Heart Rate history:", error);
      return [];
    }
  },

  GetO2SaturationMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerOxygenSaturationLevelDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching O2 Saturation history:", error);
      return [];
    }
  },

  GetGlucoseMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerGlucoseDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Glucose history:", error);
      return [];
    }
  },

  GetHeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerHeightDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching height details history:", error);
      return [];
    }
  },
  GetWeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/api/CRMFetchCustomerWeightDetails/", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching weight details history:", error);
      return [];
    }
  },

  // Update BMI metric
  UpdateBMIMetric: async (employeeRefId: number, bmi: string, bmiUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerBMIDetails/", {
        EmployeeRefId: employeeRefId,
        BMI: bmi,
        HRBMIValue: bmiUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating BMI:", error);
      throw error;
    }
  },

  CRMSaveCustomerWeightDetails: async (employeeRefId: number, weight: string, weightUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerWeightDetails/", {
        EmployeeRefId: employeeRefId,
        Weight: weight,
        HRWeightValue: weightUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating weight:", error);
      throw error;
    }
  },

  // Update Blood Pressure
  UpdateBloodPressureMetric: async (employeeRefId: number, bp: string, bpUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerBloodPressureDetails/", {
        EmployeeRefId: employeeRefId,
        BloodPressure: bp,
        HRBloodPressureValue: bpUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Blood Pressure:", error);
      throw error;
    }
  },

  // Update Heart Rate
  UpdateHeartRateMetric: async (employeeRefId: number, hr: string, hrUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerHeartRateDetails/", {
        EmployeeRefId: employeeRefId,
        HeartRate: hr,
        HRHeartRateValue: hrUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Heart Rate:", error);
      throw error;
    }
  },

  // Update O₂ Saturation Levels
  UpdateO2SaturationMetric: async (employeeRefId: number, o2: string, o2Unit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerOxygenSaturationDetails/", {
        EmployeeRefId: employeeRefId,
        OxygenSaturationValueOne: o2,
        OxygenSaturationValueTwo: (parseInt(o2) + 1).toString(),
        OxygenSaturationValueThree: (parseInt(o2) - 1).toString(),
        MeasurementValue: o2Unit,
        LoginRefId: loginRefId
      });
      return response.data;
    } catch (error) {
      console.error("Error updating O2 Saturation:", error);
      throw error;
    }
  },

  // Update Glucose
  UpdateGlucoseMetric: async (employeeRefId: number, glucose: string, glucoseUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerGlucoseDetails/", {
        EmployeeRefId: employeeRefId,
        Glucose: glucose,
        HRGlucoseValue: glucoseUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Glucose:", error);
      throw error;
    }
  },

  UpdateHeightMetric: async (employeeRefId: number, heightValue: string, heightUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/api/CRMSaveCustomerHeightDetails/", {
        EmployeeRefId: employeeRefId,
        Height: heightValue,
        HRHeightValue: heightUnit,
        LoginRefid: loginRefId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating height:", error);
      throw error;
    }
  },

  // Get upcoming events
  GetUpcomingEvents: async (employeeRefId?: number, corporateId?: number, roleId?: number, loginType?: number) => {
    try {
      const response = await api.post("/api/CRMUpcomingEventsDetails/", {
        EmployeeRefId: employeeRefId,
        RoleId: roleId || 0,
        LoginType: loginType,
        CorporateId: corporateId
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  },

  CRMLoadSponsoredServices: async (employeeRefId: number) => {
    try {
      const response = await api.get(`/api/CRMLoadSponsoredServices/${employeeRefId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sponsored services:", error);
      return null;
    }
  },
};