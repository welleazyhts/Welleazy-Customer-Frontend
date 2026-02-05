import React, { useState, useEffect } from 'react';
import './HealthAssessmentDocument.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import { HealthAssessmentAPI } from '../../api/HealthAssessment';
import html2canvas from 'html2canvas';

interface AssessmentData {
  submissionDate: string;
  userInfo: {
    name: string;
    relation: string;
    gender: string;
    age: string;
  };
  basicProfile: {
    height: string;
    weight: string;
    bmi: string;
    healthOpinion: string;
  };
  mood: number;
  presentingIllness: string[];
  pastHistory: {
    chronicIllness: string;
    surgery: string;
  };
  sleepAssessment: {
    sleepHours: string;
    wakeUpMidSleep: string;
    wakeUpReason?: string;
    morningFeeling: string;
  };
  eatingHabits: {
    dietType: string;
    friedJunkFood: string;
    milkDairy: string;
    freshFruitsVeg: string;
    waterIntake: string;
    meatSeafood?: string;
  };
  drinkingHabits: {
    consumingAlcohol: string;
    consumedInPast: string;
  };
  smokingHabits: {
    consumingTobacco: string;
    quitHabit: string;
  };
  hereditaryQuestions: {
    familyIllness: string;
    physicianCheckup: string;
    currentlyTakingMedication: string;
    stoppedMedication: string;
    otherMedicineSources: string;
  };
  bowelBladderHabits: {
    difficultyUrinating: string;
    difficultyStooling: string;
  };
  fitnessProfile: {
    stretching: string;
    aerobicActivity: string;
    strengthTraining: string;
    walking: string;
    otherActivity: string;
  };
  mentalWellness: {
    littleInterest: string;
    feelingSad: string;
    sleepAppetiteProblems: string;
    lowEnergy: string;
    anxiousRestless: string;
  };
  employeeWellness: {
    workStress: string;
    stressReasons: string[];
  };
}

interface HealthAssessmentDocumentProps {
  assessmentData?: AssessmentData;
  onClose?: () => void;
}

type HRAOutputDetailsRequest = import('../../types/HealthAssessment').HRAOutputDetailsRequest;

