import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';


export async function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain',
  downloadType: string = 'chat'
): Promise<void> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
   try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: 'utf8'
      });

      await Share.share({
        title: 'Download Account Key',
        url: result.uri,
        dialogTitle: 'Save Account Key'
      });

    } catch (error) {
      console.error('Error downloading file on native platform:', error); 
      throw error;
    }
  } else {
    // Web - use traditional download
    const dataBlob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
