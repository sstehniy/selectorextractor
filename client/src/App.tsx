import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ResultComponentSkeleton } from "./components/ResultComponentSkeleton";
import {
  Attachment,
  ExtractionResult,
  Field,
  FieldType,
  VersionedExtractionResult,
} from "./types";
import { Option } from "./modelSelectConfig";
import { Form } from "./components/Form";
import { ResultsList } from "./components/ResultsList";
import { motion } from "framer-motion";

type FieldForAPI = {
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

// Create a query to hold your collection of results
const useExtractionResults = () => {
  return useQuery<VersionedExtractionResult[]>({
    queryKey: ["extractionResults"],
    queryFn: () => [], // Initialize with empty array
    staleTime: Infinity, // Keep data fresh since we manage it manually
  });
};

const useExtractMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExtractionResult,
    Error,
    {
      html: string;
      fieldsToExtractSelectorsFor: FieldForAPI[];
      model: string;
      attachments: Attachment[];
      htmlInput: string;
      fields: Field[];
    }
  >({
    mutationFn: async (body) => {
      const response = await axios.post<APIResponse>("/api/v1/extract", body);
      return response.data.data;
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<VersionedExtractionResult[]>(
        ["extractionResults"],
        (oldData = []) => {
          const newVersion = oldData.length + 1;
          const allHtmlInput =
            vars.attachments
              .map((attachment) => attachment.content)
              .join("\n") +
            "\n" +
            vars.htmlInput;
          const fieldsWithTypes: VersionedExtractionResult["result"]["fields"] =
            data.fields.map((extractedField) => {
              const field = vars.fields.find(
                (f) => f.name === extractedField.field,
              );
              return {
                ...extractedField,
                type: field?.type,
              } as VersionedExtractionResult["result"]["fields"][number];
            });
          data.fields = fieldsWithTypes;

          const wrappedData: VersionedExtractionResult = {
            version: newVersion,
            result: data,
            htmlInput: allHtmlInput,
          };

          return [...oldData, wrappedData];
        },
      );
    },
  });
};

export const App = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { data: versionedExtractionResults } = useExtractionResults();
  const extractMutation = useExtractMutation();
  const handleExtract = (
    allHtmlInput: string,
    fieldsToExtractSelectorsFor: FieldForAPI[],
    model: Option,
    attachments: Attachment[],
    htmlInput: string,
    fields: Field[],
  ) => {
    if (
      extractMutation.isPending ||
      !allHtmlInput ||
      !fieldsToExtractSelectorsFor.length
    )
      return;
    extractMutation.mutate({
      html: allHtmlInput,
      fieldsToExtractSelectorsFor,
      model: model.value,
      attachments: attachments,
      htmlInput: htmlInput,
      fields: fields,
    });
  };

  const validateForm = (htmlInput: string, fields: Field[]): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!htmlInput.trim() && fields.length === 0) {
      newErrors.htmlInput = "HTML input is required";
    }

    fields.forEach((field) => {
      if (!field.name.trim()) {
        newErrors[`field-${field.id}-name`] = "Field name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (
    e: React.FormEvent,
    htmlInput: string,
    attachments: Attachment[],
    fields: Field[],
    model: Option,
  ) => {
    e.preventDefault();
    if (!validateForm(htmlInput, fields)) return;
    const allHtmlInput = attachments
      .map((attachment) => attachment.content)
      .join("\n");
    const cleanedFields = fields.map(({ id: _, ...field }) => field);

    handleExtract(
      allHtmlInput + "\n" + htmlInput,
      cleanedFields,
      model,
      attachments,
      htmlInput,
      fields,
    );
  };

  const sortedVersionedExtractionResults = versionedExtractionResults?.sort(
    (a, b) => b.version - a.version,
  );

  return (
    <div className="min-h-screen flex flex-col items-center pt-[5%] bg-gradient-to-b from-blue-50 to-purple-100 p-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          AI Scrape Assistant
        </h1>
        <Form
          onSubmit={handleSubmit}
          errors={errors}
          isLoading={extractMutation.isPending}
        />
        <div className="mt-8">
          <h2 className="text-2xl font-medium  mb-4">Extraction Results</h2>

          {extractMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <ResultComponentSkeleton />
            </motion.div>
          )}

          <ResultsList
            versionedExtractionResults={sortedVersionedExtractionResults || []}
          />
        </div>
      </motion.div>

      <footer className="mt-8 text-center  text-sm">
        <p>© 2024 AI Scrape Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};
