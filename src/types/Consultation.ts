import { DateTimezoneSetter } from "date-fns/parse/_lib/Setter";

export interface CRMFetchDoctorSpecializationDetails {
  DoctorSpecializationsId: number;
  Specializations: string;
  ImageName: string | null;
  Imagepath: string | null;
  Description: string;
  IsActive: number;
}

export interface CRMFetchDoctorLanguagesDetails {
  LanguageId: number;
  LanguageDescription: string;
}

export interface CRMFetchDoctorPincodeDetails {
  PincodeId: number;
  Pincode: string;
}

export interface CRMFetchDoctorTypesDetails {
  DoctorTypeDetailsId: number;
  DoctorTypeDescription: string;
}
export interface SpecializationOption {
  value: number;
  label: string;
}

export interface CRMConsultationDoctorDetailsRequest {
  SpecialityId: number;
  DistrictId: number;
  EmployeeRefId: number;
}

export interface CRMConsultationDoctorDetailsResponse {
  DoctorImage: string | null;
  DoctorId: number;
  ServiceProvider: string;
  DoctorName: string;
  Experience: string;
  EmpanelFor: string;
  Experience1: number;
  Service: string;
  Qualification: string;
  Specialization: string;
  DoctorSpecializations: string;
  Language: string;
  Pincode: string;
  DistrictId: number;
  CityName: string;
  Address: string;
  DoctorRegistrationId: string;
  FromTime: string;
  ToTime: string;
  ConsultationCount: number | null;
  DoctorTypeId: number;
  DoctorTypeDescription: string;
  ConsultationMode: string;
  ClinicId: number;
  ClinicName: string;
  Fee: string;
  ConsultationFees: number;
  VendorImageUrl: string;
  DoctorImageUrl: string;
  DCUniqueName: string;
  DoctorURL: string;

}

export interface Appointment {
  name: string;
  doctorId: string;
  time: string;
  price: number;
  mode?: string;
  specialty: string;

}

export interface TimeSlotRequest {
  DCUniqueName?: string;
  TimeZone?: number;
  doctorId?: number | undefined;
  Date: string;
}
export interface TimeSlotResponse {
  TimeId: number;
  Time: string;
  TimeZone: boolean;
  Date: string;
}

export interface BookAppointmentRequest {
  CaseLeadId: string;
  LeadType: string;
  CaseRecMode: string;
  ServicesOffered: string;
  CorporateId: string;
  BranchId: string;
  ProductId: string;
  EmployeeRefId: string;
  MedicalTest: string;
  PaymentType: string;
  CaseFor: string;
  EmployeeToPay: string;
  IsActive: string;
  LeadStatus: string;
  VisitType: string;
  DCId: string;
  TestPackageTypeId: string;
  SponsoredStatus: string;
  DoctorId: string;
  Symptoms: string;
  Specialization?: string;
  CreatedBy: string;
  EmployeeDependentDetailsId: string;
  EmployeeAddressDetailsId: string;
  PreferredAppointmentDateTime: string;
  CaseLeadCompletionDateTime: string;
  Files: File[];
}

export interface CRMSaveBookAppointmentResponse {
  Success: boolean;
  Message: string;
  CaseLead_Id: string;
}
export interface InsertCartResponse {
  Success?: boolean;
  Message: string;
  CartDetailsId?: number;
  CartUniqueId?: number;
}

export interface DependentRequest {
  EmployeeDependentDetailsId: number;
  EmployeeId: number;
  DependentId: string;
  DependentRelationShip: number;
  DependentName: string;
  DependentMobileNo: string;
  DependentGender: string;
  DependentDOB: string;
  AccessProfilePermission: boolean;
  MaritalStatus: string;
  Occupation: string;
  DependentEmailId: string;
  IsActive: boolean;
  DependentMemberId: string;
  DependentUserName: string;
  Password: string;
}

export interface DependentResponse {
  Message: string;
}

export interface CRMSponsoredServicesRequest {
  EmployeeRefId: number;
  ServiceOfferedId: number;
}

export interface CRMSponsoredStatusResponse {
  ServiceAvailable: boolean;
}

export interface ApolloClinic {
  ClinicId: number;
  ClinicName: string;
}

export interface ApolloDoctorSlot {
  slotId: number;
  time: string;
  capacity: number;
  bookedSlotCapacity: number;
  bookingStatus: number;
}

export interface ApolloDoctorSlotsApiResponse {
  status: string;
  message: string;
  responseCode: number;
  doctorSlotsResponse: ApolloDoctorSlot[];
}

export interface ApolloDoctorsSlotRequest {
  doctorId: number;
  clinicId: number;
  appointmentDate: string;
}
