import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "react-hot-toast";
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
