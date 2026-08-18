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
      icon={<Unlock className="w-6 h-6 text-[#ff4d4d]" />}
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
          <div className="p-4 bg-[#fdfbf7] dark:bg-[#332e29]/60 wobbly-md border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#ff4d4d] dark:bg-[#ff4d4d]/60 wobbly-sm text-[#ff4d4d] dark:text-[#ff4d4d] border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#2d2d2d] dark:text-white">{pdfFile.name}</div>
                <div className="text-xs text-[#2d2d2d]/[0.7] dark:text-[#f3ede2]/[0.55] font-mono mt-0.5">
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
              className="p-2 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] hover:bg-[#ff4d4d] dark:hover:bg-[#ff4d4d]/40 transition-colors cursor-pointer"
              title="Remove PDF"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-[#ff4d4d]/50 dark:bg-[#ff4d4d]/30 wobbly-md border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d]/50 space-y-3">
            <label className="block text-xs font-bold text-[#2d2d2d]/[0.92] dark:text-[#f3ede2]/[0.55] uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#ff4d4d] dark:text-[#ff4d4d]" />
              PDF Password (If prompt required):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF open password..."
              className="w-full px-4 py-2.5 text-xs bg-white dark:bg-[#332e29] wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] focus:outline-none focus:ring-2 focus:ring-[#ff4d4d] font-mono text-[#2d2d2d] dark:text-white placeholder:text-[#2d2d2d]/[0.7]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ff4d4d] dark:bg-[#ff4d4d]/60 text-[#ff4d4d] dark:text-[#ff4d4d] text-xs wobbly-sm font-medium border border-[2px] border-[#ff4d4d] dark:border-[#ff4d4d]">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleUnlockPDF}
            disabled={isUnlocking}
            className="w-full py-3.5 bg-[#2d2d2d] hover:bg-[#2d2d2d] dark:bg-[#2f7a4f] dark:hover:bg-[#2f7a4f] text-white wobbly-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand disabled:opacity-50 transition-all cursor-pointer"
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking & Removing Restrictions...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-[#2f7a4f]" /> Unlock & Save Clean PDF
              </>
            )}
          </button>
        </div>
      )}
    </ToolPageShell>
  );
};
