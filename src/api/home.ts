import { api } from "../services/api";

const API_URL = "http://3.110.32.224";

export const homeAPI = {
  // Main API for all health basic details
  CRMCustomerHealthBasicDetails: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMCustomerHealthBasicDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching health basic details:", error);
      return null;
    }
  },

  // Individual metric history APIs
  GetBMIMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerBMIDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching BMI history:", error);
      return [];
    }
  },

  GetBloodPressureMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerBloodPressureDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Blood Pressure history:", error);
      return [];
    }
  },

  GetHeartRateMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerHeartRateDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Heart Rate history:", error);
      return [];
    }
  },

  GetO2SaturationMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerOxygenSaturationLevelDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching O2 Saturation history:", error);
      return [];
    }
  },

  GetGlucoseMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerGlucoseDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching Glucose history:", error);
      return [];
    }
  },

  GetHeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerHeightDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching height details history:", error);
      return [];
    }
  },
  GetWeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await api.post("/CRMFetchCustomerWeightDetails", { EmployeeRefId: employeeRefId });
      return response.data;
    } catch (error) {
      console.error("Error fetching weight details history:", error);
      return [];
    }
  },

  // Update BMI metric
  UpdateBMIMetric: async (employeeRefId: number, bmi: string, bmiUnit: string, loginRefId: number) => {
    try {
      const response = await api.post("/CRMSaveCustomerBMIDetails", {
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
      const response = await api.post("/CRMSaveCustomerWeightDetails", {
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
      const response = await api.post("/CRMSaveCustomerBloodPressureDetails", {
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
      const response = await api.post("/CRMSaveCustomerHeartRateDetails", {
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
      const response = await api.post("/CRMSaveCustomerOxygenSaturationDetails", {
        EmployeeRefId: employeeRefId,
        OxygenSaturationValueOne: o2, // Assuming this maps to O2SaturationLevels
        OxygenSaturationValueTwo: (parseInt(o2) + 1).toString(), // Keeping original logic for derived values
        OxygenSaturationValueThree: (parseInt(o2) - 1).toString(), // Keeping original logic for derived values
        MeasurementValue: o2Unit, // Assuming this maps to HRO2SaturationLevelsValue
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
      const response = await api.post("/CRMSaveCustomerGlucoseDetails", {
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
      const response = await api.post("/CRMSaveCustomerHeightDetails", {
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
      const response = await api.post("/CRMUpcomingEventsDetails", {
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
      const response = await api.get(`/CRMLoadSponsoredServices/${employeeRefId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sponsored services:", error);
      return null;
    }
  },
};