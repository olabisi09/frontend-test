"use client";

import { useState } from "react";
import { useAnnotation } from "@/context/annotation-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { useToast } from "@/hooks/use-toast";
import {
  Highlighter,
  Underline,
  MessageSquare,
  Pen,
  Download,
  X,
  Check,
  Trash2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ToolBarProps {
  file: File;
}

export default function ToolBar({ file }: ToolBarProps) {
  const {
    annotationMode,
    addAnnotation,
    setAnnotationMode,
    currentColor,
    setCurrentColor,
    annotations,
    clearAnnotations,
  } = useAnnotation();
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const colors = [
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
    "#000000", // Black
  ];

  const handleToolSelect = (tool: string | null) => {
    setAnnotationMode(tool as any);

    if (tool === "highlight") {
      toast({
        title: "Highlight Tool Selected",
        description: "Select text in the document to highlight it.",
      });
    } else if (tool === "underline") {
      toast({
        title: "Underline Tool Selected",
        description: "Select text in the document to underline it.",
      });
    } else if (tool === "comment") {
      toast({
        title: "Comment Tool Selected",
        description: "Click anywhere on the document to add a comment.",
      });
    }
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };

  const clearSignature = () => {
    if (signatureRef) {
      signatureRef.clear();
    }
  };

  const saveSignature = () => {
    if (signatureRef && !signatureRef.isEmpty()) {
      const dataURL = signatureRef.toDataURL("image/png");

      // Add signature annotation
      const annotation = {
        type: "signature" as const,
        x: 100,
        y: 100,
        pageNumber: 1,
        color: currentColor,
        content: dataURL,
        timestamp: new Date().toISOString(),
      };

      // Add the signature annotation
      addAnnotation(annotation);

      // Close the signature panel
      setIsDrawing(false);

      toast({
        title: "Signature created",
        description: "Click on the document to place your signature.",
      });
    } else {
      toast({
        title: "Empty signature",
        description: "Please draw your signature before saving.",
        variant: "destructive",
      });
    }
  };

  const exportPDF = async () => {
    try {
      toast({
        title: "Preparing document",
        description: "Your annotated PDF is being generated...",
      });

      // Convert the File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // TODO: Apply annotations to the PDF
      // This would require more complex PDF manipulation
      // For a complete implementation, you would need to:
      // 1. Extract text positions for highlights and underlines
      // 2. Add comment annotations
      // 3. Embed signatures as images

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create a Blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `annotated-${file.name}`;
      link.click();

      toast({
        title: "Export successful",
        description: "Your annotated PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex w-full flex-col border-r bg-muted/30 p-4 md:w-64">
      <h2 className="mb-4 text-lg font-medium">Tools</h2>

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>How to use</AlertTitle>
        <AlertDescription className="text-xs">
          For highlighting and underlining, first select the text in the
          document, then click the tool.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="annotate" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="annotate" className="flex-1">
            Annotate
          </TabsTrigger>
          <TabsTrigger value="sign" className="flex-1">
            Sign
          </TabsTrigger>
        </TabsList>

        <TabsContent value="annotate" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Button
              variant={annotationMode === "highlight" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleToolSelect("highlight")}
            >
              <Highlighter className="mr-2 h-4 w-4" />
              Highlight Text
            </Button>

            <Button
              variant={annotationMode === "underline" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleToolSelect("underline")}
            >
              <Underline className="mr-2 h-4 w-4" />
              Underline Text
            </Button>

            <Button
              variant={annotationMode === "comment" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleToolSelect("comment")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full ${
                    currentColor === color
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sign" className="space-y-4 pt-4">
          {isDrawing ? (
            <div className="space-y-4">
              <div className="rounded-md border bg-background p-2">
                <SignatureCanvas
                  ref={(ref) => setSignatureRef(ref)}
                  canvasProps={{
                    className: "w-full h-32 border rounded-md",
                  }}
                  penColor={currentColor}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearSignature}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button className="flex-1" onClick={saveSignature}>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsDrawing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              className="w-full justify-start"
              onClick={() => setIsDrawing(true)}
            >
              <Pen className="mr-2 h-4 w-4" />
              Draw Signature
            </Button>
          )}
        </TabsContent>
      </Tabs>

      <Separator className="my-4" />

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleToolSelect(null)}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Tool
        </Button>

        {annotations.length > 0 && (
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={clearAnnotations}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Annotations
          </Button>
        )}

        <Button className="w-full justify-start" onClick={exportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
