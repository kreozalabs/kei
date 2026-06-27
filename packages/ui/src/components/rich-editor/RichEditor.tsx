import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { cn } from "../../lib/utils";
import React from "react";
import { EditorState, $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const defaultTheme = {
  heading: {
    h1: "text-2xl font-bold tracking-tight text-foreground leading-snug mb-2",
    h2: "text-xl font-bold tracking-tight text-foreground leading-snug mb-2",
    h3: "text-xl font-bold tracking-tight text-foreground leading-snug mb-2",
  },
  paragraph: "text-sm text-foreground leading-relaxed",
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
      setShowPlaceholder(children.length === 0 || (children.length === 1 && children[0].getTextContent() === ""));
    });

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        setShowPlaceholder(children.length === 0 || (children.length === 1 && children[0].getTextContent() === ""));
      });
    });
  }, [editor]);

  if (!showPlaceholder) return null;

  return (
    <div className="absolute top-0 left-0 pointer-events-none text-muted-foreground/50 text-xl font-bold tracking-tight">
      {placeholder}
    </div>
  );
}

export function RichEditor({
  initialConfig,
  onChange,
  plugins,
  className,
  placeholder = "What needs to be done?",
}: RichEditorProps) {
  const config = {
    namespace: "RichEditor",
    theme: defaultTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    ...initialConfig,
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className={cn("relative w-full", className)}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none min-h-[100px] w-full" />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CustomPlaceholderPlugin placeholder={placeholder} />
        <HistoryPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
        {plugins}
      </div>
    </LexicalComposer>
  );
}
