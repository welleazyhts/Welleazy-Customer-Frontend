import { api } from '../services/api';
import {
  HealthAssessmentRecordDetails,
  CRMGetEmployeeSelfAndDependentList,
  HRACustomerBasicProfileDetailsSave,
  HRACustomerPresentingIllnessDetailsSave,
  HRACustomerPastHistoryDetailsSave,
  HRACustomerSleepAssessmentSave,
  HRACustomerFoodHabitsSave,
  HRACustomerDrinkingHabitsSave,
  HRACustomerSmokingHabitsSave,
  HRACustomerHeriditaryQuestionsSave,
  HRACustomerBowelBladderHabitsSave,
  HRACustomerFitnessDetailsSave,
  HRACustomerMentalWellnessSave,
  HRACustomerWellnessSave,
  HRAOutputDetailsRequest,
  SaveDocumentResponse,
  HealthAssessmentRecordDetailsById
} from '../types/HealthAssessment';

export const HealthAssessmentAPI = {
  // List reports
  CRMLoadHealthAssessmentRecordDetails: async (): Promise<HealthAssessmentRecordDetails[]> => {
    try {
      const response = await api.get('/api/health-assessments/');
      if (Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          HRAGeneralDetailsId: item.id,
          MemberId: item.dependant_data?.member_id || 0,
          RelationType: item.dependant_data?.relationship || 0,
          EmployeeName: item.for_whom?.name || "Self",
          DateOfBirth: item.dependant_data?.dob || "",
          Relationship: item.for_whom?.type === "self" ? "Self" : "Dependent",
          CreatedOn: item.created_at || item.created_on,
          CreatedBy: "",
          IsActive: item.dependant_data?.is_active ? 1 : 0,
          IsActiveValue: item.dependant_data?.is_active ? "Active" : "Inactive",
          Status: item.report_url ? "completed" : "pending",
          AnsweredCount: 0,
          LastAnsweredQuestion: item.current_step || 0,
          Action: item.report_url ? "View" : "Resume",
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading health assessment record details:', error);
      return [];
    }
  },

  // Get detail report
  CRMLoadHealthAssessmentRecordDetailsById: async (HRAGeneralDetailsId: number): Promise<HealthAssessmentRecordDetailsById[]> => {
    try {
      const response = await api.get(`/api/health-assessments/${HRAGeneralDetailsId}/`);
      const item = response.data as any;
      return [{
        HRAGeneralDetailsId: item.id,
        MemberId: item.dependant_data?.member_id || 0,
        RelationType: item.dependant_data?.relationship || 0,
        EmployeeName: item.for_whom?.name || "Self",
        DateOfBirth: item.dependant_data?.dob || "",
        Relationship: item.for_whom?.type === "self" ? "Self" : "Dependent",
        CreatedOn: item.created_at || item.created_on,
        CreatedBy: "",
        IsActive: item.dependant_data?.is_active ? 1 : 0,
        Status: item.report_url ? "completed" : "pending",
        AnsweredCount: 0,
        LastAnsweredQuestion: item.current_step || 0,
        Action: item.report_url ? "View" : "Resume",
      }];
    } catch (error) {
      console.error('Error loading health assessment record details by ID:', error);
      throw error;
    }
  },

  // Get document (PDF) - The new API might have a different way to get the report
  CRMLoadHealthAssessmentRecordDetailsByIdDocument: async (HRAGeneralDetailsId: number): Promise<any> => {
    try {
      const response = await api.get(`/api/health-assessments/${HRAGeneralDetailsId}/`);
      return [response.data];
    } catch (error) {
      console.error('Error loading health assessment document details:', error);
      throw error;
    }
  },

  // Get employees/dependants list
  CRMGetEmployeeSelfAndDependentList: async (): Promise<CRMGetEmployeeSelfAndDependentList[]> => {
    try {
      const response = await api.get('/api/dependants/');
      const dependants = Array.isArray(response.data) ? response.data : [];

      const mappedDependants = dependants.map((d: any) => ({
        EmployeeDependentDetailsId: d.id,
        MobileNo: d.mobile_number || "",
        EmployeeRefId: d.employee || 0,
        EmployeeId: d.member_id || "",
        EmployeeName: d.name || "",
        RelationType: d.relationship || 0,
        Relation: "Dependent",
        Gender: d.gender === "Male" ? 1 : d.gender === "Female" ? 2 : 3,
        DOB: d.dob || "",
        TagLine: "",
        Age: 0,
        Emailid: d.email || "",
        State: 0,
        City: 0,
        Address: d.address || ""
      }));

      // Add Self from localStorage
      const self: CRMGetEmployeeSelfAndDependentList = {
        EmployeeDependentDetailsId: 0,
        MobileNo: localStorage.getItem("mobile") || "",
        EmployeeRefId: Number(localStorage.getItem("EmployeeRefId")),
        EmployeeId: localStorage.getItem("MemberId") || "",
        EmployeeName: localStorage.getItem("DisplayName") || "Self",
        RelationType: 1, // Self
        Relation: "Self",
        Gender: localStorage.getItem("Gender") === "Male" ? 1 : 2,
        DOB: localStorage.getItem("DOB") || "",
        TagLine: "",
        Age: 0,
        Emailid: localStorage.getItem("email") || "",
        State: Number(localStorage.getItem("StateId")),
        City: Number(localStorage.getItem("CityId")),
        Address: localStorage.getItem("address") || ""
      };

      return [self, ...mappedDependants];
    } catch (error) {
      console.error('Error loading employee self and dependent list:', error);
      // If dependants fail, still try to return self
      try {
        const self: CRMGetEmployeeSelfAndDependentList = {
          EmployeeDependentDetailsId: 0,
          MobileNo: localStorage.getItem("mobile") || "",
          EmployeeRefId: Number(localStorage.getItem("EmployeeRefId")),
          EmployeeId: localStorage.getItem("MemberId") || "",
          EmployeeName: localStorage.getItem("DisplayName") || "Self",
          RelationType: 1,
          Relation: "Self",
          Gender: localStorage.getItem("Gender") === "Male" ? 1 : 2,
          DOB: localStorage.getItem("DOB") || "",
          TagLine: "",
          Age: 0,
          Emailid: localStorage.getItem("email") || "",
          State: Number(localStorage.getItem("StateId")),
          City: Number(localStorage.getItem("CityId")),
          Address: localStorage.getItem("address") || ""
        };
        return [self];
      } catch (innerError) {
        throw error;
      }
    }
  },

  // Start Assessment (Step 1 & 2)
  CRMInsertUpdateHRACustomerGeneralDetails: async (payload: any): Promise<{ HRAGeneralDetailsId: number; Message: string }> => {
    try {
      const startPayload = {
        for_whom: payload.RelationType === 1 ? "self" : "dependant",
        dependant: payload.RelationType === 1 ? undefined : payload.EmployeeDependentDetailsId || payload.MemberId
      };
      console.log('Starting assessment with payload:', startPayload);
      const response = await api.post('/api/health-assessments/', startPayload);
      const data = response.data as any;

      console.log('CRMInsertUpdateHRACustomerGeneralDetails response:', data);

      // Robust ID extraction
      const id = data.id || data.Id || data.HRAGeneralDetailsId || (data.data && data.data.id);

      if (!id) {
        console.error('Failed to extract ID from response:', data);
      }

      return {
        HRAGeneralDetailsId: id,
        Message: "Success"
      };
    } catch (error) {
      console.error('Error starting health assessment:', error);
      throw error;
    }
  },

  // Generic Update method for steps
  updateStep: async (id: number, stepData: any) => {
    try {
      const response = await api.patch(`/api/health-assessments/${id}/`, stepData);
      return response.data;
    } catch (error) {
      console.error(`Error updating step ${stepData.current_step}:`, error);
      throw error;
    }
  },

  // Map existing methods to the generic updateStep
  CRMInsertUpdateHRACustomerBasicProfileDetails: async (payload: HRACustomerBasicProfileDetailsSave) => {
    // Validate and format height_cm to satisfy "max 3 digits before decimal"
    let heightCm = payload.HeightInCM;
    if (heightCm > 999) heightCm = 999;

    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 4,
      height_unit: payload.HeightIn === 1 ? "feet" : "cm",
      height_feet: payload.HeightInFeet,
      height_inches: payload.HeightInInches,
      height_cm: Math.round(heightCm), // Ensure integer or properly gathered number
      weight_kg: payload.WeightInKg,
      bmi: payload.BMI.toLowerCase(),
      health_opinion: payload.Opinion.toLowerCase()
    });
  },

  CRMInsertUpdateHRACustomerPresentingIllnessDetails: async (payload: HRACustomerPresentingIllnessDetailsSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 5,
      presenting_illness: payload.Illness,
      presenting_illness_other: payload.OtherIllness
    });
  },

  CRMInsertUpdateHRACustomerPastHistoryDetails: async (payload: HRACustomerPastHistoryDetailsSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 6,
      chronic_illness: payload.ChronicIllness === "Yes",
      chronic_illness_details: payload.OtherChronicIllness,
      surgery_history: payload.Surgery === "Yes",
      surgery_history_details: payload.OtherSurgery
    });
  },

  CRMInsertUpdateHRACustomerSleepAssessment: async (payload: HRACustomerSleepAssessmentSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 7,
      sleep_hours: payload.SleepInNight === "Less than 7 hours" ? "lt_7" : "gt_7",
      wakeup_midnight: payload.WakeUpInMidst === "Yes",
      wakeup_midnight_reasons: payload.WakeUpReason,
      tired_morning: payload.FeelingOfWakeUpInMorning === "Yes"
    });
  },

  CRMInsertUpdateHRACustomerFoodHabits: async (payload: HRACustomerFoodHabitsSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 8,
      junk_food_freq: payload.FriedFoodEatingOutSide.toLowerCase(),
      fruits_veg_freq: payload.FreshFruitsAndGreenVegetables.toLowerCase(),
      milk_dairy_freq: payload.MilkAndDiaryProducts.toLowerCase(),
      water_intake: payload.TakeWaterPerDay.includes("Less than 9") ? "lt_9" : "gt_9",
      is_veg: payload.IsVegeterian === 1,
      non_veg_freq: payload.MeatAndHighProteinDiet.toLowerCase()
    });
  },

  CRMInsertUpdateHRACustomerDrinkingHabits: async (payload: HRACustomerDrinkingHabitsSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 9,
      alcohol_current: payload.ConsumingAlcohol === "Yes",
      alcohol_frequency: payload.PeriodOfHabit,
      alcohol_quantity: payload.IntakeQuantity,
      alcohol_duration: payload.WhenQuitInYear, // Need to verify field mapping
      alcohol_planning_quit: payload.QuitAlcohol === "Yes",
      alcohol_past: payload.ConsumedInPast === "Yes",
      alcohol_quit_period: payload.AlcoholQuantity
    });
  },

  CRMInsertUpdateHRACustomerSmokingHabits: async (payload: HRACustomerSmokingHabitsSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 10,
      tobacco_current: payload.ConsumingTobacco === "Yes",
      tobacco_type: payload.TobaccoType,
      tobacco_duration: payload.PeriodOfHabit,
      tobacco_planning_quit: payload.QuitTobacco === "Yes",
      tobacco_quit: payload.ConsumedInPast === "Yes",
      tobacco_quit_period: payload.WhenQuitInYear
    });
  },

  CRMInsertUpdateHRACustomerHeriditaryQuestions: async (payload: HRACustomerHeriditaryQuestionsSave) => {
    const checkupMap: { [key: string]: string } = {
      "everySixMonths": "six_months",
      "yearlyOnce": "yearly",
      "hadItFewTimes": "few_times"
    };

    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 11,
      family_chronic_illness: payload.SuffreingFromDisease === "Yes",
      family_illness_records: payload.HRACustomerDiseasesDetails.map(d => ({
        dependant: 1, // Placeholder
        disease: d.DiseasesName === "Chronic Disease" ? "others" : d.DiseasesName.toLowerCase().replace(/ /g, '_')
      })),
      checkup_frequency: checkupMap[payload.RoutineCheckUp] || "few_times",
      taking_regular_meds: payload.TakingMedication === "Yes",
      stopped_meds_without_doctor: payload.TakingMedicationWDoctor === "Yes",
      other_alt_medicine: payload.TakingOtherSource === "Yes"
    });
  },

  CRMInsertUpdateHRACustomerBowelBladderHabits: async (payload: HRACustomerBowelBladderHabitsSave) => {
    const urineMap: { [key: string]: string } = {
      "Difficulty in flow of Urine": "flow_difficulty",
      "Blood tinged urination": "blood_urination",
      "Pain while urinating": "pain_while_urinating"
    };

    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 12,
      difficulty_urine: payload.DifficultyPassingUrine === "Yes",
      difficulty_urine_reasons: urineMap[payload.Difficulty] || null,
      difficulty_stools: payload.DifficultyPassingStools === "Yes"
    });
  },

  CRMInsertUpdateHRACustomerFitnessDetails: async (payload: HRACustomerFitnessDetailsSave) => {
    const durationMap: { [key: string]: string } = {
      "lessThan30": "lt_30",
      "30to60": "30_60",
      "moreThan60": "gt_60",
      "notReally": "none",
      "Not Really": "none"
    };

    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 13,
      stretch_duration: durationMap[payload.Stretching] || payload.Stretching,
      cardio_duration: durationMap[payload.Aerobic] || payload.Aerobic,
      strength_duration: durationMap[payload.StrengthAndConditioning] || payload.StrengthAndConditioning,
      walking_duration: durationMap[payload.Walking] || payload.Walking,
      other_activity: payload.OtherPhysicalActivity
    });
  },

  // Step 14 - Mood Today / Little interest
  CRMInsertUpdateHRACustomerMentalWellness: async (payload: HRACustomerMentalWellnessSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 14,
      low_interest: payload.InterestOrPleaseure === "Yes",
      depressed: payload.Feeling === "Yes",
      sleep_appetite_issue: payload.ProblemInSleep === "Yes",
      low_energy: payload.EnergyLevel === "Yes",
      anxious: payload.WorriesAndDoubts === "Yes"
    });
  },

  // Step 15 - Employee Wellness
  CRMInsertUpdateHRACustomerWellness: async (payload: HRACustomerWellnessSave) => {
    return HealthAssessmentAPI.updateStep(payload.HRAGeneralDetailsId, {
      current_step: 15,
      work_stress_affecting_life: payload.FeelStress === "Yes",
      work_stress_reasons: payload.Stressing
    });
  },

  // Final Submit
  CRMInsertUpdateHRAOutputDetails: async (payload: any): Promise<SaveDocumentResponse> => {
    try {
      const hraId = payload.HRAGeneralDetailsId;
      const response = await api.post(`/api/health-assessments/${hraId}/submit/`, {});
      const data = response.data as any;
      return {
        success: true,
        message: "Assessment submitted successfully",
        documentName: data.report_url || "",
        documentPath: data.report_url || "",
        isDataExists: "Yes"
      };
    } catch (error) {
      console.error('Error submitting health assessment:', error);
      throw error;
    }
  },

  // Legacy method for status update - can be No-Op if the new API handles state
  CRMSaveHRAQuestionAnswerStatusDetails: async (payload: { HRAGeneralDetailsId: number; QuestionAnsweredId: number; }): Promise<{ Message: string }> => {
    // The new API handles steps automatically via current_step in PATCH
    return { Message: "Success" };
  },

  // Mock/Choices API
  getChoices: async () => {
    try {
      const response = await api.get('/api/health-assessments/choices/');
      return response.data as any;
    } catch (error) {
      console.error('Error fetching choices:', error);
      throw error;
    }
  },

  prefetchUserData: async (dependantId?: number) => {
    try {
      const url = dependantId ? `/api/health-assessments/prefill/?dependant_id=${dependantId}` : '/api/health-assessments/prefill/';
      const response = await api.get(url);
      return response.data as any;
    } catch (error) {
      console.error('Error prefilling data:', error);
      throw error;
    }
  },

  // Other missing methods
  CRMFetchHRACustomerGeneralDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerBasicProfileDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerPrestingIllnessDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerPastHistoryDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerSleepAssessmentById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerFoodHabitsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerDrinkingHabitsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerSmokingHabitsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerHeriditaryQuestionsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerBowelBladderHabitsDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerFitnessDetailsById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerMentalWellnessById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,
  CRMFetchHRACustomerWellnessById: async (id: number) => (await api.get(`/api/health-assessments/${id}/`)).data as any,

  CRMUploadHRAOutputPdf: async (formData: FormData) => {
    const response = await api.post('/api/health-assessments/upload-pdf/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as any;
  }
};
