import exp from "constants";

export interface GymPackage {
  PackageId: number;
  Duration: number;
  ActualPrice: number;
  Discount: number;
  DiscountPrice: number;
  PackageName: string;
  City: number;
  VendorName: string;
  VendorLogo?: string;
  Features?: string[];
}
export interface CustomerProfile {
  EmployeeRefId: number;
  EmployeeId: string;
  EmployeeName: string;
  Address: string;
  Emailid: string;
  MobileNo: string;
  MaskedMobileNo: string;
  GenderDescription: string;
  Gender: string;
  DOB: string;
  Employee_DOB: string;
  State: number;
  StateId: number;
  City: number;
  CityId: number;
  Area: string | null;
  StateName: string;
  DistrictName: string;
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  Pincode: string;
  longitude: string;
  latitude: string;
  GeoLocation: string;
  CorporateId: number;
  CorporateName: string;
  BranchId: number;
  Branch: string;
  ProductId: string;
  Services: string;
  AccountActivationURL: string;
  CreatedBy: number;
  CreatedOn: string;
  ModifiedBy: number;
  ModifiedOn: string;
  LastActiveDate: string;
  LastInactiveDate: string;
  InActiveReason: string;
  IsActive: boolean;
  PersonalEmailid: string;
  MemberId: string;
  AddressType: string;
  MaritalStatus: number;
  EmployeeAddressDetailsId: number;
  PackageId: string;
  BloodGroup: string;
  EmployeeDependentDetailsId: number;
  TwoFAEnabled: string;
}
export interface State {
  StateId: number;
  StateName: string;
}

export interface District {
  DistrictId: number;
  DistrictName: string;
}
export interface GymCenter {
  GymDetailsId: number;
  GymCenterName: string;
  GymCenterType: string;
  GymBusinessLine: string;
  GymStateId: number;
  GymCityId: number;
  GymLocality: string;
  IsActive?: number;
  GymAddress: string;
  AddressURL?: string;
  Logo?: string;
}
export interface Relationship {
  RelationshipId: number,
  Relationship: string,
}
export interface RelationshipPerson {
  EmployeeDependentDetailsId: number;
  DependentName: string;
}