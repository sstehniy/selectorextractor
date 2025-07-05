"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  DollarSign,
  Eye,
  List,
  Microscope,
  FileText,
} from "lucide-react";
import { CopiableField, CopiableSelector } from "./CopiableFieldComponents";
import type { VersionedExtractionResult } from "@/types";
import { selectOptions, Option } from "@/lib/modelSelectConfig";
import { CodeBlockComponent } from "./CodeBlock";

type ResultComponentProps = {
  versionedResult: VersionedExtractionResult;
};

export const ResultComponent = ({ versionedResult }: ResultComponentProps) => {
  const model = versionedResult.result.model;
  const mapModel = selectOptions.find((m) => m.value === model) as Option;

  const getElementHtml = (selector: string, htmlInput: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");
    if (!selector) {
      return "No selector provided";
    }
    try {
      const element = doc.querySelector(selector);
      return element ? element.outerHTML : "No HTML content found";
    } catch {
      return `Unsupported selector: ${selector}`;
    }
  };

  const extractImageSrc = (
    selector: string,
    htmlInput: string,
  ): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");
    if (!selector) return null;

    try {
      const element = doc.querySelector(selector) as HTMLImageElement;
      if (element && element.tagName.toLowerCase() === "img") {
        return element.src || element.getAttribute("src");
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <Card className="w-full border-2" style={{ borderColor: mapModel.color }}>
      <div className="relative">
        <CardHeader className="pb-6 sticky top-0 bg-background/10 backdrop-blur-md rounded z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-col">
              <CardTitle className="text-primary">
                <span>Version {versionedResult.version}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Extracted {versionedResult.result.fields.length} fields
              </p>
            </div>
            <Badge
              variant="secondary"
              className="px-3 py-1.5 flex items-center gap-2 rounded border-2 text-primary text-sm font-medium"
              style={{ borderColor: mapModel.color }}
            >
              {mapModel.icon}
              {mapModel.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {versionedResult.result.fields.map((field, index) => {
            const fieldType = field.type?.toUpperCase() || "TEXT";
            const imageSrc =
              fieldType === "IMAGE"
                ? extractImageSrc(field.selector, versionedResult.htmlInput)
                : null;
            const hasCode =
              field.javaScriptFunction ||
              field.typeScriptFunction ||
              field.pythonFunction ||
              field.goFunction;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-primary">
                    {field.field}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-primary text-primary rounded"
                  >
                    {fieldType}
                  </Badge>
                </div>

                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  defaultValue={["result"]}
                >
                  <AccordionItem value="analysis" className="border rounded">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline [&[data-state=open]>div]:text-primary">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-4 w-4" />
                        Field Analysis
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <List className="h-4 w-4" />
                            Observations
                          </div>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {field.fieldAnalysis?.observations?.map(
                              (obs, i) => <li key={i}>{obs}</li>,
                            ) || <li>No observations</li>}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <Code className="h-4 w-4" />
                            Selectors Considered
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
                            {field.fieldAnalysis.selectorsConsidered?.map(
                              (selector, i) => (
                                <CopiableSelector
                                  key={i}
                                  selector={selector}
                                  fieldName={field.field}
                                  index={i}
                                />
                              ),
                            ) || (
                              <li className="text-muted-foreground">
                                No additional selectors considered
                              </li>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="result" className="border rounded">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline [&[data-state=open]>div]:text-primary">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Result
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <div className="grid gap-2 text-sm max-w-full">
                        {field.selector && (
                          <CopiableField
                            label="Selector"
                            value={field.selector}
                            fieldId={`selector-${field.field}`}
                            htmlInput={versionedResult.htmlInput}
                            validate={true}
                            extractMethod={field.extractMethod}
                            selector={field.selector}
                          />
                        )}

                        {field.attributeToGet && (
                          <CopiableField
                            label="Attribute"
                            value={field.attributeToGet}
                            fieldId={`attribute-${field.field}`}
                            htmlInput={versionedResult.htmlInput}
                            validate={false}
                            selector={field.selector}
                          />
                        )}

                        {field.regex && (
                          <CopiableField
                            label="Regex"
                            value={field.regex}
                            fieldId={`regex-${field.field}`}
                            htmlInput={versionedResult.htmlInput}
                            validate={true}
                            regexUse={field.regexUse}
                            regexMatchIndex={field.regexMatchIndexToUse}
                            selector={field.selector}
                          />
                        )}

                        {hasCode && (
                          <CodeBlockComponent
                            javaScriptFunction={field.javaScriptFunction}
                            typeScriptFunction={field.typeScriptFunction}
                            pythonFunction={field.pythonFunction}
                            goFunction={field.goFunction}
                            fieldName={field.field.toLowerCase()}
                            htmlInput={versionedResult.htmlInput}
                          />
                        )}

                        {fieldType === "IMAGE" && field.selector && (
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Extracted Image
                            </label>
                            {imageSrc ? (
                              <div className="border rounded overflow-hidden flex flex-col items-center">
                                <img
                                  src={imageSrc}
                                  alt={`Extracted image for ${field.field}`}
                                  className="max-w-full h-auto max-h-64 object-contain"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                    (
                                      e.target as HTMLImageElement
                                    ).nextElementSibling?.classList.remove(
                                      "hidden",
                                    );
                                  }}
                                />
                                <div className="hidden p-4 text-center text-muted-foreground text-sm">
                                  Failed to load image: {imageSrc}
                                </div>
                              </div>
                            ) : (
                              <div className="border rounded p-4 text-center text-muted-foreground text-sm">
                                No image found with the current selector
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="raw-html" className="border rounded">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline [&[data-state=open]>div]:text-primary">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Raw HTML
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <div className="text-sm">
                        <pre className="bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                          <code>
                            {getElementHtml(
                              field.selector,
                              versionedResult.htmlInput,
                            )}
                          </code>
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </CardContent>
      </div>
      <CardFooter className="px-0">
        <div className="grid grid-cols-3 gap-4 text-sm w-full justify-items-stretch border-t border-gray-200 pt-6 px-5 md:px-10">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Input
            </p>
            <p className="font-medium">
              {versionedResult.result.usage.input_tokens.toLocaleString()}{" "}
              tokens
            </p>
            <p className="text-xs text-muted-foreground">
              ${versionedResult.result.priceInputTokens.toFixed(6)}
            </p>
          </div>
          <div className="justify-self-center">
            <p className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Output
            </p>
            <p className="font-medium">
              {versionedResult.result.usage.output_tokens.toLocaleString()}{" "}
              tokens
            </p>
            <p className="text-xs text-muted-foreground">
              ${versionedResult.result.priceOutputTokens.toFixed(6)}
            </p>
          </div>
          <div className="justify-self-end">
            <p className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Total
            </p>
            <p className="font-medium">
              ${versionedResult.result.totalPrice.toFixed(6)}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
