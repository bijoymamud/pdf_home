
// import { useState, useRef, useEffect } from 'react'
// import { Document, Page, pdfjs } from 'react-pdf'
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
// import 'react-pdf/dist/esm/Page/TextLayer.css'

// // // Update worker configuration
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url
// ).toString()

// export default function PDFEditor() {
//   const [file, setFile] = useState(null)
//   const [numPages, setNumPages] = useState(null)
//   const [pageNumber, setPageNumber] = useState(1)
//   const [scale, setScale] = useState(1.0)
//   const [highlights, setHighlights] = useState([])
//   const [isHighlighting, setIsHighlighting] = useState(false)
//   const [textAnnotations, setTextAnnotations] = useState([])
//   const [isAddingText, setIsAddingText] = useState(false)
//   // const [isDrawing, setIsDrawing] = useState(false)
//   const [drawings, setDrawings] = useState({})
//   const [currentPath, setCurrentPath] = useState([])
//   const [isDrawingMode, setIsDrawingMode] = useState(false)

//   const containerRef = useRef(null)
//   const canvasRef = useRef(null)
//   const drawingRef = useRef(false)

//   const fileRef = useRef(file)  // Use ref to store the file

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0]
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       const fileURL = URL.createObjectURL(selectedFile)
//       fileRef.current = fileURL  // Store the file in ref
//       setFile(fileURL)  // Trigger rendering of the file
//     } else {
//       alert('Please select a valid PDF file')
//     }
//   }

//   useEffect(() => {
//     return () => {
//       if (file) {
//         URL.revokeObjectURL(file)
//       }
//     }
//   }, [file])

//   useEffect(() => {
//     if (canvasRef.current && containerRef.current) {
//       const canvas = canvasRef.current
//       const container = containerRef.current
//       const rect = container.getBoundingClientRect()
    
//       // Set canvas size to match container
//       canvas.width = rect.width
//       canvas.height = rect.height
    
//       // Redraw existing paths when canvas is resized
//       const ctx = canvas.getContext('2d')
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
    
//       if (drawings[pageNumber]) {
//         drawings[pageNumber].forEach(path => {
//           drawPath(ctx, path)
//         })
//       }
//     }
//   }, [pageNumber, scale, drawings, file])

//   const drawPath = (ctx, path) => {
//     if (!path || path.length < 1) return
    
//     ctx.beginPath()
//     ctx.strokeStyle = 'red'
//     ctx.lineWidth = 2
//     ctx.lineCap = 'round'
//     ctx.lineJoin = 'round'
    
//     ctx.moveTo(path[0].x * scale, path[0].y * scale)
    
//     for (let i = 1; i < path.length; i++) {
//       ctx.lineTo(path[i].x * scale, path[i].y * scale)
//     }
    
//     ctx.stroke()
//   }

//   const startDrawing = (e) => {
//     if (!isDrawingMode) return
    
//     const canvas = canvasRef.current
//     const rect = canvas.getBoundingClientRect()
//     const x = (e.clientX - rect.left)
//     const y = (e.clientY - rect.top)
    
//     setCurrentPath([{ x: x/scale, y: y/scale }])
//     drawingRef.current = true
//   }

//   const draw = (e) => {
//     if (!drawingRef.current || !isDrawingMode) return
    
//     const canvas = canvasRef.current
//     const ctx = canvas.getContext('2d')
//     const rect = canvas.getBoundingClientRect()
    
//     // Get the actual coordinates relative to the canvas
//     const x = (e.clientX - rect.left)
//     const y = (e.clientY - rect.top)
    
//     setCurrentPath(prev => {
//       const newPath = [...prev, { x: x/scale, y: y/scale }]

//       // Clear and redraw all paths
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
      
//       // Draw existing paths
//       if (drawings[pageNumber]) {
//         drawings[pageNumber].forEach(path => {
//           drawPath(ctx, path)
//         })
//       }
      
//       // Draw current path
//       drawPath(ctx, newPath)
      
//       return newPath
//     })
//   }

//   const stopDrawing = () => {
//     if (!drawingRef.current || !isDrawingMode) return
    
//     drawingRef.current = false
    
//     setDrawings(prev => ({
//       ...prev,
//       [pageNumber]: [...(prev[pageNumber] || []), currentPath]
//     }))
    
//     setCurrentPath([])
//   }

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages)
//     setPageNumber(1)
//   }

//   const handleTextSelection = () => {
//     if (!isHighlighting) return

//     const selection = window.getSelection()
//     if (!selection.rangeCount) return

//     const range = selection.getRangeAt(0)
//     const rect = range.getBoundingClientRect()
//     const container = containerRef.current.getBoundingClientRect()

//     const highlight = {
//       id: Date.now(),
//       page: pageNumber,
//       position: {
//         top: (rect.top - container.top) / scale,
//         left: (rect.left - container.left) / scale,
//         width: rect.width / scale,
//         height: rect.height / scale,
//       },
//       text: selection.toString(),
//     }

//     setHighlights([...highlights, highlight])
//     selection.removeAllRanges()
//   }

//   const handleAddText = (e) => {
//     e.preventDefault();
//     if (!isAddingText) return

//     const rect = containerRef.current.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / scale
//     const y = (e.clientY - rect.top) / scale

//     const newText = prompt('Enter text:', 'Type here...')
//     if (newText) {
//       const newTextAnnotation = {
//         id: Date.now(),
//         page: pageNumber,
//         position: { top: y, left: x },
//         text: newText,
//       }
//       setTextAnnotations([...textAnnotations, newTextAnnotation])
//     }
//   }

