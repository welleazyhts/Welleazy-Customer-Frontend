export interface CustomerAppointment {
  CaseId: string;
  CaseType: string;
  CaseRefId: string;
  AppointmentId: string;
  EmployeeName: string;
  TypeOfService: string;
  AppointmentType: string | null;
  AppointmentDate: string;
  AppointmentTime: string;
  AppointmentDescription: string;
  DCName: string;
  DoctorName: string;
  VoucherId: string | null;
  CaseAppointmentDateTime: string;
}

export interface CustomerAppointmentRequest {
  EmployeeRefId: number;
  RoleId: number;
  LoginType: number;
  CorporateId: number;
}


export interface PharmacyOrder {
  PharmacyOrderDetailsId: number;
  EmployeeName: string;
  OrderId: string;
  OneMGOrderId: string;
  PharmacyDescription: string; // In Progress, Delivered, Cancelled
  TypeOfService: string;
  Address: string;
  OrderedDate: string;   // DD/MM/YYYY
  DeliveryDate: string;  // DD/MM/YYYY
  Items: string;
  MobileNo: string;
  ShippingAddress: string;
  DeliveredPersonName: string;
  DeliveredPersonMobileNo: string;
  PharmacyCartUniqueId: number;
  CouponId: number | null;
  CouponName: string | null;
  DiscountPercent: number | null;
  GrandTotal: number;
  OrderType: string;
}
export interface PharmacyCouponAddress {
  ApolloId: number;
  ApolloSKU: string;
  Relation: number;
  Name: string;
  ContactNo: string;
  Email: string;
  State: number;
  City: number;
  DistrictName: string;
  StateName: string;
  Address: string;
  CouponName: string;
  CreatedOn: string;   // DD/MM/YYYY
  CreatedBy: number;
}
