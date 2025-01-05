// import { useEffect, useRef, useState } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { PDFDocument, rgb } from 'pdf-lib';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

// // Update worker configuration
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url
// ).toString();

// export default function PDFEditor() {
//   const [file, setFile] = useState(null);
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1.0);
//   const [highlights, setHighlights] = useState([]);
//   const [textAnnotations, setTextAnnotations] = useState([]);
//   const [drawings, setDrawings] = useState({});
//   const [currentPath, setCurrentPath] = useState([]);
//   const [mode, setMode] = useState(null); // "highlighting", "addingText", "drawing"

//   const containerRef = useRef(null);
//   const canvasRef = useRef(null);
//   const drawingRef = useRef(false);
//   const fileRef = useRef(file);

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     if (selectedFile?.type === 'application/pdf') {
//       const fileURL = URL.createObjectURL(selectedFile);
//       fileRef.current = fileURL;
//       setFile(fileURL);
//     } else {
//       alert('Please select a valid PDF file');
//     }
//   };

//   useEffect(() => {
//     return () => file && URL.revokeObjectURL(file);
//   }, [file]);

//   useEffect(() => {
//     if (canvasRef.current && containerRef.current) {
//       const canvas = canvasRef.current;
//       const container = containerRef.current;
//       const rect = container.getBoundingClientRect();

//       canvas.width = rect.width;
//       canvas.height = rect.height;

//       const ctx = canvas.getContext('2d');
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
//     }
//   }, [pageNumber, scale, drawings, file]);

//   const drawPath = (ctx, path) => {
//     if (!path?.length) return;

//     ctx.beginPath();
//     ctx.strokeStyle = 'red';
//     ctx.lineWidth = 2;
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';

//     ctx.moveTo(path[0].x * scale, path[0].y * scale);
//     path.slice(1).forEach(({ x, y }) => ctx.lineTo(x * scale, y * scale));
//     ctx.stroke();
//   };

//   const handleDrawing = {
//     start: (e) => {
//       if (mode !== 'drawing') return;

//       const { left, top } = canvasRef.current.getBoundingClientRect();
//       setCurrentPath([{ x: (e.clientX - left) / scale, y: (e.clientY - top) / scale }]);
//       drawingRef.current = true;
//     },
//     move: (e) => {
//       if (!drawingRef.current || mode !== 'drawing') return;

//       const { left, top } = canvasRef.current.getBoundingClientRect();
//       const ctx = canvasRef.current.getContext('2d');
//       const x = (e.clientX - left) / scale;
//       const y = (e.clientY - top) / scale;

//       setCurrentPath((prev) => {
//         const newPath = [...prev, { x, y }];

//         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//         drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
//         drawPath(ctx, newPath);

//         return newPath;
//       });
//     },
//     stop: () => {
//       if (!drawingRef.current || mode !== 'drawing') return;
//       drawingRef.current = false;

//       setDrawings((prev) => ({
//         ...prev,
//         [pageNumber]: [...(prev[pageNumber] || []), currentPath],
//       }));
//       setCurrentPath([]);
//     },
//   };

//   const handleHighlighting = () => {
//     if (mode !== 'highlighting') return;

//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const { top, left, width, height } = range.getBoundingClientRect();
//     const container = containerRef.current.getBoundingClientRect();

//     setHighlights((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         page: pageNumber,
//         position: {
//           top: (top - container.top) / scale,
//           left: (left - container.left) / scale,
//           width: width / scale,
//           height: height / scale,
//         },
//         text: selection.toString(),
//       },
//     ]);
//     selection.removeAllRanges();
//   };

//   const handleAddText = (e) => {
//     if (mode !== 'addingText') return;

//     const { left, top } = containerRef.current.getBoundingClientRect();
//     const x = (e.clientX - left) / scale;
//     const y = (e.clientY - top) / scale;

//     const newText = prompt('Enter text:', 'Type here...');
//     if (newText) {
//       setTextAnnotations((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           page: pageNumber,
//           position: { top: y, left: x },
//           text: newText,
//         },
//       ]);
//     }
//   };

//   const downloadEditedPDF = async () => {
//     if (!fileRef.current) return alert('No file loaded.');

//     try {
//       const existingPdfBytes = await fetch(fileRef.current).then((res) =>
//         res.arrayBuffer()
//       );
//       const pdfDoc = await PDFDocument.load(existingPdfBytes);

//       for (const [pageNum, pageDrawings] of Object.entries(drawings)) {
//         const pageIndex = parseInt(pageNum, 10) - 1; // Pages are 0-indexed in PDF-Lib
//         const page = pdfDoc.getPage(pageIndex);

//         pageDrawings.forEach((path) => {
//           const pathPoints = path.map(({ x, y }) => ({
//             x: x * scale,
//             y: page.getHeight() - y * scale,
//           }));

//           page.drawPolyline(pathPoints, {
//             color: rgb(1, 0, 0),
//             thickness: 2,
//           });
//         });
//       }

//       highlights.forEach((highlight) => {
//         const { page, position } = highlight;
//         const pdfPage = pdfDoc.getPage(page - 1);

//         pdfPage.drawRectangle({
//           x: position.left * scale,
//           y: pdfPage.getHeight() - position.top * scale - position.height * scale,
//           width: position.width * scale,
//           height: position.height * scale,
//           color: rgb(1, 1, 0),
//           opacity: 0.5,
//         });
//       });

//       textAnnotations.forEach((annotation) => {
//         const { page, position, text } = annotation;
//         const pdfPage = pdfDoc.getPage(page - 1);

//         pdfPage.drawText(text, {
//           x: position.left * scale,
//           y: pdfPage.getHeight() - position.top * scale - 14,
//           size: 14 * scale,
//           color: rgb(0, 0, 0),
//         });
//       });

//       const updatedPdfBytes = await pdfDoc.save();

//       const blob = new Blob([updatedPdfBytes], { type: 'application/pdf' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = 'edited.pdf';
//       link.click();
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Failed to download the edited PDF.');
//     }
//   };

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-lg">
//         <div className="mb-6 space-y-4">
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={handleFileChange}
//             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
//           />

//           {['highlighting', 'addingText', 'drawing'].map((currentMode) => (
//             <button
//               key={currentMode}
//               onClick={() => setMode((prev) => (prev === currentMode ? null : currentMode))}
//               className={`px-4 py-2 rounded-full font-medium ${
//                 mode === currentMode
//                   ? currentMode === 'highlighting'
//                     ? 'bg-yellow-500 text-white'
//                     : currentMode === 'addingText'
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-red-500 text-white'
//                   : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {mode === currentMode
//                 ? `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode On`
//                 : `Enable ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`}
//             </button>
//           ))}

//           {file && (
//             <div>
//               <button onClick={downloadEditedPDF} className="px-4 py-2 mt-4 bg-green-500 rounded-full text-white">
//                 Download Edited PDF
//               </button>
//             </div>
//           )}
//         </div>

//         {file ? (
//           <div
//             ref={containerRef}
//             className="relative border rounded-lg"
//             onClick={(e) => mode === 'addingText' && handleAddText(e)}
//             onMouseUp={(e) => mode === 'highlighting' && handleHighlighting(e)}
//           >
//             <Document
//               file={fileRef.current}
//               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//               className="mx-auto"
//             >
//               <Page pageNumber={pageNumber} scale={scale} className="mx-auto" />
//             </Document>

//             <canvas
//               ref={canvasRef}
//               className="absolute top-0 left-0 w-full h-full"
//               style={{ pointerEvents: mode === 'drawing' ? 'auto' : 'none', zIndex: 10 }}
//               onMouseDown={handleDrawing.start}
//               onMouseMove={handleDrawing.move}
//               onMouseUp={handleDrawing.stop}
//               onMouseLeave={handleDrawing.stop}
//             />
//           </div>
//         ) : (
//           <div className="py-12 text-center text-gray-500">Upload a PDF file to get started</div>
//         )}
//       </div>
//     </div>
//   );
// }


// ---------------perfectCode--------------------
// import { useEffect, useRef, useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import { PDFDocument, rgb } from "pdf-lib";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// // PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

// export default function PDFEditor() {
//   const [file, setFile] = useState(null);
//   const [numPages, setNumPages] = useState(0);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1);
//   const [highlights, setHighlights] = useState([]);
//   const [annotations, setAnnotations] = useState([]);
//   const [mode, setMode] = useState(null); // "highlighting", "addingText"
//   const containerRef = useRef(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file?.type === "application/pdf") {
//       setFile(URL.createObjectURL(file));
//     } else {
//       alert("Please select a valid PDF file.");
//     }
//   };

//   const handleHighlighting = () => {
//     if (mode !== "highlighting") return;

//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const { top, left, width, height } = range.getBoundingClientRect();
//     const containerRect = containerRef.current.getBoundingClientRect();

//     setHighlights((prev) => [
//       ...prev,
//       {
//         page: pageNumber,
//         position: {
//           top: (top - containerRect.top) / scale,
//           left: (left - containerRect.left) / scale,
//           width: width / scale,
//           height: height / scale,
//         },
//         text: selection.toString(),
//       },
//     ]);

//     selection.removeAllRanges();
//   };

//   const handleAddText = (e) => {
//     if (mode !== "addingText") return;

//     const { left, top } = containerRef.current.getBoundingClientRect();
//     const x = (e.clientX - left) / scale;
//     const y = (e.clientY - top) / scale;

//     const text = prompt("Enter text:");
//     if (text) {
//       setAnnotations((prev) => [
//         ...prev,
//         { id: Date.now(), page: pageNumber, position: { x, y }, text },
//       ]);
//     }
//   };

//   const downloadEditedPDF = async () => {
//     if (!file) return alert("Please upload a PDF first.");

//     const existingPdfBytes = await fetch(file).then((res) => res.arrayBuffer());
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);