//   const removeHighlight = (id) => {
//     setHighlights(highlights.filter((highlight) => highlight.id !== id))
//   }

//   const renderHighlights = () => {
//     return highlights
//       .filter((highlight) => highlight.page === pageNumber)
//       .map((highlight) => (
//         <div
//           key={highlight.id}
//           className="absolute bg-yellow-200 opacity-50 cursor-pointer group"
//           style={{
//             top: highlight.position.top * scale,
//             left: highlight.position.left * scale,
//             width: highlight.position.width * scale,
//             height: highlight.position.height * scale,
//           }}
//           onClick={() => removeHighlight(highlight.id)}
//         >
//           <div className="hidden group-hover:block absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
//             Remove
//           </div>
//         </div>
//       ))
//   }

//   const renderTextAnnotations = () => {
//     return textAnnotations
//       .filter((annotation) => annotation.page === pageNumber)
//       .map((annotation) => (
//         <div
//           key={annotation.id}
//           className="absolute bg-transparent text-black font-bold"
//           style={{
//             top: annotation.position.top * scale,
//             left: annotation.position.left * scale,
//             fontSize: 14 * scale,
//           }}
//         >
//           {annotation.text}
//         </div>
//       ))
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <div className="mb-6 space-y-4">
//           <div className="flex items-center gap-4 flex-wrap">
//             <label className="block">
//               <span className="sr-only">Choose PDF file</span>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 onChange={handleFileChange}
//                 className="block w-full text-sm text-gray-500
//                   file:mr-4 file:py-2 file:px-4
//                   file:rounded-full file:border-0
//                   file:text-sm file:font-semibold
//                   file:bg-primary file:text-white
//                   hover:file:bg-primary/90"
//               />
//             </label>
//             <button
//               onClick={() => {
//                 setIsHighlighting(!isHighlighting)
//                 setIsAddingText(false)
//                 setIsDrawingMode(false)
//               }}
//               className={`px-4 py-2 rounded-full font-medium ${
//                 isHighlighting ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {isHighlighting ? 'Highlighting Mode On' : 'Enable Highlighting'}
//             </button>
//             <button
//               onClick={() => {
//                 setIsAddingText(!isAddingText)
//                 setIsHighlighting(false)
//                 setIsDrawingMode(false)
//               }}
//               className={`px-4 py-2 rounded-full font-medium ${
//                 isAddingText ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {isAddingText ? 'Adding Text Mode On' : 'Enable Text Addition'}
//             </button>
//             <button
//               onClick={() => {
//                 setIsDrawingMode(!isDrawingMode)
//                 setIsHighlighting(false)
//                 setIsAddingText(false)
//               }}
//               className={`px-4 py-2 rounded-full font-medium ${
//                 isDrawingMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
//               }`}
//             >
//               {isDrawingMode ? 'Drawing Mode On' : 'Enable Drawing'}
//             </button>
//           </div>

//           {file && (
//             <div className="flex items-center gap-4 flex-wrap">
//               <button
//                 onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
//                 className="px-3 py-1 bg-gray-200 rounded-full"
//               >
//                 Zoom Out
//               </button>
//               <span className="text-sm text-gray-600">
//                 {Math.round(scale * 100)}%
//               </span>
//               <button
//                 onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
//                 className="px-3 py-1 bg-gray-200 rounded-full"
//               >
//                 Zoom In
//               </button>
//               <span className="text-sm text-gray-600">
//                 Page {pageNumber} of {numPages}
//               </span>
//               <button
//                 disabled={pageNumber <= 1}
//                 onClick={() => setPageNumber((prev) => prev - 1)}
//                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 disabled={pageNumber >= numPages}
//                 onClick={() => setPageNumber((prev) => prev + 1)}
//                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         {file && (
//           <div
//             ref={containerRef}
//             className="relative border rounded-lg"
//             onClick={(e) => {
//               e.stopPropagation();
//               if (isAddingText) handleAddText(e);
//             }}
//             onMouseUp={(e) => {
//               e.stopPropagation();
//               if (isHighlighting) handleTextSelection(e);
//             }}
//             style={{ position: 'relative' }}
//           >
//             <Document
//               file={fileRef.current} // Use ref to avoid reloading
//               onLoadSuccess={onDocumentLoadSuccess}
//               onLoadError={(error) => {
//                 console.error('Error loading PDF:', error)
//                 alert('Error loading PDF. Please try another file.')
//               }}
//               className="mx-auto"
//               options={{
//                 cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
//                 cMapPacked: true,
//               }}
//             >
//               <Page pageNumber={pageNumber} scale={scale} className="mx-auto" />
//             </Document>
//             {renderHighlights()}
//             {renderTextAnnotations()}
//             <canvas
//               ref={canvasRef}
//               className="absolute top-0 left-0 w-full h-full"
//               style={{
//                 pointerEvents: isDrawingMode ? 'auto' : 'none',
//                 zIndex: 10,
//               }}
//               onMouseDown={startDrawing}
//               onMouseMove={draw}
//               onMouseUp={stopDrawing}
//               onMouseLeave={stopDrawing}
//             />
//           </div>
//         )}

//         {!file && (
//           <div className="text-center py-12 text-gray-500">
//             Upload a PDF file to get started
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }




// // _____________________almostt_____________________

