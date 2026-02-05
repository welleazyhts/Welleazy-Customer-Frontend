export interface CRMMaritalStatusResponse {
    MaritalStatusId: number;
    MaritalDescription: string;
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
export interface CRMStateListResponse{
    StateId:number,
    StateName:string
}
export interface CRMCityListResponse {
  DistrictId: number;
  DistrictName: string;
}

export interface CRMAddressByTypeResponse {
  EmployeeAddressDetailsId: number;
  EmployeeRefId: number;
  RelationType: number;
  AddressType: string;
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  StateId: number;
  CityId: number;
  Pincode: string;
  IsDefault: boolean;
  EmployeeDependentDetailsId: number;
  Latitude: string;
  Longitude: string;
}

export interface CRMUpdateMangeProfileRequest {
    employeeRefId: number;
    employeeName: string;
    gender: string;
    dob: string; 
    mobileNo: string;
    maritalStatus: number;
    bloodGroup: string;
    personalEmailid: string;
}

export interface CRMUpdateMangeProfileAddressRequest {
    employeeRefId: number;
    employeeAddressDetailsId: number;
    addressLineOne: string;
    addressLineTwo: string;
    landmark: string;
    stateId: number;
    cityId: number;
    pincode: string;
}



export interface CRMFetchCustomerProfilePictureRequest {
  EmployeeRefId: number;
}
export interface CustomerProfilePicture {
  EmployeeProfileId: number;
  ProfileImageName: string;
  ProfileImagePath: string;
}

export interface SaveProfilePictureResponse {
  Message: string; // uploaded image URL
}