//     // Add highlights
//     highlights.forEach(({ page, position }) => {
//       const pdfPage = pdfDoc.getPage(page - 1);
//       pdfPage.drawRectangle({
//         x: position.left,
//         y: pdfPage.getHeight() - position.top - position.height,
//         width: position.width,
//         height: position.height,
//         color: rgb(1, 1, 0),
//         opacity: 0.5,
//       });
//     });

//     // Add annotations
//     annotations.forEach(({ page, position, text }) => {
//       const pdfPage = pdfDoc.getPage(page - 1);
//       pdfPage.drawText(text, {
//         x: position.x,
//         y: pdfPage.getHeight() - position.y,
//         size: 12,
//         color: rgb(0, 0, 0),
//       });
//     });

//     const updatedPdfBytes = await pdfDoc.save();
//     const blob = new Blob([updatedPdfBytes], { type: "application/pdf" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "edited.pdf";
//     link.click();
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
//         <div className="flex flex-col gap-4 mb-4">
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={handleFileChange}
//             className="p-2 border rounded"
//           />
//           <div className="flex gap-2">
//             <button
//               onClick={() => setMode(mode === "highlighting" ? null : "highlighting")}
//               className={`px-4 py-2 rounded ${
//                 mode === "highlighting" ? "bg-yellow-400" : "bg-gray-200"
//               }`}
//             >
//               Highlight
//             </button>
//             <button
//               onClick={() => setMode(mode === "addingText" ? null : "addingText")}
//               className={`px-4 py-2 rounded ${
//                 mode === "addingText" ? "bg-blue-400" : "bg-gray-200"
//               }`}
//             >
//               Add Text
//             </button>
//             <button
//               onClick={downloadEditedPDF}
//               className="px-4 py-2 bg-green-400 rounded"
//             >
//               Download PDF
//             </button>
//           </div>
//         </div>

