import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

import { useAuth } from "../../context/AuthContext";
import "./login.css";
import { MangeProfileApi } from "../../api/MangeProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faCalendarCheck,
  faVideo,
  faStethoscope,
  faShieldAlt,
  faCheckCircle,
  faHeartbeat,
  faClock,
  faMobileAlt,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";

interface LoginFormInputs {
  email: string;
  password: string;
  agree: boolean;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormInputs>();

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const checkProfileCompletion = async (employeeRefId: number) => {
    try {
      const profileData = await MangeProfileApi.CRMLoadCustomerProfileDetails(employeeRefId);
      const needsCompletion = !profileData.PersonalEmailid ||
        profileData.PersonalEmailid.trim() === "";
      localStorage.setItem("needsProfileCompletion", needsCompletion.toString());
      return needsCompletion;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  };

  const onSubmit = async () => {
    const data = getValues();

    if (!data.agree) {
      toast.warn("Please agree to Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        UserName: data.email,
        Password: data.password,
      };

      const response = await authService.login(payload);

      // Check if response is valid
      if (!response || !response.DisplayName) {
        toast.error("Invalid credentials");
        return;
      }

      // Check if profile needs completion
      const needsProfileCompletion = await checkProfileCompletion(response.EmployeeRefId);

      // Call context login method with additional info
      const loginData = {
        ...response,
        needsProfileCompletion,
      };
      login(loginData);

      // Show success toast
      toast.success(`Welcome ${response.DisplayName}!`);
      if (needsProfileCompletion) {
        navigate("/welcome");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FontAwesomeIcon icon={faVideo} color="white" />, text: "Instant Teleconsultation" },
    { icon: <FontAwesomeIcon icon={faCalendarCheck} color="white" />, text: "Easy Appointment Booking" },
    { icon: <FontAwesomeIcon icon={faUserMd} color="white" />, text: "Expert Medical Specialists" },
    { icon: <FontAwesomeIcon icon={faClock} color="white" />, text: "24/7 Healthcare Access" },
    { icon: <FontAwesomeIcon icon={faMobileAlt} color="white" />, text: "Mobile-Friendly Platform" },
    { icon: <FontAwesomeIcon icon={faShieldAlt} color="white" />, text: "Secure & Private" }
  ];

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left side - Healthcare Information */}
        <div className="login-left">
          <div className="healthcare-content">
            <div className="healthcare-header">
              <div className="brand-logo">
                <FontAwesomeIcon icon={faHeartbeat} className="logo-icon" />
                <h1 className="healthcare-title">
                  Welleazy
                </h1>
              </div>
              <p className="healthcare-tagline">Your Digital Healthcare Partner</p>
            </div>

            <div className="features-section">
              <h3 className="section-title" style={{ color: 'white' }}>
                <FontAwesomeIcon icon={faStethoscope} color="white" />
                Book Teleconsultation & Appointments
              </h3>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>


            <div className="stats-section">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Successful Consultations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Expert Doctors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Service Available</div>
              </div>
            </div>


          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2 className="login-subtitle">Welcome Back</h2>
              <h1 className="login-title">Login to Your Account</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Email */}
              <div className="form-group">
                <label className="form-label"> Email</label>
                <input
                  type="text"
                  placeholder="Enter your corporate email"
                  {...register("email", {
                    required: "Email is required",

                  })}
                  className={`form-input ${errors.email ? "error-border" : ""}`}
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`form-input ${errors.password ? "error-border" : ""}`}
                />
                {errors.password && (
                  <p className="error-text">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              {/* <div className="forgot-password">
                <a href="/forgot-password" className="forgot-link">
                  Forgot Password?
                </a>
              </div> */}

              {/* Agreement */}
              <div className="agreement">
                <label className="checkbox-container">
                  <input type="checkbox" {...register("agree")} />
                  <span className="checkmark"></span>
                  <span className="agreement-text">
                    I agree to Welleazy's{" "}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit button */}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span className="loading-text">Logging in...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                    Login
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="register-link">
                Don't have an account?{" "}
                <a href="/register" className="register-cta">
                  Register here
                </a>
              </div>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;