"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type IconType,
  SiGo,
  SiJavascript,
  SiPython,
  SiTypescript,
} from "@icons-pack/react-simple-icons";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactElement } from "react";
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type BundledLanguage,
  type CodeOptionsMultipleThemes,
  codeToHtml,
} from "shiki";

const filenameIconMap = {
  "*.js": SiJavascript,
  "*.ts": SiTypescript,
  "*.py": SiPython,
  "*.go": SiGo,
};

type CodeBlockContextType = {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  value: undefined,
  onValueChange: undefined,
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export const CodeBlock = ({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultValue,
  className,
  ...props
}: CodeBlockProps) => {
  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? "",
    prop: controlledValue,
    onChange: controlledOnValueChange,
  });

  return (
    <CodeBlockContext.Provider value={{ value, onValueChange }}>
      <div
        className={cn("overflow-hidden rounded border", className)}
        {...props}
      />
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CodeBlockHeader = ({
  className,
  ...props
}: CodeBlockHeaderProps) => (
  <div
    className={cn(
      "flex flex-row items-center border-b bg-secondary p-1",
      className,
    )}
    {...props}
  />
);

export type CodeBlockFilenameProps = HTMLAttributes<HTMLDivElement> & {
  icon?: IconType;
  value?: string;
};

export const CodeBlockFilename = ({
  icon,
  value,
  children,
  ...props
}: CodeBlockFilenameProps) => {
  const { value: activeValue } = useContext(CodeBlockContext);
  const defaultIcon = Object.entries(filenameIconMap).find(([pattern]) => {
    const regex = new RegExp(
      `^${pattern.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*")}$`,
    );
    return regex.test(children as string);
  })?.[1];
  const Icon = icon ?? defaultIcon;

  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className="flex grow items-center gap-2 bg-secondary px-4 py-1.5 text-muted-foreground text-xs"
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
    </div>
  );
};

export type CodeBlockSelectProps = ComponentProps<typeof Select>;

export const CodeBlockSelect = (props: CodeBlockSelectProps) => {
  const { value, onValueChange } = useContext(CodeBlockContext);

  return <Select value={value} onValueChange={onValueChange} {...props} />;
};

export type CodeBlockSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export const CodeBlockSelectTrigger = ({
  className,
  ...props
}: CodeBlockSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "w-fit border-none text-muted-foreground text-xs shadow-none",
      className,
    )}
    {...props}
  />
);

export type CodeBlockSelectValueProps = ComponentProps<typeof SelectValue>;

export const CodeBlockSelectValue = (props: CodeBlockSelectValueProps) => (
  <SelectValue {...props} />
);

export type CodeBlockSelectContentProps = ComponentProps<typeof SelectContent>;

export const CodeBlockSelectContent = (props: CodeBlockSelectContentProps) => (
  <SelectContent {...props} />
);

export type CodeBlockSelectItemProps = ComponentProps<typeof SelectItem>;

export const CodeBlockSelectItem = ({
  className,
  ...props
}: CodeBlockSelectItemProps) => (
  <SelectItem className={cn("text-sm", className)} {...props} />
);

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  asChild,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { value } = useContext(CodeBlockContext);

  const copyToClipboard = () => {
    if (
      typeof window === "undefined" ||
      !navigator.clipboard.writeText ||
      !value
    ) {
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      onCopy?.();

      setTimeout(() => setIsCopied(false), timeout);
    }, onError);
  };

  if (asChild) {
    return cloneElement(children as ReactElement, {
      // @ts-expect-error - we know this is a button
      onClick: copyToClipboard,
    });
  }

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={copyToClipboard}
      className={cn("shrink-0", className)}
      {...props}
    >
      {children ?? <Icon size={14} className="text-muted-foreground" />}
    </Button>
  );
};

type CodeBlockFallbackProps = HTMLAttributes<HTMLDivElement>;

const CodeBlockFallback = ({ children, ...props }: CodeBlockFallbackProps) => (
  <div {...props}>
    <pre className="w-full">
      <code>
        {children
          ?.toString()
          .split("\n")
          .map((line, i) => (
            <span key={i} className="line">
              {line}
            </span>
          ))}
      </code>
    </pre>
  </div>
);

export type CodeBlockBodyProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  lineNumbers?: boolean;
  syntaxHighlighting?: boolean;
};