//         {file && (
//           <div
//             ref={containerRef}
//             className="relative border"
//             onMouseUp={handleHighlighting}
//             onClick={handleAddText}
//           >
//             <Document
//               file={file}
//               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//             >
//               <Page pageNumber={pageNumber} scale={scale} />
//             </Document>
//             {highlights
//               .filter((h) => h.page === pageNumber)
//               .map((h) => (
//                 <div
//                   key={h.text}
//                   style={{
//                     position: "absolute",
//                     top: h.position.top * scale,
//                     left: h.position.left * scale,
//                     width: h.position.width * scale,
//                     height: h.position.height * scale,
//                     backgroundColor: "rgba(255, 255, 0, 0.5)",
//                   }}
//                 />
//               ))}
//             {annotations
//               .filter((a) => a.page === pageNumber)
//               .map((a) => (
//                 <div
//                   key={a.id}
//                   style={{
//                     position: "absolute",
//                     top: a.position.y * scale,
//                     left: a.position.x * scale,
//                     color: "blue",
//                   }}
//                 >
//                   {a.text}
//                 </div>
//               ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }









// import { useEffect, useRef, useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import { PDFDocument, rgb } from "pdf-lib";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// // PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

// export default function PDFEditor() {
//   const [file, setFile] = useState(null);
//   const [numPages, setNumPages] = useState(0);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1);
//   const [highlights, setHighlights] = useState([]);
//   const [annotations, setAnnotations] = useState([]);
//   const [drawings, setDrawings] = useState({});
//   const [currentPath, setCurrentPath] = useState([]);
//   const [mode, setMode] = useState(null); // "highlighting", "addingText", "drawing"
//   const containerRef = useRef(null);
//   const canvasRef = useRef(null);
//   const drawingRef = useRef(false);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file?.type === "application/pdf") {
//       setFile(URL.createObjectURL(file));
//     } else {
//       alert("Please select a valid PDF file.");
//     }
//   };

