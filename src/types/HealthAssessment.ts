

export interface HealthAssessmentRecordDetails {
  HRAGeneralDetailsId: number;
  MemberId: number;
  RelationType: number;
  EmployeeName: string;
  DateOfBirth: string; 
  Relationship: string;
  CreatedOn: string;   
  CreatedBy: string;
  IsActive: number;
  IsActiveValue: string;
   Status: string;
  AnsweredCount: number;
  LastAnsweredQuestion: number;
  Action: "Resume" | "View";
}
export interface CRMGetEmployeeSelfAndDependentList {
  EmployeeDependentDetailsId: number;
  MobileNo: string;
  EmployeeRefId: number;
  EmployeeId: string;
  EmployeeName: string;
  RelationType: number;
  Relation: string;
  Gender: number;
  DOB: string;
  TagLine: string;
  Age: number;
  Emailid: string;
  State: number;
  City: number;
  Address: string;
}

export interface HRACustomerBasicProfileDetailsSave {
  HRACustomerBasicProfileDetailsId: number;
  HRAGeneralDetailsId: number;
  HeightIn: number;
  HeightInCM: number;
  HeightInFeet: number;
  HeightInInches: number;
  WeightIn: number;
  WeightInKg: number;
  WeightInPounds: number;
  Opinion: string;
  BMI: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerPresentingIllnessDetailsSave {
  HRACustomerPrestingIllnessDetailsId: number;
  HRAGeneralDetailsId: number;
  Illness: string;
  OtherIllness: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerPastHistoryDetailsSave {
  HRACustomerPastHistoryDetailsId: number;
  HRAGeneralDetailsId: number;
  ChronicIllness: string;
  OtherChronicIllness: string;
  Surgery: string;
  OtherSurgery: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerSleepAssessmentSave {
  HRACustomerSleepAssessmentId: number;
  HRAGeneralDetailsId: number;
  SleepInNight: string;
  WakeUpInMidst: string;
  WakeUpReason: string;
  FeelingOfWakeUpInMorning: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerFoodHabitsSave {
  HRACustomerFoodHabitsId: number;
  HRAGeneralDetailsId: number;
  FriedFoodEatingOutSide: string;
  FreshFruitsAndGreenVegetables: string;
  IsVegeterian: number;
  MeatAndHighProteinDiet: string;
  MilkAndDiaryProducts: string;
  TakeWaterPerDay: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerDrinkingHabitsSave {
  HRACustomerDrinkingHabitsId: number;
  HRAGeneralDetailsId: number;
  ConsumingAlcohol: string;
  PeriodOfHabit: string;
  IntakeQuantity: string;
  QuitAlcohol: string;
  ConsumedInPast: string;
  WhenQuitInYear: string;
  AlcoholQuantity: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerSmokingHabitsSave {
  HRACustomerSmokingHabitsId: number;
  HRAGeneralDetailsId: number;
  ConsumingTobacco: string;
  TobaccoType: string;
  PeriodOfHabit: string;
  QuitTobacco: string;
  ConsumedInPast: string;
  WhenQuitInYear: string;
  NoOfBedi: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerDiseaseDetail {
  MemberName: string;
  DiseasesName: string;
}

export interface HRACustomerHeriditaryQuestionsSave {
  HRACustomerHeriditaryQuestionsId: number;
  HRAGeneralDetailsId: number;
  SuffreingFromDisease: string;
  RoutineCheckUp: string;
  TakingMedication: string;
  TakingMedicationWDoctor: string;
  TakingOtherSource: string;
  HRACustomerDiseasesDetails: HRACustomerDiseaseDetail[];
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerBowelBladderHabitsSave {
  HRACustomerBowelBladderHabitsDetailsId: number;
  HRAGeneralDetailsId: number;
  DifficultyPassingUrine: string;
  Difficulty: string;
  DifficultyPassingStools: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerFitnessDetailsSave {
  HRACustomerFitnessDetailsId: number;
  HRAGeneralDetailsId: number;
  Stretching: string;
  Aerobic: string;
  StrengthAndConditioning: string;
  Walking: string;
  PhysicalActivity: string;
  OtherPhysicalActivity: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerMentalWellnessSave {
  HRACustomerMentalWellnessId: number;
  HRAGeneralDetailsId: number;
  InterestOrPleaseure: string;
  Feeling: string;
  ProblemInSleep: string;
  EnergyLevel: string;
  WorriesAndDoubts: string;
  IsActive: number;
  CreatedBy: number;
}
export interface HRACustomerWellnessSave {
  HRACustomerWellnessId: number;
  HRAGeneralDetailsId: number;
  FeelStress: string;
  Remarks: string;
  Stressing: string;
  IsActive: number;
  CreatedBy: number;
}

export interface HRAOutputDetailsRequest {
  HRAOutpuDetailsId: number;
  EmployeeRefId: number; 
  HRAGeneralDetailsId: string;
  CreatedBy: string;
  AssessmentData: {
    SubmissionDate: string;
    UserInfo: {
      Name: string;
      Relation: string;
      Gender: string;
      Age: string;
    };
    BasicProfile: {
      Height: string;
      Weight: string;
      Bmi: string;
      HealthOpinion: string;
    };
    Mood: string;
    PresentingIllness: string[];
    PastHistory: {
      ChronicIllness: string;
      Surgery: string;
    };
    SleepAssessment: {
      SleepHours: string;
      WakeUpMidSleep: string;
      WakeUpReason: string;
      MorningFeeling: string;
    };
    EatingHabits: {
      DietType: string;
      FriedJunkFood: string;
      MilkDairy: string;
      FreshFruitsVeg: string;
      WaterIntake: string;
      MeatSeafood: string;
    };
    DrinkingHabits: {
      ConsumingAlcohol: string;
      ConsumedInPast: string;
    };
    SmokingHabits: {
      ConsumingTobacco: string;
      QuitHabit: string;
    };
    HereditaryQuestions: {
      FamilyIllness: string;
      PhysicianCheckup: string;
      CurrentlyTakingMedication: string;
      StoppedMedication: string;
      OtherMedicineSources: string;
    };
    BowelBladderHabits: {
      DifficultyUrinating: string;
      DifficultyStooling: string;
    };
    FitnessProfile: {
      Stretching: string;
      AerobicActivity: string;
      StrengthTraining: string;
      Walking: string;
      OtherActivity: string;
    };
    MentalWellness: {
      LittleInterest: string;
      FeelingSad: string;
      SleepAppetiteProblems: string;
      LowEnergy: string;
      AnxiousRestless: string;
    };
    EmployeeWellness: {
      WorkStress: string;
      StressReasons: string[];
    };
  };
}

export interface AssessmentDataModel {
  SubmissionDate: string;
  UserInfo: UserInfoModel;
  BasicProfile: BasicProfileModel;
  Mood: string;
  PresentingIllness: string[];
  PastHistory: PastHistoryModel;
  SleepAssessment: SleepAssessmentModel;
  EatingHabits: EatingHabitsModel;
  DrinkingHabits: DrinkingHabitsModel;
  SmokingHabits: SmokingHabitsModel;
  HereditaryQuestions: HereditaryQuestionsModel;
  FitnessProfile: FitnessProfileModel;
  MentalWellness: MentalWellnessModel;
  EmployeeWellness: EmployeeWellnessModel;
}

export interface UserInfoModel {
  Name: string;
  Relation: string;
  Gender: string;
  Age: string;
}

export interface BasicProfileModel {
  Height: string;
  Weight: string;
  Bmi: string;
  HealthOpinion: string;
}

export interface PastHistoryModel {
  ChronicIllness: string;
  Surgery: string;
}

export interface SleepAssessmentModel {
  SleepHours: string;
  WakeUpMidSleep: string;
  WakeUpReason?: string;
  MorningFeeling: string;
}

export interface EatingHabitsModel {
  DietType: string;
  FriedJunkFood: string;
  MilkDairy: string;
  FreshFruitsVeg: string;
  WaterIntake: string;
  MeatSeafood?: string;
}

export interface DrinkingHabitsModel {
  ConsumingAlcohol: string;
  ConsumedInPast: string;
}

export interface SmokingHabitsModel {
  ConsumingTobacco: string;
  QuitHabit: string;
}

export interface HereditaryQuestionsModel {
  FamilyIllness: string;
  PhysicianCheckup: string;
  CurrentlyTakingMedication: string;
  StoppedMedication: string;
  OtherMedicineSources: string;
}

export interface FitnessProfileModel {
  Stretching: string;
  AerobicActivity: string;
  StrengthTraining: string;
  Walking: string;
  OtherActivity: string;
}

export interface MentalWellnessModel {
  LittleInterest: string;
  FeelingSad: string;
  SleepAppetiteProblems: string;
  LowEnergy: string;
  AnxiousRestless: string;
}

export interface EmployeeWellnessModel {
  WorkStress: string;
  StressReasons: string[];
}

export interface SaveDocumentResponse {
  success: boolean;
  message: string;
  documentName: string;
  documentPath: string;
  isDataExists: string;
}

export interface SavedDocument {
  DocumentName: string;
  DocumentPath: string;
  CreatedDate: string;
}
export interface HealthAssessmentRecordDetailsById {
  HRAGeneralDetailsId: number;
  MemberId: number;
  RelationType: number;
  EmployeeName: string;
  DateOfBirth: string;
  Relationship: string;
  CreatedOn: string;
  CreatedBy: string;
  IsActive: number;
  Status: string;
  AnsweredCount: number;
  LastAnsweredQuestion: number;
  Action: 'Resume' | 'View';
}
