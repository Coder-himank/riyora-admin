'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useParams } from 'next/navigation'
import styles from '@/styles/blog/editorDemo.module.css'
import ImageManager from '@/components/ui/ImageManager'

const BlogEditor = dynamic(() => import('@/components/BlogEditor'), { ssr: false })

export default function BlogEditPage() {
    const router = useRouter()
    const { blogId } = useParams()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // fetch existing blog if editing
    useEffect(() => {
        if (blogId && blogId !== 'new') {
            setLoading(true)
            fetch(`/api/blogApi?blogId=${blogId}`)
                .then((res) => res.json())
                .then((data) => {
                    setTitle(data.title)
                    setContent(data.content)
                    setImages(data.images || [])
                    setIsEditing(true)
                })
                .finally(() => setLoading(false))
        }
    }, [blogId])

    const handleSave = async () => {
        setLoading(true)
        const payload = { title, content, images }

        try {
            const res = await fetch(`/api/blogApi${isEditing ? `/${blogId}` : ''}`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('Failed to save blog')

            router.push('/blogs')
        } catch (err) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this blog?')) return
        await fetch(`/api/blogApi/${blogId}`, { method: 'DELETE' })
        router.push('/blogs')
    }

    // image management
    const handleAddImage = (imgUrl) => {
        setImages((prev) => [...prev, imgUrl])
    }

    const handleRemoveImage = (imgUrl) => {
        setImages((prev) => prev.filter((img) => img !== imgUrl))
    }

    if (loading) return <div className={styles.loading}>Loading...</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>
                {isEditing ? 'Edit Blog Post' : 'Create New Blog'}
            </h1>

            <input
                type="text"
                placeholder="Enter blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
            />

            <BlogEditor onChange={setContent} content={content} />

            <ImageManager
                images={images}
                setData={handleAddImage}
                removeData={handleRemoveImage}
            />

            <div className={styles.buttonRow}>
                <button onClick={handleSave} disabled={loading} className={styles.saveButton}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
                {isEditing && (
                    <button onClick={handleDelete} className={styles.deleteButton}>
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}
