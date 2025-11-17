// Form field configuration from API

export type FormFieldValue = string | number | boolean;
export type ActionFormData = Record<string, FormFieldValue>;
export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  required?: boolean;
  step?: string;
  rows?: number;
  options?: { value: string; label: string }[];
}

// API response for action configuration
export interface ActionConfig {
  id: string;
  name: string;
  title: string;
  fields: FormField[];
  credentialType?: "email" | "solana";
}

// Generic action metadata (what gets saved)
export interface ActionMetadata {
  type: string;
  data: ActionFormData;
}
