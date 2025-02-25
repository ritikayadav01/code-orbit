import { useState } from "react";

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-4 bg-[#0a0a0f] rounded-lg overflow-hidden border border-[#ffffff0a]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#ffffff08]">
        <div className="flex items-center gap-2">
          <img src={`/${language}.png`} alt={language} className="size-4 object-contain" />
          <span className="text-sm text-gray-400">{language || "plaintext"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-300 hover:text-white text-sm bg-[#ffffff10] px-2 py-1 rounded"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code block */}
      <div className="relative p-4 overflow-x-auto">
        <pre className="text-gray-200 text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
