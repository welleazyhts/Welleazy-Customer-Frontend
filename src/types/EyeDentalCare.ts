

export interface EyeDentalCare
{
    EyeDentalCareTreatmentId :number,
    TreatmentName:string,
    EyeDentalCareTreatmentName:string,
    TreatmentImageName:string,
    TreatmentImagePath:string,
    IsActive:number,
}
export interface VendorListDetailsForEye {
    vendor_id: number;
    vendor_TypeId: number;
    vendor_Type: string;
    vendor_name: string;
    vendor_address: string;
    City: string | null;
    State: string | null;
    pincode: string | null;
    conPerson_name: string | null;
    conMobile_no: string | null;
    emailid: string | null;
    busRegNumber: string | null;
    serviceOffered: string | null;
    logoName: string | null;
    logoPath: string | null;
    operatingHours: string | null;
    instruction: string | null;
    termsCondition: string | null;
    AddressURL: string | null;
}
export interface VoucherData {
  requestId: string;
  name: string;
  vendorName: string;
  centerAddress: string;
  serviceName: string;
  treatmentName: string;
  contactNumber: string;
  email: string;
  caseDetailsId: string;
}
export interface Emaildata{
    EmailId:string,
    Name:string,
    VendorName:string,
    VendorAddress:string,
    RequestId:string,
    ServiceName:string,
    TreatmentName:string,
    LoginRefId:string,
}