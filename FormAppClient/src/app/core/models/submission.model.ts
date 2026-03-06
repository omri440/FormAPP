export interface FieldAnswer {
  fieldId: number;
  value: string;
}

export interface SubmitFormRequest {
  answers: FieldAnswer[];
}

export interface SubmissionValue {
  fieldId: number;
  fieldLabel: string;
  fieldType: string;
  value: string;
}

export interface Submission {
  id: number;
  formId: number;
  formTitle: string;
  submittedByEmail: string;
  submittedAt: string;
  values: SubmissionValue[];
}
