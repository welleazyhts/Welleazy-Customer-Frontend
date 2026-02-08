import { isExportDeclaration } from "typescript";

export interface CRMFetchCommonTestNameDetailsRequest {
  CorporateId: number;
  EmployeeRefId: string;
  CityId: number;
}
export interface CRMFetchCommonTestNameDetailsResponse {
  id?: number;
  name?: string;
  code?: string;
  description?: string | null;
  price?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  TestId?: number; // Old field
  TestName?: string; // Old field
  TestDescription?: string; // Old field
  ImagePath?: string; // Old field
}
export interface FetchHealthPackagesRequest {
  CorporateId: number;
  EmployeeRefId: string;
}

export interface HealthPackage {
  PackageId: number;
  CorporateId: number;
  ProductSKU: string;
  PackageName: string;
  CheckUpTypeId: number;
  TestIncluded: string;
  NormalPackagePrice: number;
  HNIPackagePrice: string;
  Status: string;
  Remark: string;
  CreatedOn: string;
  CreatedBy: number;
  UpdatedOn: string;
  UpdatedBy: number;
  PackageHeadlineDetails: string;
  PackageDetails: string;
  ImageName: string;
  ImagePath: string;
  CorporatePackagePrice: number;
  VisitType: string;
  PackageValidityDate: string | null;
  PlanCategory: number;
  TestCount: number;
  TestName: string;
  ValidityDate: string | null;
  ValidationDate: string | null;
  MinAge: number;
  MaxAge: number;
  GenderForPackage: string;
  Discount: number;
}

export interface CRMFetchTestDetailsBasedUponCommonTestNameRequest {
  CorporateId: number;
  EmployeeRefId: string,
  CityId: number,
  CommonTestName: string;
}
export interface CRMFetchTestDetailsBasedUponCommonTestNameResponse {
  TestId: number,
  TestName: string,
  CorporatePrice?: number;
  NormalPrice?: number;
}

export interface CRMLoadDCDetailsRequest {
  CorporateId: number;
  EmployeeRefId: string;
  CityId: number;
  TestId: string;
  PinCode: string;
  Area?: string;
  CommonTestName: string;
}
export interface CRMLoadDCDetailsResponse {
  dc_id: number;
  sptoken_id: string;
  center_name: string;
  city: number;
  DistrictName: string;
  address: string;
  area: string;
  Locality: string;
  service_pincode: string;
  ISO_Type: string;
  VisitType: string;
  VisitTypeId: number;
  TestName: string;
  TestId: string;
  DCUniqueName: string;
  DC_Distance: string;
  Duration: string;
  tests?: number[];
}


export interface CrmDcTestPricesResponse {
  dc_id: number;
  sptoken_id: string;
  center_name: string;
  city: number;
  DistrictName: string;
  address: string;
  area: string;
  Locality: string;
  service_pincode: string;
  ISO_Type: string;
  DCTestPackageId: number;
  TestPackageId: number;
  TestId: number;
  TestType: string;
  CorporateId: number;
  Status: string;
  VisitType: string;
  SKUCode: string;
  TestName: string;
  TestCode: string;
  NormalPrice: number;
  HNIPrice: number;
  Remark: string;
  TestDescription: string;
  CreatedOn: string;
  CreatedBy: number;
  UpdatedOn: string;
  UpdatedBy: number;
  ImageName: string;
  ImagePath: string;
  CorporatePrice: number;
  ComponentCountTest: number;
  ComponentDescription: string | null;
  DiscountPrice: number;
  DCUniqueName: string;
  TestPackageCode: string;
  IsSponsored: string;
  CommanTestName: string;
  VisitTypeId: number;
  DC_Distance: string;
  Duration: string;
  inclusions: string | null;
}
export interface LocationState {
  selectedTests: string[];
  location: string;
}

export interface DependentFormData {
  serviceFor: 'self' | 'dependent';
  relationshipId: string;
  relationshipPersonId: string;
  name: string;
  phone: string;
  email: string;
}


export interface ThyrocareLoginRequest {
  username: string;
  password: string;
  portalType: string;
  userType: string;
}

export interface ThyrocareLoginResponse {
  apiKey: string;
  accessToken: string;
  userType: string;
  userTypeId: number;
  response: string;
  respId: string;
  name: string;
  email: string;
  exists: string;
  verKey: string;
  mobile: string;
  loyaltyDiscount: any;
  uId: any;
  address: any;
  updateMandatory: string;
  androidVerKey: string;
  iosVerKey: string;
  trackingPrivilege: string;
  petCtAccess: string;
  dsaWebLink: string;
  assignType: any;
  otpAccess: string;
  isPrepaid: string;
  covidMessage: string;
  internalClient: boolean;
  agreeMentLink: string;
  isAgreed: number;
  uType: number;
  status: boolean;
  exceptionalPincode: any;
  hcLchc: any;
}

export interface ThyrocareBeneficiary {
  Name: string;
  Age: number | string;
  Gender: 'M' | 'F' | 'Male' | 'Female';
}

export interface ThyrocareOrderBookingRequest {
  ApiKey: string;
  OrderId: string;
  Email: string;
  Gender: 'Male' | 'Female' | string;
  Mobile: string;
  Address: string;
  ApptDate: string;
  OrderBy: string;
  Passon: number;
  PayType: 'POSTPAID' | 'PREPAID' | string;
  Pincode: string;
  Product: string;
  RefCode: string;
  ReportCode?: string;
  Remarks: string;
  Reports: 'Y' | 'N' | string;
  ServiceType: 'H' | 'C' | string;
  BenCount: string;
  BenDataXML: string;
}

