"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Annotation } from "@/context/annotation-context"

interface CommentDialogProps {
  annotation: Annotation
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
  onDelete: () => void
}

export default function CommentDialog({ annotation, isOpen, onClose, onSave, onDelete }: CommentDialogProps) {
  const [content, setContent] = useState(annotation.content || "")

  const handleSave = () => {
    onSave(content)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your comment here..."
            className="min-h-32"
            autoFocus
          />
        </div>
        <DialogFooter className="flex space-x-2 sm:justify-between">
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

