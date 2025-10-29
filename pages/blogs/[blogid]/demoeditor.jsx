import BlogEditor from "@/components/BlogEditor";
import { useState } from "react";
export const Editor = () => {

    const [html, setHtml] = useState("")

    const handleChange = (h) => {
        setHtml(h)
    }
    return (
        <>
            {html}
            <BlogEditor onChange={handleChange} />
        </>
    )
}


export default Editor;