import react, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

export const HtmlIde = () => {
  const navigate = useNavigate();
  const [html, sethtml] = useState("");
  const [css, setcss] = useState("");
  const [js, setjs] = useState("");
  const [srcDoc, setsrcDoc] = useState("");
  const [showCss, setShowCss] = useState(true);
  const [showJs, setShowJs] = useState(true);

  useEffect(() => {
    const storedHtml = localStorage.getItem("htmlCode") || "";
    const storedCss = localStorage.getItem("cssCode") || "";
    const storedJs = localStorage.getItem("jsCode") || "";

    if(!storedCss) {
      setShowCss(false);
    }

    if(!storedJs) {
      setShowJs(false);
    }

    sethtml(storedHtml);
    setcss(storedCss);
    setjs(storedJs);
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setsrcDoc(`<html>
        <body>${html}</body>
        <style>${css}</style>
        <script>${js}</script>
    </html>
    `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="p-4 bg-[#0f172a] min-h-screen">
      {/* Header */}
      <div className="flex items-center py-2">
        <button
          onClick={() => {
            navigate(`/course/${localStorage.getItem("currentCourseId")}`);
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
          }}
          className="flex items-center gap-2 px-3 py-1 ml-1 rounded-lg bg-[#2C3E50] text-white font-semibold shadow hover:bg-[#3d5164] transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-200 mx-auto">Test Your Code Here</h1>
      </div>

      {/* Editors Grid */}
      <div
        className={`grid gap-4 ${
          showCss && showJs
            ? "grid-cols-1 md:grid-cols-3"
            : showCss || showJs
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* HTML */}
        <div className="rounded-lg bg-black shadow overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
            <h3 className="font-semibold">HTML</h3>
          </div>
          <Editor
            height="180px"
            className="sm:h-[220px] md:h-[280px]"
            language="html"
            value={html}
            onChange={(value) => sethtml(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
            }}
          />
        </div>

        {/* CSS */}
        {showCss && (
          <div className="rounded-lg bg-black shadow overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
              <h3 className="font-semibold">CSS</h3>
            </div>
            <Editor
              height="180px"
              className="sm:h-[220px] md:h-[280px]"
              language="css"
              value={css}
              onChange={(value) => setcss(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
              }}
            />
          </div>
        )}

        {/* JS */}
        {showJs && (
          <div className="rounded-lg bg-black shadow overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
              <h3 className="font-semibold">JS</h3>
            </div>
            <Editor
              height="180px"
              className="sm:h-[220px] md:h-[280px]"
              language="javascript"
              value={js}
              onChange={(value) => setjs(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
              }}
            />
          </div>
        )}
      </div>

      {/* Output */}
      <div className="w-full mt-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-white">Output</h2>
        <hr className="border-gray-700 my-2" />
        <div className="w-full aspect-video max-h-[400px] rounded-lg overflow-hidden shadow border border-gray-800">
          <iframe
            srcDoc={srcDoc}
            title="output"
            sandbox="allow-scripts allow-modals"
            frameBorder="0"
            className="w-full h-full bg-white"
          />
        </div>
      </div>
    </div>
  );
};
