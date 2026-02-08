const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const homeAPI = {
  // Main API for all health basic details
  CRMCustomerHealthBasicDetails: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMCustomerHealthBasicDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching health basic details:", error);
      return null;
    }
  },

  // Individual metric history APIs
  GetBMIMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerBMIDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching BMI history:", error);
      return [];
    }
  },

  GetBloodPressureMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerBloodPressureDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching Blood Pressure history:", error);
      return [];
    }
  },

  GetHeartRateMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerHeartRateDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching Heart Rate history:", error);
      return [];
    }
  },

  GetO2SaturationMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerOxygenSaturationLevelDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching O2 Saturation history:", error);
      return [];
    }
  },

  GetGlucoseMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerGlucoseDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching Glucose history:", error);
      return [];
    }
  },

  GetHeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerHeightDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching Glucose history:", error);
      return [];
    }
  },
  GetWeightDetailsMetricHistory: async (employeeRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchCustomerWeightDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error fetching Glucose history:", error);
      return [];
    }
  },

  // Update BMI metric
  UpdateBMIMetric: async (employeeRefId: number, BMI: string, measurementValue: string, loginRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMSaveCustomerBMIDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          BMI,
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating BMI metric:", error);
      throw error;
    }
  },

  CRMSaveCustomerWeightDetails: async (employeeRefId: number, weight: string, measurementValue: string, loginRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMSaveCustomerWeightDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          Weight: weight,
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating BMI metric:", error);
      throw error;
    }
  },

  // Update Blood Pressure
  UpdateBloodPressureMetric: async (employeeRefId: number, bloodPressure: string, measurementValue: string, loginRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMSaveCustomerBloodPressureDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          BloodPressureValueOne: bloodPressure,
          BloodPressureValueTwo: bloodPressure,
          BloodPressureValueThree: bloodPressure,
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId,
          BloodPressureTypeValue: 1
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating Blood Pressure metric:", error);
      throw error;
    }
  },

  // Update Heart Rate
  UpdateHeartRateMetric: async (employeeRefId: number, heartRate: string, measurementValue: string, loginRefId: number) => {
    try {
      const heartRateNum = parseInt(heartRate);

      const response = await fetch(`${API_URL}/CRMSaveCustomerHeartRateDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          HeartRateValueOne: heartRate,
          HeartRateValueTwo: (heartRateNum + 5).toString(),
          HeartRateValueThree: (heartRateNum - 5).toString(),
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating Heart Rate metric:", error);
      throw error;
    }
  },

  // Update O₂ Saturation Levels
  UpdateO2SaturationMetric: async (employeeRefId: number, o2Saturation: string, measurementValue: string, loginRefId: number) => {
    try {
      const o2Num = parseInt(o2Saturation);

      const response = await fetch(`${API_URL}/CRMSaveCustomerOxygenSaturationDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          OxygenSaturationValueOne: o2Saturation,
          OxygenSaturationValueTwo: (o2Num + 1).toString(),
          OxygenSaturationValueThree: (o2Num - 1).toString(),
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating O2 Saturation metric:", error);
      throw error;
    }
  },

  // Update Glucose
  UpdateGlucoseMetric: async (employeeRefId: number, glucose: string, measurementValue: string, loginRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMSaveCustomerGlucoseDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          Glucose: glucose,
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating Glucose metric:", error);
      throw error;
    }
  },

  UpdateHeightMetric: async (employeeRefId: number, heightValue: string, measurementValue: string, loginRefId: number) => {
    try {
      const response = await fetch(`${API_URL}/CRMSaveCustomerHeightDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmployeeRefId: employeeRefId,
          Height: heightValue,
          MeasurementValue: measurementValue,
          LoginRefId: loginRefId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error updating Glucose metric:", error);
      throw error;
    }
  },

  // Get upcoming events
  GetUpcomingEvents: async (employeeRefId?: number, corporateId?: number, roleId?: number, loginType?: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const toDate = nextYear.toISOString().split('T')[0];

      const response = await fetch(`${API_URL}/api/my-bookings/?from=${today}&to=${toDate}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  },

  CRMLoadSponsoredServices: async (employeeRefId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/CRMLoadSponsoredServices/${employeeRefId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching sponsored services:", error);
      return null;
    }
  },


};
