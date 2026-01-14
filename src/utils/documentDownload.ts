import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  AlignmentType,
  TableLayoutType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType
} from 'docx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface RichTextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface CustomTemplateOptions {
  template: 'simple' | 'header' | 'footer';
  font: 'helvetica' | 'times' | 'courier';
  logo: string | null;
  position: 'top-left' | 'top-right' | 'top-center';
  response: string;
  senderInfo?: string;
  recipientInfo?: string;
  footerInfo?: string;
  showPageNumbers: boolean;
}

export async function saveBlob(blob: Blob, filename: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await convertBlobToBase64(blob) as string;

      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data.split(',')[1],
        directory: Directory.Documents,
      });

      await Share.share({
        url: savedFile.uri,
        title: 'Download',
        text: 'Word / PDF',
      });
    } catch (error) {
      console.error('Mobile Save Error:', error);
      throw error;
    }
  } else {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

function convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

function parseRichText(text: string): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        bold: false,
        italic: false
      });
    }

    if (match[1]) {
      segments.push({
        text: match[2],
        bold: true,
        italic: false
      });
    } else if (match[3]) {
      segments.push({
        text: match[4],
        bold: false,
        italic: true
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      bold: false,
      italic: false
    });
  }

  return segments.length > 0 ? segments : [{ text: text, bold: false, italic: false }];
}

function cleanCellText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .trim();
}

function parseTableRow(line: string): string[] {
  let content = line.trim();
  if (content.startsWith('|')) content = content.substring(1);
  if (content.endsWith('|')) content = content.substring(0, content.length - 1);
  return content.split('|').map(cell => cell.trim());
}

function unwrapMarkdownTables(text: string): string {
  return text;
}

function printWrappedRichText(
  doc: jsPDF,
  segments: RichTextSegment[],
  margin: number,
  yPos: number,
  maxLineWidth: number,
  lineHeight: number,
  fontName: string = 'helvetica'
): number {
  let currentX = margin;

  segments.forEach(seg => {
    let style = 'normal';
    if (seg.bold && seg.italic) style = 'bolditalic';
    else if (seg.bold) style = 'bold';
    else if (seg.italic) style = 'italic';

    doc.setFont(fontName, style);
    const words = seg.text.split(/(\s+)/);

    words.forEach((word: string) => {
      const wordWidth = doc.getTextWidth(word);
      if (currentX + wordWidth > margin + maxLineWidth) {
        yPos += lineHeight;
        currentX = margin;
      }
      doc.text(word, currentX, yPos);
      currentX += wordWidth;
    });
  });

  return yPos + lineHeight;
}

function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}

