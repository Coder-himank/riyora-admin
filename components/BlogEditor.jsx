'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import styles from '@/styles/BlogEditor.module.css'

export default function BlogEditor({ onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: true,
                orderedList: true,
            }),
            Image,
            Link.configure({ openOnClick: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: '<p>Start writing your blog...</p>',
        immediatelyRender: false, // avoids SSR hydration error
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange(html)
        },
    })

    const addImage = () => {
        const url = prompt('Enter image URL')
        if (url) editor.chain().focus().setImage({ src: url }).run()
    }

    if (!editor) return null

    return (
        <div className={styles.editorContainer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
                <button onClick={addImage}>🖼️ Image</button>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>⬅️</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>⏺️</button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>➡️</button>
                <button onClick={() => {
                    const url = prompt('Enter link URL')
                    if (url) editor.chain().focus().setLink({ href: url }).run()
                }}>🔗 Link</button>
            </div>

            <EditorContent editor={editor} className={styles.editorContent} />
        </div>
    )
}
