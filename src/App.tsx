import { Editor } from "@monaco-editor/react";
import React, { ReactNode, useRef, useState } from "react";
import Close from "./components/Icons/Close";
import Output from "./components/OutPut";
import { language, RenderImage } from "./contant";

type FileSystem = {
  [key: string]: FileSystem | { content: ReactNode | string };
};

const initialFileStructure: FileSystem = {
  src: {
    components: {
      "Header.ts": { content: '\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n' },
      "Footer.js": { content: "Footer Component Content" }
    },
    "App.ts": { content: '\nfunction greet(name : string) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n' },
    "index.js": { content: "Index File Content" }
  },
  public: {
    "index.html": { content: "<html>...</html>" },
    "favicon.ico": { content: "Binary content for favicon.ico" }
  },
  "README.md": { content: "This is the README file for the project." }
};

interface FolderProps {
  name: string;
  contents: FileSystem;
  level?: number;
  onFileSelect: (fileName: string, content: string) => void;
  selectedFile: string | null;
  onCreateFolder: (folderPath: string) => void;
  path: string;
}

const Folder: React.FC<FolderProps> = ({ name, contents, level = 0, onFileSelect, selectedFile, onCreateFolder, path }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onCreateFolder(path);
  };

  return (
    <div style={{ paddingLeft: level * 15 }} onContextMenu={handleContextMenu}>
      <div onClick={handleClick} style={{ cursor: "pointer", fontWeight: "bold" }}>
        {isOpen ? "📂" : "📁"} {name}
      </div>
      {isOpen &&
        Object.keys(contents).map((key) =>
          typeof contents[key] === "object" && "content" in contents[key] ? (
            <File
              key={key}
              name={key}
              content={(contents[key] as { content: string }).content}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
            />
          ) : (
            <Folder
              key={key}
              name={key}
              contents={contents[key] as FileSystem}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              onCreateFolder={onCreateFolder}
              path={`${path}/${key}`}
            />
          )
        )}
    </div>
  );
};

interface FileProps {
  name: string;
  content: string;
  onFileSelect: (fileName: string, content: string) => void;
  selectedFile: string | null;
  level: number;
}

const File: React.FC<FileProps> = ({ name, content, onFileSelect, selectedFile, level }) => {
  const isSelected = selectedFile === name;

  console.log(name, 'name')

  return (
    <div
      onClick={() => onFileSelect(name, content)}
      style={{
        paddingLeft: level * 15,
        cursor: "pointer",
        backgroundColor: isSelected ? "#333" : "transparent"
      }}
      className="flex items-center gap-1"
    >
      <img src={RenderImage(name?.split('.').pop())} height={15} width={15} /> {name}
    </div>
  );
};

