"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResultComponentSkeleton } from "@/components/ResultComponentSkeleton";
import type {
  Attachment,
  ExtractionResult,
  Field,
  VersionedExtractionResult,
} from "@/types";
import { Option } from "@/lib/modelSelectConfig";
import { Form } from "@/components/Form";
import { ResultsList } from "@/components/ResultsList";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { extract, FieldForAPI } from "@/app/actions";

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
    mutationFn: extract,
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

export function AppClient() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { data: versionedExtractionResults } = useExtractionResults();
  const extractMutation = useExtractMutation();
  const handleExtract = async (
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

  const sortedVersionedExtractionResults = useMemo(() => {
    return versionedExtractionResults?.sort((a, b) => b.version - a.version);
  }, [versionedExtractionResults]);

  return (
    <>
      {/* Sidebar */}
      <div className="relative pb-10 w-full lg:w-[28rem] xl:w-[32rem] 2xl:w-[36rem] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700 p-4 lg:p-6 overflow-y-auto flex-shrink-0">
        <div className="sticky top-0 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-center lg:text-left text-default-font dark:text-neutral-50">
              AI Scrape Assistant
            </h1>
            <ThemeToggle />
          </div>
        </div>

        <Form
          onSubmit={handleSubmit}
          errors={errors}
          isLoading={extractMutation.isPending}
        />
        {/* Fixed Footer */}
        <footer className="absolute bottom-1 w-full left-1/2 -translate-x-1/2 flex-shrink-0 mt-4 text-center text-sm text-subtext-color dark:text-neutral-400">
          <p className="nowrap">
            © 2025 AI Scrape Assistant. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-brand-primary bg-neutral-100 container max-w-full overflow-y-auto min-h-0">
        <div className=" flex-1 flex flex-col p-4 lg:p-6 py-0 lg:py-0 mx-auto w-full min-h-0">
          <div className="flex-1 ">
            <div className="h-6"></div>
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
              versionedExtractionResults={
                sortedVersionedExtractionResults || []
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
