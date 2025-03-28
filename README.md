# Document Signer & Annotation Tool

A web-based application for viewing, annotating, and signing PDF documents. This tool allows users to highlight text, underline text, add comments, and place signatures on PDF documents.

## Setup and Running Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1.  Clone the repository:

```bash
git clone <repository-url>
cd document-signer
```

2. Install dependencies:

```shellscript
npm install
# or
yarn install
```

3. Run the development server:

```shellscript
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```shellscript
npm run build
npm run start
# or
yarn build
yarn start
```

## Libraries and Tools Used

### Core Technologies

- **Next.js**: React framework for server-rendered applications, providing routing, API routes, and optimized builds
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Adds static typing to JavaScript, improving developer experience and code quality

### PDF Processing

- **react-pdf**: Renders PDFs in the browser, providing text selection capabilities
- **pdf-lib**: Manipulates PDFs programmatically, used for exporting annotated documents
- **pdfjs-dist**: The core PDF.js library that powers the PDF rendering

### UI Components

- **shadcn/ui**: Component library built on Radix UI, providing accessible and customizable UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Popular icon library

### User Interaction

- **react-dropzone**: Handles file uploads with drag-and-drop functionality
- **react-signature-canvas**: Provides canvas-based signature drawing capabilities

## Challenges Faced and Solutions

### PDF.js Worker Loading

**Challenge**: The PDF.js worker needed to be properly loaded for PDF rendering to work correctly.

**Solution**: Configured the worker source URL to use a CDN version matching the installed PDF.js version, and added appropriate Content Security Policy headers in the Next.js configuration.

```javascript
// Initialize pdfjs worker
const pdfWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
```

### Text Selection and Annotation Positioning

**Challenge**: Accurately positioning annotations on selected text was difficult due to coordinate system differences between the PDF viewport and the DOM.

**Solution**: Implemented a system to calculate positions relative to the PDF page element rather than the window, ensuring annotations appear exactly where intended:

```javascript
const pageRect = page.getBoundingClientRect();
const selectionRect = selectedText.rect;

// Calculate position relative to the page element
const x = selectionRect.left - pageRect.left;
const y = selectionRect.top - pageRect.top;
```

### Text Layer Visibility

**Challenge**: The text layer created by react-pdf was visible below the PDF, creating a confusing duplicate view.

**Solution**: Made the text layer invisible while maintaining its functionality for text selection by setting its opacity to 0 in CSS:

```css
.react-pdf__Page__textContent {
  opacity: 0; /* Make the text layer invisible */
  /* Other properties to maintain functionality */
}
```

### Dynamic Component Loading

**Challenge**: Server-side rendering of PDF components caused errors since they require browser APIs.

**Solution**: Used Next.js dynamic imports with `ssr: false` to ensure PDF components only load on the client side:

```javascript
// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  {
    ssr: false,
  }
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});
```

### Cross-Browser Compatibility

**Challenge**: Different browsers handle PDF rendering and text selection differently, causing inconsistent behavior.

**Solution**: Added browser-specific CSS and implemented feature detection to provide a consistent experience across Chrome, Firefox, Safari, and Edge:

```css
/* Ensure text selection works across browsers */
.react-pdf__Page__textContent span {
  color: transparent;
  cursor: text;
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}
```

## Future Features

With more time, the following features would enhance the application:

1. **Persistent Storage**: Save annotations to a database to allow resuming work on documents. This would require implementing a backend storage solution, potentially using MongoDB or PostgreSQL.
2. **User Authentication**: Add user accounts to manage document permissions and history. This could be implemented using NextAuth.js for easy integration with various authentication providers.
3. **Collaborative Editing**: Real-time collaboration allowing multiple users to annotate the same document simultaneously. This would require implementing WebSockets or a similar technology for real-time updates.
4. **Advanced PDF Manipulation**: More PDF editing capabilities like adding/removing pages, rotating pages, merging documents, and form filling. The pdf-lib library could be extended to support these features.
5. **Document Versioning**: Track changes and maintain document history, allowing users to revert to previous versions if needed.
6. **Integration with Cloud Storage**: Connect with services like Google Drive or OneDrive to directly import and export documents.
7. **Batch Processing**: Allow users to apply the same annotations to multiple documents at once, saving time for repetitive tasks.
8. **Custom Annotation Styles**: Let users define custom styles for highlights, underlines, and comments to better organize their annotations.
9. **PDF Form Support**: Add the ability to fill out PDF forms, including text fields, checkboxes, and dropdown menus.

## Usage Instructions

1. **Upload a PDF**: Drag and drop a PDF file onto the upload area or click to select a file.
2. **Navigate the Document**: Use the page navigation controls to move between pages and the zoom controls to adjust the view.
3. **Highlight Text**: Select the Highlight tool, then select text in the document.
4. **Underline Text**: Select the Underline tool, then select text in the document.
5. **Add Comments**: Select the Comment tool, then click anywhere on the document to add a comment.
6. **Add Signatures**: Go to the Sign tab, draw your signature, save it, then click on the document to place it.
7. **Export the Document**: Click the Export PDF button to download the annotated document.
