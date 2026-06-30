/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isDecoratorTextNode, signal } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  mergeRegister,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { type CSSProperties, type JSX, useRef } from "react";

import { AIExtension } from "./ai/AIExtension";
import { useAI, type UseAIReturn } from "./ai/useAI";
import { Button } from "../button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Wand2,
} from "lucide-react";

const BLOCK_TYPES = [
  { label: "Normal", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "quote" },
];

function applyBlockType(editor: LexicalEditor, type: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (type === "paragraph") {
      $setBlocksType(selection, $createParagraphNode);
    } else if (type === "quote") {
      $setBlocksType(selection, $createQuoteNode);
    } else {
      const headingTag = type as "h1" | "h2" | "h3";
      $setBlocksType(selection, () => $createHeadingNode(headingTag));
    }
  });
}

function maskStyle(url: string): CSSProperties {
  return {
    maskImage: `url('${url}')`,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskImage: `url('${url}')`,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
  };
}

function Divider() {
  return <div className="h-6 mx-1 w-px bg-border" />;
}

function $getToolbarState(): {
  blockType: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
} | null {
  const selection = $getSelection();

  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    const decoratorNode = nodes.find($isDecoratorTextNode);
    if (decoratorNode) {
      return {
        blockType: "paragraph",
        isBold: decoratorNode.hasFormat("bold"),
        isItalic: decoratorNode.hasFormat("italic"),
        isUnderline: decoratorNode.hasFormat("underline"),
      };
    }
    return null;
  }

  if (!$isRangeSelection(selection)) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  const topLevelElement =
    $findMatchingParent(anchorNode, (e) => {
      const parent = e.getParent();
      return parent !== null && $isRootOrShadowRoot(parent);
    }) || anchorNode.getTopLevelElementOrThrow();

  return {
    blockType: $isHeadingNode(topLevelElement)
      ? topLevelElement.getTag()
      : topLevelElement.getType(),
    isBold: selection.hasFormat("bold"),
    isItalic: selection.hasFormat("italic"),
    isUnderline: selection.hasFormat("underline"),
  };
}

export const ToolbarExtension = defineExtension({
  build() {
    return {
      blockType: signal("paragraph"),
      canRedo: signal(false),
      canUndo: signal(false),
      isBold: signal(false),
      isItalic: signal(false),
      isUnderline: signal(false),
    };
  },
  dependencies: [AIExtension],
  name: "@lexical/agent-example/toolbar",
  register(editor, _config, state) {
    const output = state.getOutput();
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            const toolbarState = $getToolbarState();
            if (toolbarState) {
              output.blockType.value = toolbarState.blockType;
              output.isBold.value = toolbarState.isBold;
              output.isItalic.value = toolbarState.isItalic;
              output.isUnderline.value = toolbarState.isUnderline;
            }
          },
          { editor }
        );
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          output.canUndo.value = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          output.canRedo.value = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  },
});

function useToolbar() {
  const toolbar = useExtensionDependency(ToolbarExtension).output;
  return {
    blockType: useSignalValue(toolbar.blockType),
    canRedo: useSignalValue(toolbar.canRedo),
    canUndo: useSignalValue(toolbar.canUndo),
    isBold: useSignalValue(toolbar.isBold),
    isItalic: useSignalValue(toolbar.isItalic),
    isUnderline: useSignalValue(toolbar.isUnderline),
  };
}

export function Toolbar(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const ai = useAI();
  const toolbar = useToolbar();

  const { abort, handleExtractEntities, handleGenerate, isGenerating, modelStatus } = ai;
  const aiDisabled = isGenerating || modelStatus === "loading";

  const iconBase = "flex h-[18px] w-[18px] shrink-0 bg-current";

  return (
    <div
      className="flex flex-wrap items-center gap-1 overflow-x-auto border-b border-border/40 bg-muted/5 px-2 py-2"
      ref={toolbarRef}
    >
      <Select
        value={toolbar.blockType || ""}
        onValueChange={(value) => applyBlockType(editor, value)}
      >
        <SelectTrigger className="w-30 h-8 text-xs bg-transparent border-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLOCK_TYPES.map(({ label, value }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={!toolbar.canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        aria-label="Undo"
      >
        <Undo className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={!toolbar.canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        aria-label="Redo"
      >
        <Redo className="size-4" />
      </Button>

      <Divider />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${toolbar.isBold ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Format Bold"
      >
        <Bold className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${toolbar.isItalic ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Format Italics"
      >
        <Italic className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${toolbar.isUnderline ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        aria-label="Format Underline"
      >
        <Underline className="size-4" />
      </Button>

      <Divider />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        aria-label="Left Align"
      >
        <AlignLeft className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        aria-label="Center Align"
      >
        <AlignCenter className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        aria-label="Right Align"
      >
        <AlignRight className="size-4" />
      </Button>

      <Divider />

      <AIButtons
        abort={abort}
        aiDisabled={aiDisabled}
        handleExtractEntities={handleExtractEntities}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}

function AIButtons({
  abort,
  aiDisabled,
  handleExtractEntities,
  handleGenerate,
  isGenerating,
}: {
  abort: UseAIReturn["abort"];
  aiDisabled: boolean;
  handleExtractEntities: () => void;
  handleGenerate: () => void;
  isGenerating: boolean;
}) {
  if (isGenerating) {
    return (
      <Button
        type="button"
        onClick={abort}
        variant="destructive"
        size="sm"
        className="h-8 text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 shadow-none border-0"
        aria-label="Stop AI"
      >
        <span className="animate-pulse">Stop Generating</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={aiDisabled}
        size="sm"
        variant="secondary"
        className="h-8 text-xs font-medium bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 shadow-none border border-indigo-200/50"
        aria-label="AI Generate Paragraph"
      >
        <Sparkles className="size-3.5 mr-1.5" />
        Generate Text
      </Button>
      <Button
        type="button"
        onClick={handleExtractEntities}
        disabled={aiDisabled}
        size="sm"
        variant="secondary"
        className="h-8 text-xs font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-none border border-amber-200/50"
        aria-label="Extract Entities"
      >
        <Wand2 className="size-3.5 mr-1.5" />
        Extract Entities
      </Button>
    </>
  );
}
