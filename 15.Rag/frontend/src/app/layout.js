import "./globals.css";

export const metadata = {
  title: "StudyDocs RAG — AI Study Assistant",
  description:
    "Dual engine retrieval augmented generation over CS study material PDFs. Powered by Ollama and qwen2.5:7b locally.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
