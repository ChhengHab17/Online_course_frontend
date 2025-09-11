import react, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export const CodePen = ({ showCss = true, showJs = true }) => {
  const [html, sethtml] = useState("");
  const [css, setcss] = useState("");
  const [js, setjs] = useState("");
  const [srcDoc, setsrcDoc] = useState("");

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
      <div
        className={`grid gap-4 bg-[#0f172a] ${
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
        <hr />
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts allow-modals"
          frameBorder="0"
          width="100%"
        >
          {" "}
        </iframe>
      </div>
    </div>
  );
};