const App: React.FC = () => {
  const [fileStructure, setFileStructure] = useState<FileSystem>(initialFileStructure);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [listSelect, setListSelect] = useState<string[]>([]);
  const editorRef = useRef();

  const handleFileSelect = (fileName: string, content: string) => {
    setListSelect(pre => listSelect.includes(fileName) ? pre : [...pre, fileName]);
    setSelectedFile(fileName);
    console.log(content)
  };
const handleCreateFolder = (folderPath: string) => {
  const paths = folderPath.split("/").filter(Boolean);
  let currentFolder = fileStructure;

  for (const segment of paths) {
    if (currentFolder[segment] && typeof currentFolder[segment] === "object" && !("content" in currentFolder[segment])) {
      currentFolder = currentFolder[segment] as FileSystem;
    } else {
      alert("You can only add a new folder or file to a folder.");
      return;
    }
  }

  const itemName = prompt("Enter the name of the new folder or file:");
  if (!itemName) return;

  const isFile = itemName.includes(".");

  setFileStructure((prevStructure) => {
    const updatedStructure = { ...prevStructure };
    let targetFolder = updatedStructure;

    paths.forEach((segment) => {
      targetFolder = targetFolder[segment] as FileSystem;
    });

    if (isFile) {
      targetFolder[itemName] = { content: "" }; 
    } else {
      targetFolder[itemName] = {}; 
    }

    return updatedStructure;
  });
};
  const handleClose = () => {
    if (listSelect.length > 1 && selectedFile) {
      const indexClose = listSelect.indexOf(selectedFile);
      setListSelect((pre) => pre.filter((item) => item !== selectedFile));
      handleFileSelect(listSelect[indexClose - 1], findContent(fileStructure, listSelect[indexClose - 1]) || "");
    } else {
      setListSelect([]);
      setSelectedFile(null);
    }
  };

  const findContent = (structure: FileSystem, fileName: string): string | null => {
    for (const key in structure) {
      if (key === fileName && "content" in structure[key]) {
        return (structure[key] as { content: string }).content;
      } else if (typeof structure[key] === "object" && !("content" in structure[key])) {
        const content = findContent(structure[key] as FileSystem, fileName);
        if (content) return content;
      }
    }
    return null;
  };
  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ path: string; content: React.ReactNode | string }[]>([]);
  const searchFiles = (
    fileSystem: FileSystem,
    searchTerm: string,
    path: string[] = []
  ): { path: string; content: React.ReactNode | string }[] => {
    const results: { path: string; content: React.ReactNode | string }[] = [];

    for (const key in fileSystem) {
      const value = fileSystem[key];

      if ("content" in value) {
        const filePath = [...path, key].join("/");

        if (key.includes(searchTerm) || (typeof value.content === "string" && value.content.includes(searchTerm))) {
          results.push({ path: filePath, content: value.content as ReactNode | string });
        }
      } else {
        results.push(...searchFiles(value, searchTerm, [...path, key]));
      }
    }

    return results;
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term) {
      const results = searchFiles(initialFileStructure, term);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  const handleBlurSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  }
  const handleChoseFile = (path: string) => {
    const file = path.split("/").pop();
    if (!file) return;
    console.log(file, 'file')
    handleFileSelect(file, findContent(fileStructure, file) || "")
    handleBlurSearch()
  }
  const updateFileContent = (structure: FileSystem, fileName: string, newContent: string): FileSystem => {
    const updatedStructure: FileSystem = {};

    for (const key in structure) {
      const item = structure[key];

      if (typeof item === "object" && "content" in item) {
        updatedStructure[key] = key === fileName ? { content: newContent } : item;
      } else if (typeof item === "object") {
        updatedStructure[key] = updateFileContent(item, fileName, newContent);
      }
    }
    return updatedStructure;
  };
  const onChangeEditor = (value: string) => {
    const contentChange = updateFileContent(fileStructure, selectedFile ?? 'App.js', value ?? "")
    setFileStructure(contentChange);
  }
  
  return (
    <div>
      <div className="py-2 flex items-center justify-center relative border-item-file h-full" >
        <input
          type="text"
          className="w-[500px] h-[38px] border-item-file p-3 rounded-[10px] outline-none bg-[#252526] text-white"
          placeholder="Search files..."
          value={searchTerm}
          onChange={handleSearchChange}
          onBlur={handleBlurSearch}
        />
        {searchTerm && searchResults.length > 0 && (
          <div
            className="absolute top-[87%] left-[50% - 250px] w-[500px] bg-[#333]  p-2 rounded-md shadow-lg z-10"
            style={{ maxHeight: "200px", overflowY: "auto" }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {searchResults.map((result, index) => (
              <div key={index} className="flex items-center gap-1 p-2 hover:bg-[#444] rounded-md cursor-pointer" onClick={() => handleChoseFile(result.path)}>
                <img
                  src={RenderImage(result.path.split(".").pop())}
                  alt=""
                  height={15}
                  width={15}
                />
                <span className="text-white">{result.path}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-full h-full">
        <div className="w-[300px] p-4 border-primary-right">
          <Folder
            name="root"
            contents={fileStructure}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onCreateFolder={handleCreateFolder}
            path=""
          />
        </div>
        <div className="w-full">
          <div className="flex cursor-pointer">
            {listSelect &&
              listSelect.map((item, index) => (
                <div key={index} className={`px-4 py-2 border-item-file ${selectedFile === item ? "actice-navbar" : ""}`}>
                  <div className="flex items-center justify-center">
                    <div onClick={() => handleFileSelect(item, findContent(fileStructure, item) || "")}>{item}</div>
                    {selectedFile === item && <div onClick={handleClose}> <Close /></div>}
                  </div>
                </div>
              ))}
          </div>
          {selectedFile && (
            <div style={{ height: "calc(100vh - 58px)" }}>
              <Editor
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                  lineNumbers: "on",
                  formatOnType: true,
                  scrollbar: {
                    vertical: "visible",
                    horizontal: "visible",
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
                onMount={onMount}
                height="70%"
                language={selectedFile.split('.').pop() as keyof typeof language ? language[selectedFile.split('.').pop() as keyof typeof language] : 'plaintext'}
                theme="vs-dark"
                value={findContent(fileStructure, selectedFile ?? '') ?? ''}
                onChange={(value) => onChangeEditor(value ?? '')}
              />
              <Output editorRef={editorRef} language={selectedFile.split('.').pop() as keyof typeof language ? language[selectedFile.split('.').pop() as keyof typeof language] : 'plaintext'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

