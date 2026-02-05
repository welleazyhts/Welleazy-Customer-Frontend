export interface Vital {
  name: string;
  value: string;
  lastUpdated: string;
  history: { value: string; date: string }[];
}

export interface LabParameter {

  parameterName: string;
  result: string;
  unit: string;
  startRange: string;
  endRange: string;
}

export interface HealthRecord {
  id: number;
  name: string;
  relation: string;
  type: string;
  recordName: string;
  doctor: string;
  recordDate: string;
  notes?: string;
  employeeRefId: number;
  specialization?: string;
  labParameters?: LabParameter[];
  uploadedDocName?: string;
  uploadedDocPath?: string;
  createdOn?: string;
  updatedOn?: string | null;
  typeOfRecord?: string;
}

export interface HealthRecordsListApiResponse {
  status?: string;
  message?: string;
  records: HealthRecord[];
}
export interface HospitalizationDetail {

  H_id: number;
  Record_for: number;
  Record_date: string;
  RecordName: string;
  Record_Doctor_Name: string;
  Record_Hospital_Name: string;
  Type_of_Record: string;
  Additional_Notes: string;
  UplordDocName: string;
  UplordDocPath: string;
  EmployeeRefId: number;
  Relation: number;
  RelationName: string;
  EmployeeDependentDetailsId: number;
  CreatedOn: string;
  createdBy: number;
  UpdatedOn: string;
  UpdatedBy: number;
  OtherRecordName: string;



}
export interface HospitalizationDetailApiResponse {
  status?: string;
  message?: string;
  records: HospitalizationDetail[];
}

export interface MedicalBillDetail {
  MB_id: number;
  Record_for: string;
  Record_date: string | null;
  RecordName: string;
  Record_Bill_Number: string;
  Record_Hospital_Name: string;
  Type_of_Record: string;
  UplordDocName: string | null;
  UplordDocPath: string | null;
  EmployeeRefId: number;
  RelationType: number;
  Relation: string;
  EmployeeDependentDetailsId: number;
  CreatedOn: string;
  CreatedBy: number;
  UpdatedOn: string | null;
  UpdatedBy: number | null;
  OtherRecordName: string | null;
}

export interface MedicalBillDetailApiResponse {
  status?: string;
  message?: string;
  records: MedicalBillDetail[];
}
export interface VaccinationDetails {
  V_id: number;
  Record_for: string;
  Record_date: string | null;
  RecordName: string;
  Vaccination_dose: string | null;
  Vaccination_center: string | null;
  Registration_id: string | null;
  UplordDocName: string | null;
  UplordDocPath: string | null;
  EmployeeRefId: number;
  RelationType: number;
  Relation: string;
  EmployeeDependentDetailsId: number;
  CreatedOn: string;
  CreatedBy: number;
  UpdatedOn: string | null;
  UpdatedBy: number | null;
}

export interface VaccinationDetailApiResponse {
  status?: string;
  message?: string;
  records: VaccinationDetails[];
}
export interface TestReportDocument {
  TR_DocumentId: number;
  TR_id: number;
  UplordDocName: string;
  UplordDocPath: string;
}

export interface MedicalBillDocument {
  MB_DocumentId: number;
  MB_id: number;
  UplordDocName: string;
  UplordDocPath: string;
}

export interface VaccinationDocument {
  V_DocumentId: number;
  V_id: number;
  UplordDocName: string;
  UplordDocPath: string;
}

export interface TestReportDocumentApiResponse {
  status?: string;
  message?: string;
  records: TestReportDocument[];
}

export interface MedicalBillDocumentApiResponse {
  status?: string;
  message?: string;
  records: MedicalBillDocument[];
}

export interface VaccinationDocumentApiResponse {
  status?: string;
  message?: string;
  records: VaccinationDocument[];
}
export interface HospitalizationDocument {
  H_DocumentId: number;
  H_id: number;
  UplordDocName: string;
  UplordDocPath: string;
}

export interface HospitalizationDocumentApiResponse {
  status?: string;
  message?: string;
  records: HospitalizationDocument[];
}
export interface Vital {
  name: string;
  value: string;
  lastUpdated: string;
  history: { value: string; date: string }[];
  apiName?: string;
}

export interface DoctorSpecialization {
  DoctorSpecializationsId: number;
  Specializations: string;
  ImageName: string | null;
  Imagepath: string | null;
  Description: string;
  IsActive: number;
}


export interface TestReportParameterRecord {
  TRRecordDetailsId: number;
  TR_id: number;
  ParameterName: string;
  Result: string;
  ResultType: string;
  StartRange: string;
  StartRangeType: string;
  EndRange: string;
  EndRangeType: string;
}
export interface HealthDocument {
  UplordDocName?: string;
  UplordDocPath?: string;
  DocumentName?: string;
  DocumentPath?: string;
  // Add other properties your document objects might have
}

export interface MedicineReminderSchedule {
  time: string;
  meal_relation: string;
}

export interface MedicineReminder {
  id: number;
  medicine_name: string;
  medicine_type: string;
  duration_value: number;
  duration_unit: string;
  start_date: string;
  end_date: string;
  frequency_type: string;
  intake_frequency?: string;
  schedule_times?: MedicineReminderSchedule[];
  interval_type?: string;
  interval_start_time?: string;
  interval_end_time?: string;
  dosage_value: number;
  dosage_unit: string;
  doctor_name: string;
  appointment_reminder_date: string | null;
  current_inventory: number;
  remind_when_inventory: number;
  medicines_left: number;
  documents?: { id: number; file: string; uploaded_at: string }[];
}

export interface MedicineChoices {
  medicine_type: { value: string; label: string }[];
  duration_unit: { value: string; label: string }[];
  frequency_type: { value: string; label: string }[];
  intake_frequency: { value: string; label: string }[];
  meal_relation: { value: string; label: string }[];
  interval_type: { value: string; label: string }[];
  dosage_unit: { value: string; label: string }[];
}