export interface ThyrocarePostOrderDataResponse {
  name: string;
  leadId: string;
  age: string;
  gender: string;
  pId: number;
}

export interface ThyrocareOrderBookingResponse {
  orderResponseDetails: {
    postOrderDataResponse: ThyrocarePostOrderDataResponse[];
  };
  respId: string;
  response: string;
  orderNo: string;
  product: string;
  serviceType: string;
  mode: string;
  reportHardCopy: string;
  customerRate: number;
  bookedBy: string;
  status: string;
  payType: string;
  mobile: string;
  phone: string | null;
  address: string;
  email: string;
  refOrderId: string;
  fasting: string;
  qr: string | null;
  collectionType: string | null;
  collectionCenters: any | null;
  otp: string | null;
}

// Orange Health Interfaces
export interface OrangeHealthCreateOrderRequest {
  slot_datetime: string;
  latitude: string;
  longitude: string;
  address: string;
  primary_patient_name: string;
  primary_patient_number: string;
  patient_name: string;
  patient_phone: string;
  age: string;
  gender: string;
  payment_status: string;
  email: string;
  testId: string;
  packageId: string;
  partner_notes: string;
}

export interface OrangeHealthCreateOrderResponse {
  request_id: string;
  token: string;
  status: string;
  orders: Array<{
    id: number;
    alnumOrderId: string;
    partnerReferenceId: string;
  }>;
  order_link: string;
  Message: string
}


// Interfaces
export interface CartItem {
  testId: string;
  testName: string;
  packageCode: string;
  price: number;
  quantity: number;
  selectedFor: 'self' | 'dependent';
  dependentId?: string;
  dependentName?: string;
  relation?: string;
  dcId: number;
  dcName: string;
  itemId?: number;
  note?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}
export interface DependentFormData {
  serviceFor: 'self' | 'dependent';
  relationshipId: string;
  relationshipPersonId: string;
  name: string;
  phone: string;
  email: string;
  relation?: string;
}
export interface DiagnosticCenter {
  dc_id: number;
  center_name: string;
  address?: string;
  Locality?: string;
  VisitType?: string;
  DC_Distance?: string;
  DCUniqueName?: string;
}
export interface TestItem {
  TestId: string;
  TestName: string;
  TestPackageCode?: string;
  CorporatePrice?: number;
  NormalPrice?: number;
}

export interface SRLOrderSendTestUpdateRequest {
  FLAG: string;
  ORDERID: string;
  HISORDERID: string;
  ORDER_DT: string;
  PTNT_CD: string;
  HISCLIENTID: string;
  TITLE: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PTNTNM: string;
  DOB: string;
  PTNT_GNDR: "M" | "F" | "O";
  DOB_ACT_FLG: "Y" | "N";
  MOBILE_NO: string;
  COLL_CONTACT: string;
  EMAIL_ID: string;
  ADDRESS: string;
  LOCATION: string;
  CITY: string;
  STATE: string;
  COUNTRY: string;
  ZIP: string;
  COLL_DATE_FROM: string;
  COLL_DATE_TO: string;
  TESTS: string;
  COLL_TYPE: string;
  ORDER_SOURCE: string;
  CREATED_BY: string;
}
export interface SRLOrderSendTestUpdateResponse {
  RSP_CODE: number;
  RSP_DESC: string;
  RSP_MSG: string;
}

export interface DiagnosticCenterSearchRequest {
  city_id: number;
  test_ids?: number[];
  health_package_id?: number;
  sponsored_package_id?: number;
  pincode?: string;
  area?: string;
  name?: string;
  visit_type?: string | number;
}

export interface DiagnosticCenterDetailed {
  id?: number;
  name: string;
  code: string;
  address: string;
  area: string;
  pincode: string;
  contact_number: string;
  email: string;
  active: boolean;
  city: number;
  tests: number[];
  visit_types: number[];
  health_packages: number[];
  sponsored_packages: number[];
}

export interface VisitType {
  id?: number;
  name: string;
}

export interface HealthPackageChoice {
  id?: number;
  name: string;
}

export interface APIHealthPackage {
  id: number;
  name: string;
  code: string;
  description: string;
  price: string;
  validity_till: string;
  tests: number[];
  package_type: string;
  active?: boolean;
}

export interface SponsoredPackage {
  id: number;
  name: string;
  code: string;
  description: string;
  price: string;
  validity_till: string;
  test_ids: number[];
}

export interface FilterDiagnosticCenterParams {
  area?: string;
  pincode?: string;
  name?: string;
  visit_type?: string | number;
  sort_price?: 'high' | 'low';
}

// Appointment and Cart Interfaces from Postman
export interface AddToCartRequest {
  diagnostic_center_id: number;
  visit_type_id: number;
  test_ids: number[];
  for_whom: "self" | "dependant";
  dependant_id?: number | null;
  address_id?: number | null;
  note?: string;
  appointment_date: string;
  appointment_time: string;
  confirm_update?: string; // "true"
}

export interface AddPackageToCartRequest {
  diagnostic_center_id: number;
  item_type: "health_package" | "sponsored_package";
  package_id: number;
  for_whom: "self" | "dependant";
  dependant_id?: number | null;
  appointment_date: string;
  appointment_time: string;
}

export interface AppointmentCartItem {
  id: number;
  diagnostic_center: number | string;
  diagnostic_center_name?: string;
  visit_type: number | string;
  visit_type_name?: string;
  tests: number[] | any[];
  is_for_self: boolean;
  dependant_id: number | null;
  dependant_name?: string | null;
  address_id: number | null;
  address?: any | null;
  note: string;
  price: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

export interface AppointmentCartResponse {
  id: number;
  user: number;
  items: AppointmentCartItem[];
  total_price: string;
}
