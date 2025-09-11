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
    <div>
      <div className="flex items-center py-2 bg-[#0f172a]">
      <button
        onClick={() => {
          navigate(`/course/${localStorage.getItem("currentCourseId")}`);
          // Scroll to top after navigation
          setTimeout(() => window.scrollTo({ top: 0 , behavior: 'smooth' }), 100);
        }}
        className="flex items-center gap-2 px-3 py-1 ml-3 rounded-lg bg-[#2C3E50] text-white 
    font-semibold shadow hover:bg-[#3d5164] transform transition-all duration-300 
    hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-200 mx-auto">Test Your Code Here</h1>
      </div>
      <div
        className={`grid gap-1 bg-[#0f172a] ${
          showCss && showJs
            ? "grid-cols-3"
            : showCss || showJs
            ? "grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        <div className="border rounded-tr rounded-tl bg-black overflow-hidden border-none">
          <div className="flex w-100% justify-between p-2 text-white">
            <h3 className="">HTML</h3>
          </div>
          <Editor
            height="300px"
            language="html"
            value={html}
            onChange={(value) => sethtml(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false }, // remove right minimap
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        {showCss && (
          <div className="border rounded-tr rounded-tl bg-black overflow-hidden border-none">
            <div></div>
            <div className="flex w-100% justify-between p-2 text-white">
              <h3 className="">CSS</h3>
            </div>
            <Editor
              height="300px"
              language="css"
              value={css}
              onChange={(value) => setcss(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}
        {showJs && (
          <div className="border rounded-tr rounded-tl bg-black overflow-hidden border-none">
            <div className="flex w-100% justify-between p-2 text-white">
              <h3 className="">JS</h3>
            </div>
            <Editor
              height="300px"
              language="javascript"
              value={js}
              onChange={(value) => setjs(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}
      </div>

      <div className="w-full h-150 border-1">
        <h2 className="text-center text-2xl font-bold">Output</h2>
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts allow-modals"
          frameBorder="0"
          width="100%"
          height="100%"
        >
          {" "}
        </iframe>
      </div>
    </div>
  );
};
