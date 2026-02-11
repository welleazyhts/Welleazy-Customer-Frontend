export interface CRMGenerateDependentMemberIdResponse {
  DependentMemberId: string;
}

export interface CRMInsertUpdateEmployeeDependantDetailsRequest {
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

export interface CRMInsertUpdateEmployeeDependantDetailsResponse {
  Message: string;
  data?: {
    id: number;
    member_id: string;
    name: string;
    gender: string;
    dob: string;
    relationship: number;
    mobile_number: string | null;
    email: string;
    occupation: string;
    marital_status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface CRMFetchDependentDetailsForEmployeeRequest {
  EmployeeRefId: number;
}

export interface CRMFetchDependentDetailsForEmployeeResponse {
  EmployeeDependentDetailsId: number;
  EmployeeId: number;
  DependentId: string;
  Relationship: string;
  DependentRelationShip: number;
  DependentName: string;
  DependentMobileNo: string;
  Description: string;
  DependentGender: string;
  DependentDOB: string;
  DOB: string;
  AccessProfilePermission: boolean;
  MaritalStatus: string;
  Occupation: string;
  DependentEmailId: string;
  IsActive: boolean;
  DependentMemberId: string;
}

export interface District {
  DistrictId: number;
  DistrictName: string;
  StateId: number;
  StateName: string;
  IsActive: string;
  CityType: string | null;
}
