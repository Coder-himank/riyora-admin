import connectDB from "@/lib/database";
import Blog from "@/lib/models/blog";

export default async function handler(req, res) {
    await connectDB();
    const { blogId } = req.query;

    if (req.method === "PUT") {
        if (!blogId) return res.status(400).json({ message: "Blog ID is required" });

        try {
            const data = req.body;
            const blog = await Blog.findByIdAndUpdate(blogId, data, { new: true });
            if (!blog) return res.status(404).json({ message: "Blog not found" });

            return res.status(200).json({ message: "Updated successfully", blog });
        } catch (err) {
            return res.status(500).json({ error: "Error updating blog", details: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            const data = req.body;
            console.log(data);
            

            const blog = await Blog.create(data);
            return res.status(201).json({ message: "Created successfully", blog });
        } catch (err) {
            console.log(err);
            
            return res.status(500).json({ error: "Error creating blog", details: err.message });
        }
    }

    if (req.method === "GET") {
        try {
            if (blogId) {
                const blog = await Blog.findById(blogId);
                
                if (!blog) return res.status(404).json({ message: "Blog not found" });
                return res.status(200).json(blog);
            }
            const blogs = await Blog.find().sort({ createdAt: -1 });
            return res.status(200).json(blogs);
        } catch (err) {
            return res.status(500).json({ error: "Error fetching blog data", details: err.message });
        }
    }

    if (req.method === "DELETE") {
        try {
            if (!blogId) return res.status(400).json({ error: "Blog ID is required" });
            const blog = await Blog.findByIdAndDelete(blogId);
            if (!blog) return res.status(404).json({ message: "Blog not found" });

            return res.status(200).json({ message: "Deleted successfully", blog });
        } catch (err) {
            return res.status(500).json({ error: "Error deleting blog", details: err.message });
        }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
}
