import {
  HealthRecord,
  HealthRecordsListApiResponse,
  HospitalizationDetail,
  MedicalBillDetail,
  VaccinationDetails,
  TestReportDocument,
  MedicalBillDocument,
  VaccinationDocument,
  HospitalizationDocument,
  DoctorSpecialization, TestReportParameterRecord
} from "../types/HealthRecords";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

const HealthRecordsAPI = {
  // GET Methods (existing)
  GetHealthRecords: async (employeeRefId: number): Promise<HealthRecordsListApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerTestReportDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HealthRecordsListApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching health records:", error);
      throw error;
    }
  },

  GetHospitalizationDetails: async (employeeRefId: number): Promise<HospitalizationDetail[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerHospitalizationDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching hospitalization details:", error);
      throw error;
    }
  },

  GetMedicalBillDetails: async (employeeRefId: number): Promise<MedicalBillDetail[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerMedicalBillDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching medical bill details:", error);
      throw error;
    }
  },

  GetVaccinationDetails: async (employeeRefId: number): Promise<VaccinationDetails[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerVaccinationDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching vaccination details:", error);
      throw error;
    }
  },

  // Document GET Methods (existing)
  CRMGetCustomerTestReportDocumentDetails: async (employeeRefId: number): Promise<TestReportDocument[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerTestReportDocumentDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching test report document details:", error);
      throw error;
    }
  },

  GetMedicalBillDocumentDetails: async (employeeRefId: number): Promise<MedicalBillDocument[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerMedicalBillDocumentDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching medical bill document details:", error);
      throw error;
    }
  },

  GetVaccinationDocumentDetails: async (employeeRefId: number): Promise<VaccinationDocument[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerVaccinationDocumentDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching vaccination document details:", error);
      throw error;
    }
  },

  GetHospitalizationDocumentDetails: async (employeeRefId: number): Promise<HospitalizationDocument[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerHospitalizationDocumentDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching hospitalization document details:", error);
      throw error;
    }
  },

  // ADD/UPDATE Methods
  // In your HealthRecordsAPI file
  CRMSaveCustomerTestReportDetails: async (formDataToSend: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMSaveCustomerTestReportDetails`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving health record:", error);
      throw error;
    }
  },



  CRMSaveCustomerHospitalizationDetails: async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMSaveCustomerHospitalizationDetails`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving hospitalization detail:", error);
      throw error;
    }
  },

  CRMSaveCustomerMedicalBillDetails: async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMSaveCustomerMedicalBillDetails`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving medical bill detail:", error);
      throw error;
    }
  },

  CRMSaveCustomerVaccinationDetails: async (formData: FormData): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMSaveCustomerVaccinationDetails`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving vaccination detail:", error);
      throw error;
    }
  },

  // GET BY ID Methods for editing
  CRMGetCustomerTestReportDetailsById: async (trId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerTestReportDetailsById`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TR_id: trId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching test report detail by ID:", error);
      throw error;
    }
  },

  CRMGetCustomerHospitalizationDetailsById: async (
    hId: number
  ): Promise<{ details: HospitalizationDetail[]; documents: HospitalizationDocument[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerHospitalizationDetailsById`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ H_id: hId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        details: data["Hospitalization Details"] || [],
        documents: data["Hospitalization Documents"] || [],
      };
    } catch (error) {
      console.error("Error fetching hospitalization detail by ID:", error);
      throw error;
    }
  },

  CRMGetCustomerMedicalBillDetailsById: async (mbId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerMedicalBillDetailsById`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MB_id: mbId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching medical bill detail by ID:", error);
      throw error;
    }
  },

  CRMGetCustomerVaccinationDetailsById: async (vId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerVaccinationDetailsById`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ V_id: vId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching vaccination detail by ID:", error);
      throw error;
    }
  },

  // FILTER Methods - CHANGED TO POST method to allow request body
  GetFilteredTestReports: async (filterData: {
    FromDate: string;
    ToDate: string;
    CaseForOption: string;
    DoctorName: string;
    EmployeeRefid: string
  }): Promise<any[]> => {
    try {
      console.log("Sending filter request for test reports:", filterData);

      const response = await fetch(`${API_BASE_URL}/LoadHealthRecordsDetailsWithFilterForTR`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FromDate: filterData.FromDate,
          ToDate: filterData.ToDate,
          CaseForOption: filterData.CaseForOption,
          DoctorName: filterData.DoctorName,
          EmployeeRefid: filterData.EmployeeRefid
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Filter API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Filter API success response:", data);

      return Array.isArray(data) ? data : data.records || [];
    } catch (error) {
      console.error("Error fetching filtered test reports:", error);
      throw error;
    }
  },

  GetFilteredHospitalizations: async (filterData: {
    FromDate: string;
    ToDate: string;
    CaseForOption: string;
    DoctorName: string;
    EmployeeRefid: string
  }): Promise<any[]> => {
    try {
      console.log("Sending filter request for hospitalizations:", filterData);

      const response = await fetch(`${API_BASE_URL}/LoadHealthRecordsDetailsWithFilterForHL`, {
        method: "POST", // CHANGED TO POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FromDate: filterData.FromDate,
          ToDate: filterData.ToDate,
          CaseForOption: filterData.CaseForOption,
          DoctorName: filterData.DoctorName,
          EmployeeRefid: filterData.EmployeeRefid
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Filter API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Filter API success response:", data);

      return Array.isArray(data) ? data : data.records || [];
    } catch (error) {
      console.error("Error fetching filtered hospitalizations:", error);
      throw error;
    }
  },

  GetFilteredMedicalBills: async (filterData: {
    FromDate: string;
    ToDate: string;
    CaseForOption: string;
    DoctorName: string;
    EmployeeRefid: string
  }): Promise<any[]> => {
    try {
      console.log("Sending filter request for medical bills:", filterData);

      const response = await fetch(`${API_BASE_URL}/LoadHealthRecordsDetailsWithFilterForMB`, {
        method: "POST", // CHANGED TO POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FromDate: filterData.FromDate,
          ToDate: filterData.ToDate,
          CaseForOption: filterData.CaseForOption,
          DoctorName: filterData.DoctorName,
          EmployeeRefid: filterData.EmployeeRefid
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Filter API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Filter API success response:", data);

      return Array.isArray(data) ? data : data.records || [];
    } catch (error) {
      console.error("Error fetching filtered medical bills:", error);
      throw error;
    }
  },

  GetFilteredVaccinations: async (filterData: {
    FromDate: string;
    ToDate: string;
    CaseForOption: string;
    DoctorName: string;
    EmployeeRefid: string
  }): Promise<any[]> => {
    try {
      console.log("Sending filter request for vaccinations:", filterData);

      const response = await fetch(`${API_BASE_URL}/LoadHealthRecordsDetailsWithFilterForVC`, {
        method: "POST", // CHANGED TO POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FromDate: filterData.FromDate,
          ToDate: filterData.ToDate,
          CaseForOption: filterData.CaseForOption,
          DoctorName: filterData.DoctorName,
          EmployeeRefid: filterData.EmployeeRefid
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Filter API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Filter API success response:", data);

      return Array.isArray(data) ? data : data.records || [];
    } catch (error) {
      console.error("Error fetching filtered vaccinations:", error);
      throw error;
    }
  },


  CRMFetchDoctorSpecializationDetails: async ():
    Promise<DoctorSpecialization[]> => {

    try {
      const response = await fetch(
        `${API_BASE_URL}/CRMFetchDoctorSpecializationDetails`,
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

      const data: DoctorSpecialization[] = await response.json();
      return data;

    } catch (error) {
      console.error("Error fetching doctor specialization:", error);
      throw error;
    }
  },

  CRMGetCustomerTestReportParameterDetails: async (employeeRefId: number): Promise<TestReportParameterRecord[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMGetCustomerTestReportParameterDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EmployeeRefId: employeeRefId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const records = Array.isArray(data) ? data : data.records || [];
      return records;
    } catch (error) {
      console.error("Error fetching test report document details:", error);
      throw error;
    }
  },

  // DELETE document APIs
  CRMDeleteHealthDocument: async (documentId: number, documentType: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/CRMDeleteHealthDocument`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          DocumentId: documentId,
          DocumentType: documentType, // "TEST_REPORT" | "HOSPITALIZATION" | "MEDICAL_BILL" | "VACCINATION"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting ${documentType} document:`, error);
      throw error;
    }
  },


  GetVaccinationDetailsdropdown: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/GetVaccinationDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching vaccination details:", error);
      throw error;
    }
  },



};

export default HealthRecordsAPI;
