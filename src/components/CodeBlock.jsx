import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CodeBlock = ({ 
  rawCode, 
  title = "Example", 
  description = "Our \"Try it Yourself\" editor makes it easy to learn programming. You can edit code and view the result in your browser.",
  language
}) => {
  const [displayCode, setDisplayCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (rawCode) {
      setDisplayCode(rawCode);
    }
  }, [rawCode, language]);

  const handleTryItYourself = () => {
    const cleanCode = rawCode.replace(/&nbsp;/g, ' ');
    
    localStorage.removeItem("htmlCode");
    localStorage.removeItem("cssCode");
    localStorage.removeItem("jsCode");
    localStorage.removeItem("codeToEdit");
    
    if (language === "html" || language === "css" || language === "javascript") {
      const cssMatch = cleanCode.match(/<style>([\s\S]*?)<\/style>/i);
      const jsMatch = cleanCode.match(/<script>([\s\S]*?)<\/script>/i);

      const htmlOnly = cleanCode
        .replace(/<style>[\s\S]*?<\/style>/gi, "")
        .replace(/<script>[\s\S]*?<\/script>/gi, "");

      const cssOnly = cssMatch ? cssMatch[1].trim() : "";
      const jsOnly = jsMatch ? jsMatch[1].trim() : "";

      localStorage.setItem("htmlCode", htmlOnly);
      localStorage.setItem("cssCode", cssOnly);
      localStorage.setItem("jsCode", jsOnly);
      window.location.href = "/htmlTest";
    } else {
      localStorage.setItem("codeToEdit", cleanCode);
      localStorage.setItem("codeLanguage", language);
      window.location.href = "/ide";
    }
  };

  return (
    <div className="my-6 bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-300">
      {/* Header */}
      <div className="bg-gray-200 px-4 py-3 border-b border-gray-300">
        <h4 className="text-gray-800 font-semibold text-lg">{title}</h4>
      </div>
      
      {/* Description */}
      <div className="px-4 py-3 bg-gray-100">
        <p className="text-gray-700 text-sm">
          {description}
        </p>
      </div>
      
      {/* Code Area */}
      <div className="bg-white border-l-4 border-[#2C3E50] p-4">
        <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
          <code 
            className="block text-red-600"
            style={{ backgroundColor: 'transparent', background: 'transparent' }}
          >
            {displayCode}
          </code>
        </pre>
      </div>
      
      {/* Try it yourself button */}
      <div className="px-4 py-3 bg-gray-100">
        <button
          onClick={handleTryItYourself}
          className="bg-[#2C3E50] hover:bg-[#1E2B3A] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Try it Yourself »
        </button>
      </div>
    </div>
  );
};

// Hook to process lesson content and extract code blocks
export const useCodeProcessor = (content) => {
  const [processedContent, setProcessedContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    if (!content) {
      setProcessedContent("");
      setCodeBlocks([]);
      return;
    }

    const extractedCodes = [];
    let blockIndex = 0;

    // Replace Quill code blocks with placeholders
    const processedHtml = content.replace(
      /<pre[^>]*class="ql-syntax"[^>]*>([\s\S]*?)<\/pre>/g,
      (match, codeContent) => {
        // Clean up the code content
        const cleanCode = codeContent
          .replace(/<br>/g, '\n')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"') 
          .replace(/&nbsp;/g, ' ')
          .trim();

        // Store the raw code
        extractedCodes.push({
          id: blockIndex,
          rawCode: cleanCode,
          language: 'auto' // Auto-detect language
        });

        // Return a placeholder that will be replaced with React component
        return `<div class="code-block-placeholder" data-block-id="${blockIndex++}"></div>`;
      }
    );

    setProcessedContent(processedHtml);
    setCodeBlocks(extractedCodes);
  }, [content]);

  return { processedContent, codeBlocks };
};