//   const handleHighlighting = () => {
//     if (mode !== "highlighting") return;

//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const { top, left, width, height } = range.getBoundingClientRect();
//     const containerRect = containerRef.current.getBoundingClientRect();

//     setHighlights((prev) => [
//       ...prev,
//       {
//         page: pageNumber,
//         position: {
//           top: (top - containerRect.top) / scale,
//           left: (left - containerRect.left) / scale,
//           width: width / scale,
//           height: height / scale,
//         },
//         text: selection.toString(),
//       },
//     ]);

//     selection.removeAllRanges();
//   };

//   const handleAddText = (e) => {
//     if (mode !== "addingText") return;

//     const { left, top } = containerRef.current.getBoundingClientRect();
//     const x = (e.clientX - left) / scale;
//     const y = (e.clientY - top) / scale;

//     const text = prompt("Enter text:");
//     if (text) {
//       setAnnotations((prev) => [
//         ...prev,
//         { id: Date.now(), page: pageNumber, position: { x, y }, text },
//       ]);
//     }
//   };

//   const handleDrawing = {
//     start: (e) => {
//       if (mode !== "drawing") return;

//       const { left, top } = canvasRef.current.getBoundingClientRect();
//       setCurrentPath([{ x: (e.clientX - left) / scale, y: (e.clientY - top) / scale }]);
//       drawingRef.current = true;
//     },
//     move: (e) => {
//       if (!drawingRef.current || mode !== "drawing") return;

//       const { left, top } = canvasRef.current.getBoundingClientRect();
//       const ctx = canvasRef.current.getContext("2d");
//       const x = (e.clientX - left) / scale;
//       const y = (e.clientY - top) / scale;

//       setCurrentPath((prev) => {
//         const newPath = [...prev, { x, y }];

//         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//         drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
//         drawPath(ctx, newPath);

//         return newPath;
//       });
//     },
//     stop: () => {
//       if (!drawingRef.current || mode !== "drawing") return;
//       drawingRef.current = false;

