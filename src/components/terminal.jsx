// TerminalView.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import "xterm/css/xterm.css";

const TerminalView = forwardRef(({ wsUrl, clientId, lang }, ref) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);

  let inputBuffer = "";
  useEffect(() => {
    // Init terminal
    const term = new Terminal({
      convertEol: true,
      fontFamily: "monospace",
      fontSize: 14,
      theme: { background: "#000000", foreground: "#ffffff" },
    });
    const fitAddon = new FitAddon();
    const clipboardAddon = new ClipboardAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(clipboardAddon);
    term.open(terminalRef.current);
    xtermRef.current = term;

    // Connect WebSocket
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ clientId }));
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(lang);

      if (msg.type === "stdout") {
        const filteredData = msg.data.replace("spawn ./code", "").trim();
        if (filteredData.length > 0) {
          term.write(filteredData);
        }
      } else if (msg.type === "stderr") {
        term.write(`\x1b[31m[ERR] ${msg.data}\x1b[0m`);
      } else if (msg.type === "close") {
        term.write(
          `\r\n\x1b[33m[Process exited with code ${msg.code}]\x1b[0m\r\n`
        );
      }
    };
    term.attachCustomKeyEventHandler((e) => {
      if(e.ctrlKey && e.key.toLowerCase() === "c"){
        clipboardAddon.copy();
        return false;
      }
      if(e.ctrlKey && e.key.toLowerCase() === "v"){
        clipboardAddon.paste();
        return false;
      }
      return true;
    })

    term.onData((data) => {
      // Echo locally **except for Enter**
      if (data === "\r") {
        // Move to new line when Enter is pressed

        term.write("\r\n");

        // Send Enter to backend
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log(inputBuffer);
          wsRef.current.send(JSON.stringify({ type: "stdin", clientId, data: inputBuffer + "\n" }));
        }
        inputBuffer = "";

      }else if(data === "\x7f"){
        if(inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);

          term.write("\b \b");
        }
      }
      else {
        // Echo other keys as usual
        inputBuffer += data;
        // if(lang !== 'c'){}
        term.write(data);

      }
    });

    return () => {
      wsRef.current.close();
      term.dispose();
    };
  }, [wsUrl, clientId, lang]);

  // Allow parent to clear terminal
  useImperativeHandle(ref, () => ({
    clear: () => {
      xtermRef.current?.clear();
    },
    write: (msg) => {
      xtermRef.current?.write(msg);
    },
  }));

  return (
    <div
      ref={terminalRef}
      className="bg-black rounded border border-gray-700 h-full p-2 overflow-hidden"
    ></div>
  );
});

export default TerminalView;
