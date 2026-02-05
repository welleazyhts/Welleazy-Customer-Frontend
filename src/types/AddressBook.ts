export interface EmployeeAddressDetails {
  EmployeeAddressDetailsId: number;
  EmployeeRefId: number;
  EmployeeName: string;
  RelationType: number;
  Relationship: string;
  AddressType: string;
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  StateId: number;
  CityId: number;
  StateName: string;
  DistrictName: string;
  Pincode: string;
  ContactNo: string;
  IsDefault: boolean;
  IsDefaultValue: string;
  EmployeeDependentDetailsId: number;
}
export interface SaveCustomerAddressRequest {
  EmployeeAddressDetailsId: number;
  EmployeeRefId: number;
  RelationShip: number;
  AddressType: 'Home' | 'Office' | 'Other';
  AddressLineOne: string;
  AddressLineTwo: string;
  Landmark: string;
  StateId: number;
  CityId: number;
  Pincode: string;
  IsDefault: boolean;
  EmployeeDependentDetailsId: number;
  Latitude?: string;
  Longitude?: string;
}