import "@src/assets/css/globals.css";
import "@src/assets/css/tailwind.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextNProgress from "@src/components/atoms/NextNProgress";
import Layout from "@src/layouts/_layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body>
        <NextNProgress
          color="#0764EB"
          startPosition={0}
          stopDelayMs={400}
          height={2}
          options={{ easing: "ease" }}
        />
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="light"
        />

        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
