/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CopiableFieldProps = {
  label: string;
  value: string;
  fieldId: string;
  htmlInput?: string;
  validate?: boolean;
  extractMethod?: "textContent" | "innerHTML" | "innerText" | "code";
  selector: string;
  regexUse?: "extract" | "omit";
  regexMatchIndex?: number;
};

export const CopiableField = memo(
  ({
    label,
    value,
    fieldId,
    htmlInput,
    validate = false,
    extractMethod = "textContent",
    regexUse = "extract",
    regexMatchIndex = 0,
    selector = "",
  }: CopiableFieldProps) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isValid, setIsValid] = useState<boolean | null>(true);
    const [extractedValue, setExtractedValue] = useState<string | null>(null);
    const [extractedValueExpanded, setExtractedValueExpanded] =
      useState<boolean>(false);

    const handleToggleExpanded = () => {
      setExtractedValueExpanded(!extractedValueExpanded);
    };

    useEffect(() => {
      // Reset state if validation isn't active or required inputs are missing
      if (!validate || !htmlInput) {
        setIsValid(true);
        setExtractedValue(null);
        return;
      }

      // Centralized result setter to update state
      const setValidationResult = (
        validStatus: boolean | null,
        val: string | null,
      ) => {
        setIsValid(validStatus);
        setExtractedValue(val ? val.trim() : null);
      };

      // Helper to get content from a DOM element based on the extract method
      const getContentFromElement = (
        element: Element,
        method: "textContent" | "innerHTML" | "innerText" | "code",
      ): string => {
        switch (method) {
          case "innerHTML":
            return element.innerHTML;
          case "innerText":
            // @ts-ignore
            return element.innerText || "";
          case "textContent":
          default:
            return element.textContent || "";
        }
      };

      const runValidation = () => {
        try {
          const doc = new DOMParser().parseFromString(htmlInput, "text/html");

          // --- Selector Validation ---
          if (label === "Selector") {
            if (!value) return setValidationResult(false, null);
            try {
              const elements = doc.querySelectorAll(value);
              if (elements.length > 0) {
                const content = getContentFromElement(
                  elements[0],
                  extractMethod,
                );
                setValidationResult(true, content);
              } else {
                setValidationResult(false, null);
              }
            } catch {
              console.warn("Unsupported selector for validation:", value);
              setValidationResult(null, null);
            }
            return;
          }

          // --- Regex Validation ---
          if (label === "Regex") {
            if (!value) return setValidationResult(true, null); // Empty regex is valid
            if (!selector) return setValidationResult(false, null);

            let selectorElement;
            try {
              selectorElement = doc.querySelector(selector);
            } catch {
              console.warn(
                "Unsupported selector for regex validation:",
                selector,
              );
              return setValidationResult(null, null);
            }

            if (selectorElement) {
              let content = getContentFromElement(
                selectorElement,
                extractMethod,
              );
              content = content
                .trim()
                .replace(/\s+/g, " ")
                .replace(/&nbsp;/g, " ");
              const regex = new RegExp(value);

              if (regexUse === "extract") {
                const match = content.match(regex);
                if (match) {
                  const extractedMatch = match[regexMatchIndex] || match[0];
                  setValidationResult(true, extractedMatch);
                } else {
                  setValidationResult(false, null);
                }
              } else {
                // "omit"
                const cleanContent = content.replace(regex, "").trim();
                if (cleanContent !== content) {
                  setValidationResult(true, cleanContent);
                } else {
                  setValidationResult(false, null);
                }
              }
            } else {
              setValidationResult(false, null);
            }
            return;
          }

          // --- JavaScript Validation ---
          if (label === "Code") {
            const funcMatch = value.match(
              /function\s*\([^)]*\)\s*\{([\s\S]*)\}$/,
            );
            if (!funcMatch) throw new Error("Invalid function format");

            const funcBody = funcMatch[1];
            const func = new Function("document", funcBody);
            const result = func(doc);

            if (result !== null && result !== undefined) {
              setValidationResult(true, String(result));
            } else {
              setValidationResult(false, null);
            }
            return;
          }
        } catch (error) {
          console.error("Error validating field:", value, error);
          setValidationResult(false, null);
        }
      };

      runValidation();
    }, [
      value,
      htmlInput,
      label,
      validate,
      extractMethod,
      regexUse,
      regexMatchIndex,
      selector,
    ]);

    const copyToClipboard = (text: string, field: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      });
    };

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-10 items-start relative group">
          <span className="pt-2 col-span-2 font-semibold">{label}:</span>
          <code
            className={cn(
              "col-span-8 bg-muted px-2 py-1 rounded text-sm font-medium flex items-center justify-between relative border-2",
              {
                "border-red-300": isValid === false,
                "border-green-300": isValid === true,
                "border-yellow-300": isValid === null,
                "border-gray-300":
                  typeof isValid !== "boolean" && isValid !== null,
              },
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {isValid === false && (
                <AlertCircle className="h-4 w-4 text-error-500 flex-shrink-0" />
              )}
              {isValid === true && (
                <Check className="h-4 w-4 text-success-500 flex-shrink-0" />
              )}
              {isValid === null && (
                <AlertCircle className="h-4 w-4 text-warning-500 flex-shrink-0" />
              )}
              <span className="">{value}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-100 transition-opacity p-0 h-6 w-6"
                onClick={() => copyToClipboard(value, fieldId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copiedField === fieldId && (
              <span className="absolute right-1 top-1 text-xs bg-background px-2 py-1 rounded shadow">
                Copied!
              </span>
            )}
          </code>
        </div>

        {isValid === false && (
          <div className="text-xs text-error-500 pl-[20%]">
            {label === "Selector"
              ? "Selector not found in HTML"
              : "Regex doesn't match any content"}
          </div>
        )}

        {isValid === null && (
          <div className="text-xs text-yellow-600 pl-[20%]">
            {label === "Selector"
              ? "Cannot validate selector (uses unsupported pseudo-classes)"
              : label === "Regex"
                ? "Cannot validate regex (selector uses unsupported pseudo-classes)"
                : ""}
          </div>
        )}

        {isValid === true && extractedValue && (
          <div className="pl-[20%] text-sm">
            <div className="bg-green-100 border border-green-200 rounded p-2">
              <div className="text-green-700 mb-1">Extracted Value:</div>
              <div className="flex flex-col items-end">
                <div
                  className={cn(
                    "text-green-900 break-words w-full font-mono font-semibold",
                    {
                      "line-clamp-5":
                        !extractedValueExpanded && extractedValue.length > 100,
                      "max-h-none": extractedValueExpanded,
                    },
                  )}
                >
                  {extractedValue}
                </div>
                <div>
                  {extractedValue.length > 100 && (
                    <button
                      onClick={handleToggleExpanded}
                      className="mt-1 text-xs bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-medium px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-200"
                    >
                      {extractedValueExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

CopiableField.displayName = "CopiableField";

type CopiableSelectorProps = {
  selector: string;
  fieldName: string;
  index: number;
};

export const CopiableSelector = ({
  selector,
  fieldName,
  index,
}: CopiableSelectorProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="relative">
      <code className="block text-xs bg-muted p-2 rounded border-gray-300 border-2">
        {selector}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 opacity-100 transition-opacity p-0 h-[24px] w-[24px]"
        onClick={() =>
          copyToClipboard(selector, `selector-${fieldName}-${index}`)
        }
        aria-label={`Copy selector ${selector}`}
      >
        <Copy className="h-4 w-4" />
      </Button>
      {copiedField === `selector-${fieldName}-${index}` && (
        <span className="absolute right-1 top-1 text-xs bg-background px-2 py-1 rounded shadow">
          Copied!
        </span>
      )}
    </div>
  );
};
