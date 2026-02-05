
export interface LoginRequest {
  UserName: string;
  Password: string;
}

export interface User {
  loginRefId: number;
  employeeRefId: number;
  corporateId: number;
  corporateName: string;
  displayName: string;
  userName: string;
  emailId?: string;
  rolePermissions?: string;
  permissionId?: string;
  [key: string]: any; 
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  tokenType: string;
  user: User;
}
