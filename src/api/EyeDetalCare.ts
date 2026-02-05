
import { Emaildata, EyeDentalCare ,VendorListDetailsForEye} from '../types/EyeDentalCare';
const API_URL = "https://api.welleazy.com";
    
export const EyeDentalCareAPI = {
    // Load Eye Treatment Details
    EDLoadEyeTreatmentDetails: async (): Promise<EyeDentalCare[]> => {
        try {
            const response = await fetch(`${API_URL}/EDLoadEyeTreatmentDetails`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading eye treatment details:', error);
            throw error;
        }
    },
     LoadVendorListDetailsForEye: async (): Promise<VendorListDetailsForEye[]> => {
        try {
            const response = await fetch(`${API_URL}/LoadVendorListDetailsForEye`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VendorListDetailsForEye[] = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading vendor list details for eye:', error);
            throw error;
        }
    },

EDSaveEyeDentalTreatmentCaseDetails: async (formData: FormData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/EDSaveEyeDentalTreatmentCaseDetails`, {
            method: 'POST',
            body: formData, 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving eye dental treatment case details:', error);
        throw error;
    }
},
SendEyeDentalCareAppointmentEmail: async (emailData: Emaildata): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/SendEyeDentalCareAppointmentEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending appointment email:", error);
      throw error;
    }
  },

EDLoadDentalTreatmentDetails: async (): Promise<EyeDentalCare[]> => {
        try {
            const response = await fetch(`${API_URL}/EDLoadDentalTreatmentDetails`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading eye treatment details:', error);
            throw error;
        }
    },
   LoadVendorListDetailsForDental: async (): Promise<VendorListDetailsForEye[]> => {
        try {
            const response = await fetch(`${API_URL}/LoadVendorListDetailsForDental`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VendorListDetailsForEye[] = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading vendor list details for eye:', error);
            throw error;
        }
    },


};