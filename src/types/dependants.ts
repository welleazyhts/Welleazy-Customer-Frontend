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
  DependentGender: number;
  DependentDOB: string;
  AccessProfilePermission: boolean;
  MaritalStatus: number;
  Occupation: string;
  DependentEmailId: string;
  IsActive: boolean;
  DependentMemberId: string;
  DependentUserName: string;
  Password: string;
}

export interface CRMInsertUpdateEmployeeDependantDetailsResponse {
  Message: string;
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
  DependentGender: number;
  DependentDOB: string;
  DOB: string;
  AccessProfilePermission: boolean;
  MaritalStatus: number;
  Occupation: number;
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
