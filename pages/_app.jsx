import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";

// ✅ Dynamically import Toaster so it's never server-rendered
const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="container">
        <Navbar />
        <Component {...pageProps} />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
