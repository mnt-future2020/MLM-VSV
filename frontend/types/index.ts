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
  kycStatus?: "PENDING_KYC" | "KYC_SUBMITTED" | "KYC_REJECTED" | "ACTIVE";
  createdAt?: string;
}

export interface KYCForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  idNumber: string;
  bank: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  idProofBase64: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  form: KYCForm;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