const HealthAssessmentDocument: React.FC<HealthAssessmentDocumentProps> = ({
  assessmentData: propAssessmentData,
  onClose
}) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hrageneralDetailsId, setHrageneralDetailsId] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let id = "";

    if (location.state && location.state.hrageneralDetailsId) {
      id = location.state.hrageneralDetailsId.toString();
    } else {
      const storedId = localStorage.getItem("HRAGeneralDetailsId");
      if (storedId) {
        id = storedId;
      }
    }

    setHrageneralDetailsId(id);

    if (propAssessmentData) {
      setAssessmentData(propAssessmentData);
    } else {
      const savedData = localStorage.getItem('healthAssessmentData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setAssessmentData(parsedData);
        } catch (error) {
          console.error("Error parsing assessment data from localStorage:", error);
        }
      }
    }
  }, [propAssessmentData, location.state]);

  const getMoodText = (moodValue: number): string => {
    const moodTexts = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
    return moodTexts[moodValue] || 'Neutral';
  };

  const formatData = (value: string | number | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ') || 'None';
    }
    if (typeof value === 'string' && value === 'yes') return 'Yes';
    if (typeof value === 'string' && value === 'no') return 'No';
    if (typeof value === 'string' && value === 'lessThan7') return 'Less than 7 hours';
    if (typeof value === 'string' && value === 'moreThan7') return 'More than 7 hours';
    if (typeof value === 'string' && value === 'lessThan9') return 'Less than 2.2L';
    if (typeof value === 'string' && value === 'moreThan9') return 'More than 2.2L';
    return String(value);
  };

  const generatePDF = async (mode: 'download' | 'save') => {
    const input = document.querySelector('.health-assessment-document') as HTMLElement;
    if (!input) return toast.error('Unable to generate PDF');

    try {
      const canvas = await html2canvas(input, {
        scale: 1.25,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;

      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // ✅ CRITICAL FIX
      const totalPages = Math.floor(imgHeight / pageHeight) +
        (imgHeight % pageHeight > 20 ? 1 : 0);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        pdf.addImage(
          imgData,
          'JPEG',
          0,
          -(page * pageHeight),
          pageWidth,
          imgHeight
        );
      }

      if (mode === 'download') {
        pdf.save('Health_Assessment_Report.pdf');
      }

    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };






  const handleSaveHealthAssessmentRecord = async () => {
    if (!assessmentData) {
      toast.error('No assessment data available to save');
      return;
    }

    if (!hrageneralDetailsId || hrageneralDetailsId === "0") {
      toast.error('Missing HRAGeneralDetailsId. Cannot save record.');
      return;
    }

    setIsSaving(true);
    try {
      const createdBy = localStorage.getItem("LoginRefId") || "0";
      const employeeRefId = localStorage.getItem("EmployeeRefId") || "0";

      const payload: HRAOutputDetailsRequest = {
        HRAOutpuDetailsId: 0,
        EmployeeRefId: parseInt(employeeRefId, 10) || 0,
        HRAGeneralDetailsId: hrageneralDetailsId,
        CreatedBy: createdBy,
        AssessmentData: {
          SubmissionDate: assessmentData.submissionDate,
          UserInfo: {
            Name: assessmentData.userInfo.name,
            Relation: assessmentData.userInfo.relation,
            Gender: assessmentData.userInfo.gender,
            Age: assessmentData.userInfo.age
          },
          BasicProfile: {
            Height: assessmentData.basicProfile.height,
            Weight: assessmentData.basicProfile.weight,
            Bmi: assessmentData.basicProfile.bmi,
            HealthOpinion: assessmentData.basicProfile.healthOpinion
          },
          Mood: assessmentData.mood.toString(),
          PresentingIllness: assessmentData.presentingIllness,
          PastHistory: {
            ChronicIllness: assessmentData.pastHistory.chronicIllness,
            Surgery: assessmentData.pastHistory.surgery
          },
          SleepAssessment: {
            SleepHours: assessmentData.sleepAssessment.sleepHours,
            WakeUpMidSleep: assessmentData.sleepAssessment.wakeUpMidSleep,
            WakeUpReason: assessmentData.sleepAssessment.wakeUpReason || "",
            MorningFeeling: assessmentData.sleepAssessment.morningFeeling
          },
          EatingHabits: {
            DietType: assessmentData.eatingHabits.dietType,
            FriedJunkFood: assessmentData.eatingHabits.friedJunkFood,
            MilkDairy: assessmentData.eatingHabits.milkDairy,
            FreshFruitsVeg: assessmentData.eatingHabits.freshFruitsVeg,
            WaterIntake: assessmentData.eatingHabits.waterIntake,
            MeatSeafood: assessmentData.eatingHabits.meatSeafood || ""
          },
          DrinkingHabits: {
            ConsumingAlcohol: assessmentData.drinkingHabits.consumingAlcohol,
            ConsumedInPast: assessmentData.drinkingHabits.consumedInPast
          },
          SmokingHabits: {
            ConsumingTobacco: assessmentData.smokingHabits.consumingTobacco,
            QuitHabit: assessmentData.smokingHabits.quitHabit
          },
          HereditaryQuestions: {
            FamilyIllness: assessmentData.hereditaryQuestions.familyIllness,
            PhysicianCheckup: assessmentData.hereditaryQuestions.physicianCheckup,
            CurrentlyTakingMedication: assessmentData.hereditaryQuestions.currentlyTakingMedication,
            StoppedMedication: assessmentData.hereditaryQuestions.stoppedMedication,
            OtherMedicineSources: assessmentData.hereditaryQuestions.otherMedicineSources
          },
          BowelBladderHabits: {
            DifficultyUrinating: assessmentData.bowelBladderHabits.difficultyUrinating,
            DifficultyStooling: assessmentData.bowelBladderHabits.difficultyStooling
          },
          FitnessProfile: {
            Stretching: assessmentData.fitnessProfile.stretching,
            AerobicActivity: assessmentData.fitnessProfile.aerobicActivity,
            StrengthTraining: assessmentData.fitnessProfile.strengthTraining,
            Walking: assessmentData.fitnessProfile.walking,
            OtherActivity: assessmentData.fitnessProfile.otherActivity
          },
          MentalWellness: {
            LittleInterest: assessmentData.mentalWellness.littleInterest,
            FeelingSad: assessmentData.mentalWellness.feelingSad,
            SleepAppetiteProblems: assessmentData.mentalWellness.sleepAppetiteProblems,
            LowEnergy: assessmentData.mentalWellness.lowEnergy,
            AnxiousRestless: assessmentData.mentalWellness.anxiousRestless
          },
          EmployeeWellness: {
            WorkStress: assessmentData.employeeWellness.workStress,
            StressReasons: assessmentData.employeeWellness.stressReasons
          }
        }
      };

      const response = await HealthAssessmentAPI.CRMInsertUpdateHRAOutputDetails(payload);

      if (response && response.success) {
        toast.success('Health assessment record saved successfully!');
        if (response.documentPath) {
          window.open(response.documentPath, '_blank');
        }
        navigate('/health-assessment/records'); // Redirect back to records list
      } else {
        const errorMessage = response?.message || 'Unknown error occurred';
        toast.error(`Failed to save record: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving health assessment:', error);
      toast.error('Error saving health assessment record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/health-assessment');
    }
  };

  if (!assessmentData) {
    return (
      <div className="health-assessment-document-loading-container">
        <div className="health-assessment-document-loading-spinner"></div>
        <p className="health-assessment-document-loading-text">Loading assessment data...</p>
        <button className="health-assessment-document-btn health-assessment-document-back-btn" onClick={handleBack}>
          ← Back to Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="health-assessment-document">
      {/* Modern Header */}
      <header className="health-assessment-document-header">
        <div className="health-assessment-document-header-gradient">
          <div className="health-assessment-document-header-content">
            <h1 className="health-assessment-document-title">
              <span className="health-assessment-document-icon">📋</span>
              Health Assessment Report
            </h1>
            <div className="health-assessment-document-subtitle">Comprehensive Health Analysis Document</div>

            <div className="health-assessment-document-header-meta">
              <div className="health-assessment-document-meta-card">
                <div className="health-assessment-document-meta-icon">📅</div>
                <div className="health-assessment-document-meta-content">
                  <div className="health-assessment-document-meta-label">Generated</div>
                  <div className="health-assessment-document-meta-value">{assessmentData.submissionDate}</div>
                </div>
              </div>

              <div className="health-assessment-document-meta-card">
                <div className="health-assessment-document-meta-icon">👤</div>
                <div className="health-assessment-document-meta-content">
                  <div className="health-assessment-document-meta-label">Patient</div>
                  <div className="health-assessment-document-meta-value">{assessmentData.userInfo.name}</div>
                </div>
              </div>

              <div className="health-assessment-document-meta-card">
                <div className="health-assessment-document-meta-icon">🆔</div>
                <div className="health-assessment-document-meta-content">
                  <div className="health-assessment-document-meta-label">Assessment ID</div>
                  <div className="health-assessment-document-meta-value">{hrageneralDetailsId || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3 SMALL BUTTONS IN SINGLE ROW */}
      <div className="health-assessment-document-control-panel">
        <div className="health-assessment-document-control-buttons">
          <button
            className="health-assessment-document-btn health-assessment-document-primary-btn health-assessment-document-download"
            onClick={() => generatePDF('download')}
          >
            📥 Download PDF
          </button>

          {/* <button className="health-assessment-document-btn health-assessment-document-secondary-btn health-assessment-document-print" onClick={handlePrint}>
            <span className="health-assessment-document-btn-icon">🖨️</span>
            Print
          </button> */}
          <button
            className="health-assessment-document-btn health-assessment-document-accent-btn health-assessment-document-save"
            onClick={handleSaveHealthAssessmentRecord}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Submitting...' : '💾 Final Submit'}
          </button>

        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="health-assessment-document-main-content">
        <div className="health-assessment-document-two-column-grid">

          {/* Left Column */}
          <div className="health-assessment-document-column health-assessment-document-left-column">

            {/* Section 1: Personal Information */}
            <section className="health-assessment-document-info-card">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">01</div>
                <h2 className="health-assessment-document-section-title">Personal Information</h2>
                <div className="health-assessment-document-card-icon">👤</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Full Name:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.userInfo.name}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Relationship:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.userInfo.relation}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Gender:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.userInfo.gender}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Age:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.userInfo.age} years</span>
                </div>
              </div>
            </section>

            {/* Section 3: Medical History */}
            <section className="health-assessment-document-info-card health-assessment-document-medical">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">03</div>
                <h2 className="health-assessment-document-section-title">Medical History</h2>
                <div className="health-assessment-document-card-icon">🏥</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Presenting Illness:</span>
                  <div className="health-assessment-document-data-value">
                    {assessmentData.presentingIllness.length > 0 ? (
                      <div className="health-assessment-document-tag-list">
                        {assessmentData.presentingIllness.map((illness, index) => (
                          <span key={index} className="health-assessment-document-tag">{illness}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="health-assessment-document-empty-state">None reported</span>
                    )}
                  </div>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Chronic Illness:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.pastHistory.chronicIllness)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Surgery History:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.pastHistory.surgery)}</span>
                </div>
              </div>
            </section>

            {/* Section 5: Dietary Habits */}
            <section className="health-assessment-document-info-card health-assessment-document-diet">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">05</div>
                <h2 className="health-assessment-document-section-title">Dietary Habits</h2>
                <div className="health-assessment-document-card-icon">🍎</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Diet Type:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.eatingHabits.dietType}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Fried/Junk Food:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.eatingHabits.friedJunkFood}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Milk & Dairy:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.eatingHabits.milkDairy}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Fruits & Vegetables:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.eatingHabits.freshFruitsVeg}</span>
                </div>
                {/* <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Water Intake:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.eatingHabits.waterIntake)}</span>
                </div> */}
                {assessmentData.eatingHabits.meatSeafood && (
                  <div className="health-assessment-document-data-item">
                    <span className="health-assessment-document-data-label">Meat & Seafood:</span>
                    <span className="health-assessment-document-data-value">{assessmentData.eatingHabits.meatSeafood}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Section 7: Hereditary Factors */}
            <section className="health-assessment-document-info-card health-assessment-document-hereditary">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">07</div>
                <h2 className="health-assessment-document-section-title">Hereditary Factors</h2>
                <div className="health-assessment-document-card-icon">🧬</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Family Illness:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.hereditaryQuestions.familyIllness}</span>
                </div>
                {/* <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Physician Checkup:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.hereditaryQuestions.physicianCheckup}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{whiteSpace: 'nowrap'}}>Current Medication:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.hereditaryQuestions.currentlyTakingMedication}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{whiteSpace: 'nowrap'}}>Stopped Medication:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.hereditaryQuestions.stoppedMedication}</span>
                </div> */}
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{ whiteSpace: 'nowrap' }}>Other Medicine Sources:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.hereditaryQuestions.otherMedicineSources)}</span>
                </div>
              </div>
            </section>

            {/* Section 9: Fitness Profile */}
            <section className="health-assessment-document-info-card health-assessment-document-fitness">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">09</div>
                <h2 className="health-assessment-document-section-title">Fitness Profile</h2>
                <div className="health-assessment-document-card-icon">💪</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Stretching:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.fitnessProfile.stretching}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Aerobic Activity:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.fitnessProfile.aerobicActivity}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Strength Training:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.fitnessProfile.strengthTraining}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Walking:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.fitnessProfile.walking}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Other Activity:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.fitnessProfile.otherActivity}</span>
                </div>
              </div>
            </section>

            {/* Section 11: Employee Wellness */}
            <section className="health-assessment-document-info-card health-assessment-document-employee">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">11</div>
                <h2 className="health-assessment-document-section-title">Employee Wellness</h2>
                <div className="health-assessment-document-card-icon">💼</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Work Stress:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.employeeWellness.workStress)}</span>
                </div>
                {assessmentData.employeeWellness.stressReasons.length > 0 && (
                  <div className="health-assessment-document-data-item">
                    <span className="health-assessment-document-data-label">Stress Reasons:</span>
                    <div className="health-assessment-document-data-value">
                      <div className="health-assessment-document-tag-list">
                        {assessmentData.employeeWellness.stressReasons.map((reason, index) => (
                          <span key={index} className="health-assessment-document-tag health-assessment-document-stress-tag">{reason}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Right Column */}
          <div className="health-assessment-document-column health-assessment-document-right-column">

            {/* Section 2: Basic Health Profile */}
            <section className="health-assessment-document-info-card health-assessment-document-health">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">02</div>
                <h2 className="health-assessment-document-section-title">Basic Health Profile</h2>
                <div className="health-assessment-document-card-icon">❤️</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Height:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.basicProfile.height}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Weight:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.basicProfile.weight}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">BMI Status:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.basicProfile.bmi}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Health Opinion:</span>
                  <span className="health-assessment-document-data-value">{assessmentData.basicProfile.healthOpinion}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Current Mood:</span>
                  <span className="health-assessment-document-data-value health-assessment-document-mood-indicator">
                    <span className={`health-assessment-document-mood-dot health-assessment-document-mood-${assessmentData.mood}`}></span>
                    {getMoodText(assessmentData.mood)}
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4: Sleep Patterns */}
            <section className="health-assessment-document-info-card health-assessment-document-sleep">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">04</div>
                <h2 className="health-assessment-document-section-title">Sleep Patterns</h2>
                <div className="health-assessment-document-card-icon">😴</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Sleep Duration:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.sleepAssessment.sleepHours)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Wake Up Mid-Sleep:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.sleepAssessment.wakeUpMidSleep)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Morning Feeling:</span>
                  <span className="health-assessment-document-data-value health-assessment-document-feeling-indicator">
                    {assessmentData.sleepAssessment.morningFeeling === 'yes' ? (
                      <span className="health-assessment-document-feeling health-assessment-document-restless">😫 Restless</span>
                    ) : (
                      <span className="health-assessment-document-feeling health-assessment-document-refreshed">😊 Refreshed</span>
                    )}
                  </span>
                </div>
                {assessmentData.sleepAssessment.wakeUpReason && (
                  <div className="health-assessment-document-data-item">
                    <span className="health-assessment-document-data-label">Wake Up Reason:</span>
                    <span className="health-assessment-document-data-value">{assessmentData.sleepAssessment.wakeUpReason}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Section 6: Lifestyle Factors */}
            <section className="health-assessment-document-info-card health-assessment-document-lifestyle">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">06</div>
                <h2 className="health-assessment-document-section-title">Lifestyle Factors</h2>
                <div className="health-assessment-document-card-icon">🚬</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{ whiteSpace: 'nowrap' }}>Alcohol Consumption:</span>
                  <span className="health-assessment-document-data-value ">
                    {formatData(assessmentData.drinkingHabits.consumingAlcohol)}
                  </span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Past Alcohol Use:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.drinkingHabits.consumedInPast)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Tobacco Use:</span>
                  <span className="health-assessment-document-data-value ">
                    {formatData(assessmentData.smokingHabits.consumingTobacco)}
                  </span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Quit Tobacco:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.smokingHabits.quitHabit)}</span>
                </div>
              </div>
            </section>

            {/* Section 8: Bowel & Bladder Habits */}
            <section className="health-assessment-document-info-card health-assessment-document-bowel" style={{ marginTop: '10px' }}>
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">08</div>
                <h2 className="health-assessment-document-section-title">Bowel & Bladder Habits</h2>
                <div className="health-assessment-document-card-icon">🚽</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{ whiteSpace: 'nowrap' }}>Difficulty Urinating:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.bowelBladderHabits.difficultyUrinating)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Difficulty Stooling:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.bowelBladderHabits.difficultyStooling)}</span>
                </div>
              </div>
            </section>

            {/* Section 10: Mental Wellness */}
            <section className="health-assessment-document-info-card health-assessment-document-mental">
              <div className="health-assessment-document-card-header">
                <div className="health-assessment-document-section-number">10</div>
                <h2 className="health-assessment-document-section-title">Mental Wellness</h2>
                <div className="health-assessment-document-card-icon">🧠</div>
              </div>
              <div className="health-assessment-document-card-content">
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Little Interest:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.mentalWellness.littleInterest)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Feeling Sad:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.mentalWellness.feelingSad)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label" style={{ whiteSpace: 'nowrap' }}>Sleep/Appetite Problems:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.mentalWellness.sleepAppetiteProblems)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Low Energy:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.mentalWellness.lowEnergy)}</span>
                </div>
                <div className="health-assessment-document-data-item">
                  <span className="health-assessment-document-data-label">Anxious/Restless:</span>
                  <span className="health-assessment-document-data-value">{formatData(assessmentData.mentalWellness.anxiousRestless)}</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Back Button at Bottom */}
        <div className="health-assessment-document-bottom-actions">
          <button className="health-assessment-document-btn health-assessment-document-outline-btn" onClick={handleBack}>
            <span className="health-assessment-document-btn-icon">←</span>
            Back to Assessment Form
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="health-assessment-document-footer">
        <div className="health-assessment-document-footer-content">
          <div className="health-assessment-document-disclaimer-card">
            <div className="health-assessment-document-disclaimer-icon">⚠️</div>
            <div className="health-assessment-document-disclaimer-content">
              <h4 className="health-assessment-document-disclaimer-title">Disclaimer</h4>
              <p className="health-assessment-document-disclaimer-text">
                This health assessment is for informational purposes only and should not be considered medical advice.
                Please consult with a healthcare professional for medical advice and treatment.
              </p>
            </div>
          </div>


        </div>
      </footer>
    </div>
  );
};

export default HealthAssessmentDocument;