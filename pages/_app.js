import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
