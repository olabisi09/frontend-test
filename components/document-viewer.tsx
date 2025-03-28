"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useAnnotation } from "@/context/annotation-context";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentDialog from "./comment-dialog";

// Initialize pdfjs worker
const pdfWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface DocumentViewerProps {
  file: File;
}

export default function DocumentViewer({ file }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    annotationMode,
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    currentColor,
  } = useAnnotation();
  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState<{
    text: string;
    range: Range | null;
    rect: DOMRect | null;
  }>({ text: "", range: null, rect: null });
  const [activeComment, setActiveComment] = useState<{
    annotation: any;
    index: number;
  } | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Handle text selection for highlighting
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (
        !selection ||
        selection.rangeCount === 0 ||
        !selection.toString().trim()
      ) {
        setSelectedText({ text: "", range: null, rect: null });
        return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();

      // Only process selections within the PDF container
      if (containerRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setSelectedText({ text, range, rect });
      }
    };

    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, []);

  // Apply highlight or underline to selected text
  useEffect(() => {
    if (
      (annotationMode === "highlight" || annotationMode === "underline") &&
      selectedText.range &&
      selectedText.rect
    ) {
      const container = containerRef.current;
      const page = pageRef.current;
      if (!container || !page) return;

      const containerRect = container.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      const selectionRect = selectedText.rect;

      // Calculate position relative to the page element, not the container
      // This is crucial for accurate positioning
      const x = selectionRect.left - pageRect.left;
      const y = selectionRect.top - pageRect.top;
      const width = selectionRect.width;
      const height = selectionRect.height;

      // Add annotation
      addAnnotation({
        type: annotationMode,
        x,
        y,
        width,
        height,
        pageNumber,
        color: currentColor,
        content: selectedText.text,
        timestamp: new Date().toISOString(),
      });

      // Clear selection after highlighting/underlining
      window.getSelection()?.removeAllRanges();
      setSelectedText({ text: "", range: null, rect: null });
    }
  }, [selectedText, annotationMode, addAnnotation, currentColor, pageNumber]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !annotationMode ||
      annotationMode === "highlight" ||
      annotationMode === "underline"
    )
      return;

    const page = pageRef.current;
    if (!page) return;

    const rect = page.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add annotation based on the current mode
    if (annotationMode === "comment") {
      const newAnnotation = {
        type: annotationMode,
        x,
        y,
        pageNumber,
        color: currentColor,
        content: "",
        timestamp: new Date().toISOString(),
      };

      const index = annotations.length;
      addAnnotation(newAnnotation);

      // Open comment dialog immediately after adding
      setActiveComment({
        annotation: newAnnotation,
        index,
      });
    } else if (annotationMode === "signature") {
      addAnnotation({
        type: annotationMode,
        x,
        y,
        pageNumber,
        color: currentColor,
        content: annotations.find((a) => a.type === "signature")?.content || "",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleCommentClick = (
    annotation: any,
    index: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setActiveComment({ annotation, index });
  };

  const handleCommentSave = (content: string) => {
    if (activeComment) {
      const updatedAnnotation = {
        ...activeComment.annotation,
        content,
      };
      updateAnnotation(activeComment.index, updatedAnnotation);
      setActiveComment(null);

      toast({
        title: "Comment saved",
        description: "Your comment has been saved successfully.",
      });
    }
  };

  const handleCommentDelete = () => {
    if (activeComment) {
      removeAnnotation(activeComment.index);
      setActiveComment(null);

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const handleNextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/50 p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="rounded-md bg-background px-2 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages || "?"}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="rounded-md bg-background px-2 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="rounded-md bg-background px-2 py-1 text-sm"
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="rounded-md bg-background px-2 py-1 text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 justify-center overflow-auto p-4"
        ref={containerRef}
      >
        <div
          className="relative shadow-lg"
          ref={pageRef}
          onClick={handlePageClick}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
            error={
              <div className="flex h-96 w-full flex-col items-center justify-center text-destructive">
                <p className="text-lg font-medium">Failed to load PDF</p>
                <p className="text-sm">
                  Please try again with a different file
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              canvasRef={canvasRef}
              className="relative" // Important for positioning
            />
          </Document>

          {/* Render annotations for the current page */}
          {annotations
            .filter((anno) => anno.pageNumber === pageNumber)
            .map((annotation, index) => {
              switch (annotation.type) {
                case "highlight":
                  return (
                    <div
                      key={index}
                      className="absolute pointer-events-none opacity-40"
                      style={{
                        left: `${annotation.x}px`,
                        top: `${annotation.y}px`,
                        width: annotation.width
                          ? `${annotation.width}px`
                          : "100px",
                        height: annotation.height
                          ? `${annotation.height}px`
                          : "20px",
                        backgroundColor: annotation.color,
                      }}
                      title={annotation.content || "Highlighted text"}
                    />
                  );
                case "underline":
                  return (
                    <div
                      key={index}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${annotation.x}px`,
                        top: `${annotation.y + (annotation.height || 0)}px`, // Position at the bottom of the text
                        width: annotation.width
                          ? `${annotation.width}px`
                          : "100px",
                        height: "2px",
                        backgroundColor: annotation.color,
                      }}
                      title={annotation.content || "Underlined text"}
                    />
                  );
                case "comment":
                  return (
                    <div
                      key={index}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${annotation.x}px`,
                        top: `${annotation.y}px`,
                      }}
                      onClick={(e) => handleCommentClick(annotation, index, e)}
                      title={
                        annotation.content
                          ? "Click to edit comment"
                          : "Click to add comment text"
                      }
                    >
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                        style={{ backgroundColor: annotation.color }}
                      >
                        {index + 1}
                      </div>
                    </div>
                  );
                case "signature":
                  return (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${annotation.x}px`,
                        top: `${annotation.y}px`,
                      }}
                    >
                      <img
                        src={annotation.content || "/placeholder.svg"}
                        alt="Signature"
                        className="max-h-20 max-w-40"
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })}
        </div>
      </div>

      {/* Comment Dialog */}
      {activeComment && (
        <CommentDialog
          annotation={activeComment.annotation}
          isOpen={!!activeComment}
          onClose={() => setActiveComment(null)}
          onSave={handleCommentSave}
          onDelete={handleCommentDelete}
        />
      )}
    </div>
  );
}
