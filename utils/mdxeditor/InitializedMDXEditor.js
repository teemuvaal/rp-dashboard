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
  AdmonitionDirective,
  directivesPlugin,
  diffSourcePlugin,
} from '@mdxeditor/editor'

// Define plugins configuration
const defaultPlugins = (readOnly = false) => {
  const plugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    directivesPlugin(),
    markdownShortcutPlugin(),
    diffSourcePlugin({
      viewMode: 'rich-text',
    })
  ]

  if (!readOnly) {
    plugins.unshift(
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
            <InsertCodeBlock />
            <InsertThematicBreak />
          </>
        )
      })
    )
  }
  
  return plugins
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
      autoFocus={false}
    />
  )
}
