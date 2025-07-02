import { useState } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Trash2, Copy } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import ResultComponent from "./components/ResultComponent";
import ResultComponentSkeleton from "./components/ResultComponentSkeleton";
import { PriceIndicator } from "@/components/PriceIndicator";
import { selectOptions, Option } from "./modelSelectConfig";

type FormData = {
  htmlInput: string;
  fields: Field[];
};

type FieldType = "text" | "number" | "link" | "image";

type Field = {
  name: string;
  type: FieldType;
  additionalInfo: string;
};

type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
};

type ExtractionResult = {
  fields: ExtractedSelector[];
  usage: TokenUsage;
  priceInputTokens: number;
  priceOutputTokens: number;
  totalPrice: number;
  model: string;
};

type APIResponse = {
  success: boolean;
  data: ExtractionResult;
  error?: {
    code: string;
    message: string;
  };
};

type ExtractedSelector = {
  fieldAnalysis: FieldAnalysis;
  field: string;
  selector: string;
  attributeToGet: string;
  regex: string;
  regexMatchIndexToUse: number;
  extractMethod: "textContent" | "innerHTML" | "innerText" | "javascript";
  regexUse: "extract" | "omit";
  javaScriptFunction: string;
};

type FieldAnalysis = {
  observations: string[];
  selectorsConsidered: string[];
  chosenSelectorRationale: string;
};

type Attachment = {
  id: string;
  content: string;
};

export type VersionedExtractionResult = {
  version: number;
  result: ExtractionResult;
  htmlInput: string;
};

