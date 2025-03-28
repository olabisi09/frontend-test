"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FileUp } from "lucide-react"

interface UploadAreaProps {
  onFileChange: (file: File | null) => void
}

export default function UploadArea({ onFileChange }: UploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0])
      }
    },
    [onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div
        {...getRootProps()}
        className={`flex h-80 w-full max-w-3xl flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-medium">Upload your document</h3>
        <p className="mb-4 text-sm text-muted-foreground">Drag and drop your PDF here, or click to select a file</p>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Select PDF
        </button>
      </div>
    </div>
  )
}

