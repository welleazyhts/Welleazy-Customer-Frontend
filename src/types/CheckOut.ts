export interface CartItemDetails {
  CartDetailsId: number;
  CartItemDetailsId: number;
  PersonName: string;
  Relationship: string;
  ItemName: string;
  ItemId: number;
  TestPackageType: number;
  ItemAmount: number;
  Quantity: number;
  AppointmentDate: string | null;
  AppointmentTime: string | null;
  DeliveryDateTime: string | null;
  TotalAmount: number;
  DCId: number;
  CaseRefId: number;
  AppointmentId: number | null;
  center_name: string | null;
  city: string | null;
  DistrictName: string | null;
  DistrictId: number;
  DoctorCity: string | null;
  SponsoredStatus: number;
  MobileNo: string;
  Emailid: string;
  CartUniqueId: number;
  DoctorId: number;
  DoctorName: string;
  DCAddress: string | null;
  DRAddress: string | null;
  DoctorSpeciality: string;
  ClinicName: string;
  VisitType: string;
  StMId: number | null;
  DCSelection: string | null;
  AppointmentDateTime: string | null;
  TestPackageCode: string | null;
  VendorId: number;
  Message: string;
  type?: string;
  relationship?: string;
  id?: string;
  testName?: string;
  dcName?: string;
  dcId?: string;
  testId?: string;
  AppointmentDateObj?: Date;
  note?: string;
}


export interface AppointmentData {
  doctorName: string;
  specialization: string;
  date: string | null;
  time: string;
  appointmentType: string;
  consultationType: string;
  patientName: string;
  symptoms: string;
  bookingDateTime: string;
  doctorFee?: string;
  doctorType?: string;
  isWelleazyDoctor?: boolean;
  consultationFee?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type CartStatusResponse = {
  Message: string;
  ConsultationCaseAppointmentDetailsId: number;
  DistrictName: string;
};