// Component to render processed content with code blocks
export const ProcessedContent = ({ content, className = "" , language}) => {
  const { processedContent, codeBlocks } = useCodeProcessor(content);
  const [contentWithCodeBlocks, setContentWithCodeBlocks] = useState("");
  console.log(language);

  useEffect(() => {
    if (processedContent && codeBlocks.length > 0) {
      // Replace placeholders with actual CodeBlock components
      let finalContent = processedContent;
      
      codeBlocks.forEach(block => {
        const placeholder = `<div class="code-block-placeholder" data-block-id="${block.id}"></div>`;
        const codeBlockHtml = `
          <div class="code-block-container" data-raw-code="${encodeURIComponent(block.rawCode)}" data-language="${block.language}">
            <!-- CodeBlock will be rendered here -->
          </div>
        `;
        finalContent = finalContent.replace(placeholder, codeBlockHtml);
      });

      setContentWithCodeBlocks(finalContent);

      // Process code block containers after DOM update
      setTimeout(() => {
        const containers = document.querySelectorAll('.code-block-container');
        containers.forEach(container => {
          if (!container.dataset.processed) {
            const rawCode = decodeURIComponent(container.dataset.rawCode);
            // const detectedLang = detectLanguage(rawCode);
            
            // Create CodeBlock HTML
            const codeBlockHtml = createCodeBlockHTML(rawCode, language);
            container.innerHTML = codeBlockHtml;
            container.dataset.processed = 'true';
          }
        });
      }, 100);
    } else {
      setContentWithCodeBlocks(processedContent);
    }
  }, [processedContent, codeBlocks]);

  const createCodeBlockHTML = (rawCode, language) => {
    // Escape HTML entities for display
    const escapedCode = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // Generate unique ID for this button
    const buttonId = `try-it-btn-${Math.random().toString(36).substr(2, 9)}`;

    return `
      <div class="my-6 bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-300">
        <div class="bg-gray-200 px-4 py-3 border-b border-gray-300">
          <h4 class="text-gray-800 font-semibold text-lg">Example</h4>
        </div>
        <div class="px-4 py-3 bg-gray-100">
          <p class="text-gray-700 text-sm">
            Our "Try it Yourself" editor makes it easy to learn programming. You can edit code and view the result in your browser.
          </p>
        </div>
        <div class="bg-white border-l-4 border-[#2C3E50] p-4">
          <pre class="text-sm font-mono leading-relaxed overflow-x-auto text-red-600" style="background: transparent !important; margin: 0;"><code style="background: transparent !important; background-color: transparent !important;">${escapedCode}</code></pre>
        </div>
        <div class="px-4 py-3 bg-gray-100">
          <button 
            id="${buttonId}"
            class="bg-[#2C3E50] hover:bg-[#1E2B3A] text-white px-4 py-2 rounded text-sm font-medium transition-colors try-it-button"
            data-raw-code="${encodeURIComponent(rawCode)}"
            data-language="${language}"
          >
            Try it Yourself »
          </button>
        </div>
      </div>
    `;
  };

  // Handle button clicks using event delegation
  useEffect(() => {
    const handleButtonClick = (event) => {
      if (event.target.classList.contains('try-it-button')) {
        const encodedCode = event.target.dataset.rawCode;
        const language = event.target.dataset.language;
        
        const rawCode = decodeURIComponent(encodedCode);
        const cleanCode = rawCode.replace(/&nbsp;/g, ' ');
        
        localStorage.removeItem("htmlCode");
        localStorage.removeItem("cssCode");
        localStorage.removeItem("jsCode");
        localStorage.removeItem("codeToEdit");
        
        if (language === "html" || language === "css" || language === "javascript") {
          const cssMatch = cleanCode.match(/<style>([\s\S]*?)<\/style>/i);
          const jsMatch = cleanCode.match(/<script>([\s\S]*?)<\/script>/i);

          const htmlOnly = cleanCode
            .replace(/<style>[\s\S]*?<\/style>/gi, "")
            .replace(/<script>[\s\S]*?<\/script>/gi, "");

          const cssOnly = cssMatch ? cssMatch[1].trim() : "";
          const jsOnly = jsMatch ? jsMatch[1].trim() : "";

          localStorage.setItem("htmlCode", htmlOnly);
          localStorage.setItem("cssCode", cssOnly);
          localStorage.setItem("jsCode", jsOnly);
          window.location.href = "/htmlTest";
        } else {
          localStorage.setItem("codeToEdit", cleanCode);
          localStorage.setItem("codeLanguage", language);
          window.location.href = "/ide";
        }
      }
    };

    document.addEventListener('click', handleButtonClick);

    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, []);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: contentWithCodeBlocks }}
    />
  );
};

export default CodeBlock;