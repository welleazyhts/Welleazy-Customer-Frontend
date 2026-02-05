import { InsuranceRecord, SaveInsuranceRecord } from "../types/InsuranceRecord";

const API_URL = "https://api.welleazy.com";

export const insuranceRecordAPI = {
CRMGetCustomerInsuranceRecordDetails: async (): Promise<InsuranceRecord[] | null> => {
    try {
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");

      if (!EmployeeRefId) {
        throw new Error("EmployeeRefId not found. Please log in first.");
      }

      const response = await fetch(`${API_URL}/CRMGetCustomerInsuranceRecordDetails`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ EmployeeRefId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch insurance records");
      }

      const data: InsuranceRecord[] = await response.json();
      

      return data;
    } catch (error) {
      console.error("Error fetching insurance records:", error);
      return null;
    }
},

CRMGetCustomerInsuranceRecordDetailsById: async (InsuranceRecordId: number): Promise<any | null> => {
  try {
    const EmployeeRefId = localStorage.getItem("EmployeeRefId");

    if (!EmployeeRefId) {
      throw new Error("EmployeeRefId not found. Please log in first.");
    }

    const response = await fetch(`${API_URL}/CRMGetCustomerInsuranceRecordDetailsById`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ InsuranceRecordId }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch insurance record details");
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error fetching insurance record details by ID:", error);
    return null;
  }
},
CRMSaveCustomerInsuranceRecordDetails: async (formData: FormData): Promise<any | null> => {
    try {
      console.log(" Sending form data with files");
      const entries = formData.entries();
      let entry = entries.next();
      while (!entry.done) {
        const [key, value] = entry.value;
        if (key !== 'DocumentFiles') {
          console.log(`${key}: ${value}`);
        } else {
          console.log(`DocumentFiles: [File object]`);
        }
        entry = entries.next();
      }
      const response = await fetch(`${API_URL}/CRMSaveCustomerInsuranceRecordDetails`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData, 
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error(" Server error response:", errorText);
          errorMessage = errorText || errorMessage;
        } catch (e) {
          console.error(" Could not read error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      return data;
    } catch (error) {
      console.error(" Error saving record:", error);
      return { 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false
      };
    }
  },
 // In your InsuranceRecord API file
CRMFetchInsuranceTypeDropDown: async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${API_URL}/CRMFetchInsuranceTypeDropDown`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch insurance types");
    }

    const data = await response.json();
    console.log(" Insurance types API response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching insurance types:", error);
    return null;
  }
},
CRMGetInsuranceCompanyDetails: async (insuranceTypeId: number): Promise<any[] | null> => {
    try {
      const response = await fetch(
        `${API_URL}/CRMGetInsuranceCompanyDetails/${insuranceTypeId}`,
        {
          method: "GET",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch insurance companies");

      const data = await response.json();
      console.log("Insurance companies API response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
      return null;
    }
},
CRMGetEmployeeSelfAndDependentList: async (): Promise<any[] | null> => {
    try {
      const EmployeeRefId = localStorage.getItem("EmployeeRefId");
        if (!EmployeeRefId) {
            throw new Error("EmployeeRefId not found. Please log in first.");
        }
        const response = await fetch(`${API_URL}/CRMGetEmployeeSelfAndDependentList`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify({ EmployeeRefId }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch employee self and dependent list");
        }
        const data = await response.json();
        console.log(" Employee self and dependent list API response:", data);
        return data;
    }
    catch (error) {
        console.error("Error fetching employee self and dependent list:", error);
        return null;
} 
},
DeleteInsuranceRecordDocument: async (
  insuranceRecordDocumentId: number
): Promise<any | null> => {
  try {
    const response = await fetch(
      `${API_URL}/DeleteInsuranceRecordDocument`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          InsuranceRecordDocumentId: insuranceRecordDocumentId,
        }), 
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete insurance record document");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete error:", error);
    return null;
  }
},



CRMCustomerInsuranceEmployeeDeactive: async (insuranceRecordId: number,createdBy: number): Promise<any | null> => {
  try {
    const response = await fetch(
      `${API_URL}/CRMCustomerInsuranceEmployeeDeactive`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          InsuranceRecordId: insuranceRecordId,
          CreatedBy: createdBy,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to deactivate insurance record");
    }

    return await response.json();
  } catch (error) {
    console.error("Deactivate error:", error);
    return null;
  }
},


InsuranceRecordDetailsDocument: async ( insuranceRecordDocumentId: number): Promise<any | null> => {
  try {
    const response = await fetch(
      `${API_URL}/Insurance/InsuranceRecordDetailsDocument/${insuranceRecordDocumentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch insurance record documents");
    }

    const data = await response.json();
    console.log("Insurance record documents API response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching insurance record documents:", error);
    return null;
  }
},





};