//       setDrawings((prev) => ({
//         ...prev,
//         [pageNumber]: [...(prev[pageNumber] || []), currentPath],
//       }));
//       setCurrentPath([]);
//     },
//   };

//   const drawPath = (ctx, path) => {
//     if (!path?.length) return;

//     ctx.beginPath();
//     ctx.strokeStyle = "red";
//     ctx.lineWidth = 2;
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";

//     ctx.moveTo(path[0].x * scale, path[0].y * scale);
//     path.slice(1).forEach(({ x, y }) => ctx.lineTo(x * scale, y * scale));
//     ctx.stroke();
//   };

//   const downloadEditedPDF = async () => {
//     if (!file) return alert("Please upload a PDF first.");

//     const existingPdfBytes = await fetch(file).then((res) => res.arrayBuffer());
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);

//     // Add highlights
//     highlights.forEach(({ page, position }) => {
//       const pdfPage = pdfDoc.getPage(page - 1);
//       pdfPage.drawRectangle({
//         x: position.left,
//         y: pdfPage.getHeight() - position.top - position.height,
//         width: position.width,
//         height: position.height,
//         color: rgb(1, 1, 0),
//         opacity: 0.5,
//       });
//     });

//     // Add annotations
//     annotations.forEach(({ page, position, text }) => {
//       const pdfPage = pdfDoc.getPage(page - 1);
//       pdfPage.drawText(text, {
//         x: position.x,
//         y: pdfPage.getHeight() - position.y,
//         size: 12,
//         color: rgb(0, 0, 0),
//       });
//     });

//     // Add drawings
//     Object.entries(drawings).forEach(([page, paths]) => {
//       const pdfPage = pdfDoc.getPage(Number(page) - 1);
//       paths.forEach((path) => {
//         path.forEach(({ x, y }, index) => {
//           if (index === 0) return;
//           const { x: x1, y: y1 } = path[index - 1];
//           pdfPage.drawLine({
//             start: { x: x1, y: pdfPage.getHeight() - y1 },
//             end: { x, y: pdfPage.getHeight() - y },
//             thickness: 2,
//             color: rgb(1, 0, 0),
//           });
//         });
//       });
//     });

//     const updatedPdfBytes = await pdfDoc.save();
//     const blob = new Blob([updatedPdfBytes], { type: "application/pdf" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "edited.pdf";
//     link.click();
//   };

//   useEffect(() => {
//     if (canvasRef.current && containerRef.current) {
//       const canvas = canvasRef.current;
//       const container = containerRef.current;
//       const rect = container.getBoundingClientRect();

//       canvas.width = rect.width;
//       canvas.height = rect.height;

//       const ctx = canvas.getContext("2d");
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
//     }
//   }, [pageNumber, scale, drawings]);

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
//         <div className="flex flex-col gap-4 mb-4">
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={handleFileChange}
//             className="p-2 border rounded"
//           />
//           <div className="flex gap-2">
//             <button
//               onClick={() => setMode(mode === "highlighting" ? null : "highlighting")}
//               className={`px-4 py-2 rounded ${
//                 mode === "highlighting" ? "bg-yellow-400" : "bg-gray-200"
//               }`}
//             >
//               Highlight
//             </button>
//             <button
//               onClick={() => setMode(mode === "addingText" ? null : "addingText")}
//               className={`px-4 py-2 rounded ${
//                 mode === "addingText" ? "bg-blue-400" : "bg-gray-200"
//               }`}
//             >
//               Add Text
//             </button>
//             <button
//               onClick={() => setMode(mode === "drawing" ? null : "drawing")}
//               className={`px-4 py-2 rounded ${
//                 mode === "drawing" ? "bg-red-400" : "bg-gray-200"
//               }`}
//             >
//               Draw
//             </button>
//             <button
//               onClick={downloadEditedPDF}
//               className="px-4 py-2 bg-green-400 rounded"
//             >
//               Download PDF
//             </button>
//           </div>
//         </div>

