'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'
import { useState } from 'react'
import styles from '@/styles/BlogEditor.module.css'
import ImageManager from '@/components/ui/ImageManager'
import ResizableImage from '@/components/ui/ResizeableImage'

/* ✅ Custom Tab extension for indentation */
const CustomTab = Extension.create({
    name: 'customTab',
    addKeyboardShortcuts() {
        return {
            Tab: () => {
                this.editor.commands.insertContent('&emsp;')
                return true
            },
        }
    },
})

export default function BlogEditor({ onChange }) {
    const [images, setImages] = useState([])
    const [showImageManager, setShowImageManager] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: true,
                orderedList: true,
            }),
            CustomTab,
            ResizableImage,
            Link.configure({ openOnClick: true }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: 'Start writing your blog...',
            }),
        ],
        content: '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    const setImageFunction = urls => {
        if (urls && urls.length > 0) {
            editor.chain().focus().setNode('resizableImage', { src: urls[0], width: '600px' }).run()
        }
        setShowImageManager(false)
    }

    const addImage = () => setShowImageManager(true)

    if (!editor) return null

    return (
        <div className={styles.editorContainer}>
            {showImageManager && (
                <ImageManager
                    multiple={false}
                    images={images}
                    fileFolder={'blogs'}
                    setDataFunction={setImageFunction}
                    removeDataFunction={() => { }}
                />
            )}

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <button onClick={() => editor.chain().focus().toggleBold().run()}>
                    <b>B</b>
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <i>I</i>
                </button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <s>S</s>
                </button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <u>U</u>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    H2
                </button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    • List
                </button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    1. List
                </button>
                <button onClick={addImage}>🖼️ Add</button>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>⬅️</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>⏺️</button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>➡️</button>
                <button
                    onClick={() => {
                        const url = prompt('Enter link URL')
                        if (url) editor.chain().focus().setLink({ href: url }).run()
                    }}
                >
                    🔗
                </button>
                <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                    🧹 Clear
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className={styles.editorContent} />
        </div>
    )
}
