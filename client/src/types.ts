export type FieldType = "text" | "number" | "link" | "image";

export type Field = {
  name: string;
  type: FieldType;
  additionalInfo: string;
  id: string;
};

export type Attachment = {
  id: string;
  content: string;
};

type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
};

type ExtractedSelector = {
  fieldAnalysis: FieldAnalysis;
  type?: FieldType;
  field: string;
  selector: string;
  attributeToGet: string;
  regex: string;
  regexMatchIndexToUse: number;
  extractMethod: "textContent" | "innerHTML" | "innerText";
  regexUse: "extract" | "omit";
  javaScriptFunction: string;
  typeScriptFunction: string;
  pythonFunction: string;
  goFunction: string;
};

type FieldAnalysis = {
  observations: string[];
  selectorsConsidered: string[];
  chosenSelectorRationale: string;
};

export type ExtractionResult = {
  fields: ExtractedSelector[];
  usage: TokenUsage;
  priceInputTokens: number;
  priceOutputTokens: number;
  totalPrice: number;
  model: string;
};

export type VersionedExtractionResult = {
  version: number;
  result: ExtractionResult;
  htmlInput: string;
};
