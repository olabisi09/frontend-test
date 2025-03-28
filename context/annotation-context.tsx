"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type AnnotationType =
  | "highlight"
  | "underline"
  | "comment"
  | "signature"
  | null;

export interface Annotation {
  type: AnnotationType;
  x: number;
  y: number;
  pageNumber: number;
  color: string;
  content?: string;
  timestamp: string;
  width?: number;
  height?: number;
}

interface AnnotationContextType {
  annotationMode: AnnotationType;
  setAnnotationMode: (mode: AnnotationType) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  annotations: Annotation[];
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (index: number, annotation: Annotation) => void;
  removeAnnotation: (index: number) => void;
  clearAnnotations: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(
  undefined
);

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [annotationMode, setAnnotationMode] = useState<AnnotationType>(null);
  const [currentColor, setCurrentColor] = useState<string>("#ff0000");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const addAnnotation = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  };

  const updateAnnotation = (index: number, annotation: Annotation) => {
    setAnnotations((prev) => {
      const newAnnotations = [...prev];
      newAnnotations[index] = annotation;
      return newAnnotations;
    });
  };

  const removeAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  return (
    <AnnotationContext.Provider
      value={{
        annotationMode,
        setAnnotationMode,
        currentColor,
        setCurrentColor,
        annotations,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
        clearAnnotations,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotation() {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error("useAnnotation must be used within an AnnotationProvider");
  }
  return context;
}
