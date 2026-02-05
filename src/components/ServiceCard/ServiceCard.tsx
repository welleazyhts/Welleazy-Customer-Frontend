import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faClock, 
  faStethoscope,
  faHeartbeat,
  faFileMedical,
  faPills,
  faBrain,
  faAppleAlt,
  faDumbbell,
  faUserMd
} from '@fortawesome/free-solid-svg-icons';
import './ServiceCard.css';

interface ServiceCardProps {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  isComingSoon?: boolean;
  isSponsored?: boolean;
}

const getIconForService = (title: string) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('consultation')) return faStethoscope;
  if (titleLower.includes('health record')) return faFileMedical;
  if (titleLower.includes('diagnostic') || titleLower.includes('lab')) return faHeartbeat;
  if (titleLower.includes('medication') || titleLower.includes('pharmacy')) return faPills;
  if (titleLower.includes('mental')) return faBrain;
  if (titleLower.includes('nutrition')) return faAppleAlt;
  if (titleLower.includes('fitness')) return faDumbbell;
  if (titleLower.includes('specialist')) return faUserMd;
  
  // Default icon
  return faClock;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  title, 
  description, 
  linkText, 
  linkUrl,
  isComingSoon = false,
  isSponsored = false
}) => {
  const icon = getIconForService(title);
  
  return (
    <Card className={`service-card ${isSponsored ? 'sponsored' : ''}`}>
      {isSponsored && <div className="sponsored-label">Sponsored Service</div>}
      <Card.Body>
        <div className="card-icon-wrapper">
          <FontAwesomeIcon icon={icon} className="service-icon" />
        </div>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {description}
        </Card.Text>
        <div className="card-action">
          {isComingSoon ? (
            <span className="coming-soon">Coming Soon...</span>
          ) : (
            <Button variant="primary" href={linkUrl} className="action-button">
              {linkText}
              <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceCard; 