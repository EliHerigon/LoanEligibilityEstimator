export type CreditTier = "Excellent" | "Good" | "Fair" | "Poor";

// Request and Response models for loan estimate API
export interface EstimateRequest {
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
}

// Response model for loan estimate API
export interface EstimateResponse {
  monthlyIncome: number;
  monthlyPayment: number;
  dtiPercent: number;
  creditTier: CreditTier;
  decision: "Eligible" | "Maybe" | "NotYet";
  reasons: string[];
  tips: string[];
}
