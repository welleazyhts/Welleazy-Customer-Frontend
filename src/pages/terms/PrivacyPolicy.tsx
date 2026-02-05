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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import SecurityIcon from '@mui/icons-material/Security';
import CookieIcon from '@mui/icons-material/Cookie';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

interface PrivacySection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const PrivacyPolicy: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | false>('section1');

  const handleAccordionChange = (section: string) => {
    setExpanded(expanded === section ? false : section);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections: PrivacySection[] = [
    {
      id: 'section1',
      title: 'Introduction & Overview',
      icon: <PrivacyTipIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Welleazy respects Your right to privacy. Welleazy understands that Your personal data is entrusted to us and values the importance of protecting and respecting Your privacy.
          </Typography>
          <Typography variant="body1" paragraph>
            This Privacy Policy sets out the basis on which we collect and process personal data about You including our practices regarding the collection, use, storage and disclosure of personal data that we collect from You and/or hold about You, and Your rights in relation to that data.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', bgcolor: alpha(theme.palette.info.main, 0.1), p: 2, borderRadius: 1 }}>
            By providing Your personal data to us or by using our services, website or other online or digital platform(s) You are agreeing and consenting to the practices as described or referred to in this Privacy Policy.
          </Typography>
          <Typography variant="body1">
            When we refer to 'we', 'us', 'our' and 'Welleazy', it shall mean Welleazy Healthtech Solutions Private Limited.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section2',
      title: 'Collection of Personal Data',
      icon: <DataUsageIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            When we refer to personal data in this policy, we mean information that can or has the potential to identify You as an individual. We collect and process the personal information necessary for us to render and complete any services undertaken by You with Us.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
            Types of Data We Collect
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    Identity Data
                  </TableCell>
                  <TableCell>
                    First name, last name, username, date of birth, gender, language preference
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    Contact Data
                  </TableCell>
                  <TableCell>
                    Address, phone number, email addresses (yours and next of kin)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    Health Data
                  </TableCell>
                  <TableCell>
                    Medical records, treatment history, prescriptions, health conditions
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    Technical Data
                  </TableCell>
                  <TableCell>
                    IP address, browser type, device information, usage data
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    Financial Data
                  </TableCell>
                  <TableCell>
                    Payment information, credit card details, billing information
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            When We Collect Your Data
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="When You register or create an account" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="When You book appointments or use our services" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="When You make online payments" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="When You participate in surveys or promotions" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="When You contact our customer support" />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section3',
      title: 'How We Use Your Data',
      icon: <DataUsageIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            We process Your personal data for various legitimate purposes, including:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="To provide healthcare services and treatment"
                secondary="Medical consultations, diagnosis, prescriptions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="To manage our relationship with You"
                secondary="Customer service, appointment management, billing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="To comply with legal obligations"
                secondary="Regulatory requirements, medical record keeping"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="For research and improvement"
                secondary="Service enhancement, quality assurance, training"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="For marketing (with consent)"
                secondary="Newsletters, promotions, health tips"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 3, fontStyle: 'italic' }}>
            We will only ask for Your consent for processing personal information if there are no other legal grounds to process. In these circumstances, we will always aim to be clear and transparent about why we need Your consent and what we are asking it for.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section4',
      title: 'Data Sharing & Third Parties',
      icon: <SecurityIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            We may share Your personal data with the following categories of recipients:
          </Typography>
          
          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Healthcare Professionals"
                secondary="Doctors, nurses, specialists involved in Your treatment"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Service Providers"
                secondary="IT support, payment processors, cloud storage providers"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Insurance Companies"
                secondary="For claims processing and verification"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Regulatory Authorities"
                secondary="As required by law or for compliance purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Your General Practitioner"
                secondary="For continuity of care (with Your consent)"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ color: 'error.main', fontWeight: 'medium' }}>
            We do not sell Your personal data to third parties for marketing purposes.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section5',
      title: 'Data Security & Storage',
      icon: <ShieldIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            We protect all personal data we hold about You by ensuring that we have appropriate organisational and technical security measures in place to prevent unauthorised access or unlawful processing of personal data.
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Our Security Measures Include:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Encryption of sensitive data in transit and at rest" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Regular security assessments and audits" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Access controls and authentication mechanisms" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Secure data centers with physical security" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Employee training on data protection" />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We retain Your personal data for as long as necessary to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Provide services and treatment to You" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Comply with legal and regulatory requirements" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Handle any potential legal claims" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Maintain business records as required" />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section6',
      title: 'Cookies Policy',
      icon: <CookieIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Our Websites use cookies to distinguish You from other users of our Websites. This helps us to provide You with a good experience when You browse our Websites and also allows us to improve our Websites.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
            Types of Cookies We Use
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Chip label="Essential" color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    Required for website functionality. Cannot be disabled.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Chip label="Performance" color="secondary" size="small" />
                  </TableCell>
                  <TableCell>
                    Help us understand how visitors use our website
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Chip label="Functional" color="info" size="small" />
                  </TableCell>
                  <TableCell>
                    Remember Your preferences and settings
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <Chip label="Analytical" color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    Help us analyze website performance and user behavior
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Cookie Control
          </Typography>
          <Typography variant="body1" paragraph>
            You can control cookies through Your browser settings. Most browsers allow You to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="See what cookies You've got and delete them individually" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Block third party cookies" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Block cookies from particular sites" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Block all cookies from being set" />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            Please note that blocking some types of cookies may impact Your experience on our website and the services we are able to offer.
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section7',
      title: 'Your Rights & Choices',
      icon: <PrivacyTipIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            You have the following rights regarding Your personal data:
          </Typography>

          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Access"
                secondary="You can request a copy of Your personal data we hold"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Correction"
                secondary="You can request correction of inaccurate data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Deletion"
                secondary="You can request deletion of Your data in certain circumstances"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Object"
                secondary="You can object to certain types of processing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Withdraw Consent"
                secondary="You can withdraw consent at any time"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Right to Data Portability"
                secondary="You can request transfer of Your data to another organization"
              />
            </ListItem>
          </List>

          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="warning.main">
              Opt-Out & Consent Withdrawal
            </Typography>
            <Typography variant="body1" paragraph>
              To withdraw Your consent or opt-out of further usage of Your personal information, please contact us at +91-88840 00687 or email Your request to hello@welleazy.com.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Please be aware that there may be implications on our ability to continue providing services if we are not able to process Your personal information.
            </Typography>
          </Paper>
        </Box>
      ),
    },
    {
      id: 'section8',
      title: 'Responsible Disclosure Policy',
      icon: <SecurityIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Welleazy is committed to the safety and security of its systems and services. We encourage responsible reporting of any potential vulnerabilities that may be found in our systems.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
            Reporting Security Vulnerabilities
          </Typography>
          
          <List dense sx={{ mb: 3 }}>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Email security reports to: hello@welleazy.com" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Include detailed description and steps to reproduce" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Provide Your contact information for follow-up" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Prohibited Activities
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Unauthorized data access, deletion, or modification" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Causing service disruptions during testing" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Social engineering or phishing attempts" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WarningAmberIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Physical attempts against Welleazy property" />
            </ListItem>
          </List>
        </Box>
      ),
    },
    {
      id: 'section9',
      title: 'Contact & Support',
      icon: <EmailIcon />,
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            For any questions, concerns, or to exercise Your rights under this Privacy Policy, please contact us:
          </Typography>
          
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Welleazy Healthtech Solutions Private Limited
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <EmailIcon />
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
                  <PhoneIcon />
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
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Security Reports"
                  secondary={
                    <Link href="mailto:hello@welleazy.com" color="primary">
                      hello@welleazy.com
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Grievance Officer
          </Typography>
          <Typography variant="body1" paragraph>
            You may address any discrepancies and grievances pertaining to the information provided by You or with respect to processing of information at:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            Phone: +91-88840 00687
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            Last Updated: {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Version: 2.0
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} style={{ marginTop: '-100px' }}>
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
            Privacy Policy
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ color: 'text.secondary', mb: 3 }}
          >
            Protecting Your Personal Information
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            This Privacy Policy explains how Welleazy collects, uses, stores, and protects Your personal information when You use our services.
          </Typography>
        </Box>

        {/* Important Notice */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            borderLeft: `4px solid ${theme.palette.info.main}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
            Important Notice
          </Typography>
          <Typography variant="body1" paragraph>
            It is stated that any information that You provide to Welleazy is subject to our Privacy Policy which governs our collection and use of Your information. You understand and agree that through the use of the Services You consent to the collection and use (as set forth in the Privacy Policy) of this information, processing and use by Welleazy.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            Please read this Privacy Policy carefully. By using our services, You acknowledge that You have read and understood this policy.
          </Typography>
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Accordion Sections */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
            Privacy Policy Details
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

        {/* Policy Updates */}
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
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
            Policy Updates
          </Typography>
          <Typography variant="body1" paragraph>
            Welleazy reserves the right to update this privacy policy at any time. Updates to our privacy policy will be sent to the email address available with us. We encourage You to review this policy periodically for any changes.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            Your continued use of our services after any changes to this Privacy Policy constitutes Your acceptance of those changes.
          </Typography>
        </Paper>

        {/* Quick Links */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/terms-of-service')}
            size="large"
          >
            Terms of Service
          </Button>
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

export default PrivacyPolicy;