export async function downloadAsPDF(content: string) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const maxLineWidth = pageWidth - (margin * 2);
  let yPos = 20;

  const rawResponse = unwrapMarkdownTables(content);
  const lines = rawResponse.split('\n');
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const headers = parseTableRow(tableBuffer[0]);
    const body = tableBuffer.slice(2).map(line => parseTableRow(line));
    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: body,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      didParseCell: (data: any) => {
        data.cell.text = data.cell.text.map((t: string) => cleanCellText(t));
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    tableBuffer = [];
  };

  lines.forEach((line: string) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('|')) {
      tableBuffer.push(trimmedLine);
      return;
    } else {
      flushTableBuffer();
    }
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }

    let textToProcess = trimmedLine.replace(/^(#+)(?=[^ #])/g, '$1 ');
    let isCentered = false;
    if (textToProcess.match(/<center>/i)) {
      isCentered = true;
      textToProcess = textToProcess.replace(/<\/?center>/gi, '').trim();
    }

    let fontSize = 12;
    let isHeading = false;

    if (textToProcess.startsWith('### ')) {
      fontSize = 14;
      textToProcess = textToProcess.substring(4);
      isHeading = true;
    } else if (textToProcess.startsWith('## ')) {
      fontSize = 16;
      textToProcess = textToProcess.substring(3);
      isHeading = true;
    } else if (textToProcess.startsWith('# ')) {
      fontSize = 18;
      textToProcess = textToProcess.substring(2);
      isHeading = true;
    } else if (textToProcess.startsWith('- ') || textToProcess.startsWith('* ')) {
      textToProcess = '• ' + textToProcess.substring(2);
    }

    const segments = parseRichText(textToProcess);
    if (segments.length === 0 || (segments.length === 1 && segments[0].text === '')) {
      yPos += 7;
      return;
    }

    doc.setFontSize(fontSize);

    if (isCentered) {
      let totalWidth = 0;
      segments.forEach(s => {
        let style = 'normal';
        if(isHeading) style = 'bold';
        else if (s.bold && s.italic) style = 'bolditalic';
        else if (s.bold) style = 'bold';
        else if (s.italic) style = 'italic';
        doc.setFont("helvetica", style);
        totalWidth += doc.getTextWidth(s.text);
      });

      let currentX = (pageWidth - totalWidth) / 2;
      segments.forEach(s => {
        let style = 'normal';
        if(isHeading) style = 'bold';
        else if (s.bold && s.italic) style = 'bolditalic';
        else if (s.bold) style = 'bold';
        else if (s.italic) style = 'italic';

        doc.setFont("helvetica", style);
        doc.text(s.text, currentX, yPos);
        currentX += doc.getTextWidth(s.text);
      });
      yPos += fontSize/2 + 2;
      return;
    }

    if(isHeading) segments.forEach(s => s.bold = true);
    yPos = printWrappedRichText(doc, segments, margin, yPos, maxLineWidth, isHeading ? 10 : 7);
  });

  flushTableBuffer();
  const pdfBlob = doc.output('blob');
  await saveBlob(pdfBlob, `response_${Date.now()}.pdf`);
}

export async function downloadAsWord(content: string) {
  const rawResponse = unwrapMarkdownTables(content);
  const lines = rawResponse.split('\n');
  const docChildren: any[] = [];
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const headerRow = parseTableRow(tableBuffer[0]);
    const bodyRows = tableBuffer.slice(2).map(line => parseTableRow(line));
    const totalTableWidth = 9000;
    const colWidth = Math.floor(totalTableWidth / headerRow.length);
    const columnWidthsArray = new Array(headerRow.length).fill(colWidth);

    const createCell = (text: string, isHeader: boolean) => {
      const cleanText = cleanCellText(text);
      return new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: cleanText, bold: isHeader, size: 24, font: "Calibri" })]
        })],
        width: { size: colWidth, type: WidthType.DXA },
        shading: isHeader ? { fill: "E0E0E0" } : undefined
      });
    };

    const rows = [
      new TableRow({ children: headerRow.map(text => createCell(text, true)) }),
      ...bodyRows.map(row => new TableRow({ children: row.map(text => createCell(text, false)) }))
    ];

    docChildren.push(new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: columnWidthsArray,
      rows: rows,
      width: { size: totalTableWidth, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      }
    }));
    docChildren.push(new Paragraph({ text: "" }));
    tableBuffer = [];
  };

  lines.forEach((line: string) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('|')) {
      tableBuffer.push(trimmedLine);
      return;
    } else {
      flushTableBuffer();
    }
    if (trimmedLine.length === 0) {
      docChildren.push(new Paragraph({ text: "" }));
      return;
    }

    let textToProcess = trimmedLine.replace(/^(#+)(?=[^ #])/g, '$1 ');
    let alignment: any = AlignmentType.LEFT;

    if (textToProcess.match(/<center>/i)) {
      alignment = AlignmentType.CENTER;
      textToProcess = textToProcess.replace(/<\/?center>/gi, '').trim();
    }

    let headingLevel: any = undefined;
    if (textToProcess.startsWith('# ')) {
      headingLevel = "Heading1";
      textToProcess = textToProcess.substring(2);
    } else if (textToProcess.startsWith('## ')) {
      headingLevel = "Heading2";
      textToProcess = textToProcess.substring(3);
    } else if (textToProcess.startsWith('### ')) {
      headingLevel = "Heading3";
      textToProcess = textToProcess.substring(4);
    } else if (textToProcess.startsWith('- ') || textToProcess.startsWith('* ')) {
      textToProcess = '• ' + textToProcess.substring(2);
    }

    const segments = parseRichText(textToProcess);
    const textRuns = segments.map(seg => new TextRun({
      text: seg.text,
      bold: seg.bold,
      italics: seg.italic,
      size: headingLevel ? undefined : 24,
      font: "Calibri"
    }));

    const pOpts: any = {
      children: textRuns,
      spacing: { after: 120 },
      alignment: alignment
    };
    if (headingLevel) pOpts.heading = headingLevel;

    docChildren.push(new Paragraph(pOpts));
  });

  flushTableBuffer();
  const doc = new Document({ sections: [{ properties: {}, children: docChildren }] });
  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, `response_${Date.now()}.docx`);
}

