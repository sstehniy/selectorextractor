"use server";

import { Attachment, ExtractionResult, Field, FieldType } from "@/types";

export type FieldForAPI = {
  name: string;
  type: FieldType;
  additionalInfo: string;
};

type APIResponse = {
  success: boolean;
  data: ExtractionResult;
  error?: {
    code: string;
    message: string;
  };
};

export const extract = async (body: {
  html: string;
  fieldsToExtractSelectorsFor: FieldForAPI[];
  model: string;
  attachments: Attachment[];
  htmlInput: string;
  fields: Field[];
}): Promise<ExtractionResult> => {
  const response = await fetch("http://localhost:1323/api/v1/extract", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as APIResponse;
  if (!data.success) {
    throw new Error(data.error?.message);
  }
  return data.data;
};
