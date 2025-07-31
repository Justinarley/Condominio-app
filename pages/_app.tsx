import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "./components/ Navbar";

export default function App({ Component, pageProps, router }: AppProps) {
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className="bg-gray-50 min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}
