export interface ErrorFieldMessage {
  code: string;
  field: string;
}

export interface ErrorFieldsMessage {
  code: string;
  fields: ErrorFieldMessage[];
}
