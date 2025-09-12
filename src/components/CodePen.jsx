import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export const CodePen = ({ showCss = true, showJs = true }) => {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  // dynamic grid cols
  const gridCols =
    showCss && showJs
      ? "grid-cols-1 md:grid-cols-3"
      : showCss || showJs
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1";

  return (
    <div className="p-4 bg-[#0f172a] min-h-screen">
      {/* Editors */}
      <div className={`grid gap-4 ${gridCols}`}>
        {/* HTML */}
        <div className="rounded-lg bg-black shadow overflow-hidden">
          <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
            <h3 className="font-semibold">HTML</h3>
          </div>
          <Editor
            height="180px"
            className="sm:h-[220px] md:h-[280px]"
            language="html"
            value={html}
            onChange={(value) => setHtml(value || "")}
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
          <div className="rounded-lg bg-black shadow overflow-hidden">
            <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
              <h3 className="font-semibold">CSS</h3>
            </div>
            <Editor
              height="180px"
              className="sm:h-[220px] md:h-[280px]"
              language="css"
              value={css}
              onChange={(value) => setCss(value || "")}
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
          <div className="rounded-lg bg-black shadow overflow-hidden">
            <div className="flex items-center justify-between p-2 text-white bg-[#1e293b]">
              <h3 className="font-semibold">JS</h3>
            </div>
            <Editor
              height="180px"
              className="sm:h-[220px] md:h-[280px]"
              language="javascript"
              value={js}
              onChange={(value) => setJs(value || "")}
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
        <h2 className="text-center text-xl md:text-2xl font-bold text-white">
          Output
        </h2>
        <hr className="border-gray-700 my-2" />
        <div className="w-full aspect-video max-h-[400px] rounded-lg overflow-hidden shadow">
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
