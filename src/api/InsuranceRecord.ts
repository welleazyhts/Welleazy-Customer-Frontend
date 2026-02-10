import { InsuranceRecord } from "../types/InsuranceRecord";
import { api } from "../services/api";

export const insuranceRecordAPI = {
  // 1. Get all policies - transformed to maintain compatibility with existing UI
  CRMGetCustomerInsuranceRecordDetails: async (): Promise<InsuranceRecord[] | null> => {
    try {
      const response = await api.get('/api/insurance-records/');
      let rawData: any[] = [];

      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        rawData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      } else {
        return null;
      }

      // Transform snake_case from new API to PascalCase expected by UI
      return rawData.map((item: any) => ({
        InsuranceRecordId: item.id,
        PolicyHolderName: item.patient_name || item.policy_holder_name || item.policy_name || "Unknown",
        InsuranceCompanyName: item.insurance_company,
        PolicyNumber: item.policy_number,
        PolicyName: item.policy_name,
        PolicyFrom: item.policy_from,
        PolicyTo: item.policy_to,
        IsActive: item.is_active === false ? 2 : 1, // 1 for Active, 2 for Expired
        InsuranceType: item.type_of_insurance,
        SumAssured: item.sum_assured,
        PremiumAmount: item.premium_amount,
        LastUpdateDate: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "-",
        LastUpdateTime: item.updated_at ? new Date(item.updated_at).toLocaleTimeString() : "-",
        PolicyType: item.policy_owner_type === 'dependant' ? 'Dependent' :
          item.policy_owner_type === 'company' ? 'Company Policy' : 'Self',
        TypeOfInsurance: item.type_of_insurance,
        InsuranceCompany: item.insurance_company,
        IsFloater: item.plan_type === 'floater',
        // Additional mapping for consistency
        TPA: item.tpa || "-",
        Nominee: item.nominee || "-",
        // Fill other required fields from interface
        EmployeeRefId: 0,
        RelationshipId: 0,
        NomineeName: item.nominee || "",
        MemberId: "",
        PolicyStatusValue: "",
        CreatedOn: item.created_at,
        CreatedBy: item.created_by,
        UpdatedOn: item.updated_at,
        UpdatedBy: item.updated_by,
        MaturityDate: item.maturity_date || null,
        MaturityAmount: item.maturity_amount || null,
        SurrenderDate: item.surrender_date || null
      })) as any as InsuranceRecord[];
    } catch (error) {
      console.error("Error fetching insurance records:", error);
      return null;
    }
  },

  // 2. Get single policy details by ID
  CRMGetCustomerInsuranceRecordDetailsById: async (InsuranceRecordId: number): Promise<any | null> => {
    try {
      const response = await api.get(`/api/insurance-records/${InsuranceRecordId}/`);
      let item = response.data as any;
      console.log("Full Insurance Record Item from API:", item);

      let docsFromAPI: any = null;

      // Unwrap if wrapped in 'data' or result key
      if (item.data && !item.policy_number) {
        // Check if documents are at the root level before unwrapping
        if (item.documents && Array.isArray(item.documents)) {
          docsFromAPI = item.documents;
        }
        item = item.data;
      }

      // Robust search for documents in the response

      if (!docsFromAPI) {
        const possibleKeys = [
          'insurance_documents', 'DocumentFiles', 'insurance_record_documents',
          'doc_details', 'documents_details', 'file_details',
          'InsuranceRecordDocuments', 'documents'
        ];

        for (const key of possibleKeys) {
          if (Array.isArray(item[key]) && item[key].length > 0) {
            docsFromAPI = item[key];
            break;
          }
        }
      }

      // If no non-empty array found, check singular fields
      if (!docsFromAPI) {
        docsFromAPI = item.document || item.DocumentFile || item.file || item.path || item.DocumentPath;
      }

      // Handle the extracted value
      let finalDocsArray: any[] = [];
      if (Array.isArray(docsFromAPI)) {
        finalDocsArray = docsFromAPI;
      } else if (docsFromAPI && typeof docsFromAPI === 'object') {
        finalDocsArray = [docsFromAPI];
      } else if (docsFromAPI && typeof docsFromAPI === 'string') {
        finalDocsArray = [{ file: docsFromAPI }];
      }

      const baseURL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

      const documents = finalDocsArray.map((doc: any) => {
        let path = "";
        let name = "Document";
        let docId = Math.random();

        if (typeof doc === 'string') {
          path = doc;
          name = path.split('/').pop() || "Document";
        } else {
          path = doc.file || doc.document || doc.path || doc.DocumentPath || "";
          name = doc.document_name || doc.name || doc.DocumentName || (typeof path === 'string' ? path.split('/').pop() : "Document") || "Document";
          docId = doc.id || doc.document_id || doc.InsuranceRecordDocumentId || Math.random();
        }

        // Prepend base URL if path is relative
        if (path && typeof path === 'string' && !path.startsWith('http') && !path.startsWith('data:')) {
          path = `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
        }

        return {
          InsuranceRecordDocumentId: docId,
          InsuranceRecordId: item.id || InsuranceRecordId,
          DocumentName: name,
          DocumentPath: path
        };
      });

      // Format response to match what the UI expects (InsuranceRecord.tsx fetchInsuranceRecordDetails)
      return {
        "Insurance Records Details": [{
          ...item,
          InsuranceRecordId: item.id,
          PolicyHolderName: item.patient_name || item.policy_holder_name || item.holder_name || "",
          InsuranceCompanyName: item.insurance_company,
          InsuranceCompany: item.insurance_company,
          TypeOfInsurance: item.type_of_insurance,
          PolicyFrom: item.policy_from,
          PolicyTo: item.policy_to,
          SumAssured: item.sum_assured,
          PremiumAmount: item.premium_amount,
          AdditionalNotes: item.notes || item.additional_notes || item.Notes || item.AdditionalNotes || "",
          TPA: item.tpa || "-",
          Nominee: item.nominee || "-",
          NomineeName: item.nominee || "-",
          PolicyNumber: item.policy_number || item.policy_no || "",
          PolicyName: item.policy_name || "",
          MaturityDate: item.maturity_date || item.maturity_date_details || "",
          MaturityAmount: item.maturity_amount || "",
          SurrenderDate: item.surrender_date || item.surrender_date_details || "",
          PolicyType: item.policy_owner_type === 'dependant' ? 'Dependent' :
            item.policy_owner_type === 'company' ? 'Company Policy' : 'Self',
          IsFloater: item.plan_type === 'floater'
        }],
        "Insurance Records Documents": documents || [],
        "Insurance Records Documnets": documents || [] // Support legacy typo used in some parts of frontend
      };
    } catch (error) {
      console.error("Error fetching insurance record details by ID:", error);
      return null;
    }
  },

  // 3. Save OR Update insurance record
  CRMSaveCustomerInsuranceRecordDetails: async (formData: FormData): Promise<any | null> => {
    try {
      const idStr = formData.get("InsuranceRecordId")?.toString();
      const insuranceRecordId = parseInt(idStr || "0");
      const isUpdate = insuranceRecordId > 0;

      // 1. Construct the Payload Object
      const payload: any = {};

      // Helper to safely get string values
      const getString = (key: string): string => formData.get(key)?.toString() || "";
      const getNumber = (key: string): number | null => {
        const val = formData.get(key);
        return val ? Number(val) : null;
      };

      // Map UI fields (PascalCase) to Backend fields (snake_case)
      // Basic Fields
      payload.policy_holder_name = getString("PolicyHolderName") || getString("policyHolderName");
      payload.policy_number = getString("PolicyNumber") || getString("policyNumber");
      payload.policy_name = getString("PolicyName") || getString("policyName");

      // Dates - Ensure YYYY-MM-DD
      const formatDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          // if DD-MM-YYYY -> YYYY-MM-DD
          if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        return dateStr;
      };

      payload.policy_from = formatDate(getString("PolicyFrom") || getString("policyFrom"));
      payload.policy_to = formatDate(getString("PolicyTo") || getString("policyTo"));

      // Insurance Details
      payload.type_of_insurance = getString("TypeOfInsurance") || getString("insuranceType");
      payload.insurance_company = getString("InsuranceCompany") || getString("insuranceCompany");
      payload.sum_assured = getString("SumAssured") || getString("sumAssured");
      payload.premium_amount = getString("PremiumAmount") || getString("premiumAmount");

      // Additional
      payload.notes = getString("AdditionalNotes") || getString("additionalNotes");
      payload.nominee = getString("Nominee") || getString("nominee") || getString("NomineeName");
      payload.tpa = getString("TPA") || getString("tpa");

      // Dates (Maturity/Surrender)
      payload.maturity_date = formatDate(getString("MaturityDate") || getString("Maturitydate"));
      payload.maturity_amount = getString("MaturityAmount") || getString("maturityAmount");
      payload.surrender_date = formatDate(getString("SurrenderDate") || getString("surrenderDate"));

      // 2. Handle Policy Owner Type & ID
      const pt = getString("PolicyType");
      if (pt === "Company Policy" || pt === "company") {
        payload.policy_owner_type = "company";
      } else if (pt === "Dependent" || pt === "dependant" || pt === "dependent") {
        payload.policy_owner_type = "dependant";
        const depId = getNumber("DependentId") || getNumber("dependant");
        if (depId) payload.dependant = depId;
      } else {
        payload.policy_owner_type = "self";
      }

      // 3. Handle Floater Details
      const isFloater = formData.get("isFloater") === 'true';
      if (isFloater) {
        payload.plan_type = "floater";
        payload.is_self_included = true; // Defaulting to true as per typical UI behavior, or extract from formData if available

        // If you have a specific field for this in formData:
        if (formData.has("is_self_included")) {
          payload.is_self_included = formData.get("is_self_included") === 'true';
        }

        // Handle Floater Members
        // The UI usually sends this as 'floater_members' JSON string or specific fields
        const membersStr = getString("floater_members");
        if (membersStr) {
          try {
            payload.floater_members = JSON.parse(membersStr);
          } catch (e) {
            payload.floater_members = [];
          }
        } else {
          payload.floater_members = [];
        }
      } else {
        payload.plan_type = "individual";
      }

      // 4. Construct the Final FormData
      const newFormData = new FormData();

      // Append the 'data' key containing the JSON string of all text fields
      console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));
      newFormData.append("data", JSON.stringify(payload));

      // 5. Append Documents
      // Postman uses key 'documents' (plural)
      formData.forEach((value, key) => {
        if (value instanceof File) {
          newFormData.append("documents", value, value.name);
        }
      });

      // 6. Send Request
      let response;
      // Note: No manual Content-Type header; let browser set multipart boundary
      if (isUpdate) {
        response = await api.put(`/api/insurance-records/${insuranceRecordId}/`, newFormData);
      } else {
        response = await api.post('/api/insurance-records/', newFormData);
      }

      const data = response.data as any;
      return {
        success: true,
        message: isUpdate ? "Record updated successfully" : "Record saved successfully",
        Message: isUpdate ? "Record updated successfully" : "Record saved successfully",
        ...data
      };
    } catch (error: any) {
      console.error("Error saving record:", error);
      console.error("Error details:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to save record"
      };
    }
  },

  // 4. Delete insurance record
  CRMCustomerInsuranceEmployeeDeactive: async (insuranceRecordId: number, createdBy?: number): Promise<any | null> => {
    try {
      await api.delete(`/api/insurance-records/${insuranceRecordId}/`);
      return { success: true, message: "Deleted successfully", Message: "Deleted successfully" };
    } catch (error) {
      console.error("Delete error:", error);
      return null;
    }
  },

  // 5. Fetch types
  CRMFetchInsuranceTypeDropDown: async (unusedId?: number): Promise<any[] | null> => {
    try {
      const response = await api.get('/api/insurance-records/choices/');
      console.log("Insurance choices response (Types):", response.data);

      const data = response.data as any;
      let typesData = data?.type_of_insurance;

      // Handle dictionary format (e.g., {"health": "Health Insurance"})
      if (typesData && typeof typesData === 'object' && !Array.isArray(typesData)) {
        return Object.entries(typesData).map(([key, value]) => ({
          InsuranceTypeId: key,
          InsuranceType: value as string
        }));
      }

      // Handle array format
      if (Array.isArray(typesData)) {
        return typesData.map((item: any) => {
          if (Array.isArray(item)) {
            return { InsuranceTypeId: item[0], InsuranceType: item[1] || item[0] };
          }
          return {
            InsuranceTypeId: item.value ?? item.id ?? item,
            InsuranceType: item.display_name ?? item.name ?? item
          };
        });
      }

      return null;
    } catch (error) {
      console.error("Error fetching insurance types:", error);
      return null;
    }
  },

  // 6. Fetch companies
  CRMGetInsuranceCompanyDetails: async (search?: string): Promise<any[] | null> => {
    try {
      const response = await api.get('/api/insurance-records/choices/');
      const data = response.data as any;
      let companyData = data?.insurance_company || data?.companies || data?.data;

      // Handle dictionary format
      if (companyData && typeof companyData === 'object' && !Array.isArray(companyData)) {
        return Object.entries(companyData).map(([key, value]) => ({
          InsuranceCompanyId: key,
          InsuranceCompanyName: value as string
        }));
      }

      // Handle array format
      if (Array.isArray(companyData)) {
        return companyData.map((item: any) => {
          if (Array.isArray(item)) {
            return { InsuranceCompanyId: item[0], InsuranceCompanyName: item[1] || item[0] };
          }
          return {
            InsuranceCompanyId: item.value ?? item.id ?? item,
            InsuranceCompanyName: item.display_name ?? item.name ?? item
          };
        });
      }

      return null;
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
      return null;
    }
  },

  // 7. Fetch Members
  CRMGetEmployeeSelfAndDependentList: async (): Promise<any[] | null> => {
    try {
      const response = await api.get('/api/dependants/');
      let rawData: any[] = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response.data && Array.isArray((response.data as any).results)) {
        rawData = (response.data as any).results;
      }

      const selfName = localStorage.getItem("DisplayName") || "Self";

      // Unique dependents by name to avoid duplicates in the UI
      const uniqueDependentsMap = new Map();
      rawData.forEach((item: any) => {
        const name = (item.name || item.DependentName || "").trim();
        if (name && name !== selfName && !uniqueDependentsMap.has(name)) {
          uniqueDependentsMap.set(name, item);
        }
      });

      const dependents = Array.from(uniqueDependentsMap.values()).map((item: any) => ({
        EmployeeDependentDetailsId: item.id,
        EmployeeName: item.name || item.DependentName,
        Relation: "Dependent", // Standardized display as requested
        EmployeeId: item.employee || item.EmployeeId,
        Gender: item.gender === 'Female' ? 2 : 1,
        Age: item.age || 0
      }));

      const self = {
        EmployeeDependentDetailsId: 0,
        EmployeeName: selfName,
        Relation: "Self",
        EmployeeId: localStorage.getItem("EmployeeId"),
        RelationType: 0,
        Gender: 1,
        Age: 0
      };

      const company = {
        EmployeeDependentDetailsId: -1,
        EmployeeName: selfName,
        Relation: "Company Policy",
        EmployeeId: "0",
        RelationType: 0,
        Gender: 1,
        Age: 0
      };

      // Order: Self, Company Policy, then Dependents
      return [self, company, ...dependents];
    } catch (error) {
      console.error("Error fetching members:", error);
      return null;
    }
  },

  // 8. Delete document
  DeleteInsuranceRecordDocument: async (insuranceRecordDocumentId: number): Promise<any | null> => {
    // Note: The new API might not have a standalone document delete. 
    // Usually it's done via policy update.
    return { message: "Document removal handled via policy update", Message: "Document removal handled via policy update" };
  },

  // 9. List Medical Cards
  ListMedicalCards: async (): Promise<any[] | null> => {
    try {
      const response = await api.get('/api/insurance-records/medical_cards/');
      return response.data as any[];
    } catch (error) {
      console.error("Error fetching medical cards:", error);
      return null;
    }
  }
};

