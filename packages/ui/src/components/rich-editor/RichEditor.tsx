import React, { JSX, useMemo } from "react";
import { $getRoot, defineExtension, configExtension } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextExtension } from "@lexical/rich-text";
import { HistoryExtension } from "@lexical/history";

import { AIExtension, defaultCreateWorker } from "./ai/AIExtension";
import { Toolbar, ToolbarExtension } from "./ToolbarExtension";
import { cn } from "../../lib/utils";
import type { EditorState } from "lexical";

const defaultTheme = {
  heading: {
    h1: "text-2xl font-bold tracking-tight text-foreground leading-snug mb-2",
    h2: "text-xl font-bold tracking-tight text-foreground leading-snug mb-2",
    h3: "text-xl font-bold tracking-tight text-foreground leading-snug mb-2",
  },
  paragraph: "text-sm text-foreground leading-relaxed",
  quote: "my-2 border-l-4 border-solid border-muted pl-4 italic text-muted-foreground",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
};

export interface RichEditorProps {
  initialConfig?: any;
  onChange?: (editorState: EditorState) => void;
  plugins?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function CustomPlaceholderPlugin({ placeholder }: { placeholder: string }) {
  const [editor] = useLexicalComposerContext();
  const [showPlaceholder, setShowPlaceholder] = React.useState(true);

  React.useEffect(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      setShowPlaceholder(
        children.length === 0 || (children.length === 1 && children[0].getTextContent() === "")
      );
    });

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        setShowPlaceholder(
          children.length === 0 || (children.length === 1 && children[0].getTextContent() === "")
        );
      });
    });
  }, [editor]);

  if (!showPlaceholder) return null;

  return (
    <div className="absolute top-4 left-4 pointer-events-none text-muted-foreground/50 text-xl font-bold tracking-tight">
      {placeholder}
    </div>
  );
}

function createEditorExtension(theme: any) {
  return defineExtension({
    dependencies: [
      RichTextExtension,
      HistoryExtension,
      configExtension(AIExtension, { createWorker: defaultCreateWorker }),
      ToolbarExtension,
    ],
    name: "@kreozalabs/rich-editor",
    namespace: "RichEditor",
    theme,
  });
}

export function RichEditor({
  initialConfig,
  onChange,
  plugins,
  className,
  placeholder = "What needs to be done?",
}: RichEditorProps) {
  const extension = useMemo(() => createEditorExtension(defaultTheme), []);

  return (
    <div
      className={cn(
        "flex flex-col w-full overflow-hidden rounded-2xl border border-border/40 bg-background shadow-xs",
        className
      )}
    >
      <LexicalExtensionComposer extension={extension} contentEditable={null}>
        <Toolbar />
        <div className="relative">
          <ContentEditable
            className="outline-none min-h-25 w-full p-4 [&>*:first-child]:border-b [&>*:first-child]:border-border/40 [&>*:first-child]:pb-3 [&>*:first-child]:mb-3"
            aria-placeholder={placeholder}
            placeholder={null as unknown as JSX.Element}
          />
          <CustomPlaceholderPlugin placeholder={placeholder} />
          {onChange && <OnChangePlugin onChange={onChange} />}
          {plugins}
        </div>
      </LexicalExtensionComposer>
    </div>
  );
}
