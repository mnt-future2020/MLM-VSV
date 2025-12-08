export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "user" | "admin";
  mobile?: string;
  referralId?: string;
  placement?: "LEFT" | "RIGHT";
  isActive?: boolean;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
