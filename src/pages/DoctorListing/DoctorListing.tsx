import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faMapMarkerAlt, 
  faClock, 
  faRupeeSign,
  faVideo,
  faHospital,
  faGraduationCap,
  faAward,
  faStar,
  faCalendarAlt,
  faFilter,
  faSearch,
  faCheckCircle,
  faArrowRight,
  faLanguage
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './DoctorListing.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  location: string;
  hospital: string;
  availableSlots: string[];
  languages: string[];
  image: string;
  isOnline: boolean;
  nextAvailable: string;
}

interface BookingModalProps {
  show: boolean;
  onHide: () => void;
  doctor: Doctor | null;
}

const DoctorListing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientType, setPatientType] = useState('self');
  const [displayedDoctors, setDisplayedDoctors] = useState(6); // Show 6 doctors initially
  const [isLoading, setIsLoading] = useState(false);

  // Get specialty from URL params or state
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialty = params.get('specialty') || location.state?.specialty || '';
    setSelectedSpecialty(specialty);
  }, [location]);

  const cities = ['Mumbai', 'Bangalore', 'New Delhi', 'Jaipur', 'Kolkata', 'Lucknow', 'Ahmedabad', 'Hyderabad', 'Chandigarh', 'Srinagar', 'Cochin'];
  
  const specialties = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Gynecologist', 
    'Pediatrician', 'Orthopedist', 'Neurologist', 'Psychiatrist', 
    'Dentist', 'Ophthalmologist', 'ENT Specialist', 'Gastroenterologist',
    'Endocrinologist', 'Urologist', 'Rheumatologist', 'Oncologist'
  ];

  const languages = [
    'English', 'Hindi', 'Marathi', 'Gujarati', 'Telugu', 'Tamil', 
    'Malayalam', 'Punjabi', 'Bengali', 'Kannada', 'Urdu'
  ];

  // Sample doctor data
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Physician',
      qualification: 'MBBS, MD',
      experience: 15,
      rating: 4.8,
      reviewCount: 245,
      consultationFee: 500,
      location: 'Bandra, Mumbai',
      hospital: 'Apollo Hospital',
      availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'],
      languages: ['English', 'Hindi', 'Marathi'],
      image: '/images/doctor1.jpg',
      isOnline: true,
      nextAvailable: 'Today 2:00 PM'
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      qualification: 'MBBS, MD, DM Cardiology',
      experience: 12,
      rating: 4.9,
      reviewCount: 189,
      consultationFee: 800,
      location: 'Andheri, Mumbai',
      hospital: 'Fortis Hospital',
      availableSlots: ['11:00 AM', '3:00 PM', '5:00 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor2.jpg',
      isOnline: true,
      nextAvailable: 'Tomorrow 11:00 AM'
    },
    {
      id: '3',
      name: 'Dr. Amit Patel',
      specialty: 'Dermatologist',
      qualification: 'MBBS, MD Dermatology',
      experience: 8,
      rating: 4.7,
      reviewCount: 156,
      consultationFee: 600,
      location: 'Powai, Mumbai',
      hospital: 'Hiranandani Hospital',
      availableSlots: ['9:00 AM', '1:00 PM', '7:00 PM'],
      languages: ['English', 'Hindi', 'Gujarati'],
      image: '/images/doctor3.jpg',
      isOnline: false,
      nextAvailable: 'Today 7:00 PM'
    },
    {
      id: '4',
      name: 'Dr. Sunita Reddy',
      specialty: 'Gynecologist',
      qualification: 'MBBS, MS Gynecology',
      experience: 18,
      rating: 4.9,
      reviewCount: 312,
      consultationFee: 700,
      location: 'Juhu, Mumbai',
      hospital: 'Kokilaben Hospital',
      availableSlots: ['10:30 AM', '2:30 PM', '5:30 PM'],
      languages: ['English', 'Hindi', 'Telugu'],
      image: '/images/doctor4.jpg',
      isOnline: true,
      nextAvailable: 'Today 5:30 PM'
    },
    {
      id: '5',
      name: 'Dr. Vikram Singh',
      specialty: 'Orthopedist',
      qualification: 'MBBS, MS Orthopedics',
      experience: 20,
      rating: 4.8,
      reviewCount: 278,
      consultationFee: 750,
      location: 'Worli, Mumbai',
      hospital: 'Breach Candy Hospital',
      availableSlots: ['9:30 AM', '12:00 PM', '4:30 PM'],
      languages: ['English', 'Hindi', 'Punjabi'],
      image: '/images/doctor5.jpg',
      isOnline: false,
      nextAvailable: 'Tomorrow 9:30 AM'
    },
    {
      id: '6',
      name: 'Dr. Meera Joshi',
      specialty: 'Pediatrician',
      qualification: 'MBBS, MD Pediatrics',
      experience: 10,
      rating: 4.9,
      reviewCount: 198,
      consultationFee: 550,
      location: 'Malad, Mumbai',
      hospital: 'Nanavati Hospital',
      availableSlots: ['8:00 AM', '11:30 AM', '3:30 PM', '6:30 PM'],
      languages: ['English', 'Hindi', 'Marathi'],
      image: '/images/doctor6.jpg',
      isOnline: true,
      nextAvailable: 'Today 3:30 PM'
    },
    {
      id: '7',
      name: 'Dr. Arjun Kapoor',
      specialty: 'Neurologist',
      qualification: 'MBBS, MD, DM Neurology',
      experience: 14,
      rating: 4.8,
      reviewCount: 167,
      consultationFee: 900,
      location: 'Colaba, Mumbai',
      hospital: 'Tata Memorial Hospital',
      availableSlots: ['10:00 AM', '1:00 PM', '4:00 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor7.jpg',
      isOnline: true,
      nextAvailable: 'Tomorrow 10:00 AM'
    },
    {
      id: '8',
      name: 'Dr. Kavya Nair',
      specialty: 'Psychiatrist',
      qualification: 'MBBS, MD Psychiatry',
      experience: 9,
      rating: 4.9,
      reviewCount: 134,
      consultationFee: 650,
      location: 'Vashi, Mumbai',
      hospital: 'Max Hospital',
      availableSlots: ['9:00 AM', '2:00 PM', '6:00 PM'],
      languages: ['English', 'Hindi', 'Malayalam'],
      image: '/images/doctor8.jpg',
      isOnline: true,
      nextAvailable: 'Today 6:00 PM'
    },
    {
      id: '9',
      name: 'Dr. Rohit Gupta',
      specialty: 'ENT Specialist',
      qualification: 'MBBS, MS ENT',
      experience: 11,
      rating: 4.7,
      reviewCount: 203,
      consultationFee: 550,
      location: 'Thane, Mumbai',
      hospital: 'Jupiter Hospital',
      availableSlots: ['8:30 AM', '12:30 PM', '5:30 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor9.jpg',
      isOnline: false,
      nextAvailable: 'Tomorrow 8:30 AM'
    },
    {
      id: '10',
      name: 'Dr. Neha Agarwal',
      specialty: 'Ophthalmologist',
      qualification: 'MBBS, MS Ophthalmology',
      experience: 7,
      rating: 4.8,
      reviewCount: 145,
      consultationFee: 600,
      location: 'Kandivali, Mumbai',
      hospital: 'Aditya Birla Hospital',
      availableSlots: ['9:30 AM', '1:30 PM', '4:30 PM'],
      languages: ['English', 'Hindi', 'Gujarati'],
      image: '/images/doctor10.jpg',
      isOnline: true,
      nextAvailable: 'Today 4:30 PM'
    },
    {
      id: '11',
      name: 'Dr. Sanjay Mehta',
      specialty: 'Gastroenterologist',
      qualification: 'MBBS, MD, DM Gastroenterology',
      experience: 16,
      rating: 4.9,
      reviewCount: 289,
      consultationFee: 850,
      location: 'Dadar, Mumbai',
      hospital: 'KEM Hospital',
      availableSlots: ['10:30 AM', '2:30 PM', '5:00 PM'],
      languages: ['English', 'Hindi', 'Marathi'],
      image: '/images/doctor11.jpg',
      isOnline: false,
      nextAvailable: 'Tomorrow 10:30 AM'
    },
    {
      id: '12',
      name: 'Dr. Pooja Sharma',
      specialty: 'Endocrinologist',
      qualification: 'MBBS, MD, DM Endocrinology',
      experience: 13,
      rating: 4.8,
      reviewCount: 176,
      consultationFee: 750,
      location: 'Goregaon, Mumbai',
      hospital: 'Criticare Hospital',
      availableSlots: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor12.jpg',
      isOnline: true,
      nextAvailable: 'Today 3:00 PM'
    },
    {
      id: '13',
      name: 'Dr. Anil Kumar',
      specialty: 'Urologist',
      qualification: 'MBBS, MS Urology',
      experience: 19,
      rating: 4.7,
      reviewCount: 234,
      consultationFee: 800,
      location: 'Chembur, Mumbai',
      hospital: 'Zen Hospital',
      availableSlots: ['8:00 AM', '11:00 AM', '4:00 PM'],
      languages: ['English', 'Hindi', 'Tamil'],
      image: '/images/doctor13.jpg',
      isOnline: false,
      nextAvailable: 'Tomorrow 8:00 AM'
    },
    {
      id: '14',
      name: 'Dr. Ritu Singh',
      specialty: 'Rheumatologist',
      qualification: 'MBBS, MD, DM Rheumatology',
      experience: 10,
      rating: 4.9,
      reviewCount: 123,
      consultationFee: 700,
      location: 'Santacruz, Mumbai',
      hospital: 'Lilavati Hospital',
      availableSlots: ['10:00 AM', '1:00 PM', '5:00 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor14.jpg',
      isOnline: true,
      nextAvailable: 'Today 5:00 PM'
    },
    {
      id: '15',
      name: 'Dr. Manish Jain',
      specialty: 'Oncologist',
      qualification: 'MBBS, MD, DM Oncology',
      experience: 22,
      rating: 4.9,
      reviewCount: 345,
      consultationFee: 1200,
      location: 'Lower Parel, Mumbai',
      hospital: 'Tata Memorial Hospital',
      availableSlots: ['9:00 AM', '2:00 PM'],
      languages: ['English', 'Hindi'],
      image: '/images/doctor15.jpg',
      isOnline: false,
      nextAvailable: 'Tomorrow 9:00 AM'
    }
  ];

  // Filter doctors based on search criteria
  const allFilteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesLanguage = !selectedLanguage || doctor.languages.some(lang => 
      lang.toLowerCase().includes(selectedLanguage.toLowerCase())
    );
    return matchesSearch && matchesSpecialty && matchesLanguage;
  });

  // Get only the displayed number of doctors
  const filteredDoctors = allFilteredDoctors.slice(0, displayedDoctors);

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    setShowBookingModal(false);
    // Here you would typically make an API call to book the appointment
    alert(`Appointment booked with ${selectedDoctor?.name}!`);
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedDoctors(prev => prev + 6);
      setIsLoading(false);
    }, 1000);
  };

  // Reset displayed doctors when filters change
  React.useEffect(() => {
    setDisplayedDoctors(6);
  }, [searchQuery, selectedSpecialty, selectedCity, selectedLanguage]);

  const BookingModal: React.FC<BookingModalProps> = ({ show, onHide, doctor }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [patientName, setPatientName] = useState('');
    const [symptoms, setSymptoms] = useState('');

    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {doctor && (
            <div>
              <div className="doctor-booking-info mb-4">
                <Row>
                  <Col md={3}>
                    <div className="doctor-booking-image-placeholder">
                      <FontAwesomeIcon icon={faUserMd} className="booking-placeholder-icon" />
                    </div>
                  </Col>
                  <Col md={9}>
                    <h5>{doctor.name}</h5>
                    <p className="text-muted">{doctor.specialty}</p>
                    <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {doctor.location}</p>
                    <p><FontAwesomeIcon icon={faRupeeSign} /> ₹{doctor.consultationFee} consultation fee</p>
                  </Col>
                </Row>
              </div>

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Patient Type</Form.Label>
                      <Form.Select value={patientType} onChange={(e) => setPatientType(e.target.value)}>
                        <option value="self">Self</option>
                        <option value="dependent">Dependent</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Patient Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Enter patient name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Time</Form.Label>
                      <Form.Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                        <option value="">Choose time slot</option>
                        {doctor.availableSlots.map((slot, index) => (
                          <option key={index} value={slot}>{slot}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Symptoms/Reason for visit</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms or reason for consultation"
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Confirm Booking
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="doctor-listing-page">
      {/* Header Section */}
      <section className="listing-header">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1>Find & Book Doctors</h1>
              <p>Connect with qualified healthcare professionals in {selectedCity}</p>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="outline-primary" onClick={() => navigate('/consultation')}>
                <FontAwesomeIcon icon={faVideo} className="me-2" />
                Video Consultation
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Filters Section */}
        <section className="filters-section">
          <Card className="filter-card">
            <Card.Body>
              <Row className="align-items-end">
                <Col lg={2} md={3}>
                  <Form.Group>
                    <Form.Label><FontAwesomeIcon icon={faMapMarkerAlt} /> City</Form.Label>
                    <Form.Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={2} md={3}>
                  <Form.Group>
                    <Form.Label><FontAwesomeIcon icon={faUserMd} /> Specialty</Form.Label>
                    <Form.Select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                      <option value="">All Specialties</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={2} md={3}>
                  <Form.Group>
                    <Form.Label><FontAwesomeIcon icon={faLanguage} /> Language</Form.Label>
                    <Form.Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                      <option value="">All Languages</option>
                      {languages.map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={4} md={3}>
                  <Form.Group>
                    <Form.Label><FontAwesomeIcon icon={faSearch} /> Search Doctor</Form.Label>
                    <Form.Control 
                      type="text"
                      placeholder="Search by doctor name or specialty"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={12} className="mt-md-3 mt-lg-0">
                  <Button variant="primary" className="w-100">
                    <FontAwesomeIcon icon={faFilter} /> Filter
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </section>

        {/* Results Summary */}
        <section className="results-summary">
          <Row className="align-items-center">
            <Col>
              <p className="results-text">
                Showing {filteredDoctors.length} of {allFilteredDoctors.length} doctors 
                {selectedSpecialty && ` for ${selectedSpecialty}`}
                {selectedLanguage && ` speaking ${selectedLanguage}`} in {selectedCity}
              </p>
            </Col>
            <Col xs="auto">
              <Form.Select size="sm" style={{width: 'auto'}}>
                <option>Sort by Relevance</option>
                <option>Sort by Rating</option>
                <option>Sort by Experience</option>
                <option>Sort by Fee (Low to High)</option>
                <option>Sort by Fee (High to Low)</option>
              </Form.Select>
            </Col>
          </Row>
        </section>

        {/* Doctor Cards */}
        <section className="doctors-grid">
          <Row>
            {filteredDoctors.map(doctor => (
              <Col lg={6} key={doctor.id} className="mb-4">
                <Card className="doctor-card h-100">
                  <Card.Body>
                    <Row>
                      <Col md={3} className="text-center">
                        <div className="doctor-image-wrapper">
                          <div className="doctor-image-placeholder">
                            <FontAwesomeIcon icon={faUserMd} className="doctor-placeholder-icon" />
                          </div>
                          {doctor.isOnline && (
                            <Badge bg="success" className="online-badge">
                              <FontAwesomeIcon icon={faVideo} className="me-1" />
                              Online
                            </Badge>
                          )}
                        </div>
                      </Col>
                      <Col md={9}>
                        <div className="doctor-info">
                          <div className="doctor-header">
                            <h5 className="doctor-name">{doctor.name}</h5>
                            <div className="doctor-rating">
                              <FontAwesomeIcon icon={faStar} className="star-icon" />
                              <span>{doctor.rating}</span>
                              <span className="review-count">({doctor.reviewCount} reviews)</span>
                            </div>
                          </div>
                          
                          <div className="doctor-details">
                            <p className="specialty">
                              <FontAwesomeIcon icon={faUserMd} className="me-2" />
                              {doctor.specialty}
                            </p>
                            <p className="qualification">
                              <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                              {doctor.qualification}
                            </p>
                            <p className="experience">
                              <FontAwesomeIcon icon={faAward} className="me-2" />
                              {doctor.experience} years experience
                            </p>
                            <p className="location">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                              {doctor.location}
                            </p>
                            <p className="hospital">
                              <FontAwesomeIcon icon={faHospital} className="me-2" />
                              {doctor.hospital}
                            </p>
                          </div>

                          <div className="consultation-info">
                            <div className="fee-info">
                              <span className="fee">
                                <FontAwesomeIcon icon={faRupeeSign} />
                                ₹{doctor.consultationFee}
                              </span>
                              <span className="fee-label">Consultation Fee</span>
                            </div>
                            <div className="availability">
                              <FontAwesomeIcon icon={faClock} className="me-1" />
                              <span className="next-available">{doctor.nextAvailable}</span>
                            </div>
                          </div>

                          <div className="languages">
                            <small className="text-muted">
                              Languages: {doctor.languages.join(', ')}
                            </small>
                          </div>

                          <div className="action-buttons mt-3">
                            <Button 
                              variant="primary" 
                              className="book-btn me-2"
                              onClick={() => handleBookAppointment(doctor)}
                            >
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                              Book Appointment
                            </Button>
                            {doctor.isOnline && (
                              <Button variant="outline-primary" className="video-btn">
                                <FontAwesomeIcon icon={faVideo} className="me-1" />
                                Video Consult
                              </Button>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredDoctors.length === 0 && allFilteredDoctors.length === 0 && (
            <div className="no-results text-center py-5">
              <FontAwesomeIcon icon={faUserMd} className="no-results-icon" />
              <h4>No doctors found</h4>
              <p>Try adjusting your search criteria or browse all doctors</p>
              <Button variant="outline-primary" onClick={() => {setSearchQuery(''); setSelectedSpecialty(''); setSelectedLanguage('');}}>
                View All Doctors
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {filteredDoctors.length > 0 && filteredDoctors.length < allFilteredDoctors.length && (
            <div className="load-more-section text-center py-4">
              <Button 
                variant="outline-primary" 
                size="lg" 
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading More Doctors...
                  </>
                ) : (
                  <>
                    Load More Doctors
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </>
                )}
              </Button>
              <p className="load-more-text mt-2">
                {allFilteredDoctors.length - filteredDoctors.length} more doctors available
              </p>
            </div>
          )}
        </section>
      </Container>

      {/* Booking Modal */}
      <BookingModal 
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorListing; 