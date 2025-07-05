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
import { memo, useCallback, useEffect, useMemo, useReducer } from "react";
import { Input } from "./ui/input";
import type { Field, Attachment, FieldType } from "@/types";

type FormState = {
  htmlInput: string;
  copiedAttachment: string | null;
  attachments: Attachment[];
  model: Option;
  fields: Field[];
  apiKey: string;
};

type FormAction =
  | {
      type: "UPDATE_HTML_INPUT";
      payload: string;
    }
  | {
      type: "ADD_ATTACHMENT";
      payload: Attachment;
    }
  | {
      type: "DELETE_ATTACHMENT";
      payload: string;
    }
  | {
      type: "UPDATE_MODEL";
      payload: Option;
    }
  | {
      type: "UPDATE_FIELDS";
      payload: Field;
    }
  | {
      type: "ADD_FIELD";
      payload: Field;
    }
  | {
      type: "DELETE_FIELD";
      payload: string;
    }
  | {
      type: "UPDATE_COPIED_ATTACHMENT";
      payload: string | null;
    }
  | {
      type: "UPDATE_API_KEY";
      payload: string;
    };

const formReducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case "UPDATE_HTML_INPUT":
      return { ...state, htmlInput: action.payload };
    case "ADD_ATTACHMENT":
      return {
        ...state,
        attachments: state.attachments.concat(action.payload),
      };
    case "DELETE_ATTACHMENT":
      return {
        ...state,
        attachments: state.attachments.filter((a) => a.id !== action.payload),
      };
    case "UPDATE_MODEL":
      return { ...state, model: action.payload };
    case "UPDATE_FIELDS":
      return { ...state, fields: state.fields.concat(action.payload) };
    case "ADD_FIELD":
      return { ...state, fields: state.fields.concat(action.payload) };
    case "DELETE_FIELD":
      return {
        ...state,
        fields: state.fields.filter((f) => f.id !== action.payload),
      };
    case "UPDATE_COPIED_ATTACHMENT":
      return { ...state, copiedAttachment: action.payload };
    case "UPDATE_API_KEY":
      localStorage.setItem("scrapyai-apiKey", action.payload);
      return { ...state, apiKey: action.payload };
    default:
      return state;
  }
};

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
    apiKey: string,
  ) => void;
  errors: { [key: string]: string };
  isLoading: boolean;
}) => {
  const [state, dispatch] = useReducer(formReducer, {
    htmlInput: "",
    attachments: [],
    model: selectOptions[0],
    fields: [
      {
        id: "default",
        name: "Title",
        type: "text",
        additionalInfo: "",
      },
    ],
    copiedAttachment: null,
    apiKey: "",
  });

  useEffect(() => {
    const apiKey = localStorage.getItem("scrapyai-apiKey");
    if (apiKey) {
      dispatch({ type: "UPDATE_API_KEY", payload: apiKey });
    }
  }, []);

  const handleHtmlInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newInput = e.target.value;
      if (newInput.length > 5000) {
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          content: newInput,
        };

        dispatch({ type: "ADD_ATTACHMENT", payload: newAttachment });
        dispatch({ type: "UPDATE_HTML_INPUT", payload: "" });
      } else {
        dispatch({ type: "UPDATE_HTML_INPUT", payload: newInput });
      }
    },
    [],
  );

  const deleteAttachment = (id: string) => {
    dispatch({ type: "DELETE_ATTACHMENT", payload: id });
  };

  const copyAttachment = (id: string) => {
    navigator.clipboard.writeText(
      state.attachments.find((attachment) => attachment.id === id)?.content ??
        "",
    );
    dispatch({ type: "UPDATE_COPIED_ATTACHMENT", payload: id });
    setTimeout(
      () => dispatch({ type: "UPDATE_COPIED_ATTACHMENT", payload: null }),
      2000,
    );
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: "",
      type: "text",
      additionalInfo: "",
    };
    dispatch({ type: "UPDATE_FIELDS", payload: newField });
  };

  const removeField = useCallback((id: string) => {
    dispatch({ type: "DELETE_FIELD", payload: id });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const enrichedFields = state.fields.map((field) => ({
      ...field,
      name: values[`${field.id}-name`] as string,
      type: values[`${field.id}-type`] as FieldType,
      additionalInfo: values[`${field.id}-additionalInfo`] as string,
    }));
    const apiKey = values["api-key"] as string;
    onSubmit(
      e,
      state.htmlInput,
      state.attachments,
      enrichedFields,
      state.model,
      apiKey,
    );
  };

  const attachmentsMemoToShow = useMemo(() => {
    return state.attachments.map((attachment) => ({
      ...attachment,
      content: attachment.content.slice(0, 150),
    }));
  }, [state.attachments]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="api-key" className="block text-sm font-medium">
          API Key
        </label>
        <Input
          id="api-key"
          name="api-key"
          value={state.apiKey}
          onChange={(e) =>
            dispatch({ type: "UPDATE_API_KEY", payload: e.target.value })
          }
          placeholder="Enter your API key"
          className="bg-background rounded shadow-sm"
        />
        <label htmlFor="html-input" className="block text-sm font-medium">
          HTML Input
        </label>
        <Textarea
          id="html-input"
          value={state.htmlInput}
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
                {!state.copiedAttachment && (
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
                {state.copiedAttachment === `${attachment.id}` && (
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
        {state.fields.map((field) => (
          <FieldItem
            key={field.id}
            field={field}
            errors={errors}
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
              value={state.model.value}
              onValueChange={(value) =>
                dispatch({
                  type: "UPDATE_MODEL",
                  payload: selectOptions.find((o) => o.value === value)!,
                })
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

const FieldItem = memo(
  ({
    field,
    errors,
    removeField,
  }: {
    field: Omit<Field, "name">;
    errors: { [key: string]: string };
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
