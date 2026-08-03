import JSZip from 'jszip';
import { ZipEntryItem } from '../types';

export async function createZip(files: File[], zipName: string = 'archive.zip'): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function readZipEntries(zipFile: File): Promise<{ entries: ZipEntryItem[]; zipInstance: JSZip }> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const items: ZipEntryItem[] = [];

  let index = 0;
  for (const [relativePath, entry] of Object.entries(loadedZip.files)) {
    index++;
    // Get entry size if available from internal data
    const uncompressedSize = (entry as any)._data?.uncompressedSize || 0;

    items.push({
      id: `zip-entry-${index}-${entry.name}`,
      name: relativePath,
      size: uncompressedSize,
      isDirectory: entry.dir,
      date: entry.date || new Date(),
    });
  }

  return { entries: items, zipInstance: loadedZip };
}

export async function extractZipEntry(zipInstance: JSZip, entryName: string): Promise<Blob> {
  const file = zipInstance.file(entryName);
  if (!file) {
    throw new Error(`File ${entryName} not found inside ZIP.`);
  }
  return await file.async('blob');
}

export async function extractAllZipEntries(zipInstance: JSZip): Promise<{ name: string; blob: Blob }[]> {
  const results: { name: string; blob: Blob }[] = [];

  for (const [relativePath, entry] of Object.entries(zipInstance.files)) {
    if (!entry.dir) {
      const blob = await entry.async('blob');
      results.push({ name: relativePath, blob });
    }
  }

  return results;
}
