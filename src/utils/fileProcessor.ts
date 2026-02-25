import ExcelJS from 'exceljs';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      if (pageText.trim()) {
        fullText += `Page ${pageNum}:\n${pageText}\n\n`;
      }
    }

    if (fullText.trim().length === 0) {
      throw new Error('PDF appears to contain no readable text content. The file may be image-based.');
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF error details:', errorMessage);
    if (errorMessage.includes('no readable text')) {
      throw error;
    }
    throw new Error(`PDF extraction failed: ${errorMessage}`);
  }
}

async function extractExcelText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    let extractedText = '';

    workbook.worksheets.forEach((worksheet, index) => {
      const sheetName = worksheet.name;
      let sheetText = '';

      worksheet.eachRow((row, rowNumber) => {
        const rowValues = row.values as any[];
        const cells = rowValues.slice(1).map(cell => {
          if (cell === null || cell === undefined) return '';
          if (typeof cell === 'object' && 'text' in cell) return cell.text;
          return String(cell);
        });
        sheetText += cells.join(',') + '\n';
      });

      if (sheetText.trim()) {
        extractedText += `Sheet ${index + 1} (${sheetName}):\n`;
        extractedText += sheetText + '\n';
      }
    });

    if (extractedText.trim().length === 0) {
      throw new Error('Excel file appears to be empty or contains no readable data');
    }

    return extractedText.trim();
  } catch (error) {
    throw new Error('Excel content extraction failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function extractWordText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('Word document appears to be empty or contains no readable text');
    }

    return result.value.trim();
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Could not extract text from Word document. Please ensure it\'s a valid .docx file.');
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    if (fileType.includes('text') || fileName.endsWith('.txt')) {
      const content = await file.text();
      if (!content || content.trim().length < 1) {
        throw new Error('Text file is empty');
      }
      return content;
    }

    if (fileType.includes('csv') || fileName.endsWith('.csv')) {
      const content = await file.text();
      if (!content || content.trim().length < 1) {
        throw new Error('CSV file is empty');
      }
      return content;
    }

    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return await extractPDFText(file);
    }

    if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return await extractExcelText(file);
    }

    if (fileType.includes('document') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await extractWordText(file);
    }

    const content = await file.text();
    if (!content || content.trim().length < 1) {
      throw new Error('File appears to be empty or binary');
    }
    return content;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Not possible to extract content');
  }
}

export function getFileTypeFromName(fileName: string): 'pdf' | 'csv' | 'excel' | 'doc' {
  const name = fileName.toLowerCase();
  
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'doc';
  
  return 'doc'; // Default fallback
} 