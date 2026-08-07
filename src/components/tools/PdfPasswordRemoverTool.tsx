import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import { Unlock, FileText, Download, Loader2, Trash2, Key, ShieldCheck } from 'lucide-react';
import { removePDFPassword, checkIfPDFEncrypted } from '../../lib/pdfProcessor';
import { PrivacyBadge } from '../PrivacyBadge';

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-rose-600" />
              Remove PDF Password & Unlock Security Restrictions
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Unlock password-protected PDFs and strip printing/copying restrictions 100% locally in your browser.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        {!pdfFile ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            title="Drop your password-protected PDF file here"
            subtitle="100% private client-side decryption — your document never leaves your device"
          />
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 rounded-lg text-rose-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{pdfFile.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
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
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove PDF"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Password Input Section */}
            <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-rose-600" />
                PDF Password (If prompt required):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF open password (leave blank if owner-restricted only)..."
                className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Tip: Leave blank for PDFs with owner restrictions (print/copy restrictions). Enter password for open-encrypted PDFs.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Unlock Action Button */}
            <button
              onClick={handleUnlockPDF}
              disabled={isUnlocking}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 transition-all cursor-pointer"
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
      </div>

      {/* SEO Benefit Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% On-Device Privacy
          </div>
          <div className="text-[11px] text-slate-500">
            Decryption executes in your local browser WebAssembly vault. Financial and legal PDFs never touch cloud servers.
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Unlock className="w-4 h-4 text-rose-600" />
            Strip Owner Restrictions
          </div>
          <div className="text-[11px] text-slate-500">
            Unlocks print, edit, and copy restrictions instantly so you can modify or print your document without hassle.
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-600" />
            Instant Unlocked Export
          </div>
          <div className="text-[11px] text-slate-500">
            Saves a clean, unencrypted standard PDF file that opens smoothly in any PDF viewer or printing device.
          </div>
        </div>
      </div>
    </div>
  );
};
