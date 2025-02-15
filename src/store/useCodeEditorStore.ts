import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";

import { CodeEditorState } from "@/types";

const getInitialState=()=>{
    // if we are on the server , retur default values 
    if(typeof window==="undefined")
    {
        return {
            language:"javascript",
            fontSize:16,
            theme:"vs-dark",
        }
    }

    // if we are on the client side get the values from the local storage as it is a browser api 

    const savedLanguage=localStorage.getItem("editor-language")||"javascript"
    const savedTheme=localStorage.getItem("editor-theme")||"vs-dark"
    const saveFontSize=localStorage.getItem("editor-font-Size")||16
    return{
        language:savedLanguage,
        theme:savedTheme,
        // local s will give the string we need the number 
        fontSize:Number(saveFontSize),
    }
}

// make the function type safe and on reloading there should be some initial state 
export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialState = getInitialState();
  
    return {
      ...initialState,
      output: "",
      isRunning: false,
      error: null,
      editor: null,
      executionResult: null,
  
      getCode: () => get().editor?.getValue() || "",
  
      setEditor: (editor: Monaco) => {
        const savedCode = localStorage.getItem(`editor-code-${get().language}`);
        if (savedCode) editor.setValue(savedCode);
  
        set({ editor });
      },
  
      setTheme: (theme: string) => {
        localStorage.setItem("editor-theme", theme);
        set({ theme });
      },
  
      setFontSize: (fontSize: number) => {
        localStorage.setItem("editor-font-size", fontSize.toString());
        set({ fontSize });
      },
  
      setLanguage: (language: string) => {
        // Save current language code before switching
        const currentCode = get().editor?.getValue();
        if (currentCode) {
          localStorage.setItem(`editor-code-${get().language}`, currentCode);
        }
  
        localStorage.setItem("editor-language", language);
  
        set({
          language,
          output: "",
          error: null,
        });
      },
  
      runCode: async () => {
        const { language, getCode } = get();
        const code = getCode();
  
        if (!code) {
          set({ error: "Please enter some code" });
          return;
        }
  // loading state set to true 
        set({ isRunning: true, error: null, output: "" });
  // piston ->run the code in an isolated environment such as in a docker 
        try {
          const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
          // version 2 of the piston 
          const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language: runtime.language,
              version: runtime.version,
              // we are sending the code as our content 
              files: [{ content: code }],
            }),
          });
  
          const data = await response.json();
  
          console.log("data back from piston:", data);
  
          // handle API-level erros
          if (data.message) {
            set({ error: data.message, executionResult: { code, output: "", error: data.message } });
            return;
          }
  
          // handle compilation errors
          // we are going to get different types of error depending on the compilation (language)
          if (data.compile && data.compile.code !== 0) {
            const error = data.compile.stderr || data.compile.output;
            set({
              error,
              executionResult: {
                code,
                output: "",
                error,
              },
            });
            return;
          }
  // handle the run time error 
          if (data.run && data.run.code !== 0) {
            const error = data.run.stderr || data.run.output;
            set({
              error,
              executionResult: {
                code,
                output: "",
                error,
              },
            });
            return;
          }
  
          // if we get here, execution was successful
          const output = data.run.output;
  
          set({
            output: output.trim(),
            error: null,
            executionResult: {
              code,
              output: output.trim(),
              error: null,
            },
          });
        } catch (error) {
          console.log("Error running code:", error);
          set({
            error: "Error running code",
            executionResult: { code, output: "", error: "Error running code" },
          });
        } finally {
          set({ isRunning: false });
        }
      },
    };
  });
  
  export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;