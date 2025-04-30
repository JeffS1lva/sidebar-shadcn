// src/features/auth/types/auth.types.ts

export interface UserData {
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

export interface LoginFormProps {
  className?: string;
  onLoginSuccess: (userData: UserData) => void;
}

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export interface ApiResponse {
  data?: {
    token?: string;
    firstName?: string;
    lastName?: string;
    message?: string;
  };
  status: number;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status: number;
  };
  code?: string;
  message: string;
}