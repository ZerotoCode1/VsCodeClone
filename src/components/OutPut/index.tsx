import { useState } from "react";
import { executeCode } from "../../Api";

interface OutputProps {
  editorRef: any;
  language: any;
}

const Output: React.FC<OutputProps> = ({ editorRef, language }) => {
  const [output, setOutput] = useState<string[] | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const runCode = async () => {
    setLoading(true);
    // if (!editorRef.current) return;

    const sourceCode = editorRef.current.getValue();
    // if (!sourceCode) return;

    try {
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      if (result) {
        setLoading(false);
      }
      setIsError(!!result.stderr);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={runCode}
        style={{
          padding: "8px 16px",
          marginBottom: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Run Code
      </button>
      <div
        style={{
          height: "75vh",
          padding: "16px",
          color: isError ? "red" : "#ccc",
          border: "1px solid",
          borderRadius: "4px",
          borderColor: isError ? "red" : "#333",
          overflowY: "auto"
        }}
      >
        {loading && <div className="loader"></div>}
        {output
          ? output.map((line, i) => <p key={i}>{line}</p>)
          : 'Click "Run Code" to see the output here'}
      </div>
    </div>
  );
};

export default Output;
