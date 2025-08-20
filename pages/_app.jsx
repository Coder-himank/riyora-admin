import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

// ✅ Dynamically import Toaster so it's never server-rendered
const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <>
    <SessionProvider session={pageProps.session}>
      <div className="container">
        <Navbar />
        <Component {...pageProps} />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </SessionProvider>
    </>
  );
}