//         {file && (
//           <div
//             ref={containerRef}
//             className="relative border"
//             onMouseUp={handleHighlighting}
//             onClick={handleAddText}
//           >
//             <Document
//               file={file}
//               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//             >
//               <Page pageNumber={pageNumber} scale={scale} />
//             </Document>
//             {highlights
//               .filter((h) => h.page === pageNumber)
//               .map((h) => (
//                 <div
//                   key={h.text}
//                   style={{
//                     position: "absolute",
//                     top: h.position.top * scale,
//                     left: h.position.left * scale,
//                     width: h.position.width * scale,
//                     height: h.position.height * scale,
//                     backgroundColor: "rgba(255, 255, 0, 0.5)",
//                   }}
//                 />
//               ))}
//             {annotations
//               .filter((a) => a.page === pageNumber)
//               .map((a) => (
//                 <div
//                   key={a.id}
//                   style={{
//                     position: "absolute",
//                     top: a.position.y * scale,
//                     left: a.position.x * scale,
//                     color: "blue",
//                   }}
//                 >
//                   {a.text}
//                 </div>
//               ))}
//             <canvas
//               ref={canvasRef}
//               className="absolute top-0 left-0 w-full h-full pointer-events-none"
//               onMouseDown={handleDrawing.start}
//               onMouseMove={handleDrawing.move}
//               onMouseUp={handleDrawing.stop}
//               onMouseLeave={handleDrawing.stop}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { ScreenCapture } from "react-screen-capture";
import "react-pdf/dist/esm/Page/TextLayer.css";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export default function PDFEditor() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [highlights, setHighlights] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [drawings, setDrawings] = useState({});
  const [currentPath, setCurrentPath] = useState([]);
  const [mode, setMode] = useState(null); // "highlighting", "addingText", "drawing"
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file?.type === "application/pdf") {
      setFile(URL.createObjectURL(file));
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleHighlighting = () => {
    if (mode !== "highlighting") return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const { top, left, width, height } = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setHighlights((prev) => [
      ...prev,
      {
        page: pageNumber,
        position: {
          top: (top - containerRect.top) / scale,
          left: (left - containerRect.left) / scale,
          width: width / scale,
          height: height / scale,
        },
        text: selection.toString(),
      },
    ]);

    selection.removeAllRanges();
  };

  const handleAddText = (e) => {
    if (mode !== "addingText") return;

    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / scale;
    const y = (e.clientY - top) / scale;

    const text = prompt("Enter text:");
    if (text) {
      setAnnotations((prev) => [
        ...prev,
        { id: Date.now(), page: pageNumber, position: { x, y }, text },
      ]);
    }
  };

  const handleDrawing = {
    start: (e) => {
      if (mode !== "drawing") return;

      const { left, top } = canvasRef.current.getBoundingClientRect();
      setCurrentPath([{ x: (e.clientX - left) / scale, y: (e.clientY - top) / scale }]);
      drawingRef.current = true;
    },
    move: (e) => {
      if (!drawingRef.current || mode !== "drawing") return;

      const { left, top } = canvasRef.current.getBoundingClientRect();
      const ctx = canvasRef.current.getContext("2d");
      const x = (e.clientX - left) / scale;
      const y = (e.clientY - top) / scale;

      setCurrentPath((prev) => {
        const newPath = [...prev, { x, y }];

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
        drawPath(ctx, newPath);

        return newPath;
      });
    },
    stop: () => {
      if (!drawingRef.current || mode !== "drawing") return;
      drawingRef.current = false;

      setDrawings((prev) => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), currentPath],
      }));
      setCurrentPath([]);
    },
  };

  const drawPath = (ctx, path) => {
    if (!path?.length) return;

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(path[0].x * scale, path[0].y * scale);
    path.slice(1).forEach(({ x, y }) => ctx.lineTo(x * scale, y * scale));
    ctx.stroke();
  };

  const downloadEditedPDF = async () => {
    if (!file) return alert("Please upload a PDF first.");

    const existingPdfBytes = await fetch(file).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Add highlights
    highlights.forEach(({ page, position }) => {
      const pdfPage = pdfDoc.getPage(page - 1);
      pdfPage.drawRectangle({
        x: position.left,
        y: pdfPage.getHeight() - position.top - position.height,
        width: position.width,
        height: position.height,
        color: rgb(1, 1, 0),
        opacity: 0.5,
      });
    });

    // Add annotations
    annotations.forEach(({ page, position, text }) => {
      const pdfPage = pdfDoc.getPage(page - 1);
      pdfPage.drawText(text, {
        x: position.x,
        y: pdfPage.getHeight() - position.y,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });

    // Add drawings
    Object.entries(drawings).forEach(([page, paths]) => {
      const pdfPage = pdfDoc.getPage(Number(page) - 1);
      paths.forEach((path) => {
        path.forEach(({ x, y }, index) => {
          if (index === 0) return;
          const { x: x1, y: y1 } = path[index - 1];
          pdfPage.drawLine({
            start: { x: x1, y: pdfPage.getHeight() - y1 },
            end: { x, y: pdfPage.getHeight() - y },
            thickness: 2,
            color: rgb(1, 0, 0),
          });
        });
      });
    });

    const updatedPdfBytes = await pdfDoc.save();
    const blob = new Blob([updatedPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "edited.pdf";
    link.click();
  };

  const handleCapture = (screenshot) => {
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = `screenshot_page_${pageNumber}.png`;
    link.click();
  };

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
    }
  }, [pageNumber, scale, drawings]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setMode(mode === "highlighting" ? null : "highlighting")}
              className={`px-4 py-2 rounded ${
                mode === "highlighting" ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              Highlight
            </button>
            <button
              onClick={() => setMode(mode === "addingText" ? null : "addingText")}
              className={`px-4 py-2 rounded ${
                mode === "addingText" ? "bg-blue-400" : "bg-gray-200"
              }`}
            >
              Add Text
            </button>
            <button
              onClick={() => setMode(mode === "drawing" ? null : "drawing")}
              className={`px-4 py-2 rounded ${
                mode === "drawing" ? "bg-red-400" : "bg-gray-200"
              }`}
            >
              Draw
            </button>
            <button
              onClick={downloadEditedPDF}
              className="px-4 py-2 bg-green-400 rounded"
            >
              Download PDF
            </button>
          </div>
        </div>

        {file && (
          <ScreenCapture onEndCapture={handleCapture}>
            {({ onStartCapture }) => (
              <div>
                <button
                  onClick={onStartCapture}
                  className="px-4 py-2 bg-purple-400 rounded mb-4"
                >
                  Take Screenshot
                </button>
                <div
                  ref={containerRef}
                  className="relative border"
                  onMouseUp={handleHighlighting}
                  onClick={handleAddText}
                >
                  <Document
                    file={file}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    <Page pageNumber={pageNumber} scale={scale} />
                  </Document>
                  {highlights
                    .filter((h) => h.page === pageNumber)
                    .map((h) => (
                      <div
                        key={h.text}
                        style={{
                          position: "absolute",
                          top: h.position.top * scale,
                          left: h.position.left * scale,
                          width: h.position.width * scale,
                          height: h.position.height * scale,
                          backgroundColor: "rgba(255, 255, 0, 0.5)",
                        }}
                      />
                    ))}
                  {annotations
                    .filter((a) => a.page === pageNumber)
                    .map((a) => (
                      <div
                        key={a.id}
                        style={{
                          position: "absolute",
                          top: a.position.y * scale,
                          left: a.position.x * scale,
                          color: "blue",
                        }}
                      >
                        {a.text}
                      </div>
                    ))}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    onMouseDown={handleDrawing.start}
                    onMouseMove={handleDrawing.move}
                    onMouseUp={handleDrawing.stop}
                    onMouseLeave={handleDrawing.stop}
                  />
                </div>
              </div>
            )}
          </ScreenCapture>
        )}
      </div>
    </div>
  );
}





