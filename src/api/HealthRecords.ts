import { api } from "../services/api";
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
  DoctorSpecialization, TestReportParameterRecord,
  MedicineReminder, MedicineChoices
} from "../types/HealthRecords";

const HealthRecordsAPI = {
  // New Health Records APIs
  getChoices: async () => {
    return (await api.get("/api/health-records/choices/")).data;
  },

  // Height
  createHeight: async (data: { value: number; unit: string | number }) => {
    return (await api.post("/api/health-records/height/", data)).data;
  },
  listHeightHistory: async () => {
    return (await api.get("/api/health-records/height/")).data;
  },
  getLatestHeight: async () => {
    return (await api.get("/api/health-records/height/latest/")).data;
  },

  // Weight
  createWeight: async (data: { value: number; unit: string | number }) => {
    return (await api.post("/api/health-records/weight/", data)).data;
  },
  listWeightHistory: async () => {
    return (await api.get("/api/health-records/weight/")).data;
  },
  getLatestWeight: async () => {
    return (await api.get("/api/health-records/weight/latest/")).data;
  },

  // BMI
  createBMI: async (data: { value: number }) => {
    return (await api.post("/api/health-records/bmi/", data)).data;
  },
  listBMIHistory: async () => {
    return (await api.get("/api/health-records/bmi/")).data;
  },
  getLatestBMI: async () => {
    return (await api.get("/api/health-records/bmi/latest/")).data;
  },

  // Blood Pressure
  createBloodPressure: async (data: { systolic: number; diastolic: number; unit: string | number; type: string | number }) => {
    return (await api.post("/api/health-records/blood-pressure/", data)).data;
  },
  listBloodPressureHistory: async () => {
    return (await api.get("/api/health-records/blood-pressure/")).data;
  },
  getLatestBloodPressure: async () => {
    return (await api.get("/api/health-records/blood-pressure/latest/")).data;
  },

  // Heart Rate
  createHeartRate: async (data: { value: number; unit: string | number }) => {
    return (await api.post("/api/health-records/heart-rate/", data)).data;
  },
  listHeartRateHistory: async () => {
    return (await api.get("/api/health-records/heart-rate/")).data;
  },
  getLatestHeartRate: async () => {
    return (await api.get("/api/health-records/heart-rate/latest/")).data;
  },

  // Oxygen Saturation
  createO2Saturation: async (data: { value: number; unit: string | number }) => {
    return (await api.post("/api/health-records/oxygen-saturation/", data)).data;
  },
  listO2SaturationHistory: async () => {
    return (await api.get("/api/health-records/oxygen-saturation/")).data;
  },
  getLatestO2Saturation: async () => {
    return (await api.get("/api/health-records/oxygen-saturation/latest/")).data;
  },

  // Glucose
  createGlucose: async (data: { value: number; unit: string | number; test_type: string | number }) => {
    return (await api.post("/api/health-records/glucose/", data)).data;
  },
  listGlucoseHistory: async () => {
    return (await api.get("/api/health-records/glucose/")).data;
  },
  getLatestGlucose: async () => {
    return (await api.get("/api/health-records/glucose/latest/")).data;
  },

  // Blood Group
  getBloodGroup: async () => {
    return (await api.get("/api/health-records/blood-group/")).data;
  },

  // GET Methods (existing)
  GetHealthRecords: async (employeeRefId: number): Promise<HealthRecordsListApiResponse> => {
    try {
      const response = await api.get("/api/health-records/");
      return response.data as HealthRecordsListApiResponse;
    } catch (error) {
      console.error("Error fetching health records:", error);
      return { records: [], total: 0 } as any;
    }
  },

  // Hospitalization APIs
  listHospitalizations: async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/hospitalizations/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching hospitalizations:", error);
      return [];
    }
  },

  getHospitalizationById: async (id: number): Promise<any> => {
    return (await api.get(`/api/hospitalizations/${id}/`)).data;
  },

  createHospitalization: async (data: any, documents: File[]): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    documents.forEach((file) => formData.append("documents", file));

    return (await api.post("/api/hospitalizations/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  updateHospitalization: async (id: number, data: any, documents: File[]): Promise<any> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    documents.forEach((file) => formData.append("documents", file));

    return (await api.put(`/api/hospitalizations/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  deleteHospitalization: async (id: number): Promise<void> => {
    await api.delete(`/api/hospitalizations/${id}/`);
  },

  getHospitalizationChoices: async (): Promise<any> => {
    return (await api.get("/api/hospitalizations/choices/")).data;
  },

  // Legacy adaptations (to minimize component breakage before full refactor)
  GetHospitalizationDetails: async (employeeRefId: number): Promise<HospitalizationDetail[]> => {
    const data = await HealthRecordsAPI.listHospitalizations();
    // Map new API data to old interface if needed, or return as is if compatible
    return data.map((item: any) => ({
      H_id: item.id,
      Record_for: item.for_whom === 'self' ? 1 : 2, // Approximation
      Record_date: item.admitted_date,
      RecordName: item.record_name,
      Record_Doctor_Name: item.doctor_name,
      Record_Hospital_Name: item.hospital_name,
      Type_of_Record: item.hospitalization_type,
      Additional_Notes: item.notes,
      EmployeeRefId: employeeRefId,
      RelationType: item.for_whom === 'self' ? 1 : 2,
      Relation: item.for_whom,
      EmployeeDependentDetailsId: item.dependant || 0,
      CreatedOn: item.created_at,
      UpdatedOn: item.updated_at,
      // Map other fields as best as possible
      ...item
    }));
  },

  GetHospitalizationDocumentDetails: async (employeeRefId: number): Promise<HospitalizationDocument[]> => {
    // The new list API might include documents or we fetch them separately?
    // For now, return empty or implement if documents are needed separately
    return [];
  },

  GetMedicalBillDetails: async (employeeRefId: number): Promise<MedicalBillDetail[]> => {
    try {
      const response = await api.get("/api/medical-bills/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching medical bill details:", error);
      return [];
    }
  },

  GetVaccinationDetails: async (employeeRefId: number): Promise<VaccinationDetails[]> => {
    try {
      const response = await api.get("/api/vaccination-certificates/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching vaccination details:", error);
      return [];
    }
  },

  GetVaccinationDetailsdropdown: async () => {
    try {
      const response = await api.get("/api/vaccination-certificates/types/");
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccination types:", error);
      return [];
    }
  },

  // Document GET Methods (existing)
  CRMGetCustomerTestReportDocumentDetails: async (employeeRefId: number): Promise<TestReportDocument[]> => {
    try {
      const response = await api.get("/api/health-records/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching test report documents:", error);
      return [];
    }
  },

  GetMedicalBillDocumentDetails: async (employeeRefId: number): Promise<MedicalBillDocument[]> => {
    try {
      const response = await api.get("/api/medical-bills/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching medical bill documents:", error);
      return [];
    }
  },

  GetVaccinationDocumentDetails: async (employeeRefId: number): Promise<VaccinationDocument[]> => {
    try {
      const response = await api.get("/api/vaccination-certificates/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return data.records || [];
    } catch (error) {
      console.error("Error fetching vaccination documents:", error);
      return [];
    }
  },

  // ADD/UPDATE Methods
  CRMSaveCustomerTestReportDetails: async (formDataToSend: FormData): Promise<any> => {
    return (await api.post("/api/health-records/", formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  CRMSaveCustomerHospitalizationDetails: async (formData: FormData): Promise<any> => {
    return (await api.post("/api/hospitalizations/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  CRMSaveCustomerMedicalBillDetails: async (formData: FormData): Promise<any> => {
    return (await api.post("/api/medical-bills/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  CRMSaveCustomerVaccinationDetails: async (formData: FormData): Promise<any> => {
    return (await api.post("/api/vaccination-certificates/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  // GET BY ID Methods for editing
  CRMGetCustomerTestReportDetailsById: async (trId: number): Promise<any> => {
    return (await api.get(`/api/health-records/${trId}/`)).data;
  },

  CRMGetCustomerHospitalizationDetailsById: async (
    hId: number
  ): Promise<{ details: HospitalizationDetail[]; documents: HospitalizationDocument[] }> => {
    const data = (await api.get(`/api/hospitalizations/${hId}/`)).data as any;
    return {
      details: [data], // The new API likely returns the single object
      documents: data.documents || [],
    };
  },

  CRMGetCustomerMedicalBillDetailsById: async (mbId: number): Promise<any> => {
    return (await api.get(`/api/medical-bills/${mbId}/`)).data;
  },

  CRMGetCustomerVaccinationDetailsById: async (vId: number): Promise<any> => {
    return (await api.get(`/api/vaccination-certificates/${vId}/`)).data;
  },

  // FILTER Methods - In REST these are usually handled via query params on the list endpoint
  GetFilteredTestReports: async (filterData: any): Promise<any[]> => {
    const data = (await api.get("/api/health-records/", { params: filterData })).data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.records || [];
  },

  GetFilteredHospitalizations: async (filterData: any): Promise<any[]> => {
    const data = (await api.get("/api/hospitalizations/", { params: filterData })).data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.records || [];
  },

  GetFilteredMedicalBills: async (filterData: any): Promise<any[]> => {
    const data = (await api.get("/api/medical-bills/", { params: filterData })).data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.records || [];
  },

  GetFilteredVaccinations: async (filterData: any): Promise<any[]> => {
    const data = (await api.get("/api/vaccination-certificates/", { params: filterData })).data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.records || [];
  },

  CRMFetchDoctorSpecializationDetails: async (): Promise<DoctorSpecialization[]> => {
    const response = await api.get("/api/consultation/doctor-specializations/");
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.data || [];
  },

  CRMGetCustomerTestReportParameterDetails: async (employeeRefId: number): Promise<TestReportParameterRecord[]> => {
    try {
      const response = await api.get("/api/health-records/common/");
      const data = response.data as any;
      if (Array.isArray(data)) return data;
      return data.records || data.results || [];
    } catch (error) {
      console.error("Error fetching test report parameter details:", error);
      return [];
    }
  },

  CRMDeleteHealthDocument: async (documentId: number, documentType: string): Promise<any> => {
    // In REST, delete is usually a DELETE request to a specific resource
    // For now we'll keep the POST if the backend still expects it, but update the path
    return (await api.post("/api/health-records/delete-document/", {
      DocumentId: documentId,
      DocumentType: documentType,
    })).data;
  },

  // Medicine Reminder APIs
  getMedicineChoices: async (): Promise<MedicineChoices> => {
    return (await api.get("/api/medicine-reminders/choices/")).data as MedicineChoices;
  },

  listMedicineReminders: async (startDate?: string, endDate?: string): Promise<MedicineReminder[]> => {
    const params = startDate && endDate ? { start_date: startDate, end_date: endDate } : {};
    const response = await api.get("/api/medicine-reminders/", { params });
    const data = response.data as any;
    if (Array.isArray(data)) return data;
    return data.results || data.records || [];
  },

  getMedicineReminderById: async (id: number): Promise<MedicineReminder> => {
    return (await api.get(`/api/medicine-reminders/${id}/`)).data as MedicineReminder;
  },

  createMedicineReminder: async (reminderData: any, files?: File[]): Promise<MedicineReminder> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(reminderData));
    if (files) {
      files.forEach(file => formData.append("documents", file));
    }
    return (await api.post("/api/medicine-reminders/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data as MedicineReminder;
  },

  updateMedicineReminder: async (id: number, reminderData: any, files?: File[]): Promise<MedicineReminder> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(reminderData));
    if (files) {
      files.forEach(file => formData.append("documents", file));
    }
    return (await api.put(`/api/medicine-reminders/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data as MedicineReminder;
  },

  deleteMedicineReminder: async (id: number): Promise<void> => {
    await api.delete(`/api/medicine-reminders/${id}/`);
  },
};

export default HealthRecordsAPI;