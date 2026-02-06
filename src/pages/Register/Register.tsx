import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import "./Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faPhone,
    faLock,
    faCheckCircle,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

interface RegisterFormInputs {
    name: string;
    email: string;
    mobile_number: string;
    password: string;
    confirm_password: string;
    agree: boolean;
}

const Register: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormInputs>();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const password = watch("password");

    const onSubmit = async (data: RegisterFormInputs) => {
        if (!data.agree) {
            toast.warn("Please agree to Terms of Service and Privacy Policy.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                password: data.password,
                confirm_password: data.confirm_password,
            };

            console.log("Registration payload:", payload);

            // Call the actual registration API
            const response = await authService.register(payload);

            console.log("Registration response:", response);

            toast.success("Registration successful! Please login with your credentials.");

            // Redirect to login page after successful registration
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error: any) {
            console.error("Registration error:", error);

            // Handle different error formats
            let errorMessage = "Registration failed. Please try again.";

            if (error.email) {
                errorMessage = Array.isArray(error.email) ? error.email[0] : error.email;
            } else if (error.mobile_number) {
                errorMessage = Array.isArray(error.mobile_number) ? error.mobile_number[0] : error.mobile_number;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-content">
                    {/* Left Side - Branding */}
                    <div className="register-left">
                        <div className="brand-section">
                            <img
                                src="/welleazy-logo.png"
                                alt="Welleazy Logo"
                                className="brand-logo"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                            <h1 className="brand-title">Welcome to Welleazy</h1>
                            <p className="brand-subtitle">
                                Your Complete Healthcare Solution
                            </p>
                        </div>

                        <div className="features-list">
                            <div className="feature-item">
                                <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
                                <span>24/7 Healthcare Access</span>
                            </div>
                            <div className="feature-item">
                                <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
                                <span>Book Appointments Easily</span>
                            </div>
                            <div className="feature-item">
                                <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
                                <span>Manage Health Records</span>
                            </div>
                            <div className="feature-item">
                                <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
                                <span>Online Pharmacy Services</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="register-right">
                        <div className="register-form-container">
                            <h2 className="form-title">Create Your Account</h2>
                            <p className="form-subtitle">
                                Join Welleazy for better healthcare management
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                                {/* Name Field */}
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">
                                        <FontAwesomeIcon icon={faUser} className="label-icon" />
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        {...register("name", {
                                            required: "Name is required",
                                            minLength: {
                                                value: 3,
                                                message: "Name must be at least 3 characters",
                                            },
                                        })}
                                        className={`form-input ${errors.name ? "error-border" : ""}`}
                                    />
                                    {errors.name && (
                                        <p className="error-text">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        <FontAwesomeIcon icon={faEnvelope} className="label-icon" />
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        className={`form-input ${errors.email ? "error-border" : ""}`}
                                    />
                                    {errors.email && (
                                        <p className="error-text">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Mobile Number Field */}
                                <div className="form-group">
                                    <label htmlFor="mobile_number" className="form-label">
                                        <FontAwesomeIcon icon={faPhone} className="label-icon" />
                                        Mobile Number
                                    </label>
                                    <input
                                        id="mobile_number"
                                        type="tel"
                                        placeholder="Enter your mobile number"
                                        {...register("mobile_number", {
                                            required: "Mobile number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Mobile number must be 10 digits",
                                            },
                                        })}
                                        className={`form-input ${errors.mobile_number ? "error-border" : ""
                                            }`}
                                    />
                                    {errors.mobile_number && (
                                        <p className="error-text">{errors.mobile_number.message}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        <FontAwesomeIcon icon={faLock} className="label-icon" />
                                        Password
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 8,
                                                    message: "Password must be at least 8 characters",
                                                },
                                                pattern: {
                                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                                    message:
                                                        "Password must contain uppercase, lowercase, number and special character",
                                                },
                                            })}
                                            className={`form-input ${errors.password ? "error-border" : ""
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <FontAwesomeIcon
                                                icon={showPassword ? faEyeSlash : faEye}
                                            />
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="error-text">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="form-group">
                                    <label htmlFor="confirm_password" className="form-label">
                                        <FontAwesomeIcon icon={faLock} className="label-icon" />
                                        Confirm Password
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="confirm_password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            {...register("confirm_password", {
                                                required: "Please confirm your password",
                                                validate: (value) =>
                                                    value === password || "Passwords do not match",
                                            })}
                                            className={`form-input ${errors.confirm_password ? "error-border" : ""
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={showConfirmPassword ? faEyeSlash : faEye}
                                            />
                                        </button>
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="error-text">
                                            {errors.confirm_password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Agreement Checkbox */}
                                <div className="agreement">
                                    <label className="checkbox-container">
                                        <input type="checkbox" {...register("agree")} />
                                        <span className="checkmark"></span>
                                        <span className="agreement-text">
                                            I agree to Welleazy's{" "}
                                            <a
                                                href="/terms-and-conditions"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="/privacy-policy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="register-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner"></div>
                                            <span className="loading-text">Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faCheckCircle}
                                                style={{ marginRight: "8px" }}
                                            />
                                            Create Account
                                        </>
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="login-link">
                                    Already have an account?{" "}
                                    <a href="/login" className="login-cta">
                                        Login here
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
