'use client'
import React, { useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

export default function ResizableImageComponent({ node, updateAttributes, selected }) {
    const { src, width, alt } = node.attrs
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(0)
    const imgRef = useRef(null)

    const startResize = e => {
        e.preventDefault()
        setIsDragging(true)
        setStartX(e.clientX)
        setStartWidth(imgRef.current.offsetWidth)
    }

    const onResize = e => {
        if (!isDragging) return
        const delta = e.clientX - startX
        const newWidth = Math.max(50, startWidth + delta)
        updateAttributes({ width: `${newWidth}px` })
    }

    const stopResize = () => setIsDragging(false)

    return (
        <NodeViewWrapper
            className="relative group"
            onMouseMove={onResize}
            onMouseUp={stopResize}
            onMouseLeave={stopResize}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt || ''}
                style={{
                    width,
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '10px auto',
                    border: selected ? '2px solid #2684ff' : 'none',
                    borderRadius: '6px',
                }}
            />
            {selected && (
                <div
                    onMouseDown={startResize}
                    className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded cursor-se-resize opacity-80 group-hover:opacity-100"
                />
            )}
        </NodeViewWrapper>
    )
}
