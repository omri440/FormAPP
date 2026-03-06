export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface FormField {
  id: number;
  label: string;
  fieldType: FieldType;
  isRequired: boolean;
  order: number;
  options?: string; // JSON array string — only for select type
}

export interface AppForm {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  fields: FormField[];
}

export interface CreateFormRequest {
  title: string;
  description: string;
  fields: {
    label: string;
    fieldType: FieldType;
    isRequired: boolean;
    order: number;
    options?: string;
  }[];
}
