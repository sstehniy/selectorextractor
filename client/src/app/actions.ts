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

export const extract = async (
  body: {
    html: string;
    fieldsToExtractSelectorsFor: FieldForAPI[];
    model: string;
    attachments: Attachment[];
    htmlInput: string;
    fields: Field[];
  },
  apiKey: string,
): Promise<ExtractionResult> => {
  console.log("API key: ", apiKey);
  const response = await fetch(`${process.env.API_URL}/extract`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });
  const data = (await response.json()) as APIResponse;
  if (!data.success) {
    throw new Error(data.error?.message);
  }
  return data.data;
};
