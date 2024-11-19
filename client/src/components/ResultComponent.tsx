"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { VersionedExtractionResult } from "@/App";
import { Option, selectOptions } from "@/modelSelectConfig";

type Props = {
  versionedResult: VersionedExtractionResult;
  fields: Array<{
    name: string;
    type: string;
  }>;
};

export default function Component({ versionedResult, fields }: Props) {
  const model = versionedResult.result.model;
  const mapModel = selectOptions.find((m) => m.value === model) as Option;

  const getElementHtml = (selector: string, htmlInput: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");
    if (!selector) {
      return "No selector provided";
    }
    const element = doc.querySelector(selector);
    return element ? element.outerHTML : "No HTML content found";
  };

  return (
    <Card
      className="w-full max-w-2xl border-2"
      style={{ borderColor: mapModel.color }}
    >
      <CardHeader className="pb-3">
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
            className="px-3 py-1.5 flex items-center gap-2 rounded-md border-2 text-primary text-sm font-medium"
            style={{ borderColor: mapModel.color }}
          >
            {mapModel.icon}
            {mapModel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {versionedResult.result.fields.map((field, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-primary">
                {field.field}
              </h3>
              <Badge
                variant="outline"
                className="border-primary text-primary rounded-sm"
              >
                {(
                  fields.find((f) => f.name === field.field)?.type || "text"
                ).toUpperCase()}
              </Badge>
            </div>

            <Accordion
              type="multiple"
              className="w-full space-y-2"
              defaultValue={["result"]}
            >
              <AccordionItem value="analysis" className="border rounded-lg">
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
                        {field.fieldAnalysis?.observations?.map((obs, i) => (
                          <li key={i}>{obs}</li>
                        )) || <li>No observations</li>}
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

              <AccordionItem value="result" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline [&[data-state=open]>div]:text-primary">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Result
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  <div className="grid gap-2 text-sm">
                    <CopiableField
                      label="Selector"
                      value={field.selector}
                      fieldId={`selector-${field.field}`}
                      htmlInput={versionedResult.htmlInput}
                      validate={true}
                      extractMethod={field.extractMethod}
                      selector={field.selector}
                    />

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
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="raw-html" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline [&[data-state=open]>div]:text-primary">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Raw HTML
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  <div className="text-sm">
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
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
        ))}

        <div className="border-t pt-3 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Input
              </p>
              <p className="font-medium">
                {versionedResult.result.usage.input_tokens.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ${versionedResult.result.priceInputTokens.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Output</p>
              <p className="font-medium">
                {versionedResult.result.usage.output_tokens.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ${versionedResult.result.priceOutputTokens.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium">
                ${versionedResult.result.totalPrice.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
