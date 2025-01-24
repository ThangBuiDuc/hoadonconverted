import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import localFont from "next/font/local";
import { HeroUIProvider } from "@heroui/system";
const montserrat = localFont({
  src: [
    {
      path: "./fonts/Montserrat-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Montserrat-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    // <ViewTransitions>
    // </ViewTransitions>
    (<html lang="en">
      <body className={`${montserrat.className} bg-white `}>
        <HeroUIProvider>
          <ReactQueryProvider>
            <main>{children}</main>
          </ReactQueryProvider>
        </HeroUIProvider>
      </body>
    </html>)
  );
}
