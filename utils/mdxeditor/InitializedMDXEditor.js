'use client'

import '@mdxeditor/editor/style.css'
import './editor.css'
import { MDXEditor } from '@mdxeditor/editor'
import { 
  toolbarPlugin, 
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  ListsToggle,
  InsertTable,
  InsertCodeBlock,
  InsertThematicBreak,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  codeBlockPlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor'

// Define plugins configuration
const defaultPlugins = (readOnly = false) => {
  if (readOnly) return []
  
  return [
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <CreateLink />
          <ListsToggle />
          <InsertImage />
          <InsertTable />
          <InsertThematicBreak />
        </>
      )
    }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    codeBlockPlugin(),
    markdownShortcutPlugin()
  ]
}

// This wraps the editor with the initialization logic
export default function InitializedMDXEditor({ markdown, onChange, readOnly = false, editorRef }) {
  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      onChange={onChange}
      readOnly={readOnly}
      plugins={defaultPlugins(readOnly)}
      contentEditableClassName="prose dark:prose-invert max-w-none min-h-[200px] p-4"
      className="mdxeditor border rounded-md"
    />
  )
}
