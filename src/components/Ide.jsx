// IDE (responsive like CodeRunner)
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
    java: `public class Main {
  public static void main(String[] args) {     
      // Write your code here
      System.out.println("Hello, Java!");
  }
}`,
    cpp: `#include <iostream>
using namespace std;

// Write your code here
int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`,
  };
  const [code, setCode] = useState(localStorage.getItem("codeToEdit") || "");
  const [language, setLanguage] = useState(
    localStorage.getItem("codeLanguage") || "python"
  );
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
    try {
      localStorage.setItem("codeLanguage", newLang);
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#233554] p-2 md:p-6 pb-6 font-mono text-sm">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-[#0f172a] bg-opacity-90 rounded-lg shadow px-4 py-3 border border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 rounded bg-[#00AEEF] text-white font-semibold shadow hover:bg-[#0098d4] transition"
          aria-label="Go back"
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
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight text-center flex-1">
          Test The Code Here
        </h1>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="ml-4 px-3 py-1 rounded bg-blue-500 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border border-blue-400 hover:bg-blue-600 transition"
        >
          <option value="python">Python</option>
          <option value="node">Node.js</option>
          <option value="php">PHP</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Main Content */}
  <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e293b] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] text-gray-200 text-sm font-semibold border-b border-gray-700">
            <span className="tracking-wide">Code Editor</span>
            <button
              onClick={runCode}
              className="px-4 py-1 w-20 bg-gradient-to-r from-[#00A8E8] to-[#2B98C1] hover:from-[#2B98C1] hover:to-[#00A8E8] text-gray-100 font-bold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            >
              Run
            </button>
          </div>
          <div className="flex-1 h-64 lg:h-[70vh] overflow-y-auto">
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
        </div>

        {/* Terminal */}
        <div className="flex-1 lg:w-1/3 flex flex-col bg-[#1e293b] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 bg-[#0f172a] text-gray-200 text-sm font-semibold border-b border-gray-700">
            Terminal
          </div>
          <div className="flex-1 text-gray-200 overflow-y-auto">
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
