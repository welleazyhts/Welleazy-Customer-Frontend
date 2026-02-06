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
  type: string;
  order_id: string;
  status: string;
  patient_name: string;
  type_of_service: string;
  order_type: string;
  ordered_date: string;
  expected_delivery: string;
  order_amount: number;
  address: {
    id: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  actions: {
    view_medicine_details_url: string;
    view_voucher_url: string;
  };
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
