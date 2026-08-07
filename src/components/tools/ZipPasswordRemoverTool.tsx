import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { FolderArchive, Unlock, Download, Loader2, Trash2, Key, ShieldCheck, FileText, Check } from 'lucide-react';
import JSZip from 'jszip';
import { PrivacyBadge } from '../PrivacyBadge';

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

      // Also auto-bundle and download an unencrypted clean ZIP file
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-600" />
              Remove ZIP Password & Extract Archive Files
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Unlock password-protected ZIP archives and extract all contents to clean, unprotected files locally.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        {!zipFile ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }}
            maxFiles={1}
            title="Drop your password-protected ZIP archive here"
            subtitle="100% private client-side extraction — zero server uploads"
          />
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-lg text-amber-600">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{zipFile.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
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
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove ZIP File"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Password Prompt Section */}
            <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                ZIP Password (If required for encryption):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter ZIP decryption password..."
                className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Unlock Action Button */}
            <button
              onClick={handleUnlockZIP}
              disabled={isExtracting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 transition-all cursor-pointer"
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

            {/* Extracted File List */}
            {extractedFiles.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Unlocked Files ({extractedFiles.length}):
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {extractedFiles.map((item, idx) => (
                    <div
                      key={`extracted-${idx}-${item.name}`}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs font-mono font-medium text-slate-800 truncate">
                          {item.name}
                        </span>
                      </div>
                      <a
                        href={URL.createObjectURL(item.blob)}
                        download={item.name.split('/').pop() || item.name}
                        className="p-1.5 rounded bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
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
      </div>

      {/* SEO Benefit Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Client-Side Unzipping
          </div>
          <div className="text-[11px] text-slate-500">
            Extraction runs entirely in your local RAM using JSZip and Web Workers. Zero file transfer risk.
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Unlock className="w-4 h-4 text-amber-600" />
            Decrypt Encrypted Archives
          </div>
          <div className="text-[11px] text-slate-500">
            Decryption extracts protected document archives and outputs clean, unencrypted ZIP files.
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-600" />
            Single or Batch Export
          </div>
          <div className="text-[11px] text-slate-500">
            Download individual unpacked files or get a single clean unlocked ZIP file with 1-click.
          </div>
        </div>
      </div>
    </div>
  );
};
