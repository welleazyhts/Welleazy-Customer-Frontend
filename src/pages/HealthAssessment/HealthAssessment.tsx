import React, { useState, useEffect, useRef } from 'react';
import './HealthAssessment.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faDownload, faChevronLeft, faChevronRight, faPrint, faMale, faFemale } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { HealthAssessmentAPI } from '../../api/HealthAssessment';
import { HealthAssessmentRecordDetails, CRMGetEmployeeSelfAndDependentList, HRAOutputDetailsRequest, HealthAssessmentRecordDetailsById } from '../../types/HealthAssessment';
import { toast } from "react-toastify";
import { jsPDF } from 'jspdf';
//import 'jspdf-autotable';



const HealthAssessment: React.FC = () => {
  const [view, setView] = useState('initial');
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [hrageneralDetailsId, setHrageneralDetailsId] = useState<number>(0);
  const navigate = useNavigate();
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState(1);
  const [moodValue, setMoodValue] = useState(2);

  // Height State
  const [heightUnit, setHeightUnit] = useState<'feet' | 'cm'>('feet');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Weight State
  const [weightUnit, setWeightUnit] = useState<'kg' | 'pound'>('kg');
  const [weightValue, setWeightValue] = useState('');

  // BMI Calculation
  const [bmi, setBmi] = useState('');
  const [bmiStatus, setBmiStatus] = useState('');

  // Health Opinion
  const [healthOpinion, setHealthOpinion] = useState<'healthy' | 'unhealthy' | ''>('');
  const [showUnhealthyPopup, setShowUnhealthyPopup] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Assessment data states
  const [selectedIllnesses, setSelectedIllnesses] = useState<string[]>([]);
  const [hasChronicIllness, setHasChronicIllness] = useState<string>('no');
  const [hasSurgery, setHasSurgery] = useState<string>('no');
  const [sleepHours, setSleepHours] = useState('moreThan7');
  const [wakeUpMidSleep, setWakeUpMidSleep] = useState('no');
  const [morningFeeling, setMorningFeeling] = useState('no');
  const [wakeUpReason, setWakeUpReason] = useState('');
  const [isNonVeg, setIsNonVeg] = useState<boolean>(false);
  const [friedJunkFood, setFriedJunkFood] = useState<string>('');
  const [milkDairy, setMilkDairy] = useState<string>('');
  const [freshFruitsVeg, setFreshFruitsVeg] = useState<string>('');
  const [waterIntake, setWaterIntake] = useState<string>('');
  const [meatSeafood, setMeatSeafood] = useState<string>('');
  const [consumingAlcohol, setConsumingAlcohol] = useState<string>('');
  const [consumedInPast, setConsumedInPast] = useState<string>('');
  const [consumingTobacco, setConsumingTobacco] = useState<string>('');
  const [quitHabit, setQuitHabit] = useState<string>('');
  const [familyIllness, setFamilyIllness] = useState<string>('');
  const [physicianCheckup, setPhysicianCheckup] = useState<string>('');
  const [currentlyTakingMedication, setCurrentlyTakingMedication] = useState<string>('');
  const [stoppedMedication, setStoppedMedication] = useState<string>('');
  const [otherMedicineSources, setOtherMedicineSources] = useState<string>('');
  const [difficultyUrinating, setDifficultyUrinating] = useState<string>('');
  const [difficultyStooling, setDifficultyStooling] = useState<string>('');
  const [stretching, setStretching] = useState<string>('');
  const [aerobicActivity, setAerobicActivity] = useState<string>('');
  const [strengthTraining, setStrengthTraining] = useState<string>('');
  const [walking, setWalking] = useState<string>('');
  const [otherActivity, setOtherActivity] = useState<string>('');
  const [littleInterest, setLittleInterest] = useState<string>('');
  const [feelingSad, setFeelingSad] = useState<string>('');
  const [sleepAppetiteProblems, setSleepAppetiteProblems] = useState<string>('');
  const [lowEnergy, setLowEnergy] = useState<string>('');
  const [anxiousRestless, setAnxiousRestless] = useState<string>('');
  const [workStress, setWorkStress] = useState<string>('');
  const [stressReasons, setStressReasons] = useState<string[]>([]);
  const [savedData, setSavedData] = useState<any>(null);
  const [records, setRecords] = useState<HealthAssessmentRecordDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<CRMGetEmployeeSelfAndDependentList[]>([]);

  const hasAutoSetData = useRef(false);

  // Add state for current assessment ID
  const [currentAssessmentId, setCurrentAssessmentId] = useState<number | null>(null);

  // Carousel states
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [userCarouselIndex, setUserCarouselIndex] = useState(0);
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);

  const RECORDS_VISIBLE = 3;
  const USERS_VISIBLE = 2;
  const LOCATIONS_VISIBLE = 4;



  const toggleIllness = (illness: string) => {
    setSelectedIllnesses((prev) =>
      prev.includes(illness)
        ? prev.filter((i) => i !== illness)
        : [...prev, illness]
    );
  };

  // Auto-set gender and age when entering generalDetails view
  useEffect(() => {
    if (view !== 'generalDetails') {
      hasAutoSetData.current = false;
      return;
    }

    if (view === 'generalDetails' && selectedUserIndex !== null && employees.length > 0 && !hasAutoSetData.current) {
      const selectedEmployee = employees[selectedUserIndex];
      if (selectedEmployee) {
        setGender(selectedEmployee.Gender);
        if (selectedEmployee.Age && selectedEmployee.Age > 0) {
          setAge(selectedEmployee.Age);
        }
        hasAutoSetData.current = true;
      }
    }
  }, [view, selectedUserIndex, employees]);

  // BMI calculation effect
  useEffect(() => {
    let heightInMeters = 0;
    let weightInKg = 0;

    // Convert height to meters
    if (heightUnit === 'cm' && heightCm) {
      heightInMeters = parseFloat(heightCm) / 100;
    } else if (heightUnit === 'feet' && heightFeet) {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      const totalInches = feet * 12 + inches;
      heightInMeters = totalInches * 0.0254;
    }

    // Convert weight to kg
    if (weightUnit === 'kg' && weightValue) {
      weightInKg = parseFloat(weightValue);
    } else if (weightUnit === 'pound' && weightValue) {
      weightInKg = parseFloat(weightValue) * 0.453592;
    }

    // Calculate BMI if values are valid
    if (heightInMeters > 0 && weightInKg > 0) {
      const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
      const roundedBmi = calculatedBmi.toFixed(1);
      setBmi(roundedBmi);

      // Determine BMI status
      if (calculatedBmi < 18.5) {
        setBmiStatus('Underweight');
      } else if (calculatedBmi < 24.9) {
        setBmiStatus('Normal');
      } else if (calculatedBmi < 29.9) {
        setBmiStatus('Overweight');
      } else {
        setBmiStatus('Obese');
      }
    } else {
      setBmi('');
      setBmiStatus('');
    }
  }, [heightUnit, heightFeet, heightInches, heightCm, weightUnit, weightValue]);

  // Carousel handlers
  const handlePrev = () => {
    setCarouselIndex(prev => (prev === 0 ? Math.max(0, records.length - RECORDS_VISIBLE) : prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex(prev => (prev >= records.length - RECORDS_VISIBLE ? 0 : prev + 1));
  };

  const handleUserPrev = () => {
    setUserCarouselIndex(prev => (prev === 0 ? Math.max(0, employees.length - USERS_VISIBLE) : prev - 1));
  };

  const handleUserNext = () => {
    setUserCarouselIndex(prev => (prev >= employees.length - USERS_VISIBLE ? 0 : prev + 1));
  };

  const handleLocationPrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleLocationNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  // Auto-scroll for locations
  useEffect(() => {
    const interval = setInterval(() => {
      setLocationCarouselIndex(prev =>
        prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // API functions
  const handleGetAssessments = async (actionType: 'Resume' | 'View'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const result = await HealthAssessmentAPI.CRMLoadHealthAssessmentRecordDetails();

      if (Array.isArray(result)) {
        const filteredRecords = result.filter(
          record => record.Action === actionType
        );

        setRecords(filteredRecords);
      } else {
        setRecords([]);
      }

      setCarouselIndex(0);
      setView('pastAssessments');
    } catch (error) {
      console.error("Error in handleGetAssessments:", error);
      setError("Failed to load assessments");
      setRecords([]);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };


  const handleViewDocument = async (HRAGeneralDetailsId: number) => {
    try {
      setLoading(true);
      const docDetails = await HealthAssessmentAPI.CRMLoadHealthAssessmentRecordDetailsByIdDocument(HRAGeneralDetailsId);
      if (Array.isArray(docDetails) && docDetails.length > 0) {
        const doc = docDetails[0];
        let fileUrl = doc.report_url || doc.DocumentPath;

        if (!fileUrl) {
          toast.info("No document available for this assessment.");
          return;
        }

        // Normalize URL
        if (!fileUrl.startsWith('http')) {
          fileUrl = fileUrl
            .replace("C:\\inetpub\\Welleazy_Prod\\Welleazy\\", "")
            .replace(/\\/g, "/");
          fileUrl = `https://live.welleazy.com/${fileUrl}`;
        }

        try {
          // Attempt to download the file directly
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Health_Assessment_Report_${HRAGeneralDetailsId}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success("Download started successfully!");
        } catch (downloadError) {
          console.warn("Direct download failed, opening in new tab instead:", downloadError);
          window.open(fileUrl, "_blank");
        }
      } else {
        toast.info("No document available for this assessment.");
      }
    } catch (error) {
      console.error("Error fetching document details:", error);
      toast.error("Failed to process download. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewHealthEvaluation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await HealthAssessmentAPI.CRMGetEmployeeSelfAndDependentList();

      if (!result || result.length === 0) {
        toast.info("No employee or dependent records found.");
        return;
      }

      setEmployees(result);
      setView('newUser');
    } catch (error) {
      console.error("Error starting new health evaluation:", error);
      toast.error("Failed to start new health evaluation");
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Validation functions
  const validateBasicProfile = () => {
    // Height validation
    if (heightUnit === 'feet') {
      if (!heightFeet) {
        toast.error('Feet is required');
        return false;
      }
      if (heightInches && (parseFloat(heightInches) < 0 || parseFloat(heightInches) >= 12)) {
        toast.error('Inches must be between 0 and 11.9');
        return false;
      }
    } else {
      if (!heightCm) {
        toast.error('Centimeters is required');
        return false;
      } else if (parseFloat(heightCm) <= 0) {
        toast.error('Height must be greater than 0');
        return false;
      } else if (parseFloat(heightCm) > 250) {
        toast.error('Height cannot be more than 250 cm');
        return false;
      }
    }

    // Weight validation
    if (!weightValue) {
      toast.error('Weight is required');
      return false;
    } else if (parseFloat(weightValue) <= 0) {
      toast.error('Weight must be greater than 0');
      return false;
    } else if (weightUnit === 'kg' && parseFloat(weightValue) > 300) {
      toast.error('Weight cannot be more than 300 kg');
      return false;
    } else if (weightUnit === 'pound' && parseFloat(weightValue) > 660) {
      toast.error('Weight cannot be more than 660 pounds');
      return false;
    }

    // Health opinion validation
    if (!healthOpinion) {
      toast.error('Please select your health opinion');
      return false;
    }

    return true;
  };

  const validatePresentingIllness = () => {
    if (selectedIllnesses.length === 0) {
      toast.error('Please select at least one illness option');
      return false;
    }
    return true;
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleHealthOpinionSelect = (opinion: 'healthy' | 'unhealthy') => {
    setHealthOpinion(opinion);
    if (errors.healthOpinion) {
      setErrors(prev => ({ ...prev, healthOpinion: '' }));
    }
    if (opinion === 'unhealthy') {
      setShowUnhealthyPopup(true);
    }
  };

  // Save General Details (Mood Assessment)
  const handleSaveGeneralDetails = async () => {
    try {
      if (selectedUserIndex === null) {
        toast.error("Please select a user first");
        return;
      }
      const selectedEmployee = employees[selectedUserIndex];
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const moodRemarks = [
        "Very Sad",
        "Sad",
        "Neutral",
        "Happy",
        "Very Happy"
      ];
      let memberId: number;
      if (selectedEmployee.Relation === "Self") {
        memberId = selectedEmployee.EmployeeRefId;
      } else {
        memberId = selectedEmployee.EmployeeRefId;
      }

      const payload = {
        HRAGeneralDetailsId: currentAssessmentId || 0, // Use currentAssessmentId if resuming
        MemberId: memberId,
        RelationType: selectedEmployee.RelationType,
        Remarks: moodRemarks[moodValue] || "Neutral",
        IsActive: 0,
        CreatedBy: parseInt(createdBy),
        EmployeeDependentDetailsId: selectedEmployee.EmployeeDependentDetailsId
      };

      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerGeneralDetails(payload);
      if (response && response.HRAGeneralDetailsId) {
        setHrageneralDetailsId(response.HRAGeneralDetailsId);

        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: response.HRAGeneralDetailsId,
          QuestionAnsweredId: 1,
        });
        setView('basicProfile');
      } else {
        //toast.error("Failed to save assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Error saving assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBasicProfileNext = async () => {
    setIsSubmitted(true);

    if (!validateBasicProfile()) {
      return;
    }

    try {
      const selectedEmployee = selectedUserIndex !== null ? employees[selectedUserIndex] : null;
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      let heightInCM = 0;
      let heightInFeet = 0;
      let heightInInches = 0;
      let weightInKg = 0;
      let weightInPounds = 0;

      if (heightUnit === 'cm') {
        heightInCM = parseFloat(heightCm);
        heightInFeet = 0;
        heightInInches = 0;
      } else {
        heightInFeet = parseFloat(heightFeet) || 0;
        heightInInches = parseFloat(heightInches) || 0;
        const totalInches = (heightInFeet * 12) + heightInInches;
        heightInCM = totalInches * 2.54;
      }
      if (weightUnit === 'kg') {
        weightInKg = parseFloat(weightValue);
        weightInPounds = 0;
      } else {
        weightInPounds = parseFloat(weightValue);
        weightInKg = weightInPounds * 0.453592;
      }

      const heightIn = heightUnit === 'cm' ? 0 : 1;
      const weightIn = weightUnit === 'kg' ? 0 : 1;

      const payload = {
        HRACustomerBasicProfileDetailsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        HeightIn: heightIn,
        HeightInCM: Math.round(heightInCM),
        HeightInFeet: Math.round(heightInFeet),
        HeightInInches: Math.round(heightInInches),
        WeightIn: weightIn,
        WeightInKg: Math.round(weightInKg * 10) / 10,
        WeightInPounds: Math.round(weightInPounds),
        Opinion: healthOpinion === 'healthy' ? 'Healthy' : 'Unhealthy',
        BMI: bmiStatus,
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };
      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerBasicProfileDetails(payload);

      if (response) {
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 2,
        });
        //toast.success("Basic profile saved successfully!");
        setView('presentingIllness');
      } else {
        toast.error("Failed to save basic profile");
      }
    } catch (error) {
      console.error("Error saving basic profile:", error);
      toast.error("Error saving basic profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresentingIllnessNext = async () => {
    if (!validatePresentingIllness()) {
      return;
    }

    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const illnessString = selectedIllnesses.join(', ');
      const payload = {
        HRACustomerPrestingIllnessDetailsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        Illness: illnessString,
        OtherIllness: "",
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };
      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerPresentingIllnessDetails(payload);
      if (response) {
        //toast.success("Presenting illness details saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 3,
        });
        setView('pastHistory');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save presenting illness details");
      }
    } catch (error) {
      console.error("Error saving presenting illness details:", error);
      toast.error("Error saving presenting illness details. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleSavePastHistory = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const chronicIllnessValue = hasChronicIllness === 'yes' ? 'Yes' : 'No';
      const surgeryValue = hasSurgery === 'yes' ? 'Yes' : 'No';

      const payload = {
        HRACustomerPastHistoryDetailsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        ChronicIllness: chronicIllnessValue,
        OtherChronicIllness: "",
        Surgery: surgeryValue,
        OtherSurgery: "",
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };
      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerPastHistoryDetails(payload);
      if (response) {
        //toast.success("Past history details saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 4,
        });
        setView('sleepAssessment');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save past history details");
      }
    } catch (error) {
      console.error("Error saving past history details:", error);
      toast.error("Error saving past history details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSleepAssessment = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const sleepInNightValue = sleepHours === 'lessThan7' ? 'Less than 7 hours' : 'More than 7 hours';
      const wakeUpInMidstValue = wakeUpMidSleep === 'yes' ? 'Yes' : 'No';
      const feelingOfWakeUpValue = morningFeeling === 'yes' ? 'Yes' : 'No';

      const payload = {
        HRACustomerSleepAssessmentId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        SleepInNight: sleepInNightValue,
        WakeUpInMidst: wakeUpInMidstValue,
        WakeUpReason: wakeUpReason || "",
        FeelingOfWakeUpInMorning: feelingOfWakeUpValue,
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending sleep assessment payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerSleepAssessment(payload);
      if (response) {
        //toast.success("Sleep assessment saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 5,
        });
        setView('eatingHabits');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save sleep assessment");
      }
    } catch (error) {
      console.error("Error saving sleep assessment:", error);
      toast.error("Error saving sleep assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEatingHabits = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const isVegeterianValue = isNonVeg ? 0 : 1;
      const payload = {
        HRACustomerFoodHabitsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        FriedFoodEatingOutSide: friedJunkFood || "Never",
        FreshFruitsAndGreenVegetables: freshFruitsVeg || "Never",
        IsVegeterian: isVegeterianValue,
        MeatAndHighProteinDiet: isNonVeg ? (meatSeafood || "Never") : "Never",
        MilkAndDiaryProducts: milkDairy || "Never",
        TakeWaterPerDay: waterIntake === 'lessThan9' ? "Less than 9 glasses / 2.2 Lts" : "More than 9 glasses / 2.2 Lts",
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending food habits payload:", payload);

      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerFoodHabits(payload);
      if (response) {
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 6,
        });
        setView('drinkingHabits');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save eating habits");
      }
    } catch (error) {
      console.error("Error saving eating habits:", error);
      toast.error("Error saving eating habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleSaveDrinkingHabits = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      // Map the state values to API expected format
      const consumingAlcoholValue = consumingAlcohol === 'yes' ? 'Yes' : 'No';
      const consumedInPastValue = consumedInPast === 'yes' ? 'Yes' : 'No';
      const periodOfHabit = consumingAlcohol === 'yes' ? "occasionally" : "";
      const intakeQuantity = consumingAlcohol === 'yes' ? "socially" : "";
      const quitAlcohol = consumingAlcohol === 'no' && consumedInPast === 'yes' ? "Yes" : "No";
      const whenQuitInYear = consumedInPast === 'yes' ? "lt_1y" : "";
      const alcoholQuantity = consumedInPast === 'yes' ? "socially" : "";

      const payload = {
        HRACustomerDrinkingHabitsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        ConsumingAlcohol: consumingAlcoholValue,
        PeriodOfHabit: periodOfHabit,
        IntakeQuantity: intakeQuantity,
        QuitAlcohol: quitAlcohol,
        ConsumedInPast: consumedInPastValue,
        WhenQuitInYear: whenQuitInYear,
        AlcoholQuantity: alcoholQuantity,
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending drinking habits payload:", payload);
      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerDrinkingHabits(payload);
      console.log("Drinking habits API Response:", response);
      if (response) {
        //toast.success("Drinking habits saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 7,
        });
        setView('smokingHabits');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save drinking habits");
      }
    } catch (error) {
      console.error("Error saving drinking habits:", error);
      toast.error("Error saving drinking habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveSmokingHabits = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      // Map the state values to API expected format
      const consumingTobaccoValue = consumingTobacco === 'yes' ? 'Yes' : 'No';
      const consumedInPastValue = quitHabit === 'yes' ? 'Yes' : 'No';
      const quitTobaccoValue = consumingTobacco === 'no' && quitHabit === 'yes' ? 'Yes' : 'No';

      const payload = {
        HRACustomerSmokingHabitsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        ConsumingTobacco: consumingTobaccoValue,
        TobaccoType: consumingTobacco === 'yes' ? "cigarette" : "",
        PeriodOfHabit: consumingTobacco === 'yes' ? "occasionally" : "",
        QuitTobacco: quitTobaccoValue,
        ConsumedInPast: consumedInPastValue,
        WhenQuitInYear: quitHabit === 'yes' ? "lt_1y" : "",
        NoOfBedi: consumingTobacco === 'yes' ? "0" : "",
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending smoking habits payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerSmokingHabits(payload);
      if (response) {
        //toast.success("Smoking habits saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 8,
        });
        setView('hereditaryQuestions');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save smoking habits");
      }
    } catch (error) {
      console.error("Error saving smoking habits:", error);
      toast.error("Error saving smoking habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHereditaryQuestions = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      // Map the state values to API expected format
      const sufferingFromDiseaseValue = familyIllness === 'yes' ? 'Yes' : 'No';
      const takingMedicationValue = currentlyTakingMedication === 'yes' ? 'Yes' : 'No';
      const takingMedicationWDoctorValue = stoppedMedication === 'yes' ? 'Yes' : 'No';
      const takingOtherSourceValue = otherMedicineSources === 'yes' ? 'Yes' : 'No';

      // Prepare diseases details array
      const diseasesDetails = familyIllness === 'yes' ? [
        {
          MemberName: "Family Member", // You can add input for member name
          DiseasesName: "Chronic Disease" // You can add input for disease name
        }
      ] : [];

      const payload = {
        HRACustomerHeriditaryQuestionsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        SuffreingFromDisease: sufferingFromDiseaseValue,
        RoutineCheckUp: physicianCheckup || "Never conducted",
        TakingMedication: takingMedicationValue,
        TakingMedicationWDoctor: takingMedicationWDoctorValue,
        TakingOtherSource: takingOtherSourceValue,
        HRACustomerDiseasesDetails: diseasesDetails,
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending hereditary questions payload:", payload);
      setLoading(true);
      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerHeriditaryQuestions(payload);
      if (response) {
        //toast.success("Hereditary questions saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 9,
        });
        setView('bowelBladderHabits');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save hereditary questions");
      }
    } catch (error) {
      console.error("Error saving hereditary questions:", error);
      toast.error("Error saving hereditary questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveBowelBladderHabits = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      // Map the state values to API expected format
      const difficultyPassingUrineValue = difficultyUrinating === 'yes' ? 'Yes' : 'No';
      const difficultyPassingStoolsValue = difficultyStooling === 'yes' ? 'Yes' : 'No';

      const payload = {
        HRACustomerBowelBladderHabitsDetailsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        DifficultyPassingUrine: difficultyPassingUrineValue,
        Difficulty: difficultyUrinating === 'yes' ? "Difficulty in flow of Urine" : "No",
        DifficultyPassingStools: difficultyPassingStoolsValue,
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending bowel bladder habits payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerBowelBladderHabits(payload);

      if (response) {
        //toast.success("Bowel & bladder habits saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 10,
        });
        setView('fitnessProfile'); // Move to next view
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save bowel & bladder habits");
      }
    } catch (error) {
      console.error("Error saving bowel & bladder habits:", error);
      toast.error("Error saving bowel & bladder habits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFitnessDetails = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      const payload = {
        HRACustomerFitnessDetailsId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        Stretching: stretching || "Not Really",
        Aerobic: aerobicActivity || "Not Really",
        StrengthAndConditioning: strengthTraining || "Not Really",
        Walking: walking || "Not Really",
        PhysicalActivity: otherActivity || "Not Really",
        OtherPhysicalActivity: otherActivity === "Other" ? "" : "", // Add state for other activity description if needed
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending fitness details payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerFitnessDetails(payload);

      console.log("Fitness details API Response:", response);
      if (response) {
        //toast.success("Fitness details saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 11,
        });
        setView('mentalWellness');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save fitness details");
      }
    } catch (error) {
      console.error("Error saving fitness details:", error);
      toast.error("Error saving fitness details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveMentalWellness = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      const payload = {
        HRACustomerMentalWellnessId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        InterestOrPleaseure: littleInterest === 'yes' ? 'Yes' : 'No',
        Feeling: feelingSad === 'yes' ? 'Yes' : 'No',
        ProblemInSleep: sleepAppetiteProblems === 'yes' ? 'Yes' : 'No',
        EnergyLevel: lowEnergy === 'yes' ? 'Yes' : 'No',
        WorriesAndDoubts: anxiousRestless === 'yes' ? 'Yes' : 'No',
        IsActive: 0,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending mental wellness payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerMentalWellness(payload);


      if (response) {
        //toast.success("Mental wellness details saved successfully!");
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 12,
        });
        setView('employeeWellness');
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save mental wellness details");
      }
    } catch (error) {
      console.error("Error saving mental wellness details:", error);
      toast.error("Error saving mental wellness details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployeeWellness = async () => {
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";

      const payload = {
        HRACustomerWellnessId: 0,
        HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId, // Use currentAssessmentId if resuming
        FeelStress: workStress === 'yes' ? 'Yes' : 'No',
        Remarks: stressReasons.join(', ') || "",
        Stressing: workStress === 'yes' ? stressReasons.join(', ') : "",
        IsActive: 1,
        CreatedBy: parseInt(createdBy)
      };

      console.log("Sending employee wellness payload:", payload);

      setLoading(true);

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRACustomerWellness(payload);

      console.log("Employee wellness API Response:", response);

      if (response) {
        // toast.success("Employee wellness details saved successfully!");
        // Move to final submission and redirect to document page
        const CRMSaveHRAQuestionAnswerStatusDetails = await HealthAssessmentAPI.CRMSaveHRAQuestionAnswerStatusDetails({
          HRAGeneralDetailsId: currentAssessmentId || hrageneralDetailsId,
          QuestionAnsweredId: 13,
        });
        handleFinalSubmitAndRedirect();
      } else {
        console.error("Unexpected response:", response);
        toast.error("Failed to save employee wellness details");
      }
    } catch (error) {
      console.error("Error saving employee wellness details:", error);
      toast.error("Error saving employee wellness details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleFinalSubmitAndRedirect = () => {
    const fullAssessmentData = collectAllData();
    localStorage.setItem('healthAssessmentData', JSON.stringify(fullAssessmentData));
    localStorage.setItem('HRAGeneralDetailsId', (currentAssessmentId || hrageneralDetailsId).toString());
    navigate('/health-assessment/document', {
      state: {
        hrageneralDetailsId: currentAssessmentId || hrageneralDetailsId
      }
    });

    toast.success("Health assessment completed successfully! Redirecting to report...");
  };


  // Data collection for summary
  const collectAllData = () => {
    const selectedEmployee = selectedUserIndex !== null ? employees[selectedUserIndex] : null;

    return {
      userInfo: {
        name: selectedEmployee ? selectedEmployee.EmployeeName : 'No user selected',
        relation: selectedEmployee ? selectedEmployee.Relation : '',
        gender: gender === 1 ? 'Male' : 'Female',
        age: age
      },
      mood: moodValue,
      basicProfile: {
        height: heightUnit === 'feet' ? `${heightFeet} ft ${heightInches} in` : `${heightCm} cm`,
        weight: `${weightValue} ${weightUnit}`,
        bmi: `${bmi} (${bmiStatus})`,
        healthOpinion: healthOpinion
      },
      presentingIllness: selectedIllnesses,
      pastHistory: {
        chronicIllness: hasChronicIllness,
        surgery: hasSurgery
      },
      sleepAssessment: {
        sleepHours: sleepHours,
        wakeUpMidSleep: wakeUpMidSleep,
        wakeUpReason: wakeUpReason,
        morningFeeling: morningFeeling
      },
      eatingHabits: {
        dietType: isNonVeg ? 'Non-veg' : 'Veg',
        friedJunkFood: friedJunkFood,
        milkDairy: milkDairy,
        freshFruitsVeg: freshFruitsVeg,
        waterIntake: waterIntake,
        meatSeafood: meatSeafood
      },
      drinkingHabits: {
        consumingAlcohol: consumingAlcohol,
        consumedInPast: consumedInPast
      },
      smokingHabits: {
        consumingTobacco: consumingTobacco,
        quitHabit: quitHabit
      },
      hereditaryQuestions: {
        familyIllness: familyIllness,
        physicianCheckup: physicianCheckup,
        currentlyTakingMedication: currentlyTakingMedication,
        stoppedMedication: stoppedMedication,
        otherMedicineSources: otherMedicineSources
      },
      bowelBladderHabits: {
        difficultyUrinating: difficultyUrinating,
        difficultyStooling: difficultyStooling
      },
      fitnessProfile: {
        stretching: stretching,
        aerobicActivity: aerobicActivity,
        strengthTraining: strengthTraining,
        walking: walking,
        otherActivity: otherActivity
      },
      mentalWellness: {
        littleInterest: littleInterest,
        feelingSad: feelingSad,
        sleepAppetiteProblems: sleepAppetiteProblems,
        lowEnergy: lowEnergy,
        anxiousRestless: anxiousRestless
      },
      employeeWellness: {
        workStress: workStress,
        stressReasons: stressReasons
      },
      submissionDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };


  const handleFinalSubmit = () => {
    const data = collectAllData();
    setSavedData(data);
    setView('submitted');
  };

  // Location data
  const locationData = [
    { name: 'New Delhi', img: '/DELHI-8.png' },
    { name: 'Chandigarh', img: '/Chandigarh.png' },
    { name: 'Srinagar', img: '/srinagr.png' },
    { name: 'Cochin', img: '/kochi.png' },
    { name: 'Bangalore', img: '/BANGALORE-8.png' },
    { name: 'Mumbai', img: '/mumbai.png' },
    { name: 'Kolkata', img: '/KOLKATA-8.png' },
    { name: 'Ahmedabad', img: '/AHEMDABAD-8.png' },
    { name: 'Jaipur', img: '/JAIPUR-8.png' },
    { name: 'Lucknow', img: '/LUCKNOW-8.png' },
  ];

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  // ============ RESUME ASSESSMENT FUNCTIONALITY ============

  const questionToViewMap: Record<number, string> = {
    1: 'generalDetails',
    2: 'basicProfile',
    3: 'presentingIllness',
    4: 'pastHistory',
    5: 'sleepAssessment',
    6: 'eatingHabits',
    7: 'drinkingHabits',
    8: 'smokingHabits',
    9: 'hereditaryQuestions',
    10: 'bowelBladderHabits',
    11: 'fitnessProfile',
    12: 'mentalWellness',
    13: 'employeeWellness'
  };



  const handleEditAssessment = async (
    record: HealthAssessmentRecordDetailsById
  ) => {
    try {
      setLoading(true);
      setCurrentAssessmentId(record.HRAGeneralDetailsId);

      // 1️⃣ Load assessment progress
      const detailedRecords =
        await HealthAssessmentAPI.CRMLoadHealthAssessmentRecordDetailsById(
          record.HRAGeneralDetailsId
        );

      if (!detailedRecords || detailedRecords.length === 0) {
        toast.error('No assessment data found');
        return;
      }

      const assessmentData = detailedRecords[0];

      const lastAnsweredQuestion = Number(
        assessmentData.LastAnsweredQuestion || 0
      );

      // 🔥 CORE LOGIC
      // If all answered → open first page
      // Else → open next unanswered
      const nextQuestion =
        lastAnsweredQuestion >= 13 ? 1 : lastAnsweredQuestion + 1;

      console.log(
        'Resuming assessment → last:',
        lastAnsweredQuestion,
        'next:',
        nextQuestion
      );

      // 2️⃣ Load employee list
      const employeeResult =
        await HealthAssessmentAPI.CRMGetEmployeeSelfAndDependentList();

      if (!employeeResult || employeeResult.length === 0) {
        toast.error('Failed to load employee data');
        return;
      }

      setEmployees(employeeResult);

      // 3️⃣ Set selected user
      const memberIdStr = assessmentData.MemberId.toString();

      const employeeIndex = employeeResult.findIndex(emp =>
        emp.EmployeeId?.toString() === memberIdStr ||
        emp.EmployeeRefId?.toString() === memberIdStr ||
        emp.EmployeeDependentDetailsId?.toString() === memberIdStr
      );

      if (employeeIndex !== -1) {
        setSelectedUserIndex(employeeIndex);

        const selectedEmployee = employeeResult[employeeIndex];

        if (selectedEmployee.Gender) {
          setGender(selectedEmployee.Gender);
        }

        setAge(Number(selectedEmployee.Age) || 0);
      }

      // 4️⃣ Load saved form data
      await loadSavedAssessmentData(record.HRAGeneralDetailsId);

      // 5️⃣ Redirect
      const nextView =
        questionToViewMap[nextQuestion] || 'generalDetails';

      console.log('Redirecting to view:', nextView);
      setView(nextView);

    } catch (error) {
      console.error('Error loading assessment details:', error);
      toast.error('Failed to load assessment details');
      setView('generalDetails');
    } finally {
      setLoading(false);
    }
  };



  const loadSavedAssessmentData = async (hRAGeneralDetailsId: number) => {
    try {
      setErrors({});
      const [
        generalDetails,
        basicProfile,
        presentingIllness,
        pastHistory,
        sleepAssessment,
        foodHabits,
        drinkingHabits,
        smokingHabits,
        hereditaryQuestions,
        bowelBladderHabits,
        fitnessDetails,
        mentalWellness,
        wellness
      ] = await Promise.all([
        HealthAssessmentAPI.CRMFetchHRACustomerGeneralDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerBasicProfileDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerPrestingIllnessDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerPastHistoryDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerSleepAssessmentById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerFoodHabitsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerDrinkingHabitsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerSmokingHabitsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerHeriditaryQuestionsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerBowelBladderHabitsDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerFitnessDetailsById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerMentalWellnessById(hRAGeneralDetailsId),
        HealthAssessmentAPI.CRMFetchHRACustomerWellnessById(hRAGeneralDetailsId)
      ]);

      console.log('Loaded saved data:', {
        generalDetails, basicProfile, presentingIllness, pastHistory,
        sleepAssessment, foodHabits, drinkingHabits, smokingHabits,
        hereditaryQuestions, bowelBladderHabits, fitnessDetails,
        mentalWellness, wellness
      });
      if (generalDetails && Array.isArray(generalDetails) && generalDetails.length > 0) {
        const gd = generalDetails[0];
        const moodMap: { [key: string]: number } = {
          'Very Sad': 0,
          'Sad': 1,
          'Neutral': 2,
          'Happy': 3,
          'Very Happy': 4
        };
        const moodValue = moodMap[gd.Remarks] ?? 2;
        setMoodValue(moodValue);
      }
      if (basicProfile && Array.isArray(basicProfile) && basicProfile.length > 0) {
        const bp = basicProfile[0];
        if (bp.HeightIn === 0) { // cm
          setHeightUnit('cm');
          setHeightCm(bp.HeightInCM?.toString() || '');
        } else { // feet
          setHeightUnit('feet');
          setHeightFeet(bp.HeightInFeet?.toString() || '');
          setHeightInches(bp.HeightInInches?.toString() || '');
        }

        // Weight
        if (bp.WeightIn === 0) { // kg
          setWeightUnit('kg');
          setWeightValue(bp.WeightInKg?.toString() || '');
        } else { // pounds
          setWeightUnit('pound');
          setWeightValue(bp.WeightInPounds?.toString() || '');
        }

        // Health Opinion
        if (bp.Opinion) {
          const opinion = bp.Opinion.toLowerCase();
          setHealthOpinion((opinion === 'healthy' || opinion === 'unhealthy')
            ? opinion as 'healthy' | 'unhealthy'
            : '');
        }

        // BMI will be calculated automatically by useEffect
      }

      // Set Presenting Illness
      if (presentingIllness && Array.isArray(presentingIllness) && presentingIllness.length > 0) {
        const pi = presentingIllness[0];
        if (pi.Illness) {
          const illnesses = pi.Illness.split(',').map((i: string) => i.trim().toLowerCase());
          // Map API illness names to your UI illness names
          const illnessMap: { [key: string]: string } = {
            'cough': 'cough',
            'cold': 'cold',
            'fever': 'fever',
            'diabetes': 'diabetes',
            'hypertension': 'hypertension',
            'asthma': 'asthma',
            'flu': 'flu'
          };

          const mappedIllnesses = illnesses
            .map((illness: string) => illnessMap[illness] || illness)
            .filter(Boolean);

          setSelectedIllnesses(mappedIllnesses);
        }
      }

      // Set Past History
      if (pastHistory && Array.isArray(pastHistory) && pastHistory.length > 0) {
        const ph = pastHistory[0];
        setHasChronicIllness(ph.ChronicIllness === 'Yes' ? 'yes' : 'no');
        setHasSurgery(ph.Surgery === 'Yes' ? 'yes' : 'no');
      }

      // Set Sleep Assessment
      if (sleepAssessment && Array.isArray(sleepAssessment) && sleepAssessment.length > 0) {
        const sa = sleepAssessment[0];
        setSleepHours(sa.SleepInNight === 'Less than 7 hours' ? 'lessThan7' : 'moreThan7');
        setWakeUpMidSleep(sa.WakeUpInMidst === 'Yes' ? 'yes' : 'no');
        setMorningFeeling(sa.FeelingOfWakeUpInMorning === 'Yes' ? 'yes' : 'no');

        // Set wake up reason
        if (sa.WakeUpReason) {
          const reasonMap: { [key: string]: string } = {
            'Excessive Urination': 'excessiveUrination',
            'Breathing Difficulty': 'breathingDifficulty',
            'Stress': 'stress',
            'Body Over Heat': 'bodyOverHeat',
            'Indigestion': 'indigestion',
            'Anxiety/Depression': 'anxietyDepression'
          };
          setWakeUpReason(reasonMap[sa.WakeUpReason] || sa.WakeUpReason);
        }
      }

      // Set Eating Habits
      if (foodHabits && Array.isArray(foodHabits) && foodHabits.length > 0) {
        const fh = foodHabits[0];
        setIsNonVeg(fh.IsVegeterian === 0);

        // Map frequency values
        const frequencyMap: { [key: string]: string } = {
          'Never': 'neverOrAlmost',
          'Never or almost never': 'neverOrAlmost',
          'Occasionally': 'occasionally',
          'Often': 'often',
          'Very Often': 'veryOften',
          'Always': 'alwaysOrAlmost',
          'Always or Almost Always': 'alwaysOrAlmost'
        };

        setFriedJunkFood(frequencyMap[fh.FriedFoodEatingOutSide] || '');
        setMilkDairy(frequencyMap[fh.MilkAndDiaryProducts] || '');
        setFreshFruitsVeg(frequencyMap[fh.FreshFruitsAndGreenVegetables] || '');
        setWaterIntake(fh.TakeWaterPerDay === 'Less than 9 glasses / 2.2 Lts' ? 'lessThan9' : 'moreThan9');

        if (fh.IsVegeterian === 0) {
          setMeatSeafood(frequencyMap[fh.MeatAndHighProteinDiet] || '');
        }
      }

      // Set Drinking Habits
      if (drinkingHabits && Array.isArray(drinkingHabits) && drinkingHabits.length > 0) {
        const dh = drinkingHabits[0];
        setConsumingAlcohol(dh.ConsumingAlcohol === 'Yes' ? 'yes' : 'no');
        setConsumedInPast(dh.ConsumedInPast === 'Yes' ? 'yes' : 'no');
      }

      // Set Smoking Habits
      if (smokingHabits && Array.isArray(smokingHabits) && smokingHabits.length > 0) {
        const sh = smokingHabits[0];
        setConsumingTobacco(sh.ConsumingTobacco === 'Yes' ? 'yes' : 'no');
        // Determine if quit habit - check if consuming is No but consumed in past is Yes
        if (sh.ConsumingTobacco === 'No' && sh.ConsumedInPast === 'Yes') {
          setQuitHabit('yes');
        } else {
          setQuitHabit(sh.QuitTobacco === 'Yes' ? 'yes' : 'no');
        }
      }

      // Set Hereditary Questions
      if (hereditaryQuestions && Array.isArray(hereditaryQuestions) && hereditaryQuestions.length > 0) {
        const hq = hereditaryQuestions[0];
        setFamilyIllness(hq.SuffreingFromDisease === 'Yes' ? 'yes' : 'no');

        // Map physician checkup frequency
        const checkupMap: { [key: string]: string } = {
          'Every six months': 'everySixMonths',
          'Yearly once': 'yearlyOnce',
          'Have conducted it few times in my life': 'hadItFewTimes',
          'Never conducted': 'hadItFewTimes' // fallback
        };
        setPhysicianCheckup(checkupMap[hq.RoutineCheckUp] || '');

        setCurrentlyTakingMedication(hq.TakingMedication === 'Yes' ? 'yes' : 'no');
        setStoppedMedication(hq.TakingMedicationWDoctor === 'Yes' ? 'yes' : 'no');
        setOtherMedicineSources(hq.TakingOtherSource === 'Yes' ? 'yes' : 'no');
      }

      // Set Bowel Bladder Habits
      if (bowelBladderHabits && Array.isArray(bowelBladderHabits) && bowelBladderHabits.length > 0) {
        const bbh = bowelBladderHabits[0];
        setDifficultyUrinating(bbh.DifficultyPassingUrine === 'Yes' ? 'yes' : 'no');
        setDifficultyStooling(bbh.DifficultyPassingStools === 'Yes' ? 'yes' : 'no');
      }

      // Set Fitness Profile
      if (fitnessDetails && Array.isArray(fitnessDetails) && fitnessDetails.length > 0) {
        const fd = fitnessDetails[0];

        // Map duration values
        const durationMap: { [key: string]: string } = {
          'Less than 30 mins': 'lessThan30',
          '30 mins - 1 hr': '30to60',
          'More than 1 hr': 'moreThan60',
          'Not Really': 'notReally'
        };

        setStretching(durationMap[fd.Stretching] || '');
        setAerobicActivity(durationMap[fd.Aerobic] || '');
        setStrengthTraining(durationMap[fd.StrengthAndConditioning] || '');
        setWalking(durationMap[fd.Walking] || '');

        // Handle other activity
        if (fd.PhysicalActivity && fd.PhysicalActivity !== 'Not Really') {
          setOtherActivity(fd.PhysicalActivity.toLowerCase());
        } else {
          setOtherActivity(durationMap[fd.PhysicalActivity] || '');
        }
      }

      // Set Mental Wellness
      if (mentalWellness && Array.isArray(mentalWellness) && mentalWellness.length > 0) {
        const mw = mentalWellness[0];
        setLittleInterest(mw.InterestOrPleaseure === 'Yes' ? 'yes' : 'no');
        setFeelingSad(mw.Feeling === 'Yes' ? 'yes' : 'no');
        setSleepAppetiteProblems(mw.ProblemInSleep === 'Yes' ? 'yes' : 'no');
        setLowEnergy(mw.EnergyLevel === 'Yes' ? 'yes' : 'no');
        setAnxiousRestless(mw.WorriesAndDoubts === 'Yes' ? 'yes' : 'no');
      }

      // Set Employee Wellness
      if (wellness && Array.isArray(wellness) && wellness.length > 0) {
        const w = wellness[0];
        setWorkStress(w.FeelStress === 'Yes' ? 'yes' : 'no');

        if (w.Stressing) {
          const stressReasonsArray = w.Stressing.split(',').map((s: string) => s.trim());
          setStressReasons(stressReasonsArray);
        }
      }

      console.log('Form state populated with saved data');

    } catch (error) {
      console.error('Error loading saved assessment data:', error);
      toast.warning('Some saved data could not be loaded. Please check your inputs.');
    }
  };


  // Reset all form states
  const resetAllStates = () => {
    setAge(0);
    setGender(1);
    setMoodValue(2);
    setHeightUnit('feet');
    setHeightFeet('');
    setHeightInches('');
    setHeightCm('');
    setWeightUnit('kg');
    setWeightValue('');
    setBmi('');
    setBmiStatus('');
    setHealthOpinion('');
    setSelectedIllnesses([]);
    setHasChronicIllness('no');
    setHasSurgery('no');
    setSleepHours('moreThan7');
    setWakeUpMidSleep('no');
    setMorningFeeling('no');
    setWakeUpReason('');
    setIsNonVeg(false);
    setFriedJunkFood('');
    setMilkDairy('');
    setFreshFruitsVeg('');
    setWaterIntake('');
    setMeatSeafood('');
    setConsumingAlcohol('');
    setConsumedInPast('');
    setConsumingTobacco('');
    setQuitHabit('');
    setFamilyIllness('');
    setPhysicianCheckup('');
    setCurrentlyTakingMedication('');
    setStoppedMedication('');
    setOtherMedicineSources('');
    setDifficultyUrinating('');
    setDifficultyStooling('');
    setStretching('');
    setAerobicActivity('');
    setStrengthTraining('');
    setWalking('');
    setOtherActivity('');
    setLittleInterest('');
    setFeelingSad('');
    setSleepAppetiteProblems('');
    setLowEnergy('');
    setAnxiousRestless('');
    setWorkStress('');
    setStressReasons([]);
    setErrors({});
    setIsSubmitted(false);
  };

  // ============ END RESUME ASSESSMENT FUNCTIONALITY ============



  // Past Assessments View
  if (view === 'pastAssessments') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="healthassesment bng.png" alt="Health Assessment Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Health Assessment Records</h2>
              <p>Add your Health assessment Records</p>
            </div>

            {loading ? (
              <div className="loading-message">Loading past assessments...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : records.length === 0 ? (
              <p className="no-records">No active past assessments found.</p>
            ) : (
              <div className="assessment-carousel-wrapper">
                {records.length > RECORDS_VISIBLE && (
                  <button className="carousel-arrow prev" onClick={handlePrev}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}
                <div className="assessment-carousel">
                  {records.slice(carouselIndex, carouselIndex + RECORDS_VISIBLE).map((record, index) => (
                    <div className="assessment-card" key={record.HRAGeneralDetailsId || index}>
                      <div className="assessment-card-header">
                        <div>
                          <span className="record-name">{record.EmployeeName || 'N/A'}</span>
                          <span className="record-relation">{record.Relationship || 'N/A'}</span>
                        </div>
                        <button
                          className="edit-record-btn"
                          onClick={() => handleEditAssessment(record)}
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>

                      </div>
                      <p><strong className="created-by-label">Created On:</strong> {formatDate(record.CreatedOn || '')}</p>
                      <p><strong className="created-by-label">Created By:</strong> {record.CreatedBy || 'N/A'}</p>
                      <p><strong className="created-by-label">Status:</strong> {record.IsActiveValue || 'Unknown'}</p>
                      <button className="download-btn" onClick={() => handleViewDocument(record.HRAGeneralDetailsId)}>
                        <FontAwesomeIcon icon={faDownload} /> Download
                      </button>
                    </div>
                  ))}
                </div>
                {records.length > RECORDS_VISIBLE && (
                  <button className="carousel-arrow next" onClick={handleNext}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}
              </div>
            )}

            <div className="panel-actions">
              <button className="action-btn new-eval-records" onClick={handleNewHealthEvaluation}  >New Health Evaluation</button>
            </div>
          </div>
        </div>
        {/* <div className="home-btn-container">
          <button className="action-btn home-btn" onClick={() => navigate('/')}>Home</button>
        </div> */}
      </div>
    );
  }

  // New User View
  if (view === 'newUser') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="select user.png" alt="Select User Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Select User</h2>
              <p>Choose who you are doing this Heart Health Assessment for</p>
            </div>

            {loading ? (
              <div className="loading-message">Loading users...</div>
            ) : employees.length === 0 ? (
              <div className="no-users-message">No users found</div>
            ) : (
              <div className="assessment-carousel-wrapper user-carousel-wrapper">
                <button className="carousel-arrow prev" onClick={handleUserPrev} disabled={userCarouselIndex === 0}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="assessment-carousel">
                  {employees
                    .slice(userCarouselIndex, userCarouselIndex + USERS_VISIBLE)
                    .map((employee, index) => {
                      const actualIndex = userCarouselIndex + index;
                      return (
                        <div
                          className={`user-card ${selectedUserIndex === actualIndex ? 'selected' : ''}`}
                          key={employee.EmployeeId || actualIndex}
                          onClick={() => setSelectedUserIndex(actualIndex)}
                        >
                          <h3>{employee.EmployeeName} <span>({employee.Relation})</span></h3>
                          <p>{employee.TagLine || "Health assessment"}</p>
                          <div className="user-card-image-container">
                            <img src={"/user1.png"} alt={employee.EmployeeName} />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <button
                  className="carousel-arrow next"
                  onClick={handleUserNext}
                  disabled={userCarouselIndex >= employees.length - USERS_VISIBLE}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('initial')} style={{ width: '100px' }}>Previous</button>
          <button style={{ width: '100px' }}
            className="action-btn next-btn"
            onClick={() => {
              if (selectedUserIndex === null) {
                toast.error("Please select a user first");
                return;
              }
              setView('generalDetails');
            }}
            disabled={selectedUserIndex === null}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // General Details View
  if (view === 'generalDetails') {
    const selectedEmployee = selectedUserIndex !== null ? employees[selectedUserIndex] : null;

    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="general.png" alt="General Details Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>General Details</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="general-details-form">
              <div className="form-group">
                <label>Name of the Customer</label>
                <input
                  type="text"
                  value={selectedEmployee ? selectedEmployee.EmployeeName : 'No user selected'}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group-inline">
                <div className="form-group">
                  <label>Gender</label>
                  <div className="gender-selection">
                    <button
                      className={`gender-btn ${gender === 1 ? 'selected' : ''}`}
                      onClick={() => setGender(1)}
                    >
                      <FontAwesomeIcon icon={faMale} className="gender-icon" />
                      Male
                    </button>
                    <button
                      className={`gender-btn ${gender === 2 ? 'selected' : ''}`}
                      onClick={() => setGender(2)}
                    >
                      <FontAwesomeIcon icon={faFemale} className="gender-icon" />
                      Female
                    </button>
                  </div>
                  <small>**Auto-selected from profile. You can change if needed.</small>
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <div className="age-input">
                    <button
                      onClick={() => setAge(prev => Math.max(0, prev - 1))}
                      disabled={age <= 0}
                    >
                      &#9664;
                    </button>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setAge(Math.max(0, value));
                      }}
                      min="0"
                      max="120"
                    />
                    <button
                      onClick={() => setAge(prev => Math.min(120, prev + 1))}
                      disabled={age >= 120}
                    >
                      &#9654;
                    </button>
                  </div>
                  {selectedEmployee?.Age && (
                    <small>From profile: {selectedEmployee.Age} years</small>
                  )}
                  {age === 0 && <small className="error-text">Please enter age</small>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('newUser')} style={{ width: '100px' }}>Previous</button>
          <button
            style={{ width: '100px' }}
            className="action-btn next-btn"
            onClick={() => {
              if (age === 0) {
                toast.error("Please enter age");
                return;
              }
              if (!selectedEmployee) {
                toast.error("No user selected");
                return;
              }
              setView('moodAssessment');
            }}
            disabled={age === 0 || !selectedEmployee}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Mood Assessment View
  if (view === 'moodAssessment') {
    const selectedEmployee = selectedUserIndex !== null ? employees[selectedUserIndex] : null;
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/Drag.png" alt="How are you doing illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>General Details</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="mood-assessment-content">
              <h3>Hi {selectedEmployee ? selectedEmployee.EmployeeName : 'User'}, How are you doing Today</h3>
              <p>Drag the slider</p>
              <div className="mood-slider-container">
                <div className="mood-icons">
                  <img src="/drag-1.png" alt="Very Sad" className="mood-icon" />
                  <img src="/drag-2.png" alt="Sad" className="mood-icon" />
                  <img src="/drag-3.png" alt="Neutral" className="mood-icon" />
                  <img src="/drag-4.png" alt="Happy" className="mood-icon" />
                  <img src="/drag-5.png" alt="Very Happy" className="mood-icon" />
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={moodValue}
                  onChange={(e) => setMoodValue(parseInt(e.target.value))}
                  className={`mood-slider mood-${moodValue}`}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('generalDetails')} style={{ width: '100px' }}>Previous</button>
          <button
            className="action-btn next-btn"
            onClick={handleSaveGeneralDetails}
            disabled={loading || selectedUserIndex === null}
            style={{ width: '100px' }}>
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    );
  }

  // Basic Profile View
  if (view === 'basicProfile') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/basic.png" alt="Basic Profile Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Basic Profile</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="basic-profile-content">
              {/* Height Section */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label className="height-label">My Height</label>

                  {/* Height Unit Toggle - Fixed */}
                  <div className="unit-toggle-container">
                    <div
                      className={`unit-toggle ${heightUnit === 'feet' ? 'active' : ''}`}
                      style={{
                        display: 'inline-flex',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '4px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setHeightUnit('feet');
                          setErrors(prev => ({ ...prev, heightCm: '', heightFeet: '', heightInches: '' }));
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: heightUnit === 'feet' ? '#4a6fa5' : 'transparent',
                          color: heightUnit === 'feet' ? 'white' : '#4a5568',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          minWidth: '60px'
                        }}
                      >
                        Feet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHeightUnit('cm');
                          setErrors(prev => ({ ...prev, heightFeet: '', heightInches: '', heightCm: '' }));
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: heightUnit === 'cm' ? '#4a6fa5' : 'transparent',
                          color: heightUnit === 'cm' ? 'white' : '#4a5568',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          minWidth: '73px'
                        }}
                      >
                        Cm
                      </button>
                    </div>
                  </div>
                </div>

                <div className="height-inputs">
                  {heightUnit === 'feet' ? (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            placeholder="Feet"
                            value={heightFeet}
                            onChange={handleInputChange(setHeightFeet, 'heightFeet')}

                            className={errors.heightFeet ? 'error' : ''}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              paddingRight: '40px',
                              borderRadius: '8px',
                              border: errors.heightFeet ? '1px solid #e74c3c' : '1px solid #e2e8f0',
                              fontSize: '14px'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#718096',
                            fontSize: '14px'
                          }}></span>
                        </div>
                        {errors.heightFeet && (
                          <span className="error-message">{errors.heightFeet}</span>
                        )}
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            placeholder="Inches"
                            value={heightInches}
                            onChange={handleInputChange(setHeightInches, 'heightInches')}

                            className={errors.heightInches ? 'error' : ''}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              paddingRight: '40px',
                              borderRadius: '8px',
                              border: errors.heightInches ? '1px solid #e74c3c' : '1px solid #e2e8f0',
                              fontSize: '14px'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#718096',
                            fontSize: '14px'
                          }}></span>
                        </div>
                        {errors.heightInches && (
                          <span className="error-message">{errors.heightInches}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="input-group">
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          placeholder="Cm"
                          value={heightCm}
                          onChange={handleInputChange(setHeightCm, 'heightCm')}

                          className={errors.heightCm ? 'error' : ''}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: '40px',
                            borderRadius: '8px',
                            border: errors.heightCm ? '1px solid #e74c3c' : '1px solid #e2e8f0',
                            fontSize: '14px'
                          }}
                        />

                      </div>
                      {errors.heightCm && (
                        <span className="error-message">{errors.heightCm}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Weight Section */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label className="height-label">My Weight</label>

                  {/* Weight Unit Toggle - Fixed */}
                  <div className="unit-toggle-container">
                    <div
                      className={`unit-toggle ${weightUnit === 'pound' ? 'active' : ''}`}
                      style={{
                        display: 'inline-flex',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '4px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setWeightUnit('kg');
                          setErrors(prev => ({ ...prev, weightValue: '' }));
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: weightUnit === 'kg' ? '#4a6fa5' : 'transparent',
                          color: weightUnit === 'kg' ? 'white' : '#4a5568',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          minWidth: '60px'
                        }}
                      >
                        Kg
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWeightUnit('pound');
                          setErrors(prev => ({ ...prev, weightValue: '' }));
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: weightUnit === 'pound' ? '#4a6fa5' : 'transparent',
                          color: weightUnit === 'pound' ? 'white' : '#4a5568',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          minWidth: '60px'
                        }}
                      >
                        Pound
                      </button>
                    </div>
                  </div>
                </div>

                <div className="weight-inputs">
                  <div className="input-group">
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        placeholder={weightUnit === 'kg' ? 'Kg' : 'Pound'}
                        value={weightValue}
                        onChange={handleInputChange(setWeightValue, 'weightValue')}

                        className={errors.weightValue ? 'error' : ''}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          paddingRight: weightUnit === 'kg' ? '35px' : '60px',
                          borderRadius: '8px',
                          border: errors.weightValue ? '1px solid #e74c3c' : '1px solid #e2e8f0',
                          fontSize: '14px'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#718096',
                        fontSize: '14px'
                      }}>

                      </span>
                    </div>
                    {errors.weightValue && (
                      <span className="error-message">{errors.weightValue}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* BMI Section */}
              <div className="bmi-section">
                <label>BMI</label>
                <input
                  type="text"
                  className="bmi-input"
                  value={bmi ? `${bmi} (${bmiStatus})` : ''}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#2d3748',
                    fontSize: '14px'
                  }}
                />
                {bmi && (
                  <div className={`bmi-status ${bmiStatus.toLowerCase()}`} style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textAlign: 'center',
                    background:
                      bmiStatus.toLowerCase() === 'underweight' ? '#fff3cd' :
                        bmiStatus.toLowerCase() === 'normal' ? '#d1ecf1' :
                          bmiStatus.toLowerCase() === 'overweight' ? '#f8d7da' : '#d1ecf1',
                    color:
                      bmiStatus.toLowerCase() === 'underweight' ? '#856404' :
                        bmiStatus.toLowerCase() === 'normal' ? '#0c5460' :
                          bmiStatus.toLowerCase() === 'overweight' ? '#721c24' : '#0c5460'
                  }}>
                    Status: {bmiStatus}
                  </div>
                )}
              </div>

              {/* General Health Opinion Section */}
              <div className="form-section health-opinion-section">
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '15px' }}>
                  In general, what is your opinion about your health?
                </p>
                {errors.healthOpinion && isSubmitted && (
                  <span className="error-message">{errors.healthOpinion}</span>
                )}
                <div className="health-options" style={{ display: 'flex', gap: '20px' }}>
                  <div className="health-option" style={{ textAlign: 'center' }}>
                    <img
                      src="/healty1.png"
                      alt="Healthy"
                      className="health-image"
                      style={{
                        width: '80px',
                        height: '80px',
                        marginBottom: '10px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      className={`health-option-btn ${healthOpinion === 'healthy' ? 'selected' : ''} ${errors.healthOpinion && isSubmitted ? 'error-border' : ''}`}
                      onClick={() => handleHealthOpinionSelect('healthy')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: healthOpinion === 'healthy' ? '2px solid #4a6fa5' : '1px solid #e2e8f0',
                        background: healthOpinion === 'healthy' ? '#edf4fc' : 'white',
                        color: healthOpinion === 'healthy' ? '#4a6fa5' : '#4a5568',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        minWidth: '120px'
                      }}
                    >
                      Healthy
                    </button>
                  </div>
                  <div className="health-option" style={{ textAlign: 'center' }}>
                    <img
                      src="/unhealty1.png"
                      alt="Unhealthy"
                      className="health-image"
                      style={{
                        width: '80px',
                        height: '80px',
                        marginBottom: '10px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      className={`health-option-btn ${healthOpinion === 'unhealthy' ? 'selected' : ''} ${errors.healthOpinion && isSubmitted ? 'error-border' : ''}`}
                      onClick={() => handleHealthOpinionSelect('unhealthy')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: healthOpinion === 'unhealthy' ? '2px solid #e74c3c' : '1px solid #e2e8f0',
                        background: healthOpinion === 'unhealthy' ? '#fde8e8' : 'white',
                        color: healthOpinion === 'unhealthy' ? '#e74c3c' : '#4a5568',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        minWidth: '120px'
                      }}
                    >
                      Unhealthy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-navigation-buttons" >
          <button
            className="action-btn prev-btn"
            onClick={() => setView('moodAssessment')}
            style={{ width: '100px' }}
          >
            Previous
          </button>
          <button
            className="action-btn next-btn"
            onClick={handleBasicProfileNext}
            style={{ width: '100px' }}
          >
            Next
          </button>
        </div>

        {/* Unhealthy Popup */}
        {showUnhealthyPopup && (
          <div className="popup-overlay">
            <div className="popup-content" style={{ width: '400px' }}>
              <button className="popup-close" onClick={() => setShowUnhealthyPopup(false)}>×</button>
              <h3 style={{ whiteSpace: 'nowrap' }}>You need to connect with a doctor</h3>
              <div className="popup-actions">
                <button className="popup-btn" onClick={() => navigate('/consultation')} style={{ width: '100px' }}>Yes</button>
                <button className="popup-btn" onClick={() => setShowUnhealthyPopup(false)} style={{ width: '100px' }}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Presenting Illness View
  if (view === 'presentingIllness') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/illness.png" alt="Presenting Illness Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Presenting Illness</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="presenting-illness-content">
              <p className="illness-question">Any Acute Illness / Chronic Illness?</p>
              <div className="illness-options-grid">
                <button className={`illness-option-btn ${selectedIllnesses.includes('cough') ? 'selected' : ''}`} onClick={() => toggleIllness('cough')}>
                  <img src="/Cough.svg" alt="Cough" />
                  <span>Cough</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('cold') ? 'selected' : ''}`} onClick={() => toggleIllness('cold')}>
                  <img src="/Cold.svg" alt="Cold" />
                  <span>Cold</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('fever') ? 'selected' : ''}`} onClick={() => toggleIllness('fever')}>
                  <img src="/Fever.svg" alt="Fever" />
                  <span>Fever</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('diabetes') ? 'selected' : ''}`} onClick={() => toggleIllness('diabetes')}>
                  <img src="/Diabetes.svg" alt="Diabetes" />
                  <span>Diabetes</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('hypertension') ? 'selected' : ''}`} onClick={() => toggleIllness('hypertension')}>
                  <img src="/Hypertension.svg" alt="Hypertension" />
                  <span>Hypertension</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('asthma') ? 'selected' : ''}`} onClick={() => toggleIllness('asthma')}>
                  <img src="/Asthma.svg" alt="Asthma" />
                  <span>Asthma</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('flu') ? 'selected' : ''}`} onClick={() => toggleIllness('flu')}>
                  <img src="/Fine.svg" alt="Flu" />
                  <span>Flu</span>
                </button>
                <button className={`illness-option-btn ${selectedIllnesses.includes('other') ? 'selected' : ''}`} onClick={() => toggleIllness('other')}>
                  <img src="/Other.svg" alt="Other" />
                  <span>Other</span>
                </button>
              </div>

              {/* Show selected count for user feedback */}
              {/* {selectedIllnesses.length > 0 && (
                <div className="selected-count">
                  {selectedIllnesses.length} illness(es) selected
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('basicProfile')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handlePresentingIllnessNext} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }
  // Past History View
  if (view === 'pastHistory') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/past.png" alt="Past History Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Past History</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="past-history-content">
              {/* Chronic Illness Section */}
              <div className="past-history-question-group">
                <p className="question-text">History of any chronic illness</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="chronicIllness"
                      value="yes"
                      checked={hasChronicIllness === 'yes'}
                      onChange={() => setHasChronicIllness('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="chronicIllness"
                      value="no"
                      checked={hasChronicIllness === 'no'}
                      onChange={() => setHasChronicIllness('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Surgery History Section */}
              <div className="past-history-question-group">
                <p className="question-text">History of any surgery</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="hasSurgery"
                      value="yes"
                      checked={hasSurgery === 'yes'}
                      onChange={() => setHasSurgery('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="hasSurgery"
                      value="no"
                      checked={hasSurgery === 'no'}
                      onChange={() => setHasSurgery('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('presentingIllness')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSavePastHistory} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Sleep Assessment View
  if (view === 'sleepAssessment') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/sleep.png" alt="Sleep Assessment Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Sleep Assessment</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="sleep-assessment-content">
              {/* Question 1: How many hours do you generally sleep? */}
              <div className="sleep-question-group">
                <p className="question-text">How many hours do you generally sleep in the night</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="sleepHours"
                      value="lessThan7"
                      checked={sleepHours === 'lessThan7'}
                      onChange={() => setSleepHours('lessThan7')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 7 hours
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="sleepHours"
                      value="moreThan7"
                      checked={sleepHours === 'moreThan7'}
                      onChange={() => setSleepHours('moreThan7')}
                    />
                    <span className="radio-indicator"></span>
                    More than 7 hours
                  </label>
                </div>
              </div>

              {/* Question 2: Do you wake up in the midst of the sleep? */}
              <div className="sleep-question-group">
                <p className="question-text">Do you wake up in the midst of the sleep for any reason</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="wakeUpMidSleep"
                      value="yes"
                      checked={wakeUpMidSleep === 'yes'}
                      onChange={() => setWakeUpMidSleep('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="wakeUpMidSleep"
                      value="no"
                      checked={wakeUpMidSleep === 'no'}
                      onChange={() => setWakeUpMidSleep('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>

                {/* Show reason options when Yes is selected */}
                {wakeUpMidSleep === 'yes' && (
                  <div className="reason-options-group">
                    <p className="reason-question-text">Reason</p>
                    <div className="radio-option-group">
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="excessiveUrination"
                          checked={wakeUpReason === 'excessiveUrination'}
                          onChange={() => setWakeUpReason('excessiveUrination')}
                        />
                        <span className="radio-indicator"></span>
                        Excessive Urination
                      </label>
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="breathingDifficulty"
                          checked={wakeUpReason === 'breathingDifficulty'}
                          onChange={() => setWakeUpReason('breathingDifficulty')}
                        />
                        <span className="radio-indicator"></span>
                        Breathing Difficulty
                      </label>
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="stress"
                          checked={wakeUpReason === 'stress'}
                          onChange={() => setWakeUpReason('stress')}
                        />
                        <span className="radio-indicator"></span>
                        Stress
                      </label>
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="bodyOverHeat"
                          checked={wakeUpReason === 'bodyOverHeat'}
                          onChange={() => setWakeUpReason('bodyOverHeat')}
                        />
                        <span className="radio-indicator"></span>
                        Body Over Heat
                      </label>
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="indigestion"
                          checked={wakeUpReason === 'indigestion'}
                          onChange={() => setWakeUpReason('indigestion')}
                        />
                        <span className="radio-indicator"></span>
                        Indigestion
                      </label>
                      <label className="custom-radio-label">
                        <input
                          type="radio"
                          name="wakeUpReason"
                          value="anxietyDepression"
                          checked={wakeUpReason === 'anxietyDepression'}
                          onChange={() => setWakeUpReason('anxietyDepression')}
                        />
                        <span className="radio-indicator"></span>
                        Anxiety/Depression
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Question 3: Do you generally have a feeling of restlessness or tiredness or irritability? */}
              <div className="sleep-question-group">
                <p className="question-text">Do you generally have a feeling of restlessness or tiredness or irritability in the morning, when you wake up</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="morningFeeling"
                      value="yes"
                      checked={morningFeeling === 'yes'}
                      onChange={() => setMorningFeeling('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="morningFeeling"
                      value="no"
                      checked={morningFeeling === 'no'}
                      onChange={() => setMorningFeeling('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('pastHistory')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveSleepAssessment} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Eating Habits View
  if (view === 'eatingHabits') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/eating.png" alt="Eating Habits Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Eating Habits</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="eating-habits-content">
              {/* Veg/Non-veg Toggle */}
              <div className="diet-type-toggle-container">
                <span
                  className="diet-label"
                  style={{
                    color: !isNonVeg ? '#2e7d32' : '#999',
                    fontWeight: !isNonVeg ? '600' : '400',
                    transition: 'color 0.3s ease'
                  }}
                >
                  Veg
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isNonVeg}
                    onChange={() => setIsNonVeg(!isNonVeg)}
                  />
                  <span
                    className="slider round"
                    style={{
                      backgroundColor: isNonVeg ? '#c62828' : '#2e7d32'
                    }}
                  ></span>
                </label>

                <span
                  className="diet-label"
                  style={{
                    color: isNonVeg ? '#c62828' : '#999',
                    fontWeight: isNonVeg ? '600' : '400',
                    transition: 'color 0.3s ease'
                  }}
                >
                  Non-veg
                </span>
              </div>


              {/* Question 1: How frequent do you eat Fried/Junk food - eating outside */}
              <div className="eating-habit-question-group">
                <p className="question-text">How frequent do you eat Fried/Junk food - eating outside</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="friedJunkFood"
                      value="neverOrAlmost"
                      checked={friedJunkFood === 'neverOrAlmost'}
                      onChange={() => setFriedJunkFood('neverOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Never or almost never
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="friedJunkFood"
                      value="occasionally"
                      checked={friedJunkFood === 'occasionally'}
                      onChange={() => setFriedJunkFood('occasionally')}
                    />
                    <span className="radio-indicator"></span>
                    Occasionally
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="friedJunkFood"
                      value="often"
                      checked={friedJunkFood === 'often'}
                      onChange={() => setFriedJunkFood('often')}
                    />
                    <span className="radio-indicator"></span>
                    Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="friedJunkFood"
                      value="veryOften"
                      checked={friedJunkFood === 'veryOften'}
                      onChange={() => setFriedJunkFood('veryOften')}
                    />
                    <span className="radio-indicator"></span>
                    Very Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="friedJunkFood"
                      value="alwaysOrAlmost"
                      checked={friedJunkFood === 'alwaysOrAlmost'}
                      onChange={() => setFriedJunkFood('alwaysOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Always or Almost Always
                  </label>
                </div>
              </div>

              {/* Question 2: Milk and dairy products */}
              <div className="eating-habit-question-group">
                <p className="question-text">Milk and dairy products</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="milkDairy"
                      value="neverOrAlmost"
                      checked={milkDairy === 'neverOrAlmost'}
                      onChange={() => setMilkDairy('neverOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Never or almost never
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="milkDairy"
                      value="occasionally"
                      checked={milkDairy === 'occasionally'}
                      onChange={() => setMilkDairy('occasionally')}
                    />
                    <span className="radio-indicator"></span>
                    Occasionally
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="milkDairy"
                      value="often"
                      checked={milkDairy === 'often'}
                      onChange={() => setMilkDairy('often')}
                    />
                    <span className="radio-indicator"></span>
                    Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="milkDairy"
                      value="veryOften"
                      checked={milkDairy === 'veryOften'}
                      onChange={() => setMilkDairy('veryOften')}
                    />
                    <span className="radio-indicator"></span>
                    Very Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="milkDairy"
                      value="alwaysOrAlmost"
                      checked={milkDairy === 'alwaysOrAlmost'}
                      onChange={() => setMilkDairy('alwaysOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Always or Almost Always
                  </label>
                </div>
              </div>

              {/* Question 3: Fresh fruits and green vegetable */}
              <div className="eating-habit-question-group">
                <p className="question-text">Fresh fruits and green vegetable</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="freshFruitsVeg"
                      value="neverOrAlmost"
                      checked={freshFruitsVeg === 'neverOrAlmost'}
                      onChange={() => setFreshFruitsVeg('neverOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Never or almost never
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="freshFruitsVeg"
                      value="occasionally"
                      checked={freshFruitsVeg === 'occasionally'}
                      onChange={() => setFreshFruitsVeg('occasionally')}
                    />
                    <span className="radio-indicator"></span>
                    Occasionally
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="freshFruitsVeg"
                      value="often"
                      checked={freshFruitsVeg === 'often'}
                      onChange={() => setFreshFruitsVeg('often')}
                    />
                    <span className="radio-indicator"></span>
                    Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="freshFruitsVeg"
                      value="veryOften"
                      checked={freshFruitsVeg === 'veryOften'}
                      onChange={() => setFreshFruitsVeg('veryOften')}
                    />
                    <span className="radio-indicator"></span>
                    Very Often
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="freshFruitsVeg"
                      value="alwaysOrAlmost"
                      checked={freshFruitsVeg === 'alwaysOrAlmost'}
                      onChange={() => setFreshFruitsVeg('alwaysOrAlmost')}
                    />
                    <span className="radio-indicator"></span>
                    Always or Almost Always
                  </label>
                </div>
              </div>

              {/* Question 4: How much of water do you Drink Per Day */}
              <div className="eating-habit-question-group">
                <p className="question-text">How much of water do you Drink Per Day</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="waterIntake"
                      value="lessThan9"
                      checked={waterIntake === 'lessThan9'}
                      onChange={() => setWaterIntake('lessThan9')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 9 glasses / 2.2 Lts
                  </label>
                  <label className="custom-radio-label small-gap">
                    <input
                      type="radio"
                      name="waterIntake"
                      value="moreThan9"
                      checked={waterIntake === 'moreThan9'}
                      onChange={() => setWaterIntake('moreThan9')}
                    />
                    <span className="radio-indicator"></span>
                    More than 9 glasses / 2.2 Lts
                  </label>
                </div>
              </div>
              {isNonVeg && (
                <div className="eating-habit-question-group">
                  <p className="question-text">Meat and Sea food</p>
                  <div className="radio-option-group horizontal-options">
                    <label className="custom-radio-label small-gap">
                      <input
                        type="radio"
                        name="meatSeafood"
                        value="occasionally"
                        checked={meatSeafood === 'occasionally'}
                        onChange={() => setMeatSeafood('occasionally')}
                      />
                      <span className="radio-indicator"></span>
                      Occasionally
                    </label>
                    <label className="custom-radio-label small-gap">
                      <input
                        type="radio"
                        name="meatSeafood"
                        value="often"
                        checked={meatSeafood === 'often'}
                        onChange={() => setMeatSeafood('often')}
                      />
                      <span className="radio-indicator"></span>
                      Often
                    </label>
                    <label className="custom-radio-label small-gap">
                      <input
                        type="radio"
                        name="meatSeafood"
                        value="veryOften"
                        checked={meatSeafood === 'veryOften'}
                        onChange={() => setMeatSeafood('veryOften')}
                      />
                      <span className="radio-indicator"></span>
                      Very Often
                    </label>
                    <label className="custom-radio-label small-gap">
                      <input
                        type="radio"
                        name="meatSeafood"
                        value="alwaysOrAlmost"
                        checked={meatSeafood === 'alwaysOrAlmost'}
                        onChange={() => setMeatSeafood('alwaysOrAlmost')}
                      />
                      <span className="radio-indicator"></span>
                      Always or Almost Always
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('sleepAssessment')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveEatingHabits} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Drinking Habits View
  if (view === 'drinkingHabits') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/drinking.png" alt="Drinking Habits Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Drinking Habits</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="drinking-habits-content">
              {/* Question 1: Do you consuming alcohol? */}
              <div className="drinking-habit-question-group">
                <p className="question-text">Do you consuming alcohol?</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumingAlcohol"
                      value="yes"
                      checked={consumingAlcohol === 'yes'}
                      onChange={() => setConsumingAlcohol('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumingAlcohol"
                      value="no"
                      checked={consumingAlcohol === 'no'}
                      onChange={() => setConsumingAlcohol('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 2: Have consumed in the past? */}
              <div className="drinking-habit-question-group">
                <p className="question-text">Have consumed in the past?</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumedInPast"
                      value="yes"
                      checked={consumedInPast === 'yes'}
                      onChange={() => setConsumedInPast('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumedInPast"
                      value="no"
                      checked={consumedInPast === 'no'}
                      onChange={() => setConsumedInPast('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('eatingHabits')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveDrinkingHabits} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Smoking Habits View
  if (view === 'smokingHabits') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/smoking.png" alt="Smoking Habits Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Smoking Habits</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="smoking-habits-content">
              {/* Question 1: Are you currently consuming any form of tobacco? */}
              <div className="smoking-habit-question-group">
                <p className="question-text">Are you currently consuming any form of tobacco?</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumingTobacco"
                      value="yes"
                      checked={consumingTobacco === 'yes'}
                      onChange={() => setConsumingTobacco('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="consumingTobacco"
                      value="no"
                      checked={consumingTobacco === 'no'}
                      onChange={() => setConsumingTobacco('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 2: Have you quit the habit? */}
              <div className="smoking-habit-question-group">
                <p className="question-text">Have you quit the habit?</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="quitHabit"
                      value="yes"
                      checked={quitHabit === 'yes'}
                      onChange={() => setQuitHabit('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="quitHabit"
                      value="no"
                      checked={quitHabit === 'no'}
                      onChange={() => setQuitHabit('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('drinkingHabits')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveSmokingHabits} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }
  // Hereditary Questions View
  if (view === 'hereditaryQuestions') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/Hereditary.png" alt="Hereditary Questions Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Hereditary Questions</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="hereditary-questions-content">
              {/* Question 1: Chronic/Long term illness */}
              <div className="hereditary-question-group">
                <p className="question-text">Has any of your immediate family members suffered or are Suffering from any Chronic / Long term illness. To get the list please select one of the family member below</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="familyIllness"
                      value="yes"
                      checked={familyIllness === 'yes'}
                      onChange={() => setFamilyIllness('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="familyIllness"
                      value="no"
                      checked={familyIllness === 'no'}
                      onChange={() => setFamilyIllness('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 2: I see my physician for routine check-ups, health screenings, and disease prevention */}
              <div className="hereditary-question-group">
                <p className="question-text">I see my physician for routine check-ups, health screenings, and disease prevention</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="physicianCheckup"
                      value="everySixMonths"
                      checked={physicianCheckup === 'everySixMonths'}
                      onChange={() => setPhysicianCheckup('everySixMonths')}
                    />
                    <span className="radio-indicator"></span>
                    Every six months
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="physicianCheckup"
                      value="yearlyOnce"
                      checked={physicianCheckup === 'yearlyOnce'}
                      onChange={() => setPhysicianCheckup('yearlyOnce')}
                    />
                    <span className="radio-indicator"></span>
                    Yearly once
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="physicianCheckup"
                      value="hadItFewTimes"
                      checked={physicianCheckup === 'hadItFewTimes'}
                      onChange={() => setPhysicianCheckup('hadItFewTimes')}
                    />
                    <span className="radio-indicator"></span>
                    Have conducted it few times in my life
                  </label>
                </div>
              </div>

              {/* Question 3: Are you currently taking any medication for conditions like, diabetes/hypertension/Stroke/Asthma etc. */}
              <div className="hereditary-question-group">
                <p className="question-text">Are you currently taking any medication for conditions like, diabetes/hypertension/Stroke/Asthma etc.</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="currentlyTakingMedication"
                      value="yes"
                      checked={currentlyTakingMedication === 'yes'}
                      onChange={() => setCurrentlyTakingMedication('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="currentlyTakingMedication"
                      value="no"
                      checked={currentlyTakingMedication === 'no'}
                      onChange={() => setCurrentlyTakingMedication('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 4: Have you stopped taking any medications without consulting the doctor */}
              <div className="hereditary-question-group">
                <p className="question-text">Have you stopped taking any medications without consulting the doctor</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="stoppedMedication"
                      value="yes"
                      checked={stoppedMedication === 'yes'}
                      onChange={() => setStoppedMedication('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="stoppedMedication"
                      value="no"
                      checked={stoppedMedication === 'no'}
                      onChange={() => setStoppedMedication('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 5: Are you taking any other sources of medicine (Ayurveda/Unani/homeopathy) */}
              <div className="hereditary-question-group">
                <p className="question-text">Are you taking any other sources of medicine (Ayurveda/Unani/homeopathy)</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherMedicineSources"
                      value="yes"
                      checked={otherMedicineSources === 'yes'}
                      onChange={() => setOtherMedicineSources('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherMedicineSources"
                      value="no"
                      checked={otherMedicineSources === 'no'}
                      onChange={() => setOtherMedicineSources('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('smokingHabits')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveHereditaryQuestions} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Bowel Bladder Habits View
  if (view === 'bowelBladderHabits') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/BowelBladder.png" alt="Bowel Bladder Habits Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Bowel Bladder Habits</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="bowel-bladder-habits-content">
              {/* Question 1: Do you feel difficulty in passing urine */}
              <div className="bowel-bladder-question-group">
                <p className="question-text">Do you feel difficulty in passing urine</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="difficultyUrinating"
                      value="yes"
                      checked={difficultyUrinating === 'yes'}
                      onChange={() => setDifficultyUrinating('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="difficultyUrinating"
                      value="no"
                      checked={difficultyUrinating === 'no'}
                      onChange={() => setDifficultyUrinating('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 2: Do you feel difficulty in passing stools */}
              <div className="bowel-bladder-question-group">
                <p className="question-text">Do you feel difficulty in passing stools</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="difficultyStooling"
                      value="yes"
                      checked={difficultyStooling === 'yes'}
                      onChange={() => setDifficultyStooling('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="difficultyStooling"
                      value="no"
                      checked={difficultyStooling === 'no'}
                      onChange={() => setDifficultyStooling('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('hereditaryQuestions')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveBowelBladderHabits} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Fitness Profile View
  if (view === 'fitnessProfile') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/Fitness-Profile.png" alt="Fitness Profile Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Fitness Profile</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="fitness-profile-content">
              {/* Question 1: Stretching/Warm up */}
              <div className="fitness-question-group">
                <p className="question-text">Stretching/Warm up</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="stretching"
                      value="lessThan30"
                      checked={stretching === 'lessThan30'}
                      onChange={() => setStretching('lessThan30')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 30 mins
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="stretching"
                      value="30to60"
                      checked={stretching === '30to60'}
                      onChange={() => setStretching('30to60')}
                    />
                    <span className="radio-indicator"></span>
                    30 mins - 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="stretching"
                      value="moreThan60"
                      checked={stretching === 'moreThan60'}
                      onChange={() => setStretching('moreThan60')}
                    />
                    <span className="radio-indicator"></span>
                    More than 1 hr
                  </label>
                </div>
              </div>

              {/* Question 2: Aerobic Activity */}
              <div className="fitness-question-group">
                <p className="question-text">Aerobic Activity</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="aerobicActivity"
                      value="lessThan30"
                      checked={aerobicActivity === 'lessThan30'}
                      onChange={() => setAerobicActivity('lessThan30')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 30 mins
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="aerobicActivity"
                      value="30to60"
                      checked={aerobicActivity === '30to60'}
                      onChange={() => setAerobicActivity('30to60')}
                    />
                    <span className="radio-indicator"></span>
                    30 mins - 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="aerobicActivity"
                      value="moreThan60"
                      checked={aerobicActivity === 'moreThan60'}
                      onChange={() => setAerobicActivity('moreThan60')}
                    />
                    <span className="radio-indicator"></span>
                    More than 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="aerobicActivity"
                      value="notReally"
                      checked={aerobicActivity === 'notReally'}
                      onChange={() => setAerobicActivity('notReally')}
                    />
                    <span className="radio-indicator"></span>
                    Not Really
                  </label>
                </div>
              </div>

              {/* Question 3: Strength and Conditioning Training */}
              <div className="fitness-question-group">
                <p className="question-text">Strength and Conditioning Training</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="strengthTraining"
                      value="lessThan30"
                      checked={strengthTraining === 'lessThan30'}
                      onChange={() => setStrengthTraining('lessThan30')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 30 mins
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="strengthTraining"
                      value="30to60"
                      checked={strengthTraining === '30to60'}
                      onChange={() => setStrengthTraining('30to60')}
                    />
                    <span className="radio-indicator"></span>
                    30 mins - 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="strengthTraining"
                      value="moreThan60"
                      checked={strengthTraining === 'moreThan60'}
                      onChange={() => setStrengthTraining('moreThan60')}
                    />
                    <span className="radio-indicator"></span>
                    More than 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="strengthTraining"
                      value="notReally"
                      checked={strengthTraining === 'notReally'}
                      onChange={() => setStrengthTraining('notReally')}
                    />
                    <span className="radio-indicator"></span>
                    Not Really
                  </label>
                </div>
              </div>

              {/* Question 4: Walking */}
              <div className="fitness-question-group">
                <p className="question-text">Walking</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="walking"
                      value="lessThan30"
                      checked={walking === 'lessThan30'}
                      onChange={() => setWalking('lessThan30')}
                    />
                    <span className="radio-indicator"></span>
                    Less than 30 mins
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="walking"
                      value="30to60"
                      checked={walking === '30to60'}
                      onChange={() => setWalking('30to60')}
                    />
                    <span className="radio-indicator"></span>
                    30 mins - 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="walking"
                      value="moreThan60"
                      checked={walking === 'moreThan60'}
                      onChange={() => setWalking('moreThan60')}
                    />
                    <span className="radio-indicator"></span>
                    More than 1 hr
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="walking"
                      value="notReally"
                      checked={walking === 'notReally'}
                      onChange={() => setWalking('notReally')}
                    />
                    <span className="radio-indicator"></span>
                    Not Really
                  </label>
                </div>
              </div>

              {/* Question 5: Any other physical activity (Other than Walking) */}
              <div className="fitness-question-group">
                <p className="question-text">Any other physical activity (Other than Walking)</p>
                <div className="radio-option-group horizontal-options">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherActivity"
                      value="running"
                      checked={otherActivity === 'running'}
                      onChange={() => setOtherActivity('running')}
                    />
                    <span className="radio-indicator"></span>
                    Running
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherActivity"
                      value="playingSport"
                      checked={otherActivity === 'playingSport'}
                      onChange={() => setOtherActivity('playingSport')}
                    />
                    <span className="radio-indicator"></span>
                    Playing Any sport
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherActivity"
                      value="cycling"
                      checked={otherActivity === 'cycling'}
                      onChange={() => setOtherActivity('cycling')}
                    />
                    <span className="radio-indicator"></span>
                    Cycling
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherActivity"
                      value="gymnastics"
                      checked={otherActivity === 'gymnastics'}
                      onChange={() => setOtherActivity('gymnastics')}
                    />
                    <span className="radio-indicator"></span>
                    Gymnastics
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="otherActivity"
                      value="other"
                      checked={otherActivity === 'other'}
                      onChange={() => setOtherActivity('other')}
                    />
                    <span className="radio-indicator"></span>
                    Other
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('bowelBladderHabits')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveFitnessDetails} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Mental Wellness View
  if (view === 'mentalWellness') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/Mental-wellness.png" alt="Mental Wellness Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Mental wellness</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="mental-wellness-content">
              {/* Question 1: Do you have little interest in doing things that you enjoyed before */}
              <div className="mental-wellness-question-group">
                <p className="question-text">Do you have little interest in doing things that you enjoyed before</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="littleInterest"
                      value="yes"
                      checked={littleInterest === 'yes'}
                      onChange={() => setLittleInterest('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="littleInterest"
                      value="no"
                      checked={littleInterest === 'no'}
                      onChange={() => setLittleInterest('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 2: Have you been feeling sad or depressed most of the times */}
              <div className="mental-wellness-question-group">
                <p className="question-text">Have you been feeling sad or depressed most of the times</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="feelingSad"
                      value="yes"
                      checked={feelingSad === 'yes'}
                      onChange={() => setFeelingSad('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="feelingSad"
                      value="no"
                      checked={feelingSad === 'no'}
                      onChange={() => setFeelingSad('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 3: Do you have problems in sleep and appetite */}
              <div className="mental-wellness-question-group">
                <p className="question-text">Do you have problems in sleep and appetite</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="sleepAppetiteProblems"
                      value="yes"
                      checked={sleepAppetiteProblems === 'yes'}
                      onChange={() => setSleepAppetiteProblems('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="sleepAppetiteProblems"
                      value="no"
                      checked={sleepAppetiteProblems === 'no'}
                      onChange={() => setSleepAppetiteProblems('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 4: Have you been tired and having very little energy */}
              <div className="mental-wellness-question-group">
                <p className="question-text">Have you been tired and having very little energy</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="lowEnergy"
                      value="yes"
                      checked={lowEnergy === 'yes'}
                      onChange={() => setLowEnergy('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="lowEnergy"
                      value="no"
                      checked={lowEnergy === 'no'}
                      onChange={() => setLowEnergy('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>

              {/* Question 5: Have you been Anxious / Restless or having multiple worries and doubts in mind than usual */}
              <div className="mental-wellness-question-group">
                <p className="question-text">Have you been Anxious / Restless or having multiple worries and doubts in mind than usual</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="anxiousRestless"
                      value="yes"
                      checked={anxiousRestless === 'yes'}
                      onChange={() => setAnxiousRestless('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="anxiousRestless"
                      value="no"
                      checked={anxiousRestless === 'no'}
                      onChange={() => setAnxiousRestless('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('fitnessProfile')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveMentalWellness} style={{ width: '100px' }}>Next</button>
        </div>
      </div>
    );
  }

  // Employee Wellness View
  if (view === 'employeeWellness') {
    return (
      <div className="assessment-records-page">
        <div className="assessment-records-container">
          <div className="assessment-illustration">
            <img src="/employ-wellnes.png" alt="Employee Wellness Illustration" />
          </div>
          <div className="assessment-records-panel">
            <div className="panel-header">
              <h2>Employee Wellness</h2>
              <p>Please enter correct information for us to provide accurate output</p>
            </div>

            <div className="employee-wellness-content">
              {/* Question 1: Do you feel stress from work is affecting your personal life? */}
              <div className="employee-wellness-question-group">
                <p className="question-text">Do you feel stress from work is affecting your personal life?</p>
                <div className="radio-option-group">
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="workStress"
                      value="yes"
                      checked={workStress === 'yes'}
                      onChange={() => setWorkStress('yes')}
                    />
                    <span className="radio-indicator"></span>
                    Yes
                  </label>
                  <label className="custom-radio-label">
                    <input
                      type="radio"
                      name="workStress"
                      value="no"
                      checked={workStress === 'no'}
                      onChange={() => setWorkStress('no')}
                    />
                    <span className="radio-indicator"></span>
                    No
                  </label>
                </div>
              </div>
              {workStress === 'yes' && (
                <div className="employee-wellness-question-group">
                  <p className="question-text">What's stressing you out?</p>
                  <div className="checkbox-option-group">
                    {['Increased workload', 'Long Working Hours', 'Any Health Issues', 'Financial issues', 'Others'].map((option) => (
                      <label key={option} className="custom-checkbox-label">
                        <input
                          type="checkbox"
                          value={option}
                          checked={stressReasons.includes(option)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...stressReasons, option]
                              : stressReasons.filter((item) => item !== option);
                            setStressReasons(updated);
                          }}
                        />
                        <span className="checkbox-indicator"></span>
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-navigation-buttons">
          <button className="action-btn prev-btn" onClick={() => setView('mentalWellness')} style={{ width: '100px' }}>Previous</button>
          <button className="action-btn next-btn" onClick={handleSaveEmployeeWellness} style={{ width: '100px' }}>Submit</button>
        </div>
      </div>
    );
  }

  // Initial View
  return (
    <div className="health-assessment-container">
      <div className="assessment-banner">
        <img
          src="Health-Assessments.jpg"
          alt="Health Assessment Banner"
          className="assessment-banner-img"
        />
      </div>
      <div className="assessment-actions">
        <button className="action-btn resume" onClick={() => handleGetAssessments('Resume')} >
          Resume assessment
        </button>
        <button className="action-btn new-eval" onClick={handleNewHealthEvaluation}>
          New Health Evaluation
        </button>
        <button className="action-btn view-past" onClick={() => handleGetAssessments('View')}>
          View past assessments
        </button>
      </div>

      <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px' }}>
          <h2 className="our-location-headings">Our Locations</h2>
          <div className="location-carousel-wrappers">
            <button className="carousel-arrow left" onClick={handleLocationPrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} className="location-img large-location-img" />
                  <div className="location-name large-location-name">{loc.name}</div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleLocationNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default HealthAssessment;