export const CodeBlockBody = ({
  value,
  lineNumbers = true,
  syntaxHighlighting = true,
  children,
  className,
  ...props
}: CodeBlockBodyProps) => {
  const { value: activeValue } = useContext(CodeBlockContext);

  if (value !== activeValue) {
    return null;
  }

  const lineNumberClassNames = cn(
    "[&_code]:[counter-reset:line]",
    "[&_code]:[counter-increment:line_0]",
    "[&_.line]:before:content-[counter(line)]",
    "[&_.line]:before:inline-block",
    "[&_.line]:before:[counter-increment:line]",
    "[&_.line]:before:w-4",
    "[&_.line]:before:mr-4",
    "[&_.line]:before:text-[13px]",
    "[&_.line]:before:text-right",
    "[&_.line]:before:text-muted-foreground/50",
    "[&_.line]:before:font-mono",
    "[&_.line]:before:select-none",
  );

  const darkModeClassNames = cn(
    "dark:[&_.shiki]:!text-[var(--shiki-dark)]",
    "dark:[&_.shiki]:!bg-[var(--shiki-dark-bg)]",
    "dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]",
    "dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]",
    "dark:[&_.shiki]:![text-decoration:var(--shiki-dark-text-decoration)]",
    "dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
    "dark:[&_.shiki_span]:!bg-[var(--shiki-dark-bg)]",
    "dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]",
    "dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]",
    "dark:[&_.shiki_span]:![text-decoration:var(--shiki-dark-text-decoration)]",
  );

  const lineHighlightClassNames = cn(
    "[&_.line.highlighted]:bg-blue-50",
    "[&_.line.highlighted]:after:bg-blue-500",
    "[&_.line.highlighted]:after:absolute",
    "[&_.line.highlighted]:after:left-0",
    "[&_.line.highlighted]:after:top-0",
    "[&_.line.highlighted]:after:bottom-0",
    "[&_.line.highlighted]:after:w-0.5",
    "dark:[&_.line.highlighted]:bg-blue-800",
  );

  const lineDiffClassNames = cn(
    "[&_.line.diff]:after:absolute",
    "[&_.line.diff]:after:left-0",
    "[&_.line.diff]:after:top-0",
    "[&_.line.diff]:after:bottom-0",
    "[&_.line.diff]:after:w-0.5",
    "[&_.line.diff.add]:bg-emerald-50",
    "[&_.line.diff.add]:after:bg-emerald-500",
    "[&_.line.diff.remove]:bg-rose-50",
    "[&_.line.diff.remove]:after:bg-rose-500",
    "dark:[&_.line.diff.add]:bg-emerald-800",
    "dark:[&_.line.diff.remove]:bg-rose-800",
  );

  const lineFocusedClassNames = cn(
    "[&_code:has(.focused)_.line]:blur-[2px]",
    "[&_code:has(.focused)_.line.focused]:blur-none",
  );

  const wordHighlightClassNames = cn(
    "[&_.highlighted-word]:bg-blue-50",
    "dark:[&_.highlighted-word]:bg-blue-800",
  );

  const codeBlockClassName = cn(
    "mt-0 text-sm",
    "[&_pre]:py-4",
    "[&_.shiki]:!bg-[var(--shiki-bg)]",
    "[&_code]:w-full",
    "[&_code]:grid",
    "[&_code]:overflow-x-auto",
    "[&_.line]:px-4",
    "[&_.line]:w-full",
    "[&_.line]:relative",
    lineHighlightClassNames,
    lineDiffClassNames,
    lineFocusedClassNames,
    wordHighlightClassNames,
    lineNumbers && lineNumberClassNames,
    darkModeClassNames,
    className,
  );

  if (!syntaxHighlighting) {
    return (
      <CodeBlockFallback className={codeBlockClassName} {...props}>
        {children}
      </CodeBlockFallback>
    );
  }

  return (
    <div className={codeBlockClassName} {...props}>
      {children}
    </div>
  );
};

export type CodeBlockContentProps = {
  themes?: CodeOptionsMultipleThemes["themes"];
  language?: BundledLanguage;
  children: string;
};

export const CodeBlockContent = ({
  children,
  themes,
  language = "typescript",
}: CodeBlockContentProps) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    codeToHtml(children as string, {
      lang: language,
      themes: themes ?? {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
      transformers: [
        transformerNotationDiff({
          matchAlgorithm: "v3",
        }),
        transformerNotationHighlight({
          matchAlgorithm: "v3",
        }),
        transformerNotationWordHighlight({
          matchAlgorithm: "v3",
        }),
        transformerNotationFocus({
          matchAlgorithm: "v3",
        }),
        transformerNotationErrorLevel({
          matchAlgorithm: "v3",
        }),
      ],
    })
      .then(setHtml)
      .catch(console.error);
  }, [children, themes, language]);

  if (!html) {
    return <CodeBlockFallback>{children}</CodeBlockFallback>;
  }

  return (
    <div
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Kinda how Shiki works"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
