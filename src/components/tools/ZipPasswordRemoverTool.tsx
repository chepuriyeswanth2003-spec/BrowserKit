import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FolderArchive, Unlock, Download, Loader2, Trash2, Key, ShieldCheck, FileText, Check } from 'lucide-react';
import JSZip from 'jszip';
import { ToolPageShell } from './ToolPageShell';
import { decryptZipCryptoArchive, isZipEncrypted } from '../../lib/zipCrypto';

interface ZipPasswordRemoverToolProps {
  onDownloadTrigger?: (filename: string, count: number) => void;
}

export const ZipPasswordRemoverTool: React.FC<ZipPasswordRemoverToolProps> = ({ onDownloadTrigger }) => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedFiles, setExtractedFiles] = useState<{ name: string; blob: Blob }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setZipFile(files[0]);
    setExtractedFiles([]);
    setErrorMsg('');
  };

  const handleUnlockZIP = async () => {
    if (!zipFile) return;
    setIsExtracting(true);
    setErrorMsg('');
    setExtractedFiles([]);

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const encrypted = isZipEncrypted(arrayBuffer);
      let items: { name: string; blob: Blob }[] = [];

      if (encrypted) {
        if (!password) {
          throw new Error('This archive is password-protected. Enter the password to unlock it.');
        }
        const { entries, skipped } = decryptZipCryptoArchive(arrayBuffer, password);
        items = entries.filter((e) => !e.isDirectory).map((e) => ({ name: e.name, blob: new Blob([e.data as any]) }));

        if (items.length === 0 && skipped.length > 0) {
          const wrongPassword = skipped.some((s) => s.reason === 'Incorrect password');
          throw new Error(
            wrongPassword
              ? 'Incorrect password — no entries could be decrypted.'
              : skipped[0].reason
          );
        }
        if (skipped.length > 0) {
          setErrorMsg(
            `Unlocked ${items.length} file(s). ${skipped.length} entr${skipped.length === 1 ? 'y was' : 'ies were'} skipped (${skipped
              .map((s) => s.reason)
              .filter((v, i, a) => a.indexOf(v) === i)
              .join('; ')}).`
          );
        }
      } else {
        // Not actually encrypted — just re-package it cleanly
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);
        for (const relativePath of Object.keys(zipContent.files)) {
          const fileEntry = zipContent.files[relativePath];
          if (!fileEntry.dir) {
            const blob = await fileEntry.async('blob');
            items.push({ name: relativePath, blob });
          }
        }
      }

      if (items.length === 0) {
        throw new Error('No readable files found in the archive.');
      }

      setExtractedFiles(items);

      const cleanZip = new JSZip();
      items.forEach((item) => cleanZip.file(item.name, item.blob));
      const cleanBlob = await cleanZip.generateAsync({ type: 'blob' });

      const downloadUrl = URL.createObjectURL(cleanBlob);
      const outputName = zipFile.name.replace(/\.zip$/i, '') + '_unlocked.zip';
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      if (onDownloadTrigger) {
        onDownloadTrigger(outputName, items.length);
      }
    } catch (err: any) {
      console.error('ZIP Unlock Error:', err);
      setErrorMsg(err.message || 'Failed to unlock ZIP archive. Please check your password or archive integrity.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <ToolPageShell
      categoryBadge="Vault Suite"
      categoryBadgeColor="amber"
      title="Remove ZIP Password & Extract Archive Files"
      description="Unlock password-protected ZIP archives and extract all contents to clean, unprotected files locally."
      icon={<FolderArchive className="w-6 h-6 text-[#b8860b]" />}
    >
      {!zipFile ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept=".zip"
          title="Drop your password-protected ZIP archive here"
          subtitle="100% private client-side extraction — zero server uploads"
        />
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-[#fdfbf7] dark:bg-[#332e29]/60 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#b8860b] dark:bg-[#b8860b]/60 wobbly-sm text-[#b8860b] dark:text-[#b8860b] border border-[2px] border-[#b8860b] dark:border-[#b8860b]">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#2d2d2d] dark:text-white">{zipFile.name}</div>
                <div className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] font-mono mt-0.5">
                  {(zipFile.size / 1024 / 1024).toFixed(2)} MB • ZIP Archive
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setZipFile(null);
                setPassword('');
                setExtractedFiles([]);
                setErrorMsg('');
              }}
              className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
              title="Remove ZIP File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-[#b8860b]/50 dark:bg-[#b8860b]/30 wobbly-md border border-[2px] border-[#b8860b] dark:border-[#b8860b]/50 space-y-3">
            <label className="block text-xs font-bold text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#b8860b] dark:text-[#b8860b]" />
              ZIP Password (If required for encryption):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter ZIP decryption password..."
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-[#332e29] wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] focus:outline-none focus:ring-2 focus:ring-[#b8860b] font-mono text-[#2d2d2d] dark:text-white placeholder:text-[#2d2d2d]/[0.7]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ff4d4d] dark:bg-[#ff4d4d]/60 text-[#ff4d4d] dark:text-[#ff4d4d] text-xs wobbly-sm font-medium border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d]">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleUnlockZIP}
            disabled={isExtracting}
            className="w-full py-3.5 bg-[#2d2d2d] hover:bg-[#2d2d2d] dark:bg-[#2f7a4f] dark:hover:bg-[#2f7a4f] text-white wobbly-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking & Extracting ZIP Archive...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-[#2f7a4f]" /> Unlock & Save Clean ZIP Archive
              </>
            )}
          </button>

          {extractedFiles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#2d2d2d]/[0.15] dark:border-[#f3ede2]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#2f7a4f] dark:text-[#2f7a4f]" />
                  Unlocked Files ({extractedFiles.length}):
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {extractedFiles.map((item, idx) => (
                  <div
                    key={`extracted-${idx}-${item.name}`}
                    className="p-2.5 wobbly-sm bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileText className="w-4 h-4 text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] shrink-0" />
                      <span className="text-xs font-mono font-medium text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] truncate">
                        {item.name}
                      </span>
                    </div>
                    <a
                      href={URL.createObjectURL(item.blob)}
                      download={item.name.split('/').pop() || item.name}
                      className="p-1.5 wobbly-sm bg-white dark:bg-[#332e29] text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] hover:text-[#2d2d2d] dark:hover:text-white border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]/[0.35] transition-all cursor-pointer"
                      title={`Download ${item.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPageShell>
  );
};
