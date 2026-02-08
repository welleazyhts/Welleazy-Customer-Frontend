import { promises } from 'dns';
import {
  HealthAssessmentRecordDetails, CRMGetEmployeeSelfAndDependentList, HRACustomerBasicProfileDetailsSave, HRACustomerPresentingIllnessDetailsSave, HRACustomerPastHistoryDetailsSave, HRACustomerSleepAssessmentSave, HRACustomerFoodHabitsSave, HRACustomerDrinkingHabitsSave
  , HRACustomerSmokingHabitsSave, HRACustomerHeriditaryQuestionsSave, HRACustomerBowelBladderHabitsSave, HRACustomerFitnessDetailsSave, HRACustomerMentalWellnessSave, HRACustomerWellnessSave, HRAOutputDetailsRequest, SaveDocumentResponse, HealthAssessmentRecordDetailsById
} from '../types/HealthAssessment';

const API_URL = process.env.REACT_APP_API_URL || "http://3.110.32.224";

export const HealthAssessmentAPI = {
  CRMLoadHealthAssessmentRecordDetails: async (): Promise<HealthAssessmentRecordDetails[]> => {
    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId");

      if (!employeeRefId) {
        throw new Error("EmployeeRefId not found in localStorage");
      }
      const response = await fetch(`${API_URL}/CRMLoadHealthAssessmentRecordDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeRefId: Number(employeeRefId),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.Message && data.Message === "Details Not Found") {
        console.log('No health assessment records found for this user');
        return [];
      }
      if (Array.isArray(data)) {
        return data;
      }
      if (data.Data && Array.isArray(data.Data)) {
        return data.Data;
      }
      console.log('Unexpected API response format:', data);
      return [];
    } catch (error) {
      console.error('Error loading health assessment record details:', error);
      return [];
    }
  },
  CRMLoadHealthAssessmentRecordDetailsByIdDocument: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMLoadHealthAssessmentRecordDetailsByIdDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          HRAGeneralDetailsId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading health assessment document details:', error);
      throw error;
    }
  },
  CRMGetEmployeeSelfAndDependentList: async (): Promise<CRMGetEmployeeSelfAndDependentList[]> => {
    try {
      const employeeRefId = localStorage.getItem("EmployeeRefId");

      if (!employeeRefId) {
        throw new Error("EmployeeRefId not found in localStorage");
      }

      const response = await fetch(`${API_URL}/CRMGetEmployeeSelfAndDependentList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeRefId: Number(employeeRefId),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading health assessment record details:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerGeneralDetails: async (payload: {
    HRAGeneralDetailsId: number;
    MemberId: number; RelationType: number; Remarks: string; IsActive: number; CreatedBy: number;
  }): Promise<{ HRAGeneralDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerGeneralDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer general details:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerBasicProfileDetails: async (
    payload: HRACustomerBasicProfileDetailsSave
  ): Promise<{ HRACustomerBasicProfileDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerBasicProfileDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer basic profile details:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerPresentingIllnessDetails: async (
    payload: HRACustomerPresentingIllnessDetailsSave
  ): Promise<{ HRACustomerPrestingIllnessDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerPresentingIllnessDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating presenting illness details:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerPastHistoryDetails: async (
    payload: HRACustomerPastHistoryDetailsSave
  ): Promise<{ HRACustomerPastHistoryDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerPastHistoryDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer past history details:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerSleepAssessment: async (
    payload: HRACustomerSleepAssessmentSave
  ): Promise<{ HRACustomerSleepAssessmentId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerSleepAssessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer sleep assessment:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerFoodHabits: async (
    payload: HRACustomerFoodHabitsSave
  ): Promise<{ HRACustomerFoodHabitsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerFoodHabits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer food habits:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerDrinkingHabits: async (
    payload: HRACustomerDrinkingHabitsSave
  ): Promise<{ HRACustomerDrinkingHabitsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerDrinkingHabits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer drinking habits:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerSmokingHabits: async (
    payload: HRACustomerSmokingHabitsSave
  ): Promise<{ HRACustomerSmokingHabitsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerSmokingHabits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error('Error inserting/updating HRA customer smoking habits:', error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerHeriditaryQuestions: async (
    payload: HRACustomerHeriditaryQuestionsSave
  ): Promise<{ HRACustomerHeriditaryQuestionsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerHeriditaryQuestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error inserting/updating hereditary questions:", error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerBowelBladderHabits: async (
    payload: HRACustomerBowelBladderHabitsSave
  ): Promise<{ HRACustomerBowelBladderHabitsDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerBowelBladderHabits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Error inserting/updating bowel & bladder habits:", error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerFitnessDetails: async (
    payload: HRACustomerFitnessDetailsSave
  ): Promise<{ HRACustomerFitnessDetailsId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerFitnessDetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error inserting/updating HRA customer fitness details:", error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerMentalWellness: async (
    payload: HRACustomerMentalWellnessSave
  ): Promise<{ HRACustomerMentalWellnessId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerMentalWellness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error inserting/updating HRA customer mental wellness:", error);
      throw error;
    }
  },
  CRMInsertUpdateHRACustomerWellness: async (
    payload: HRACustomerWellnessSave
  ): Promise<{ HRACustomerWellnessId: number; Message: string }> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRACustomerWellness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error inserting/updating HRA customer wellness:", error);
      throw error;
    }
  },
  CRMInsertUpdateHRAOutputDetails: async (
    payload: HRAOutputDetailsRequest
  ): Promise<SaveDocumentResponse> => {
    try {
      const response = await fetch(`${API_URL}/CRMInsertUpdateHRAOutputDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving HRA output details:', error);
      throw error;
    }
  },
  CRMSaveHRAQuestionAnswerStatusDetails: async (payload: { HRAGeneralDetailsId: number; QuestionAnsweredId: number; }): Promise<{ Message: string }> => {
    try {
      const response = await fetch(
        `${API_URL}/CRMSaveHRAQuestionAnswerStatusDetails`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        'Error saving HRA question answer status details:',
        error
      );
      throw error;
    }
  },


  CRMLoadHealthAssessmentRecordDetailsById: async (HRAGeneralDetailsId: number): Promise<HealthAssessmentRecordDetailsById[]> => {
    try {
      const response = await fetch(
        `${API_URL}/CRMLoadHealthAssessmentRecordDetailsById`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ HRAGeneralDetailsId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        'Error loading health assessment record details by ID:',
        error
      );
      throw error;
    }
  },
  CRMFetchHRACustomerGeneralDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerGeneralDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerBasicProfileDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerBasicProfileDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerPrestingIllnessDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerPrestingIllnessDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerPastHistoryDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerPastHistoryDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerSleepAssessmentById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerSleepAssessmentById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerFoodHabitsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerFoodHabitsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerDrinkingHabitsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerDrinkingHabitsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerSmokingHabitsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerSmokingHabitsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerHeriditaryQuestionsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerHeriditaryQuestionsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerBowelBladderHabitsDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerBowelBladderHabitsDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },
  CRMFetchHRACustomerFitnessDetailsById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerFitnessDetailsById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },

  CRMFetchHRACustomerMentalWellnessById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerMentalWellnessById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },

  CRMFetchHRACustomerWellnessById: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/CRMFetchHRACustomerWellnessById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ HRAGeneralDetailsId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.error('Error fetching HRA customer general details by ID:', error);
      throw error;
    }
  },

  CRMUploadHRAOutputPdf: async (formData: FormData): Promise<SaveDocumentResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/CRMInsertUpdateHRAOutputDetails`,
        {
          method: 'POST',
          body: formData, // FormData
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading HRA output PDF:', error);
      throw error;
    }
  }

};



