import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImageComponent from '@/components/ui/ResizeableImageComponent'

const ResizableImage = Node.create({
    name: 'resizableImage',
    // group: 'block',
    inline: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            width: { default: 'auto' },
            height: { default: 'auto' },
        }
    },

    parseHTML() {
        return [{ tag: 'img[src]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent)
    },
})

export default ResizableImage
