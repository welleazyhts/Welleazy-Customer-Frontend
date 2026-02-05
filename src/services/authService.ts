import { api } from './api';

export const authService = {
    login: async (formData: { UserName: string; Password: string }) => {
        try {
            console.log("Sending Login Payload:", {
                email: formData.UserName,
                password: formData.Password
            });

            const response = await api.post('/api/accounts/password-login/', {
                email: formData.UserName,
                password: formData.Password
            });

            const data: any = response.data;

            // Map new API structure to legacy expected fields
            const displayName = data.DisplayName || data.user?.name || "";
            const employeeRefId = data.EmployeeRefId || data.user?.id || "";

            // Store in localStorage
            localStorage.setItem("LoginRefId", data.LoginRefId || "");
            localStorage.setItem("EmployeeRefId", employeeRefId.toString());
            localStorage.setItem("CorporateId", data.CorporateId || "");
            localStorage.setItem("DisplayName", displayName);
            localStorage.setItem("LoginType", data.LoginType || "");
            localStorage.setItem("MemberId", data.MemberId || "");
            localStorage.setItem("DistrictId", data.DistrictId || "");
            localStorage.setItem("BranchId", data.BranchId || "");
            localStorage.setItem("RoleID", data.RoleId || "");
            localStorage.setItem("CartUniqueId", data.CartUniqueId || "0");

            if (data.access) {
                localStorage.setItem("token", data.access);
                localStorage.setItem("refreshToken", data.refresh);
            }

            // Return merged data to ensure frontend checks pass (e.g. response.DisplayName)
            return {
                ...data,
                DisplayName: displayName,
                EmployeeRefId: employeeRefId
            };
        } catch (error: any) {
            console.error("Login failed:", error);
            // Throwing error allows the component to handle specific UI feedback
            throw error.response?.data || error.message || "Login failed";
        }
    },

    register: async (formData: any) => {
        try {
            const response = await api.post('/api/accounts/register/', formData);
            return response.data;
        } catch (error: any) {
            console.error("Registration failed:", error);
            throw error.response?.data || error.message || "Registration failed";
        }
    }
};
