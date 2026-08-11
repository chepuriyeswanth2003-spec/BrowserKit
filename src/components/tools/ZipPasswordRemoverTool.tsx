import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FolderArchive, Unlock, Download, Loader2, Trash2, Key, ShieldCheck, FileText, Check } from 'lucide-react';
import JSZip from 'jszip';
import { ToolPageShell } from './ToolPageShell';

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
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      const items: { name: string; blob: Blob }[] = [];

      for (const relativePath of Object.keys(zipContent.files)) {
        const fileEntry = zipContent.files[relativePath];
        if (!fileEntry.dir) {
          try {
            const blob = await fileEntry.async('blob');
            items.push({ name: relativePath, blob });
          } catch {
            throw new Error('Encrypted archive entry encountered. Please verify the ZIP password.');
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
      icon={<FolderArchive className="w-6 h-6 text-amber-600" />}
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
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{zipFile.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
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
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Remove ZIP File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ZIP Password (If required for encryption):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter ZIP decryption password..."
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleUnlockZIP}
            disabled={isExtracting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking & Extracting ZIP Archive...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" /> Unlock & Save Clean ZIP Archive
              </>
            )}
          </button>

          {extractedFiles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Unlocked Files ({extractedFiles.length}):
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {extractedFiles.map((item, idx) => (
                  <div
                    key={`extracted-${idx}-${item.name}`}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <a
                      href={URL.createObjectURL(item.blob)}
                      download={item.name.split('/').pop() || item.name}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
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
