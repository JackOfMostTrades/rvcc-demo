import * as PDFKit from "pdfkit";
import * as blobStream from "blob-stream";

declare global {
    let PDFDocument: PDFKit.PDFDocument;
    let blobStream: blobStream;
}
