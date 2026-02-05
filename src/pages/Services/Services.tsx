import React from 'react';
import './Services.css';

const services = [
  {
    title: 'Consultation',
    img: '/images/consultation.png',
    description: 'Doctor consultation is a consultation between you and your doctor. It can be done in person, over the phone or through video/Tele/Chat. Our doctors provide high-quality medical care. our doctor consultation services are easily accessible and convenient for patients spread ...',
    comingSoon: false,
  },
  {
    title: 'Diagnostics/Labs Test',
    img: '/images/diagnostics.png',
    description: 'Lab and diagnostic services are treatments, tests, or procedures that help doctors diagnose your condition. They can include blood tests, X-rays, ultrasounds and more. Our lab and diagnostic services are easily accessible and convenient ...',
    comingSoon: false,
  },
  {
    title: 'Insurance Records',
    img: '/images/insurance.png',
    description: 'Insurance record is a unique feature provided by us. The portal provides a secure area where all the insurance details can be stored in one place. The user will have access to all their insurance documents and details, which can be accessed at any time. It will help the individuals to get ...',
    comingSoon: false,
  },
  {
    title: 'Health Records',
    img: '/images/healthrecords.png',
    description: 'Your Health records at one place. we can provide you with a secure access to your health records so that only those who are authorized to view the information can do so. We also offer a secure file sharing system, where your health records can be stored securely in our portal. The user ...',
    comingSoon: false,
  },
  {
    title: 'Health Assessment',
    img: '/images/assessment.png',
    description: 'Health Risk Assessment (HRA) is a systematic approach to identifying potential health risks and promoting preventive care. Typically conducted through a questionnaire and biometric screenings, it evaluates factors such as lifestyle, medical history, and current health status. The insights ...',
    comingSoon: false,
  },
  {
    title: 'Medicine Reminder',
    img: '/images/medicine.png',
    description: 'Care programs are comprehensive plans that are designed to improve the health and well-being of individuals who require care and support. We provide care and support to someone with a long-term condition or terminal illness. This includes different types of care and support that ...',
    comingSoon: false,
  },
  {
    title: 'Pharmacy',
    img: '/images/pharmacy.png',
    description: 'Online pharmacies provide a convenient and accessible way for patients to purchase medications and health-related products from the comfort of their own home. Our pharmacy provides prescription medications at competitive prices, as well as a wide range of over-the-counter drugs. ...',
    comingSoon: false,
  },
  {
    title: 'GYM Services',
    img: '/images/gym.png',
    description: 'Online pharmacies provide a convenient and accessible way for patients to purchase medications and health-related products from the comfort of their own home. Our pharmacy provides prescription medications at competitive prices, as well as a wide range of over-the-counter drugs. ...',
    comingSoon: false,
  },
  {
    title: 'Eye Care/Dental Care',
    img: '/images/eye.png',
    description: 'Online pharmacies provide a convenient and accessible way for patients to purchase medications and health-related products from the comfort of their own home. Our pharmacy provides prescription medications at competitive prices, as well as a wide range of over-the-counter drugs. ...',
    comingSoon: false,
  },
  {
    title: 'Home and Elderly Care Programs',
    img: '/images/elderly.png',
    description: 'Care programs are comprehensive plans that are designed to improve the health and well-being of individuals who require care and support. We provide care and support to someone with a long-term condition or terminal illness. This includes different types of care and support that ...',
    comingSoon: false,
  },
  {
    title: 'Mental Wellness',
    img: '/images/mental.png',
    description: 'Mental wellness is essential for maintaining overall health and professional efficiency. It includes stress management, emotional well-being, and proactive mental health care. Setting priorities for mental health improves attention, resilience, and interactions with others, while also ...',
    comingSoon: true,
  },
  {
    title: 'Women Health',
    img: '/images/women.png',
    description: 'Online pharmacies provide a convenient and accessible way for patients to purchase medications and health-related products from the comfort of their own home. Our pharmacy provides prescription medications at competitive prices, as well as a wide range of over-the-counter drugs. ...',
    comingSoon: true,
  },
  {
    title: 'Comprehensive Health Plans',
    img: '/images/plans.png',
    description: 'These plans are made to cover a variety of medical services, including prescription drugs, doctor visits, preventive care, etc. They do, however, frequently provide more comprehensive coverage and cheaper out-of-pocket expenses.',
    comingSoon: true,
  },
];

const Services: React.FC = () => {
  return (
    <div className="services-main-section">
      <h1 className="services-title">Our Services</h1>
      <div className="services-grid">
        {services.map((service, idx) => (
          <div className="service-card-custom" key={idx}>
            <div className="service-ribbon">{service.comingSoon ? 'Coming Soon' : ''}</div>
            <div className="service-card-content">
              <div className="service-img-col">
                <img src={service.img} alt={service.title} className="service-img" />
              </div>
              <div className="service-info-col">
                <div className="service-card-title">{service.title}</div>
                <div className="service-card-desc">{service.description}</div>
                {service.comingSoon ? (
                  <button className="service-btn-custom coming-soon-btn">Coming Soon...</button>
                ) : (
                  <button className="service-btn-custom">Click Here</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;