export interface InsuranceRecord {
  InsuranceRecordId: number;
  EmployeeRefId: number;
  RelationshipId: number;
  PolicyHolderName: string;
  NomineeName: string;
  PolicyNumber: string;
  PolicyName: string;
  TypeOfInsurance: number;
  InsuranceCompany: number;
  InsuranceCompanyName: string;
  PolicyFrom: string; 
  PolicyTo: string;
  MemberId: string;
  AdditionalNotes: string;
  PolicyStatusValue: string; 
  IsActive: number; 
  CreatedOn: string | null;
  CreatedBy: string | null;
  UpdatedOn: string | null;
  UpdatedBy: string | null;
  SumAssured: string | null;
  PremiumAmount: string | null;
  MaturityDate: string | null;
  MaturityAmount: string | null;
  SurrenderDate: string | null;
  PolicyType: string | null;
  LastUpdateDate: string | null;
  LastUpdateTime: string | null;
  InsuranceType: string | null;
}
export interface SaveInsuranceRecord {
  InsuranceRecordId: number;
  EmployeeRefId: string;
  PolicyHolderName: string;
  NomineeName: string;
  PolicyNumber: string;
  PolicyName: string;
  TypeOfInsurance: string;
  InsuranceCompany: string;
  PolicyFrom: string;
  PolicyTo: string;
  MemberId: string;
  AdditionalNotes: string;
  PolicyStatus: string;
  PolicyType: string;
    Createdby: number;
    isActive: number;
    sumAssured: string;
    premiumAmount: string;
    tpa: string;
    nominee: string;
}


export interface RecordType {
  id: number;
  member: string;
  insurer: string;
  policyFrom: string;
  policyTo: string;
  lastUpdateDate: string;
  lastUpdateTime: string;
  status: string;
  expanded?: boolean;
  details?: any | null;
  insuranceType?: string;
   documents?: DocumentType[];
}
export interface DocumentType {
  InsuranceRecordDocumentId: number;
  InsuranceRecordId: number;
  DocumentName: string;
  DocumentPath: string;
}
export interface MemberType {
  name: string;
  relation: string;
  employeeId: string;
  dob: string;
  age: number;
  gender: number;
  isActive?: boolean; // For tracking selected state
}


export interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}
export interface InsuranceType {
  InsuranceTypeId: number;
  InsuranceType: string;
}
export interface InsuranceCompany {
  InsuranceCompanyId: number;
  InsuranceCompanyName: string;
}

export interface Dependent {
  EmployeeDependentDetailsId: number;
  EmployeeName: string;
  Relation: string;
  MobileNo: string;
  EmployeeRefId: number;
  EmployeeId: string;
  RelationType: number;
  Gender: number;
  DOB: string;
  TagLine: string;
  Age: number;
  Emailid: string;
  State: number;
  City: number;
  Address: string;
}
export interface InsuranceDocument {
  InsuranceRecordDocumentId: number;
  InsuranceRecordId: number;
  DocumentName: string;
  DocumentPath: string;
}

