export enum ServiceCategory {
  MARKETING = "Маркетинг",
  TRAINING = "Корпоративное обучение",
  ACCOUNTING = "Бухгалтерские услуги",
}

export interface Solution {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  value: string;
  isRecommended?: boolean;
  isConfirmed?: boolean;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  region: string;
  tasks: string[];
  contacts: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface AppState {
  profile: CompanyProfile;
  messages: Message[];
  recommendedSolutions: Solution[];
  isTyping: boolean;
  currentStep: number;
}
