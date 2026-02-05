
const API_URL = "";

export const loginAPI = {
  login: async (formData: { UserName: string; Password: string }) => {
    try {
      console.log("Sending Login Payload:", {
        email: formData.UserName,
        password: formData.Password
      });

      const response = await fetch(`${API_URL}/api/accounts/password-login/`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.UserName,
          password: formData.Password
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error Text:", errorText);
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        console.error("Parsed Error Data:", errorData);
        throw new Error(errorData.detail || errorData.message || "Network response was not ok");
      }
      const data = await response.json();

      localStorage.setItem("LoginRefId", data.LoginRefId || "");
      localStorage.setItem("EmployeeRefId", data.EmployeeRefId || "");
      localStorage.setItem("CorporateId", data.CorporateId || "");
      localStorage.setItem("DisplayName", data.DisplayName || "");
      localStorage.setItem("LoginType", data.LoginType || "");
      localStorage.setItem("MemberId", data.MemberId || "");
      localStorage.setItem("DistrictId", data.DistrictId || "");
      localStorage.setItem("BranchId", data.BranchId || "");
      localStorage.setItem("RoleID", data.RoleId || "");
      localStorage.setItem("CartUniqueId", data.CartUniqueId || "0");
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  },



};
