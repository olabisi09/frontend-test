"use client";

import { useState } from "react";
import DocumentViewer from "@/components/document-viewer";
import ToolBar from "@/components/tool-bar";
import UploadArea from "@/components/upload-area";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { AnnotationProvider } from "@/context/annotation-context";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (newFile: File | null) => {
    if (newFile) {
      if (newFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF document",
          variant: "destructive",
        });
        return;
      }

      setFile(newFile);
      toast({
        title: "Document uploaded",
        description: `${newFile.name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background p-4">
        <h1 className="text-2xl font-bold">
          Document Signer & Annotation Tool
        </h1>
      </header>

      <div className="flex flex-1 flex-col">
        {!file ? (
          <UploadArea onFileChange={handleFileChange} />
        ) : (
          <AnnotationProvider>
            <div className="flex flex-1 flex-col md:flex-row">
              <ToolBar file={file} />
              <DocumentViewer file={file} />
            </div>
          </AnnotationProvider>
        )}
      </div>

      <Toaster />
    </main>
  );
}
