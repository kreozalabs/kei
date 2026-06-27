import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $createParagraphNode, $isParagraphNode, ParagraphNode } from "lexical";
import { $createHeadingNode, $isHeadingNode, HeadingNode } from "@lexical/rich-text";

export function TitleEnforcementPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Initial setup: ensure root has heading and paragraph
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();

      if (!firstChild) {
        const heading = $createHeadingNode("h3");
        root.append(heading);
      } else if (!$isHeadingNode(firstChild)) {
        const heading = $createHeadingNode("h3");
        if ($isParagraphNode(firstChild)) {
          heading.append(...firstChild.getChildren());
          firstChild.replace(heading);
        } else {
          firstChild.insertBefore(heading);
        }
      }
    });

    // Enforce first node remains h3
    const removeHeadingTransform = editor.registerNodeTransform(HeadingNode, (node) => {
      const root = $getRoot();
      if (node.is(root.getFirstChild()) && node.getTag() !== "h3") {
        const h3 = $createHeadingNode("h3");
        h3.append(...node.getChildren());
        node.replace(h3);
      }
    });

    // Enforce no paragraph as first node
    const removeParaTransform = editor.registerNodeTransform(ParagraphNode, (node) => {
      const root = $getRoot();
      if (node.is(root.getFirstChild())) {
        const h3 = $createHeadingNode("h3");
        h3.append(...node.getChildren());
        node.replace(h3);
      }
    });

    return () => {
      removeHeadingTransform();
      removeParaTransform();
    };
  }, [editor]);

  return null;
}