export async function generateCustomPDF(opts: CustomTemplateOptions) {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;
  const margin = 20;
  const maxLineWidth = width - (margin * 2);

  doc.setFont(opts.font, 'normal');
  let currentY = margin;

  if (opts.logo) {
    try {
      const dim = await getImageDimensions(opts.logo);
      const ratio = dim.width / dim.height;
      const imgHeight = 20;
      const imgWidth = imgHeight * ratio;

      let imgX = margin;
      if (opts.position === 'top-right') imgX = width - margin - imgWidth;
      else if (opts.position === 'top-center') imgX = (width / 2) - (imgWidth / 2);

      doc.addImage(opts.logo, 'PNG', imgX, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
    } catch (e) {
      console.error("Error adding logo", e);
    }
  }

  if (opts.template === 'header' || opts.template === 'footer') {
    doc.setFontSize(10);

    if (opts.senderInfo) {
      const senderLines = doc.splitTextToSize(opts.senderInfo, (width / 2) - margin - 5);
      doc.text(senderLines, margin, currentY);
    }

    if (opts.recipientInfo) {
      const recipientLines = doc.splitTextToSize(opts.recipientInfo, (width / 2) - margin - 5);
      const xRight = width - margin;
      doc.text(recipientLines, xRight, currentY, { align: 'right' });
    }

    const senderH = opts.senderInfo ? doc.getTextDimensions(opts.senderInfo).h : 0;
    const recipientH = opts.recipientInfo ? doc.getTextDimensions(opts.recipientInfo).h : 0;
    currentY += Math.max(senderH, recipientH) + 15;
  }

  let yPos = currentY;
  const rawResponse = unwrapMarkdownTables(opts.response);
  const lines = rawResponse.split('\n');
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const headers = parseTableRow(tableBuffer[0]);
    const body = tableBuffer.slice(2).map(line => parseTableRow(line));

    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: body,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak', font: opts.font },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
      didParseCell: (data: any) => {
        data.cell.text = data.cell.text.map((t: string) => cleanCellText(t));
      }
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    tableBuffer = [];
  };

  lines.forEach((line: string) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('|')) {
      tableBuffer.push(trimmedLine);
      return;
    } else {
      flushTableBuffer();
    }

    if (yPos > height - margin - 15) {
      doc.addPage();
      yPos = 20;
    }

    let textToProcess = trimmedLine.replace(/^(#+)(?=[^ #])/g, '$1 ');
    let isCentered = false;
    if (textToProcess.match(/<center>/i)) {
      isCentered = true;
      textToProcess = textToProcess.replace(/<\/?center>/gi, '').trim();
    }

    let fontSize = 11;
    let fontType = 'normal';

    if (textToProcess.startsWith('# ')) {
      fontSize=16;
      fontType='bold';
      textToProcess = textToProcess.substring(2);
    } else if (textToProcess.startsWith('## ')) {
      fontSize=14;
      fontType='bold';
      textToProcess = textToProcess.substring(3);
    } else if (textToProcess.startsWith('### ')) {
      fontSize=12;
      fontType='bold';
      textToProcess = textToProcess.substring(4);
    } else if (textToProcess.startsWith('- ') || textToProcess.startsWith('* ')) {
      textToProcess = '• ' + textToProcess.substring(2);
    }

    if (!textToProcess) {
      yPos += 3;
      return;
    }

    doc.setFontSize(fontSize);
    doc.setFont(opts.font, fontType);

    const segments = parseRichText(textToProcess);
    if(fontType === 'bold') {
      segments.forEach(s => s.bold = true);
    }

    if (isCentered) {
      let cleanText = textToProcess.replace(/\*\*/g, '').replace(/__/g, '');
      const splitLines = doc.splitTextToSize(cleanText, maxLineWidth);
      doc.text(splitLines, width / 2, yPos, { align: 'center' });
      yPos += (splitLines.length * (fontSize * 0.5)) + 2;
    } else {
      const lineHeight = (fontSize * 0.5) + 2;
      yPos = printWrappedRichText(doc, segments, margin, yPos, maxLineWidth, lineHeight, opts.font);
    }
  });

  flushTableBuffer();

  if (opts.template === 'footer' && opts.footerInfo) {
    const footerY = height - 20;
    doc.setFontSize(9);
    doc.setFont(opts.font, 'normal');
    doc.setTextColor(100);
    doc.setDrawColor(200);
    doc.line(margin, footerY - 5, width - margin, footerY - 5);

    const footerLines = doc.splitTextToSize(opts.footerInfo, maxLineWidth);
    doc.text(footerLines, margin, footerY);
    doc.setTextColor(0);
  }

  if (opts.showPageNumbers) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`${i} / ${totalPages}`, width - margin, height - 10, { align: 'right' });
    }
  }

  const pdfBlob = doc.output('blob');
  await saveBlob(pdfBlob, `custom_doc_${Date.now()}.pdf`);
}

