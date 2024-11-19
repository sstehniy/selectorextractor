/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, AlertCircle, Check } from "lucide-react";

type CopiableFieldProps = {
  label: string;
  value: string;
  fieldId: string;
  htmlInput?: string;
  validate?: boolean;
  extractMethod?: "textContent" | "innerHTML" | "innerText";
  selector: string;
  regexUse?: "extract" | "omit";
  regexMatchIndex?: number;
};

export const CopiableField = ({
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
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [extractedValue, setExtractedValue] = useState<string | null>(null);

  useEffect(() => {
    if (validate && htmlInput && value) {
      try {
        if (label === "Selector") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlInput, "text/html");
          if (!value) {
            setIsValid(false);
            setExtractedValue(null);
            return;
          }
          const elements = doc.querySelectorAll(value);
          const found = elements.length > 0;
          setIsValid(found);

          if (found) {
            let extractedContent = "";
            switch (extractMethod) {
              case "innerHTML":
                extractedContent = elements[0].innerHTML;
                break;
              case "innerText":
                // @ts-ignore
                extractedContent = elements[0].innerText;
                break;
              case "textContent":
              default:
                extractedContent = elements[0].textContent || "";
                break;
            }
            setExtractedValue(extractedContent.trim());
          }
        } else if (label === "Regex") {
          console.log("Regex:", value);
          const parser = new DOMParser();

          const doc = parser.parseFromString(htmlInput, "text/html");
          if (!selector) {
            setIsValid(false);
            setExtractedValue(null);
            return;
          }
          const selectorElement = doc.querySelector(selector);
          if (selectorElement) {
            let content = "";
            switch (extractMethod) {
              case "innerHTML":
                content = selectorElement.innerHTML;
                break;
              case "innerText":
                // @ts-ignore
                content = selectorElement.innerText;
                break;
              case "textContent":
              default:
                content = selectorElement.textContent || "";
                break;
            }
            // 1. Trim whitespace from start and end
            // 2. Replace multiple whitespace characters with a single space
            // 3. Replace HTML non-breaking space entities with regular spaces
            content = content
              .trim()
              .replace(/\s+/g, " ")
              .replace(/&nbsp;/g, " ");
            const regex = new RegExp(value);

            if (regexUse === "extract") {
              const match = content.match(regex);
              // log all matches
              console.log("Matches:", match, content);
              if (match) {
                setIsValid(true);
                const extractedMatch = match[regexMatchIndex] || match[0];
                setExtractedValue(extractedMatch.trim());
              } else {
                setIsValid(false);
                setExtractedValue(null);
              }
            } else {
              console.log("Omitting:", content);
              const cleanContent = content.replace(regex, "").trim();
              if (cleanContent !== content) {
                setIsValid(true);
                setExtractedValue(cleanContent);
              } else {
                setIsValid(false);
                setExtractedValue(null);
              }
            }
          } else {
            setIsValid(false);
            setExtractedValue(null);
          }
        }
      } catch (error) {
        console.error("Error validating field:", value, error);
        setIsValid(false);
        setExtractedValue(null);
      }
    }
  }, [
    value,
    htmlInput,
    label,
    validate,
    extractMethod,
    regexUse,
    regexMatchIndex,
  ]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 items-center relative group">
        <span className="text-muted-foreground">{label}:</span>
        <code
          className={`col-span-2 bg-muted px-2 py-1 rounded-sm text-sm font-medium flex items-center justify-between relative border-2 ${
            isValid === false
              ? "border-red-300"
              : isValid === true
                ? "border-green-300"
                : "border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {isValid === false && (
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            )}
            {isValid === true && (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            <span className="truncate">{value}</span>
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
        <div className="text-xs text-red-500 pl-[33.333%]">
          {label === "Selector"
            ? "Selector not found in HTML"
            : "Regex doesn't match any content"}
        </div>
      )}

      {isValid === true && extractedValue && (
        <div className="pl-[33.333%] text-sm">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-xs text-green-700 mb-1">Extracted Value:</div>
            <div className="text-green-900 break-words">{extractedValue}</div>
          </div>
        </div>
      )}
    </div>
  );
};

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
