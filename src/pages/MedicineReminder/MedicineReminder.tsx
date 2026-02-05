import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicineReminder.css';
import HealthRecordsAPI from '../../api/HealthRecords';
import { MedicineChoices } from '../../types/HealthRecords';
import { toast } from 'react-toastify';

const MedicineReminder: React.FC = () => {
  const [activeContent, setActiveContent] = useState<'main' | 'profile' | 'dependents' | 'addressBook'>('main');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    medicine_name: '',
    medicine_type: '',
    duration_value: 1,
    duration_unit: 'day',
    dosage_value: 1,
    dosage_unit: 'tablet',
    doctor_name: '',
    current_inventory: 0,
    remind_when_inventory: 5,
    medicines_left: 0,
    frequency_type: 'fixed_times',
    intake_frequency: 'once',
    appointment_reminder_date: '',
    scheduled_time: '08:00 AM'
  });

  const [choices, setChoices] = useState<MedicineChoices | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Fetch choices on mount
  React.useEffect(() => {
    const fetchChoices = async () => {
      try {
        const data = await HealthRecordsAPI.getMedicineChoices();
        console.log("Medicine Choices API Data:", data);
        setChoices(data);
      } catch (error) {
        console.error('Error fetching medicine choices:', error);
      }
    };
    fetchChoices();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.medicine_name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare payload for API
      const payload = {
        ...formData,
        // Convert 'after_meal' or similar if needed, but for now we simplify based on UI
        schedule_times: [
          { time: formData.scheduled_time.split(' ')[0], meal_relation: 'after_meal' }
        ]
      };

      await HealthRecordsAPI.createMedicineReminder(payload, files);
      toast.success('Medicine reminder saved successfully!');
      navigate('/health-records'); // or wherever appropriate
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save medicine reminder');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get choices or fall back
  const getOptions = (key: keyof MedicineChoices, fallback: any[]) => {
    if (choices && choices[key] && Array.isArray(choices[key])) {
      return choices[key].map(c => ({ label: c.label, value: c.value }));
    }
    return fallback;
  };

  const medicineTypes = getOptions('medicine_type', [
    { label: '🧴 Syrup', value: 'syrup' },
    { label: '💊 Tablet', value: 'tablet' },
    { label: '💧 Drops', value: 'drops' },
    { label: '🫁 Inhalers', value: 'inhalers' },
    { label: '💉 Injections', value: 'injections' },
    { label: '🧴 Creams/Gel', value: 'cream' },
  ]);

  const dosageOptions = getOptions('dosage_unit', [
    { label: 'Tablespoons', value: 'tablespoons' },
    { label: 'Tablet', value: 'tablet' },
    { label: 'Drops', value: 'drops' },
    { label: 'As directed by Physician', value: 'as_directed' }
  ]);

  const intakeOptions = getOptions('intake_frequency', [
    { label: 'Once', value: 'once' },
    { label: 'Twice', value: 'twice' },
    { label: 'Thrice', value: 'thrice' },
    { label: 'Four times', value: 'four_times' },
    { label: 'Every 30 minutes', value: 'every_30_mins' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Every 4 hours', value: 'every_4_hours' }
  ]);

  const frequencyOptions = [
    { label: 'One time', value: 'one_time' }, // Mapped to backend values
    { label: 'Recurring', value: 'fixed_times' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="medicine-reminder">
      <main className="medicine-reminder__main">
        <div className="medicine-reminder__container">
          {activeContent === 'main' && (
            <div className="medicine-reminder__form-section">
              <h2 className="medicine-reminder__title">Medicine Reminder</h2>
              <p className="medicine-reminder__subtitle">Set reminders for your medications</p>

              <div className="medicine-reminder__columns">
                {/* Left Column */}
                <div className="medicine-reminder__left">
                  {/* Date Range */}
                  <div className="medicine-reminder__row">
                    <div className="medicine-reminder__field">
                      <label className="medicine-reminder__label">
                        From <span className="medicine-reminder__required">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className="medicine-reminder__input"
                      />
                    </div>
                    <div className="medicine-reminder__field">
                      <label className="medicine-reminder__label">
                        To <span className="medicine-reminder__required">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="medicine-reminder__input"
                      />
                    </div>
                  </div>

                  {/* Medicine Name */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Medicine Name</label>
                    <input
                      type="text"
                      value={formData.medicine_name}
                      onChange={(e) => handleInputChange('medicine_name', e.target.value)}
                      className="medicine-reminder__input"
                      placeholder="Enter medicine name"
                    />
                  </div>

                  {/* Type of Medicine */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Type of Medicine</label>
                    <input
                      type="text"
                      value={formData.medicine_type}
                      onChange={(e) => handleInputChange('medicine_type', e.target.value)}
                      className="medicine-reminder__input"
                      placeholder="Enter type"
                    />
                  </div>

                  {/* Medicine Type Icons */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Select Category</label>
                    <div className="medicine-reminder__types">
                      {medicineTypes.map((type) => (
                        <button
                          key={type.value}
                          className={`medicine-reminder__type-btn ${formData.medicine_type === type.value ? 'medicine-reminder__type-btn--selected' : ''
                            }`}
                          onClick={() => handleInputChange('medicine_type', type.value)}
                          type="button"
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Duration</label>
                    <div className="medicine-reminder__duration">
                      <div className="medicine-reminder__stepper">
                        <button
                          type="button"
                          className="medicine-reminder__stepper-btn"
                          onClick={() => handleInputChange('duration_value', Math.max(1, formData.duration_value - 1))}
                        >
                          −
                        </button>
                        <span className="medicine-reminder__stepper-value">{formData.duration_value}</span>
                        <button
                          type="button"
                          className="medicine-reminder__stepper-btn"
                          onClick={() => handleInputChange('duration_value', formData.duration_value + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="medicine-reminder__duration-unit">Day(s)</span>
                    </div>
                  </div>

                  {/* Dosage */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Dosage</label>
                    <div className="medicine-reminder__dosage-stepper">
                      <button
                        type="button"
                        className="medicine-reminder__stepper-btn"
                        onClick={() => handleInputChange('dosage_value', Math.max(1, formData.dosage_value - 1))}
                      >
                        −
                      </button>
                      <span className="medicine-reminder__stepper-value">{formData.dosage_value}</span>
                      <button
                        type="button"
                        className="medicine-reminder__stepper-btn"
                        onClick={() => handleInputChange('dosage_value', formData.dosage_value + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Doctor's Name */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Doctor's Name</label>
                    <input
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                      className="medicine-reminder__input"
                      placeholder="Enter doctor's name"
                    />
                  </div>

                  {/* Upload Documents */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Upload Prescription/Documents</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="medicine-reminder__file-input"
                      id="medicine-files"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="medicine-files" className="medicine-reminder__upload-label">
                      <span className="medicine-reminder__upload-icon">📁</span>
                      {files.length > 0 ? `${files.length} file(s) selected` : 'Choose Files'}
                    </label>
                    {files.length > 0 && (
                      <div className="medicine-reminder__file-list">
                        {files.map((file, idx) => (
                          <div key={idx} className="medicine-reminder__file-name">{file.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="medicine-reminder__right">
                  {/* Dosage Options */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__group-label">Dosage Unit</label>
                    <div className="medicine-reminder__options">
                      {dosageOptions.map((option, index) => (
                        <label key={index} className="medicine-reminder__option">
                          <input
                            type="radio"
                            name="dosage"
                            value={option.value}
                            checked={formData.dosage_unit === option.value}
                            onChange={(e) => handleInputChange('dosage_unit', e.target.value)}
                            className="medicine-reminder__radio"
                          />
                          <span className="medicine-reminder__option-text">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__group-label">Frequency Type</label>
                    <div className="medicine-reminder__frequency">
                      {frequencyOptions.map((option) => (
                        <label key={option.value} className="medicine-reminder__frequency-option">
                          <input
                            type="radio"
                            name="frequency"
                            value={option.value}
                            checked={formData.frequency_type === option.value}
                            onChange={(e) => handleInputChange('frequency_type', e.target.value)}
                            className="medicine-reminder__radio"
                          />
                          <span className="medicine-reminder__option-text">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Refill Reminders */}
                  <div className="medicine-reminder__row">
                    <div className="medicine-reminder__field">
                      <label className="medicine-reminder__label">Medicines Left</label>
                      <input
                        type="number"
                        value={formData.medicines_left}
                        onChange={(e) => handleInputChange('medicines_left', parseInt(e.target.value) || 0)}
                        className="medicine-reminder__input"
                        placeholder="e.g. 20"
                      />
                    </div>
                    <div className="medicine-reminder__field">
                      <label className="medicine-reminder__label">Remind at Inventory</label>
                      <input
                        type="number"
                        value={formData.remind_when_inventory}
                        onChange={(e) => handleInputChange('remind_when_inventory', parseInt(e.target.value) || 0)}
                        className="medicine-reminder__input"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>


                  {/* Appointment Reminder */}
                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">
                      Appointment Reminder <span className="medicine-reminder__required">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.appointment_reminder_date}
                      onChange={(e) => handleInputChange('appointment_reminder_date', e.target.value)}
                      className="medicine-reminder__input"
                    />
                  </div>


                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Current Inventory</label>
                    <input
                      type="text"
                      value={formData.current_inventory}
                      onChange={(e) => handleInputChange('current_inventory', parseInt(e.target.value) || 0)}
                      className="medicine-reminder__input"
                      placeholder="Enter value"
                    />
                  </div>



                  <div className="medicine-reminder__field">
                    <label className="medicine-reminder__label">Scheduled Time for dosage</label>
                    <input
                      type="text"
                      value={formData.scheduled_time}
                      onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                      className="medicine-reminder__input"
                      placeholder="Enter time (e.g., 08:00 AM)"
                    />
                  </div>

                </div>
              </div>

              {/* Form Buttons */}
              <div className="medicine-reminder__actions">
                <button
                  type="button"
                  className="medicine-reminder__btn medicine-reminder__btn--save"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Reminder'}
                </button>
                <button
                  type="button"
                  className="medicine-reminder__btn medicine-reminder__btn--cancel"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicineReminder;