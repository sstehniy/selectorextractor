import { useCallback, useEffect, useState } from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockFilename,
  CodeBlockSelect,
  CodeBlockSelectTrigger,
  CodeBlockSelectItem,
  CodeBlockSelectValue,
  CodeBlockSelectContent,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockBody,
  type CodeBlockContentProps,
} from "@/components/ui/shadcn-io/code-block";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export const CodeBlockComponent = ({
  javaScriptFunction,
  typeScriptFunction,
  pythonFunction,
  goFunction,
  fieldName,
  htmlInput,
}: {
  javaScriptFunction: string;
  typeScriptFunction: string;
  pythonFunction: string;
  goFunction: string;
  fieldName: string;
  htmlInput: string;
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(true);
  const [extractedValue, setExtractedValue] = useState<string | null>(null);
  const [extractedValueExpanded, setExtractedValueExpanded] =
    useState<boolean>(false);

  const handleToggleExpanded = () => {
    setExtractedValueExpanded(!extractedValueExpanded);
  };

  const code: {
    language: CodeBlockContentProps["language"];
    filename: string;
    code: string;
  }[] = useMemo(() => {
    const formattedFieldName = fieldName.replace(/ /g, "-");
    const config = [];
    if (javaScriptFunction) {
      config.push({
        language: "javascript" as const,
        filename: `extract-${formattedFieldName}.js`,
        code: javaScriptFunction,
      });
    }
    if (typeScriptFunction) {
      config.push({
        language: "typescript" as const,
        filename: `extract-${formattedFieldName}.ts`,
        code: typeScriptFunction,
      });
    }
    if (pythonFunction) {
      config.push({
        language: "python" as const,
        filename: `extract-${formattedFieldName}.py`,
        code: pythonFunction,
      });
    }
    if (goFunction) {
      config.push({
        language: "go" as const,
        filename: `extract-${fieldName}.go`,
        code: goFunction,
      });
    }
    return config;
  }, [
    javaScriptFunction,
    typeScriptFunction,
    pythonFunction,
    goFunction,
    fieldName,
  ]);

  const setValidationResult = (
    validStatus: boolean | null,
    val: string | null,
  ) => {
    setIsValid(validStatus);
    setExtractedValue(val ? val.trim() : null);
  };
  const validateJavascriptFunction = useCallback(() => {
    try {
      const doc = new DOMParser().parseFromString(htmlInput, "text/html");

      const funcMatch = javaScriptFunction.match(
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
    } catch (error) {
      console.error("Error validating field:", javaScriptFunction, error);
      setValidationResult(false, null);
    }
  }, [javaScriptFunction, htmlInput]);

  useEffect(() => {
    validateJavascriptFunction();
  }, [validateJavascriptFunction]);

  if (code.length === 0) {
    return null;
  }

  return (
    <>
      <CodeBlock defaultValue={code[0].language}>
        <CodeBlockHeader>
          {code.map((item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          ))}
          <CodeBlockSelect>
            <CodeBlockSelectTrigger>
              <CodeBlockSelectValue />
            </CodeBlockSelectTrigger>
            <CodeBlockSelectContent>
              {code.map((item) => (
                <CodeBlockSelectItem
                  key={item.language}
                  value={item.language || ""}
                >
                  {item.language}
                </CodeBlockSelectItem>
              ))}
            </CodeBlockSelectContent>
          </CodeBlockSelect>
        </CodeBlockHeader>
        {code.map((item) => (
          <CodeBlockBody
            key={item.language}
            value={item.language || ""}
            className="relative"
          >
            <CodeBlockContent
              language={item.language}
              themes={{
                light: "github-light",
                dark: "github-dark",
              }}
            >
              {item.code}
            </CodeBlockContent>
            <CodeBlockCopyButton
              className="absolute top-2 right-2"
              onCopy={() => {
                navigator.clipboard.writeText(item.code);
              }}
            />
          </CodeBlockBody>
        ))}
      </CodeBlock>
      {isValid === false && (
        <div className="text-xs text-error-500 pl-[20%]">
          Code failed or returned null
        </div>
      )}

      {isValid === null && (
        <div className="text-xs text-yellow-600 pl-[20%]">
          Cannot validate code
        </div>
      )}

      {isValid === true && extractedValue && (
        <div className="text-sm">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-xs text-green-700 mb-1">Extracted Value:</div>
            <div className="flex flex-col items-end">
              <div
                className={cn(
                  "text-green-900 break-all overflow-hidden w-full min-w-0",
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
                    className="mt-1 text-xs bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-medium px-2 py-1 rounded transition-colors shadow-sm border border-blue-200"
                  >
                    {extractedValueExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