export default function Component() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [versionedExtractionResults, setVersionedExtractionResults] = useState<
    VersionedExtractionResult[]
  >([]);
  const [copiedAttachment, setCopiedAttachment] = useState<string | null>(null);
  const [model, setModel] = useState<Option>(selectOptions[0]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      htmlInput: "",
      fields: [{ name: "Title", type: "text", additionalInfo: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const htmlInput = watch("htmlInput");

  const extractMutation = useMutation<
    ExtractionResult,
    Error,
    {
      html: string;
      fieldsToExtractSelectorsFor: Field[];
      model: string;
    }
  >({
    mutationFn: async (body) => {
      const response = await axios.post<APIResponse>("/api/v1/extract", body);
      return response.data.data;
    },
    onSuccess: (data) => {
      const newVersion = versionedExtractionResults.length + 1;
      const allHtmlInput =
        attachments.map((attachment) => attachment.content).join("\n") +
        "\n" +
        htmlInput;

      const wrappedData: VersionedExtractionResult = {
        version: newVersion,
        result: data,
        htmlInput: allHtmlInput,
      };
      setVersionedExtractionResults([
        ...versionedExtractionResults,
        wrappedData,
      ]);
    },
  });

  const handleExtract = (allHtmlInput: string, fields: Field[]) => {
    if (extractMutation.isPending || !allHtmlInput || !fields.length) return;
    extractMutation.mutate({
      html: allHtmlInput,
      fieldsToExtractSelectorsFor: fields,
      model: model.value,
    });
  };

  const handleHtmlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    if (newInput.length > 5000) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        content: newInput,
      };
      setAttachments([...attachments, newAttachment]);
      setValue("htmlInput", "");
    } else {
      setValue("htmlInput", newInput);
    }
  };

  const deleteAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  const copyAttachment = (id: string) => {
    navigator.clipboard.writeText(
      attachments.find((attachment) => attachment.id === id)?.content ?? "",
    );
    setCopiedAttachment(id);
    setTimeout(() => setCopiedAttachment(null), 2000);
  };

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    console.log("Attachments:", attachments);
    const allHtmlInput = attachments
      .map((attachment) => attachment.content)
      .join("\n");
    handleExtract(allHtmlInput + "\n" + data.htmlInput, data.fields);
  };

  const sortedVersionedExtractionResults = versionedExtractionResults.sort(
    (a, b) => b.version - a.version,
  );

  return (
    <div className="min-h-screen flex flex-col items-center pt-[10%] bg-gradient-to-b from-blue-50 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          AI Scrape Assistant
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="html-input" className="block text-sm font-medium">
              HTML Input
            </label>
            <Textarea
              id="html-input"
              {...register("htmlInput", {
                validate: (value) => {
                  if (attachments.length > 0) return true;
                  return value.trim() !== "" || "HTML input is required";
                },
              })}
              value={htmlInput}
              onChange={handleHtmlInputChange}
              placeholder="Paste your HTML here"
              className="min-h-[150px] bg-white  rounded-md shadow-sm"
            />
            {errors.htmlInput && attachments.length === 0 && (
              <p className="text-red-500 text-sm mt-1">
                {errors.htmlInput.message}
              </p>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="p-3 bg-white border  rounded-md shadow-sm relative group  transition-colors duration-200"
                  >
                    <p className="text-sm  truncate pr-8">
                      {attachment.content.slice(0, 150)}...
                    </p>
                    {!copiedAttachment && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => copyAttachment(attachment.id)}
                          className="absolute right-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white"
                        >
                          <Copy className="h-4 w-4  hover:" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAttachment(attachment.id)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200  hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4 " />
                        </Button>
                      </>
                    )}
                    {copiedAttachment === `${attachment.id}` && (
                      <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs bg-background px-2 py-1 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Fields to Extract
            </label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Controller
                  name={`fields.${index}.name`}
                  control={control}
                  rules={{ required: "Field name is required" }}
                  render={({ field: inputField, fieldState }) => (
                    <div className="flex-1">
                      <Input
                        {...inputField}
                        placeholder="Name"
                        className="bg-white  rounded-md shadow-sm"
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name={`fields.${index}.type`}
                  control={control}
                  rules={{ required: "Field type is required" }}
                  render={({ field: selectField, fieldState }) => (
                    <div>
                      <Select
                        {...selectField}
                        onValueChange={selectField.onChange}
                      >
                        <SelectTrigger className="w-[110px] bg-white  rounded-md shadow-sm">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name={`fields.${index}.additionalInfo`}
                  control={control}
                  render={({ field: inputField }) => (
                    <Input
                      {...inputField}
                      placeholder="Additional Info"
                      className="flex-1 bg-white  rounded-md shadow-sm"
                    />
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0 hover:bg-red-50 hover:border-red-500 transition-colors duration-200"
                >
                  <X className="h-4 w-4  hover:text-red-500" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ name: "", type: "text", additionalInfo: "" })
              }
              className="mt-2  hover:bg-blue-50 transition-colors duration-200"
            >
              Add Field
            </Button>
          </div>

          <div className="flex flex-col space-y-2 w-full max-w-md mx-auto">
            <div className="relative">
              <Button
                type="submit"
                disabled={extractMutation.isPending}
                className="w-full  duration-300 shadow-md transition-all pr-52 bg-primary rounded-lg"
              >
                {extractMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing...
                  </div>
                ) : (
                  "Analyze"
                )}
              </Button>
              <div className="absolute right-1 top-1 bottom-1">
                <Select
                  value={model.value}
                  onValueChange={(value) =>
                    setModel(selectOptions.find((o) => o.value === value)!)
                  }
                  defaultValue={selectOptions[0].value}
                >
                  <SelectTrigger className="h-full bg-white/25 border-0 focus:ring-0 text-white font-medium rounded-md">
                    <SelectValue
                      placeholder="model"
                      className="flex items-center gap-1.5"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-1.5">
                          {option.icon}
                          <span>{option.label}</span>
                          <span className="mr-1">
                            <PriceIndicator level={option.priceIndicator} />
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-8">
          {!sortedVersionedExtractionResults.length &&
            extractMutation.isPending && (
              <div className="flex items-center justify-center">
                <ResultComponentSkeleton />
              </div>
            )}
          {sortedVersionedExtractionResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-medium  mb-4">Extraction Results</h2>
              {extractMutation.isPending && (
                <div className="mb-4">
                  <ResultComponentSkeleton />
                </div>
              )}
              {sortedVersionedExtractionResults.map((versionedResult) => (
                <div className="mb-4" key={versionedResult.version}>
                  <ResultComponent
                    versionedResult={versionedResult}
                    fields={fields}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <footer className="mt-8 text-center  text-sm">
        <p>© 2024 AI Scrape Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}
