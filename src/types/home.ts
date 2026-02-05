
export interface upcomingeventdata {
  consultationCaseAppointmentDetailsId: number;
  consultationCaseDetailsId: number;
  CaseId: string;
  applicationNo: string;
  caseEntryDateTime: string;
  appointmentDateTime: string;
  DoctorName: string;
  caseStatus: string;
  mobileNo: string;
  eMailId: string;
  AppointmentDate: string;
  AppointmentTime: string;
  consultationType: string;
  appointmentType: string;
}

export interface UpcomingEventsApiResponse {
  message: string;
  data: upcomingeventdata[];
}

export interface VitalData {
    employeeRefId: number;
  height: string;
  heightValue: string;
  lastUpdateHeightValue: string;
  weight: string;
  weightValue: string;
  lastUpdateWeightValue: string;
  BMI: string;
  BMIValue: string;
  lastUpdateBMIValue: string;
  bloodPressure: string;
  bloodPressure1: string;
  bloodPressure2: string;
  bloodPressureValue: string;
  bloodPressureTypeValue: string;
  lastUpdateBloodPressureValue: string;
  heartRate: string;
  heartRate1: string;
  heartRate2: string;
  heartRateValue: string;
  lastUpdateHeartRateValue: string;
  o2SaturationLevels: string;
  o2SaturationLevels1: string;
  o2SaturationLevels2: string;
  o2SaturationLevelsValue: string;
  lastUpdateO2SaturationLevelsValue: string;
  glucose: string;
  glucoseValue: string;
  lastUpdateGlucoseValue: string;
  hrHeightValue: string;
  hrWeightValue: string;
  hrbmiValue: string;
  hrBloodPressureValue: string;
  hrHeartRateValue: string;
  hrO2SaturationLevelsValue: string;
  hrGlucoseValue: string;
  hrBloodGroup: string;
 } 
 export interface VitalApiResponse {
    message: string;
    data: VitalData;
 }

 export interface HealthMetricHistory {
  metricValue: string;
  CreatedOn: string;
  DisplayName: string;
}

export interface HealthMetricHistoryApiResponse {
  message: string;
  data: HealthMetricHistory[];
}

export interface HealthMetricUpdateRequest {
  employeeRefId: number;
  metricType: string;
  value: string;
  updatedBy?: number;
}

export interface HealthMetricUpdateResponse {
  message: string;
  isSuccess: boolean;
}
export interface SponsoredServiceType {
  SubProductId: number;
  SponsoredServiceName: string;
  ImagePath: string;
}
