import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Unlock, FileText, Download, Loader2, Trash2, Key, ShieldCheck } from 'lucide-react';
import { removePDFPassword, checkIfPDFEncrypted } from '../../lib/pdfProcessor';
import { ToolPageShell } from './ToolPageShell';

interface PdfPasswordRemoverToolProps {
  onDownloadTrigger?: (filename: string, count: number) => void;
}

export const PdfPasswordRemoverTool: React.FC<PdfPasswordRemoverToolProps> = ({ onDownloadTrigger }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setPdfFile(file);
    setErrorMsg('');
    try {
      const encrypted = await checkIfPDFEncrypted(file);
      setIsEncrypted(encrypted);
    } catch {
      setIsEncrypted(true);
    }
  };

  const handleUnlockPDF = async () => {
    if (!pdfFile) return;
    setIsUnlocking(true);
    setErrorMsg('');

    try {
      const unlockedBlob = await removePDFPassword(pdfFile, password);
      const downloadUrl = URL.createObjectURL(unlockedBlob);
      const outputName = pdfFile.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      if (onDownloadTrigger) {
        onDownloadTrigger(outputName, 1);
      }
    } catch (err: any) {
      console.error('PDF Unlock Error:', err);
      setErrorMsg(err.message || 'Failed to unlock PDF. Please check the password and try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <ToolPageShell
      categoryBadge="PDF Security"
      categoryBadgeColor="rose"
      title="Remove PDF Password & Security Restrictions"
      description="Unlock password-protected PDFs and strip printing/copying restrictions 100% locally in your browser."
      icon={<Unlock className="w-6 h-6 text-rose-600" />}
    >
      {!pdfFile ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept=".pdf"
          title="Drop your password-protected PDF file here"
          subtitle="100% private client-side decryption — your document never leaves your device"
        />
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{pdfFile.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • {isEncrypted ? 'Locked / Password Required' : 'Standard Restrictions Detected'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setPdfFile(null);
                setPassword('');
                setErrorMsg('');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Remove PDF"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              PDF Password (If prompt required):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF open password..."
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium border border-red-200 dark:border-red-800">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleUnlockPDF}
            disabled={isUnlocking}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking & Removing Restrictions...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" /> Unlock & Save Clean PDF
              </>
            )}
          </button>
        </div>
      )}
    </ToolPageShell>
  );
};
