// CodeRunner.jsx
import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import TerminalView from "./terminal";
import { useLocation, useNavigate } from "react-router-dom";

export const Ide = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const templates = {
  python: `# Write your code here
print("Hello from Python")`,
  node: `// write your code here
console.log("Hello, Node.js!");`,
  php: `<?php
  // Write your code here
  echo "Hello, PHP!";
?>`,
  java:`public class Main {
    public static void main(String[] args) {     
        // Write your code here
        System.out.println("Hello, Java!");
    }
}`,
  cpp:`#include <iostream>
    using namespace std;

    // Write your code here
    int main() {
        cout << "Hello, C++!" << endl;
        return 0;
    }`,
};
  const [code, setCode] = useState(localStorage.getItem("codeToEdit") || "");
  const [language, setLanguage] = useState(localStorage.getItem("codeLanguage") || "python");
  const clientIdRef = useRef(Math.random().toString(36).substring(2));
  const terminalRef = useRef(null);

  const runCode = async () => {
    terminalRef.current?.clear();
    terminalRef.current?.write(`Running ${language} code...\r\n`);

  await fetch("https://backend-hosting-d4f6.onrender.com/api/ide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        language,
        clientId: clientIdRef.current,
      }),
    });
  };

  const monacoLangMap = {
    python: "python",
    node: "javascript",
    php: "php",
    java: "java",
    cpp: "cpp",
  };
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(templates[newLang]); // load boilerplate for new language
  };

  return (
      <div className="p-6 font-mono text-sm bg-[#0f172a]">
        <div className="flex justify-between items-center">
          <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1 ml-3 rounded-lg bg-[#00AEEF] text-white font-semibold shadow hover:bg-[#0098d4] transition-all duration-200"
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
          <h1 className="text-2xl font-bold text-white">Test The Code Here</h1>
          <h1></h1>
        </div>
        <div className="flex p-4 font-mono text-sm gap-4 h-screen bg-[#0f172a]">
          <div className="flex-1 flex flex-col bg-[#1e293b] rounded-lg overflow-hidden shadow">
            <div className="flex items-center justify-between pl-4 py-2 bg-[#0f172a] text-gray-200 text-sm font-semibold border-b border-gray-700">
              <span>Code Editor</span>
              <button
                  onClick={runCode}
                  className="px-4 py-1 w-20 bg-[#00A8E8] hover:bg-[#2B98C1] text-gray-200 font-bold rounded transition"
              >
                Run
              </button>
            </div>
            <Editor
                height="100%"
                language={monacoLangMap[language]}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
            />
          </div>

          <div className="w-1/3 flex flex-col bg-[#1e293b] rounded-lg overflow-hidden shadow">
            <div className="py-3 bg-[#0f172a] text-gray-200 text-sm font-semibold border-b border-gray-700">
              Terminal
            </div>
            <div className="flex-1 text-gray-200">
              <TerminalView
                  ref={terminalRef}
                  wsUrl="wss://backend-hosting-d4f6.onrender.com"
                  clientId={clientIdRef.current}
                  lang={language}
              />
            </div>
          </div>

        </div>
      </div>

  );
};
