import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GavelIcon from '@mui/icons-material/Gavel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface TermsSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const TermsOfService: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | false>('section1');

  const handleAccordionChange = (section: string) => {
    setExpanded(expanded === section ? false : section);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections: TermsSection[] = [
    {
      id: 'section1',
      title: 'Acceptance of Terms',
      icon: <CheckCircleOutlineIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable and the provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000.
          </Typography>
          <Typography variant="body1" paragraph>
            By clicking on the "I ACCEPT" or "Agreed" button, You are consenting to be bound by these General Terms and Conditions for using Website/App and for availing the services of Welleazy. Please ensure that You read these terms and conditions carefully before You use the service of this portal.
          </Typography>
          <Typography variant="body1" paragraph>
            If You do not agree to be bound by (or cannot comply with) any or all of them, do not check/click the "I ACCEPT" or "AGREE" box, do not complete the registration process, and do not attempt to access or use any services of Welleazy including its Website/App.
          </Typography>
          <Typography variant="body1">
            When You register/access any services of Welleazy, You are bound by all of the terms and conditions which are intended to be fully effective and binding including privacy policy and all other operating rules, policies, and procedures that may be published/updated on the Website.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section2',
      title: 'Parties to the Agreement',
      icon: <GavelIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            These general terms and conditions is an agreement made between M/s. Welleazy Healthtech Solutions Private Limited, India (hereinafter referred to as "Welleazy" or "Company") and the user (hereinafter referred to as "You" or "Your" or "User") who avails any service from Welleazy.
          </Typography>
          <Typography variant="body1" paragraph>
            The word You shall mean the individual, company or any other legal entity for which the terms and conditions of this agreement are agreed to and includes affiliates of the Company or any other legal entity.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="If You agree to these terms and conditions of a company or any other legal entity, You represent that You have the authority to bind such entity and its affiliates."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="You represent that You are a valid person meeting age and other requirements for entering into an agreement."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="In the event that You are a parent or guardian of a minor, You represent and warrant that You have the legal capacity to act on behalf of such minor."
              />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section3',
      title: 'Changes to Terms',
      icon: <AssignmentIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Welleazy reserves the right that at its sole discretion it may change, modify, add or remove these terms and conditions at any time in part or in whole without prior notice to You and such modifications shall be effective immediately upon posting the revised terms and conditions.
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to check and review these terms and conditions periodically to be aware of such changes/modifications and your continued use of Welleazy Website/App following the posting of revised Terms and Conditions of Use means that You accept and agree to the changes and the revised Terms of Use.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', bgcolor: alpha(theme.palette.warning.main, 0.1), p: 2, borderRadius: 1 }}>
            We do not undertake to notify You of proposed or actual changes.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section4',
      title: 'Services Description',
      icon: <HealthAndSafetyIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Welleazy through its partner organisations primarily provides primary healthcare services and related services and does not treat medical emergencies.
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'error.main', fontWeight: 'medium' }}>
            You understand and agree that use of Welleazy services is entirely at Your own risk and that in no event shall Welleazy be liable for any direct, indirect, incidental, consequential, special, exemplary, punitive, or any other monetary or other damages.
          </Typography>
          <Typography variant="body1" paragraph>
            Information provided on Welleazy Website/App should not be construed as medical advice or used for treatment purposes and no content in the Website / App intends to provide medical advice, professional diagnosis, opinion, treatment to You or any other individual.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section5',
      title: 'Medical Service Providers',
      icon: <HealthAndSafetyIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Services offered by the company are not health insurance policies. Welleazy provides the services through own or independent medical professionals/ organizations/ institutions/ ambulance providers/ pathology labs/ radiology labs/ others ("Medical Service Providers").
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'medium' }}>
            The Medical Service Providers are independent entities/professionals in private practice and are neither employees nor agents of Welleazy and/or its parents, subsidiaries or affiliates.
          </Typography>
          <Typography variant="body1" paragraph>
            Welleazy is only an aggregator/ facilitator of independent Medical Service Providers and merely an intermediary providing the Website and App as a platform to offer services to You/Users.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Welleazy does not recommend or suggest any particular Medical Service Provider."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Welleazy does not make any representations or warranties with respect to Medical Service Providers or the quality of the healthcare services."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="The Service offered by Company and Medical Service Provider are provided on 'As Is' and 'As Available' basis."
              />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section6',
      title: 'User Responsibilities',
      icon: <PrivacyTipIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Representations and Warranties
          </Typography>
          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="You are 18 years of age or older." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="All information You submit is complete and accurate." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="You will use the services solely for Your personal and non-commercial use." />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            Prohibited Activities
          </Typography>
          <Typography variant="body1" paragraph>
            You shall not use the Website/App/Services to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Host, display, upload, modify, publish, transmit, update or share any information that belongs to another person." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Share content that is harmful, harassing, defamatory, obscene, or otherwise unlawful." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Violate any patent, trademark, copyright or other proprietary rights." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Impersonate another person." />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section7',
      title: 'Welleazy Added Services',
      icon: <HealthAndSafetyIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Consultation Services
          </Typography>
          <Typography variant="body1" paragraph>
            Welleazy provides comprehensive consultation services that enable users to access general physicians and specialist doctors via both Virtual Consultation and in-clinic appointments.
          </Typography>
          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="All medical professionals listed are licensed and credentials verified." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Virtual Consultation sessions may be recorded for quality and reference purposes." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Consultations are not intended for emergency medical situations." />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom color="primary">
            Diagnostic Services
          </Typography>
          <Typography variant="body1" paragraph>
            Welleazy offers seamless access to a range of diagnostic tests including blood work, radiology scans, and full body check-ups through its network of accredited laboratory partners.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Labs are NABL/NABH certified for highest quality and safety standards." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Reports are directly uploaded to user's secure digital health records." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Users are informed of any critical or abnormal findings promptly." />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section8',
      title: 'Termination & Dispute Resolution',
      icon: <GavelIcon />,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Account Termination
          </Typography>
          <Typography variant="body1" paragraph>
            Welleazy reserves the right to terminate/refuse/cancel any account in cases:
          </Typography>
          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="User breaches any terms and conditions." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Welleazy is unable to verify or authenticate any information." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="User's actions may cause legal liability or are contrary to the interests of the Service." />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            Dispute Resolution
          </Typography>
          <Typography variant="body1" paragraph>
            Most user concerns can be resolved quickly by emailing Welleazy support at hello@welleazy.com.
          </Typography>
          <Typography variant="body1" paragraph sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), p: 2, borderRadius: 1 }}>
            In the unlikely event that our support team is unable to resolve a complaint, we each agree to resolve those disputes through arbitration and in accordance with the Arbitration and Conciliation Act, 1996.
          </Typography>
          <Typography variant="body1">
            The place of arbitration shall be at Bangalore. The award of the arbitrator shall be final and conclusive and binding upon the Parties.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section9',
      title: 'Contact Information',
      icon: <ContactSupportIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            For any questions, concerns, or suggestions regarding these Terms of Service, please contact us:
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Welleazy Healthtech Solutions Private Limited
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <ContactSupportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary={
                    <Link href="mailto:hello@welleazy.com" color="primary">
                      hello@welleazy.com
                    </Link>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <ContactSupportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone"
                  secondary={
                    <Link href="tel:+918884000687" color="primary">
                      +91-88840 00687
                    </Link>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <ContactSupportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Website"
                  secondary={
                    <Link href="https://www.welleazy.com" target="_blank" rel="noopener noreferrer" color="primary">
                      www.welleazy.com
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="body2" color="text.secondary">
            Last Updated: {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Container sx={{ py: 4 }} style={{marginTop:'-100px'}}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('login')}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}
          >
            Terms of Service
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ color: 'text.secondary', mb: 3 }}
          >
            General Terms And Conditions Of Service
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            This agreement governs your use of Welleazy services. By accessing our platform, you agree to be bound by these terms and conditions.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            The Url: www.welleazy.com ("Website/Site") and its mobile application ("App") is owned by the legal entity 'Welleazy Healthtech Solutions Private Limited'. The terms and conditions of engagement with Welleazy as per these general terms and conditions of service will apply in all cases where You register / avail services from Welleazy and even if You are a guest and not a registered user of the Website/App.
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            This agreement supersedes all previous oral and written terms and conditions (if any) communicated to You relating to Your use of the Website/App to avail the services.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Accordion Sections */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
            Detailed Terms & Conditions
          </Typography>
          
          {sections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expanded === section.id}
              onChange={() => handleAccordionChange(section.id)}
              sx={{
                mb: 2,
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: expanded === section.id ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  borderRadius: '8px',
                  minHeight: 64,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'primary.main' }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {section.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                {section.content}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Important Notice */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            borderLeft: `4px solid ${theme.palette.warning.main}`,
            borderRadius: 2,
            mb: 4
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.dark' }}>
            Important Notice
          </Typography>
          <Typography variant="body1">
            By using Welleazy services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
          </Typography>
        </Paper>

        {/* Quick Links */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
         
       
          <Button
            variant="contained"
            onClick={() => window.scrollTo(0, 0)}
            size="large"
          >
            Back to Top
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;