// // import { useState, useRef, useEffect } from 'react';
// // import { Document, Page, pdfjs } from 'react-pdf';
// // import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// // import 'react-pdf/dist/esm/Page/TextLayer.css';

// // // Update worker configuration
// // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
// //   'pdfjs-dist/build/pdf.worker.min.js',
// //   import.meta.url
// // ).toString();

// // export default function PDFEditor() {
// //   const [file, setFile] = useState(null);
// //   const [numPages, setNumPages] = useState(null);
// //   const [pageNumber, setPageNumber] = useState(1);
// //   const [scale, setScale] = useState(1.0);
// //   const [highlights, setHighlights] = useState([]);
// //   const [isHighlighting, setIsHighlighting] = useState(false);
// //   const [textAnnotations, setTextAnnotations] = useState([]);
// //   const [isAddingText, setIsAddingText] = useState(false);
// //   const [drawings, setDrawings] = useState({});
// //   const [currentPath, setCurrentPath] = useState([]);
// //   const [isDrawingMode, setIsDrawingMode] = useState(false);

// //   const containerRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const drawingRef = useRef(false);
// //   const fileRef = useRef(null); // Ref to store the file

// //   const handleFileChange = (event) => {
// //     const selectedFile = event.target.files[0];
// //     if (selectedFile && selectedFile.type === 'application/pdf') {
// //       const fileURL = URL.createObjectURL(selectedFile);
// //       fileRef.current = fileURL; // Store the file in ref
// //       setFile(fileURL); // Trigger rendering of the file
// //     } else {
// //       alert('Please select a valid PDF file');
// //     }
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (file) {
// //         URL.revokeObjectURL(file);
// //       }
// //     };
// //   }, [file]);

// //   useEffect(() => {
// //     if (canvasRef.current && containerRef.current) {
// //       const canvas = canvasRef.current;
// //       const container = containerRef.current;
// //       const rect = container.getBoundingClientRect();

// //       // Set canvas size to match container
// //       canvas.width = rect.width;
// //       canvas.height = rect.height;

// //       // Redraw existing paths when canvas is resized
// //       const ctx = canvas.getContext('2d');
// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       if (drawings[pageNumber]) {
// //         drawings[pageNumber].forEach((path) => {
// //           drawPath(ctx, path);
// //         });
// //       }
// //     }
// //   }, [pageNumber, scale, drawings]);

// //   const drawPath = (ctx, path) => {
// //     if (!path || path.length < 1) return;

// //     ctx.beginPath();
// //     ctx.strokeStyle = 'red';
// //     ctx.lineWidth = 2;
// //     ctx.lineCap = 'round';
// //     ctx.lineJoin = 'round';

// //     ctx.moveTo(path[0].x * scale, path[0].y * scale);

// //     for (let i = 1; i < path.length; i++) {
// //       ctx.lineTo(path[i].x * scale, path[i].y * scale);
// //     }

// //     ctx.stroke();
// //   };

// //   const startDrawing = (e) => {
// //     if (!isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left) / scale;
// //     const y = (e.clientY - rect.top) / scale;

// //     setCurrentPath([{ x, y }]);
// //     drawingRef.current = true;
// //   };

// //   const draw = (e) => {
// //     if (!drawingRef.current || !isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left) / scale;
// //     const y = (e.clientY - rect.top) / scale;

// //     setCurrentPath((prev) => {
// //       const newPath = [...prev, { x, y }];

// //       // Clear and redraw all paths
// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       // Draw existing paths
// //       if (drawings[pageNumber]) {
// //         drawings[pageNumber].forEach((path) => {
// //           drawPath(ctx, path);
// //         });
// //       }

// //       // Draw current path
// //       drawPath(ctx, newPath);

// //       return newPath;
// //     });
// //   };

// //   const stopDrawing = () => {
// //     if (!drawingRef.current || !isDrawingMode) return;

// //     drawingRef.current = false;

// //     setDrawings((prev) => ({
// //       ...prev,
// //       [pageNumber]: [...(prev[pageNumber] || []), currentPath],
// //     }));

// //     setCurrentPath([]);
// //   };

// //   const handleTextSelection = (e) => {
// //     e.preventDefault();
// //     if (!isHighlighting) return;

// //     const selection = window.getSelection();
// //     if (!selection.rangeCount) return;

// //     const range = selection.getRangeAt(0);
// //     const rect = range.getBoundingClientRect();
// //     const container = containerRef.current.getBoundingClientRect();

// //     const highlight = {
// //       id: Date.now(),
// //       page: pageNumber,
// //       position: {
// //         top: (rect.top - container.top) / scale,
// //         left: (rect.left - container.left) / scale,
// //         width: rect.width / scale,
// //         height: rect.height / scale,
// //       },
// //       text: selection.toString(),
// //     };

// //     setHighlights([...highlights, highlight]);
// //     selection.removeAllRanges();
// //   };

// //   const handleAddText = (e) => {
// //     e.preventDefault();
// //     if (!isAddingText) return;

// //     const rect = containerRef.current.getBoundingClientRect();
// //     const x = (e.clientX - rect.left) / scale;
// //     const y = (e.clientY - rect.top) / scale;

// //     const newText = prompt('Enter text:', 'Type here...');
// //     if (newText) {
// //       const newTextAnnotation = {
// //         id: Date.now(),
// //         page: pageNumber,
// //         position: { top: y, left: x },
// //         text: newText,
// //       };
// //       setTextAnnotations([...textAnnotations, newTextAnnotation]);
// //     }
// //   };

// //   return (
// //    <div>
   
// //   <div className="flex flex-col items-center space-y-4">
// //     <div className="flex space-x-2">
// //       <input
// //         type="file"
// //         accept="application/pdf"
// //         onChange={handleFileChange}
// //         className="border p-2"
// //       />
// //       <button
// //         onClick={() => setIsHighlighting(!isHighlighting)}
// //         className={`px-4 py-2 ${isHighlighting ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// //       >
// //         Highlight
// //       </button>
// //       <button
// //         onClick={() => setIsAddingText(!isAddingText)}
// //         className={`px-4 py-2 ${isAddingText ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// //       >
// //         Add Text
// //       </button>
// //       <button
// //         onClick={() => setIsDrawingMode(!isDrawingMode)}
// //         className={`px-4 py-2 ${isDrawingMode ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// //       >
// //         Draw
// //       </button>
// //       <button
// //         onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
// //         className="px-4 py-2 bg-gray-300"
// //       >
// //         Zoom In
// //       </button>
// //       <button
// //         onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
// //         className="px-4 py-2 bg-gray-300"
// //       >
// //         Zoom Out
// //       </button>
// //       <button
// //         onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
// //         className="px-4 py-2 bg-gray-300"
// //       >
// //         Previous Page
// //       </button>
// //       <button
// //         onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
// //         className="px-4 py-2 bg-gray-300"
// //       >
// //         Next Page
// //       </button>
// //     </div>

// //     {file && (
// //       <div
// //         className="relative border w-full"
// //         style={{ height: '80vh' }}
// //         onMouseDown={startDrawing}
// //         onMouseMove={draw}
// //         onMouseUp={stopDrawing}
// //         onClick={handleAddText}
// //         onDoubleClick={handleTextSelection}
// //       >
// //         <Document
// //           file={fileRef.current}
// //           onLoadSuccess={({ numPages }) => setNumPages(numPages)}
// //         >
// //           <Page
// //             pageNumber={pageNumber}
// //             scale={scale}
// //             renderAnnotationLayer={false}
// //             renderTextLayer={false}
// //             canvasRef={containerRef}
// //           />
// //         </Document>
// //         <canvas
// //           ref={canvasRef}
// //           className="absolute top-0 left-0 pointer-events-none"
// //           style={{ width: '100%', height: '100%' }}
// //         />
// //         {highlights
// //           .filter((hl) => hl.page === pageNumber)
// //           .map((hl) => (
// //             <div
// //               key={hl.id}
// //               className="absolute bg-yellow-300 opacity-50"
// //               style={{
// //                 top: `${hl.position.top * scale}px`,
// //                 left: `${hl.position.left * scale}px`,
// //                 width: `${hl.position.width * scale}px`,
// //                 height: `${hl.position.height * scale}px`,
// //               }}
// //             />
// //           ))}
// //         {textAnnotations
// //           .filter((ta) => ta.page === pageNumber)
// //           .map((ta) => (
// //             <div
// //               key={ta.id}
// //               className="absolute bg-white border text-black px-2"
// //               style={{
// //                 top: `${ta.position.top * scale}px`,
// //                 left: `${ta.position.left * scale}px`,
// //               }}
// //             >
// //               {ta.text}
// //             </div>
// //           ))}
// //       </div>
// //     )}
// //   </div>


// //    </div>
// //   );
// // }




// // ------------------------------reload solve-------------------


// // import { useState, useRef, useEffect, useMemo } from 'react';
// // import { Document, Page, pdfjs } from 'react-pdf';
// // import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// // import 'react-pdf/dist/esm/Page/TextLayer.css';

// // // Update worker configuration
// // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
// //   'pdfjs-dist/build/pdf.worker.min.js',
// //   import.meta.url
// // ).toString();

// // export default function PDFEditor() {
// //   const [file, setFile] = useState(null);
// //   const [numPages, setNumPages] = useState(null);
// //   const [pageNumber, setPageNumber] = useState(1);
// //   const [scale, setScale] = useState(1.0);
// //   const [highlights, setHighlights] = useState([]);
// //   const [textAnnotations, setTextAnnotations] = useState([]);
// //   const [drawings, setDrawings] = useState({});
// //   const [isHighlighting, setIsHighlighting] = useState(false);
// //   const [isAddingText, setIsAddingText] = useState(false);
// //   const [isDrawingMode, setIsDrawingMode] = useState(false);

// //   const fileRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const drawingRef = useRef(false);
// //   const containerRef = useRef(null);

// //   const handleFileChange = (event) => {
// //     const selectedFile = event.target.files[0];
// //     if (selectedFile && selectedFile.type === 'application/pdf') {
// //       const fileURL = URL.createObjectURL(selectedFile);
// //       fileRef.current = fileURL; // Store the file in ref
// //       setFile(fileURL); // Trigger rendering of the file
// //     } else {
// //       alert('Please select a valid PDF file');
// //     }
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (file) {
// //         URL.revokeObjectURL(file);
// //       }
// //     };
// //   }, [file]);

// //   const onDocumentLoadSuccess = ({ numPages }) => {
// //     setNumPages(numPages);
// //     setPageNumber(1);
// //   };

// //   // Editing modes logic (highlighting, adding text, drawing)
// //   const handleTextSelection = () => {
// //     if (!isHighlighting) return;

// //     const selection = window.getSelection();
// //     if (!selection.rangeCount) return;

// //     const range = selection.getRangeAt(0);
// //     const rect = range.getBoundingClientRect();
// //     const container = containerRef.current.getBoundingClientRect();

// //     const highlight = {
// //       id: Date.now(),
// //       page: pageNumber,
// //       position: {
// //         top: (rect.top - container.top) / scale,
// //         left: (rect.left - container.left) / scale,
// //         width: rect.width / scale,
// //         height: rect.height / scale,
// //       },
// //       text: selection.toString(),
// //     };

// //     setHighlights((prev) => [...prev, highlight]);
// //     selection.removeAllRanges();
// //   };

// //   const startDrawing = (e) => {
// //     if (!isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left);
// //     const y = (e.clientY - rect.top);

// //     setDrawings((prev) => ({
// //       ...prev,
// //       [pageNumber]: [
// //         ...(prev[pageNumber] || []),
// //         [{ x: x / scale, y: y / scale }],
// //       ],
// //     }));

// //     drawingRef.current = true;
// //   };

// //   const draw = (e) => {
// //     if (!drawingRef.current || !isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left);
// //     const y = (e.clientY - rect.top);

// //     setDrawings((prev) => {
// //       const newPath = [...prev[pageNumber], { x: x / scale, y: y / scale }];
      
// //       // Redraw the canvas and existing paths
// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       (prev[pageNumber] || []).forEach((path) => {
// //         drawPath(ctx, path);
// //       });

// //       drawPath(ctx, newPath);
// //       return { ...prev, [pageNumber]: newPath };
// //     });
// //   };

// //   const stopDrawing = () => {
// //     drawingRef.current = false;
// //   };

// //   const drawPath = (ctx, path) => {
// //     if (!path || path.length < 1) return;

// //     ctx.beginPath();
// //     ctx.strokeStyle = 'red';
// //     ctx.lineWidth = 2;
// //     ctx.lineCap = 'round';
// //     ctx.lineJoin = 'round';

// //     ctx.moveTo(path[0].x * scale, path[0].y * scale);
// //     for (let i = 1; i < path.length; i++) {
// //       ctx.lineTo(path[i].x * scale, path[i].y * scale);
// //     }

// //     ctx.stroke();
// //   };

// //   const renderHighlights = () => {
// //     return highlights
// //       .filter((highlight) => highlight.page === pageNumber)
// //       .map((highlight) => (
// //         <div
// //           key={highlight.id}
// //           className="absolute bg-yellow-200 opacity-50 cursor-pointer"
// //           style={{
// //             top: highlight.position.top * scale,
// //             left: highlight.position.left * scale,
// //             width: highlight.position.width * scale,
// //             height: highlight.position.height * scale,
// //           }}
// //         >
// //           <div className="hidden group-hover:block absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
// //             Remove
// //           </div>
// //         </div>
// //       ));
// //   };

// //   const renderTextAnnotations = () => {
// //     return textAnnotations
// //       .filter((annotation) => annotation.page === pageNumber)
// //       .map((annotation) => (
// //         <div
// //           key={annotation.id}
// //           className="absolute bg-transparent text-black font-bold"
// //           style={{
// //             top: annotation.position.top * scale,
// //             left: annotation.position.left * scale,
// //             fontSize: 14 * scale,
// //           }}
// //         >
// //           {annotation.text}
// //         </div>
// //       ));
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-100 p-8">
// //       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
// //         <div className="mb-6 space-y-4">
// //           <div className="flex items-center gap-4 flex-wrap">
// //             <label className="block">
// //               <span className="sr-only">Choose PDF file</span>
// //               <input
// //                 type="file"
// //                 accept=".pdf"
// //                 onChange={handleFileChange}
// //                 className="block w-full text-sm text-gray-500
// //                   file:mr-4 file:py-2 file:px-4
// //                   file:rounded-full file:border-0
// //                   file:text-sm file:font-semibold
// //                   file:bg-primary file:text-white
// //                   hover:file:bg-primary/90"
// //               />
// //             </label>
// //             <button
// //               onClick={() => setIsHighlighting(!isHighlighting)}
// //               className={`px-4 py-2 rounded-full font-medium ${isHighlighting ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isHighlighting ? 'Highlighting Mode On' : 'Enable Highlighting'}
// //             </button>
// //             <button
// //               onClick={() => setIsAddingText(!isAddingText)}
// //               className={`px-4 py-2 rounded-full font-medium ${isAddingText ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isAddingText ? 'Adding Text Mode On' : 'Enable Text Addition'}
// //             </button>
// //             <button
// //               onClick={() => setIsDrawingMode(!isDrawingMode)}
// //               className={`px-4 py-2 rounded-full font-medium ${isDrawingMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isDrawingMode ? 'Drawing Mode On' : 'Enable Drawing'}
// //             </button>
// //           </div>

// //           {file && (
// //             <div className="flex items-center gap-4 flex-wrap">
// //               <button
// //                 onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
// //                 className="px-3 py-1 bg-gray-200 rounded-full"
// //               >
// //                 Zoom Out
// //               </button>
// //               <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
// //               <button
// //                 onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
// //                 className="px-3 py-1 bg-gray-200 rounded-full"
// //               >
// //                 Zoom In
// //               </button>
// //               <span className="text-sm text-gray-600">
// //                 Page {pageNumber} of {numPages}
// //               </span>
// //               <button
// //                 disabled={pageNumber <= 1}
// //                 onClick={() => setPageNumber((prev) => prev - 1)}
// //                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
// //               >
// //                 Previous
// //               </button>
// //               <button
// //                 disabled={pageNumber >= numPages}
// //                 onClick={() => setPageNumber((prev) => prev + 1)}
// //                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
// //               >
// //                 Next
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         {file && (
// //           <div
// //             ref={containerRef}
// //             className="relative border rounded-lg"
// //             onMouseUp={(e) => {
// //               e.stopPropagation();
// //               if (isHighlighting) handleTextSelection();
// //             }}
// //             style={{ position: 'relative' }}
// //           >
// //             <Document
// //               file={fileRef.current} // Use ref to avoid re-render
// //               onLoadSuccess={onDocumentLoadSuccess}
// //               className="mx-auto"
// //             >
// //               <Page pageNumber={pageNumber} scale={scale} className="mx-auto" />
// //             </Document>
// //             {renderHighlights()}
// //             {renderTextAnnotations()}
// //             <canvas
// //               ref={canvasRef}
// //               className="absolute top-0 left-0 w-full h-full"
// //               style={{
// //                 pointerEvents: isDrawingMode ? 'auto' : 'none',
// //                 zIndex: 10,
// //               }}
// //               onMouseDown={startDrawing}
// //               onMouseMove={draw}
// //               onMouseUp={stopDrawing}
// //               onMouseLeave={stopDrawing}
// //             />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }





// // import { useState, useRef, useEffect } from 'react';
// // import { Document, Page, pdfjs } from 'react-pdf';
// // import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// // import 'react-pdf/dist/esm/Page/TextLayer.css';

// // // Update worker configuration
// // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
// //   'pdfjs-dist/build/pdf.worker.min.js',
// //   import.meta.url
// // ).toString();

// // export default function PDFEditor() {
// //   const [file, setFile] = useState(null);
// //   const [numPages, setNumPages] = useState(null);
// //   const [pageNumber, setPageNumber] = useState(1);
// //   const [scale, setScale] = useState(1.0);
// //   const [highlights, setHighlights] = useState([]);
// //   const [textAnnotations, setTextAnnotations] = useState([]);
// //   const [drawings, setDrawings] = useState({});
// //   const [isHighlighting, setIsHighlighting] = useState(false);
// //   const [isAddingText, setIsAddingText] = useState(false);
// //   const [isDrawingMode, setIsDrawingMode] = useState(false);
// //   const [textInput, setTextInput] = useState(""); // Store the text input value

// //   const fileRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const drawingRef = useRef(false);
// //   const containerRef = useRef(null);

// //   const handleFileChange = (event) => {
// //     const selectedFile = event.target.files[0];
// //     if (selectedFile && selectedFile.type === 'application/pdf') {
// //       const fileURL = URL.createObjectURL(selectedFile);
// //       fileRef.current = fileURL; // Store the file in ref
// //       setFile(fileURL); // Trigger rendering of the file
// //     } else {
// //       alert('Please select a valid PDF file');
// //     }
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (file) {
// //         URL.revokeObjectURL(file);
// //       }
// //     };
// //   }, [file]);

// //   const onDocumentLoadSuccess = ({ numPages }) => {
// //     setNumPages(numPages);
// //     setPageNumber(1);
// //   };

// //   const handleTextSelection = () => {
// //     if (!isHighlighting) return;

// //     const selection = window.getSelection();
// //     if (!selection.rangeCount) return;

// //     const range = selection.getRangeAt(0);
// //     const rect = range.getBoundingClientRect();
// //     const container = containerRef.current.getBoundingClientRect();

// //     const highlight = {
// //       id: Date.now(),
// //       page: pageNumber,
// //       position: {
// //         top: (rect.top - container.top) / scale,
// //         left: (rect.left - container.left) / scale,
// //         width: rect.width / scale,
// //         height: rect.height / scale,
// //       },
// //       text: selection.toString(),
// //     };

// //     setHighlights((prev) => [...prev, highlight]);
// //     selection.removeAllRanges();
// //   };

// //   const startDrawing = (e) => {
// //     if (!isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left);
// //     const y = (e.clientY - rect.top);

// //     setDrawings((prev) => ({
// //       ...prev,
// //       [pageNumber]: [
// //         ...(prev[pageNumber] || []),
// //         [{ x: x / scale, y: y / scale }],
// //       ],
// //     }));

// //     drawingRef.current = true;
// //   };

// //   const draw = (e) => {
// //     if (!drawingRef.current || !isDrawingMode) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext('2d');
// //     const rect = canvas.getBoundingClientRect();
// //     const x = (e.clientX - rect.left);
// //     const y = (e.clientY - rect.top);

// //     setDrawings((prev) => {
// //       const newPath = [...prev[pageNumber], { x: x / scale, y: y / scale }];
      
// //       // Redraw the canvas and existing paths
// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       (prev[pageNumber] || []).forEach((path) => {
// //         drawPath(ctx, path);
// //       });

// //       drawPath(ctx, newPath);
// //       return { ...prev, [pageNumber]: newPath };
// //     });
// //   };

// //   const stopDrawing = () => {
// //     drawingRef.current = false;
// //   };

// //   const drawPath = (ctx, path) => {
// //     if (!path || path.length < 1) return;

// //     ctx.beginPath();
// //     ctx.strokeStyle = 'red';
// //     ctx.lineWidth = 2;
// //     ctx.lineCap = 'round';
// //     ctx.lineJoin = 'round';

// //     ctx.moveTo(path[0].x * scale, path[0].y * scale);
// //     for (let i = 1; i < path.length; i++) {
// //       ctx.lineTo(path[i].x * scale, path[i].y * scale);
// //     }

// //     ctx.stroke();
// //   };

// //   const renderHighlights = () => {
// //     return highlights
// //       .filter((highlight) => highlight.page === pageNumber)
// //       .map((highlight) => (
// //         <div
// //           key={highlight.id}
// //           className="absolute bg-yellow-200 opacity-50 cursor-pointer"
// //           style={{
// //             top: highlight.position.top * scale,
// //             left: highlight.position.left * scale,
// //             width: highlight.position.width * scale,
// //             height: highlight.position.height * scale,
// //           }}
// //         >
// //           <div className="hidden group-hover:block absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
// //             Remove
// //           </div>
// //         </div>
// //       ));
// //   };

// //   const renderTextAnnotations = () => {
// //     return textAnnotations
// //       .filter((annotation) => annotation.page === pageNumber)
// //       .map((annotation) => (
// //         <div
// //           key={annotation.id}
// //           className="absolute bg-transparent text-black font-bold"
// //           style={{
// //             top: annotation.position.top * scale,
// //             left: annotation.position.left * scale,
// //             fontSize: 14 * scale,
// //           }}
// //         >
// //           {annotation.text}
// //         </div>
// //       ));
// //   };

// //   const handleAddTextClick = (e) => {
// //     if (!isAddingText) return;

// //     const rect = e.target.getBoundingClientRect();
// //     const x = (e.clientX - rect.left) / scale;
// //     const y = (e.clientY - rect.top) / scale;

// //     const newTextAnnotation = {
// //       id: Date.now(),
// //       page: pageNumber,
// //       position: { top: y, left: x },
// //       text: textInput,
// //     };

// //     setTextAnnotations((prev) => [...prev, newTextAnnotation]);
// //     setTextInput(""); // Reset the input after adding text
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-100 p-8">
// //       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
// //         <div className="mb-6 space-y-4">
// //           <div className="flex items-center gap-4 flex-wrap">
// //             <label className="block">
// //               <span className="sr-only">Choose PDF file</span>
// //               <input
// //                 type="file"
// //                 accept=".pdf"
// //                 onChange={handleFileChange}
// //                 className="block w-full text-sm text-gray-500
// //                   file:mr-4 file:py-2 file:px-4
// //                   file:rounded-full file:border-0
// //                   file:text-sm file:font-semibold
// //                   file:bg-primary file:text-white
// //                   hover:file:bg-primary/90"
// //               />
// //             </label>
// //             <button
// //               onClick={() => setIsHighlighting(!isHighlighting)}
// //               className={`px-4 py-2 rounded-full font-medium ${isHighlighting ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isHighlighting ? 'Highlighting Mode On' : 'Enable Highlighting'}
// //             </button>
// //             <button
// //               onClick={() => setIsAddingText(!isAddingText)}
// //               className={`px-4 py-2 rounded-full font-medium ${isAddingText ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isAddingText ? 'Adding Text Mode On' : 'Enable Text Addition'}
// //             </button>
// //             <button
// //               onClick={() => setIsDrawingMode(!isDrawingMode)}
// //               className={`px-4 py-2 rounded-full font-medium ${isDrawingMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
// //             >
// //               {isDrawingMode ? 'Drawing Mode On' : 'Enable Drawing'}
// //             </button>
// //           </div>

// //           {file && (
// //             <div className="flex items-center gap-4 flex-wrap">
// //               <button
// //                 onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
// //                 className="px-3 py-1 bg-gray-200 rounded-full"
// //               >
// //                 Zoom Out
// //               </button>
// //               <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
// //               <button
// //                 onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
// //                 className="px-3 py-1 bg-gray-200 rounded-full"
// //               >
// //                 Zoom In
// //               </button>
// //               <span className="text-sm text-gray-600">
// //                 Page {pageNumber} of {numPages}
// //               </span>
// //               <button
// //                 disabled={pageNumber <= 1}
// //                 onClick={() => setPageNumber((prev) => prev - 1)}
// //                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
// //               >
// //                 Previous
// //               </button>
// //               <button
// //                 disabled={pageNumber >= numPages}
// //                 onClick={() => setPageNumber((prev) => prev + 1)}
// //                 className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
// //               >
// //                 Next
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         {file && (
// //           <div
// //             ref={containerRef}
// //             className="relative border rounded-lg"
// //             onMouseUp={(e) => {
// //               e.stopPropagation();
// //               if (isHighlighting) handleTextSelection();
// //               if (isAddingText) handleAddTextClick(e);
// //             }}
// //             style={{ position: 'relative' }}
// //           >
// //             <Document
// //               file={fileRef.current}
// //               onLoadSuccess={onDocumentLoadSuccess}
// //               className="mx-auto"
// //             >
// //               <Page pageNumber={pageNumber} scale={scale} className="mx-auto" />
// //             </Document>
// //             {renderHighlights()}
// //             {renderTextAnnotations()}
// //             <canvas
// //               ref={canvasRef}
// //               className="absolute top-0 left-0 w-full h-full"
// //               style={{
// //                 pointerEvents: isDrawingMode ? 'auto' : 'none',
// //                 zIndex: 10,
// //               }}
// //               onMouseDown={startDrawing}
// //               onMouseMove={draw}
// //               onMouseUp={stopDrawing}
// //               onMouseLeave={stopDrawing}
// //             />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }










import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Update worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export default function PDFEditor() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [highlights, setHighlights] = useState([]);
  const [textAnnotations, setTextAnnotations] = useState([]);
  const [drawings, setDrawings] = useState({});
  const [currentPath, setCurrentPath] = useState([]);

  const [mode, setMode] = useState(null); // "highlighting", "addingText", "drawing"

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const fileRef = useRef(file);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(selectedFile);
      fileRef.current = fileURL;
      setFile(fileURL);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  useEffect(() => {
    return () => file && URL.revokeObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawings[pageNumber]?.forEach((path) => drawPath(ctx, path));
    }
  }, [pageNumber, scale, drawings, file]);

  const drawPath = (ctx, path) => {
    if (!path?.length) return;

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(path[0].x * scale, path[0].y * scale);
    path.slice(1).forEach(({ x, y }) => ctx.lineTo(x * scale, y * scale));
    ctx.stroke();
  };

  const handleDrawing = {
    start: (e) => {
      if (mode !== 'drawing') return;

      const { left, top } = canvasRef.current.getBoundingClientRect();
      setCurrentPath([{ x: (e.clientX - left) / scale, y: (e.clientY - top) / scale }]);
      drawingRef.current = true;
    },
    move: (e) => {
      if (!drawingRef.current || mode !== 'drawing') return;

      const { left, top } = canvasRef.current.getBoundingClientRect();
      const ctx = canvasRef.current.getContext('2d');
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
      if (!drawingRef.current || mode !== 'drawing') return;
      drawingRef.current = false;

      setDrawings((prev) => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), currentPath],
      }));
      setCurrentPath([]);
    },
  };

  const handleHighlighting = () => {
    if (mode !== 'highlighting') return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const { top, left, width, height } = range.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    setHighlights((prev) => [
      ...prev,
      {
        id: Date.now(),
        page: pageNumber,
        position: {
          top: (top - container.top) / scale,
          left: (left - container.left) / scale,
          width: width / scale,
          height: height / scale,
        },
        text: selection.toString(),
      },
    ]);
    selection.removeAllRanges();
  };

  const handleAddText = (e) => {
    if (mode !== 'addingText') return;

    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / scale;
    const y = (e.clientY - top) / scale;

    const newText = prompt('Enter text:', 'Type here...');
    if (newText) {
      setTextAnnotations((prev) => [
        ...prev,
        {
          id: Date.now(),
          page: pageNumber,
          position: { top: y, left: x },
          text: newText,
        },
      ]);
    }
  };

  const renderOverlays = () => (
    <>
      {highlights
        .filter((highlight) => highlight.page === pageNumber)
        .map((highlight) => (
          <div
            key={highlight.id}
            className="absolute bg-yellow-200 opacity-50 cursor-pointer group"
            style={{
              top: highlight.position.top * scale,
              left: highlight.position.left * scale,
              width: highlight.position.width * scale,
              height: highlight.position.height * scale,
            }}
            onClick={() => setHighlights((prev) => prev.filter((h) => h.id !== highlight.id))}
          >
            <div className="absolute top-0 right-0 hidden px-2 py-1 text-xs text-white bg-red-500 rounded group-hover:block">
              Remove
            </div>
          </div>
        ))}

      {textAnnotations
        .filter((annotation) => annotation.page === pageNumber)
        .map((annotation) => (
          <div
            key={annotation.id}
            className="absolute font-bold text-black bg-transparent"
            style={{
              top: annotation.position.top * scale,
              left: annotation.position.left * scale,
              fontSize: 14 * scale,
            }}
          >
            {annotation.text}
          </div>
        ))}
    </>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />

            {['highlighting', 'addingText', 'drawing'].map((currentMode) => (
              <button
                key={currentMode}
                onClick={() => setMode((prev) => (prev === currentMode ? null : currentMode))}
                className={`px-4 py-2 rounded-full font-medium ${mode === currentMode
                  ? currentMode === 'highlighting'
                    ? 'bg-yellow-500 text-white'
                    : currentMode === 'addingText'
                      ? 'bg-blue-500 text-white'
                      : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {mode === currentMode
                  ? `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode On`
                  : `Enable ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`}
              </button>
            ))}
          </div>

          {file && (
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))} className="px-3 py-1 bg-gray-200 rounded-full">
                Zoom Out
              </button>
              <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((prev) => Math.min(2, prev + 0.1))} className="px-3 py-1 bg-gray-200 rounded-full">
                Zoom In
              </button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((prev) => prev - 1)}
                className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {file ? (
          <div
            ref={containerRef}
            className="relative border rounded-lg"
            onClick={(e) => mode === 'addingText' && handleAddText(e)}
            onMouseUp={(e) => mode === 'highlighting' && handleHighlighting(e)}
          >
            <Document
              file={fileRef.current}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF. Please try another file.');
              }}
              className="mx-auto"
              options={{
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
              }}
            >
              <Page pageNumber={pageNumber} scale={scale} className="mx-auto" />
            </Document>

            {renderOverlays()}

            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ pointerEvents: mode === 'drawing' ? 'auto' : 'none', zIndex: 10 }}
              onMouseDown={handleDrawing.start}
              onMouseMove={handleDrawing.move}
              onMouseUp={handleDrawing.stop}
              onMouseLeave={handleDrawing.stop}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">Upload a PDF file to get started</div>
        )}
      </div>
    </div>
  );
}