export async function generateCustomWord(opts: CustomTemplateOptions) {
  const children: any[] = [];

  let fontName = "Arial";
  if (opts.font === 'times') fontName = "Times New Roman";
  else if (opts.font === 'courier') fontName = "Courier New";

  if (opts.logo) {
    try {
      const match = opts.logo.match(/data:image\/(.*?);base64/);
      let imgType = "png";
      if (match && match[1]) imgType = (match[1] === 'jpeg' || match[1] === 'jpg') ? "jpeg" : "png";

      const imageBuffer = Uint8Array.from(atob(opts.logo.split(',')[1]), c => c.charCodeAt(0));
      const dim = await getImageDimensions(opts.logo);
      const ratio = dim.width / dim.height;
      const targetHeight = 50;
      const targetWidth = targetHeight * ratio;

      let align: any = AlignmentType.LEFT;
      if(opts.position === 'top-right') align = AlignmentType.RIGHT;
      if(opts.position === 'top-center') align = AlignmentType.CENTER;

      children.push(new Paragraph({
        children: [new ImageRun({
          data: imageBuffer,
          transformation: { width: Math.round(targetWidth), height: Math.round(targetHeight) },
          type: imgType as any,
        })],
        alignment: align,
        spacing: { after: 200 }
      }));
    } catch (e) {
      console.error("Logo error", e);
    }
  }

  if ((opts.template === 'header' || opts.template === 'footer') && (opts.senderInfo || opts.recipientInfo)) {
    const colWidth = 4600;

    const senderCell = new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: opts.senderInfo || '', font: fontName, size: 22 })]
      })],
      borders: {
        top: {style: BorderStyle.NONE},
        bottom: {style: BorderStyle.NONE},
        left: {style: BorderStyle.NONE},
        right: {style: BorderStyle.NONE}
      },
      width: { size: colWidth, type: WidthType.DXA }
    });

    const recipientCell = new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: opts.recipientInfo || '', font: fontName, size: 22 })],
        alignment: AlignmentType.RIGHT
      })],
      borders: {
        top: {style: BorderStyle.NONE},
        bottom: {style: BorderStyle.NONE},
        left: {style: BorderStyle.NONE},
        right: {style: BorderStyle.NONE}
      },
      width: { size: colWidth, type: WidthType.DXA }
    });

    const headerTable = new Table({
      layout: TableLayoutType.FIXED,
      rows: [ new TableRow({ children: [senderCell, recipientCell] }) ],
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [colWidth, colWidth],
      borders: {
        top: {style: BorderStyle.NONE},
        bottom: {style: BorderStyle.NONE},
        left: {style: BorderStyle.NONE},
        right: {style: BorderStyle.NONE},
        insideVertical: {style: BorderStyle.NONE}
      }
    });

    children.push(headerTable);
    children.push(new Paragraph({ text: "", spacing: { after: 400 } }));
  }

  const rawResponse = unwrapMarkdownTables(opts.response);
  const lines = rawResponse.split('\n');
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;
    const headerRow = parseTableRow(tableBuffer[0]);
    const bodyRows = tableBuffer.slice(2).map(line => parseTableRow(line));

    const totalTableWidth = 9000;
    const colWidth = Math.floor(totalTableWidth / headerRow.length);
    const columnWidthsArray = new Array(headerRow.length).fill(colWidth);

    const createCell = (text: string, isHeader: boolean) => {
      const cleanText = cleanCellText(text);
      return new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: cleanText, bold: isHeader, size: 24, font: fontName })]
        })],
        width: { size: colWidth, type: WidthType.DXA },
        shading: isHeader ? { fill: "E0E0E0" } : undefined
      });
    };

    const rows = [
      new TableRow({ children: headerRow.map(text => createCell(text, true)) }),
      ...bodyRows.map(row => new TableRow({ children: row.map(text => createCell(text, false)) }))
    ];

    children.push(new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: columnWidthsArray,
      rows: rows,
      width: { size: totalTableWidth, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      }
    }));

    children.push(new Paragraph({ text: "" }));
    tableBuffer = [];
  };

  lines.forEach((line: string) => {
    let trimmedLine = line.trim();

    if (trimmedLine.startsWith('|')) {
      tableBuffer.push(trimmedLine);
      return;
    } else {
      flushTableBuffer();
    }

    if (trimmedLine.length === 0) {
      children.push(new Paragraph({ text: "" }));
      return;
    }

    let textToProcess = trimmedLine.replace(/^(#+)(?=[^ #])/g, '$1 ');
    let alignment: any = AlignmentType.LEFT;

    if (textToProcess.match(/<center>/i)) {
      alignment = AlignmentType.CENTER;
      textToProcess = textToProcess.replace(/<\/?center>/gi, '').trim();
    }

    let headingLevel: any = undefined;
    let bulletLevel = 0;

    if (textToProcess.startsWith('# ')) {
      headingLevel = "Heading1";
      textToProcess = textToProcess.substring(2);
    } else if (textToProcess.startsWith('## ')) {
      headingLevel = "Heading2";
      textToProcess = textToProcess.substring(3);
    } else if (textToProcess.startsWith('### ')) {
      headingLevel = "Heading3";
      textToProcess = textToProcess.substring(4);
    } else if (textToProcess.startsWith('- ') || textToProcess.startsWith('* ')) {
      bulletLevel = 1;
      textToProcess = textToProcess.substring(2);
    }

    const segments = parseRichText(textToProcess);
    const textRuns = segments.map(seg => new TextRun({
      text: seg.text,
      bold: seg.bold,
      italics: seg.italic,
      size: headingLevel ? undefined : 24,
      font: fontName
    }));

    const pOpts: any = {
      children: textRuns,
      spacing: { after: 120 },
      alignment: alignment
    };
    if (headingLevel) pOpts.heading = headingLevel;
    if (bulletLevel > 0) pOpts.bullet = { level: 0 };

    children.push(new Paragraph(pOpts));
  });

  flushTableBuffer();

  const footers: any = {};

  if (opts.template === 'footer' && opts.footerInfo) {
    footers.first = new Footer({
      children: [
        new Paragraph({
          children: [new TextRun({ text: opts.footerInfo, size: 18, color: "666666", font: fontName })],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } }
        })
      ]
    });
  }

  if (opts.showPageNumbers) {
    footers.default = new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "Page numbers will appear here", font: fontName, size: 18, color: "666666" })
          ],
          alignment: AlignmentType.RIGHT
        })
      ]
    });
  }

  const sectionProps: any = {
    children: children,
    properties: {
      titlePage: true,
    },
    footers: footers
  };

  const doc = new Document({ sections: [sectionProps] });
  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, `custom_doc_${Date.now()}.docx`);
}
