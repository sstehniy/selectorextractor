import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Copy, Plus, Trash2, X } from "lucide-react";
import { PriceIndicator } from "./PriceIndicator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { selectOptions, Option } from "@/lib/modelSelectConfig";
import { memo, useMemo, useState } from "react";
import { Input } from "./ui/input";
import type { Field, Attachment, FieldType } from "@/types";

const FieldItem = memo(
  ({
    field,
    errors,
    removeField,
  }: {
    field: Omit<Field, "name">;
    errors: { [key: string]: string };
    updateField: (
      id: string,
      key: keyof Omit<Field, "id">,
      value: string,
    ) => void;
    removeField: (id: string) => void;
  }) => {
    return (
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            name={`${field.id}-name`}
            placeholder="Name"
            defaultValue={"Title"}
            className="bg-background rounded shadow-sm"
          />
          {errors[`field-${field.id}-name`] && (
            <p className="text-error-500 text-xs mt-1">
              {errors[`field-${field.id}-name`]}
            </p>
          )}
        </div>

        <div>
          <Select name={`${field.id}-type`} defaultValue={field.type}>
            <SelectTrigger className="w-[110px] bg-background rounded shadow-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          name={`${field.id}-additionalInfo`}
          placeholder="Additional Info"
          className="flex-1 bg-background rounded shadow-sm"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeField(field.id)}
          className="shrink-0 hover:bg-primary/10 hover:border-primary transition-colors duration-200"
        >
          <X className="h-4 w-4 hover:text-primary" />
        </Button>
      </div>
    );
  },
);
FieldItem.displayName = "FieldItem";

export const Form = ({
  onSubmit,
  errors,
  isLoading,
}: {
  onSubmit: (
    e: React.FormEvent,
    htmlInput: string,
    attachments: Attachment[],
    fields: Field[],
    model: Option,
  ) => void;
  errors: { [key: string]: string };
  isLoading: boolean;
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedAttachment, setCopiedAttachment] = useState<string | null>(null);
  const [model, setModel] = useState<Option>(selectOptions[0]);
  const [htmlInput, setHtmlInput] = useState("");
  const [fields, setFields] = useState<Omit<Field, "name">[]>([
    { id: "default", type: "text", additionalInfo: "" },
    { id: "213414", type: "number", additionalInfo: "" },
    { id: "4325", type: "image", additionalInfo: "" },
    { id: "432s5", type: "link", additionalInfo: "" },
  ]);

  const handleHtmlInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    if (newInput.length > 5000) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        content: newInput,
      };

      setAttachments((prev) => prev.concat([newAttachment]));
      setHtmlInput("");
    } else {
      setHtmlInput(newInput);
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

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: "",
      type: "text",
      additionalInfo: "",
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (
    id: string,
    key: keyof Omit<Field, "id">,
    value: string,
  ) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const enrichedFields = fields.map((field) => ({
      ...field,
      name: values[`${field.id}-name`] as string,
      type: values[`${field.id}-type`] as FieldType,
      additionalInfo: values[`${field.id}-additionalInfo`] as string,
    }));
    onSubmit(e, htmlInput, attachments, enrichedFields, model);
  };

  const attachmentsMemoToShow = useMemo(() => {
    return attachments.map((attachment) => ({
      ...attachment,
      content: attachment.content.slice(0, 150),
    }));
  }, [attachments]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="html-input" className="block text-sm font-medium">
          HTML Input
        </label>
        <Textarea
          id="html-input"
          value={htmlInput}
          onChange={handleHtmlInputChange}
          placeholder="Paste your HTML here"
          className="min-h-[150px] bg-background rounded shadow-sm"
        />
        {errors.htmlInput && (
          <p className="text-error-500 text-sm mt-1">{errors.htmlInput}</p>
        )}

        {attachmentsMemoToShow.length > 0 && (
          <div className="space-y-2">
            {attachmentsMemoToShow.map((attachment) => (
              <div
                key={attachment.id}
                className="p-3 bg-background border rounded shadow-sm relative group transition-colors duration-200"
              >
                <p className="text-sm  truncate pr-8">
                  {attachment.content}...
                </p>
                {!copiedAttachment && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyAttachment(attachment.id)}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background"
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
        <label className="block text-sm font-medium">Fields to Extract</label>
        {fields.map((field) => (
          <FieldItem
            key={field.id}
            field={field}
            errors={errors}
            updateField={updateField}
            removeField={removeField}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addField}
          className="mt-2 hover:bg-primary/10 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <div className="flex flex-col space-y-2 w-full max-w-md lg:max-w-full mx-auto">
        <div className="relative">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full  duration-300 shadow-md transition-all pr-52 bg-primary rounded"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Extracting...
              </div>
            ) : (
              "Extract"
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
              <SelectTrigger className="h-full bg-white/20 dark:bg-neutral-950 border-0 focus:ring-1 focus:ring-white/30 dark:focus:ring-neutral-300/20 text-white dark:text-neutral-200 font-medium rounded-[6px] hover:bg-white/30 dark:hover:bg-neutral-950/80 transition-colors">
                <SelectValue
                  placeholder="model"
                  className="flex items-center gap-1.5"
                />
              </SelectTrigger>
              <SelectContent className="top-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg">
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
  );
};
