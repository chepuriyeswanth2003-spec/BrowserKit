import React, { useState } from 'react';
import { Dropzone } from '../Dropzone';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  Download,
  Loader2,
  Trash2,
  FileText,
  Film,
  Image as ImageIcon,
  Archive,
  FileCode,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  encryptFileWithPassword,
  decryptFileWithPassword,
  inspectEncryptedFile,
} from '../../lib/fileEncryption';
import { ToolPageShell } from './ToolPageShell';

export const FileEncryptorTool: React.FC = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encryption state
  const [filesToEncrypt, setFilesToEncrypt] = useState<File[]>([]);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Decryption state
  const [encryptedFiles, setEncryptedFiles] = useState<
    { file: File; meta?: { originalName: string; mimeType: string; fileSize: number } }[]
  >([]);
  const [decryptPassword, setDecryptPassword] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<
    { blob: Blob; url: string; originalName: string; mimeType: string }[]
  >([]);

  // Password Generator
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let pwd = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setPassword(pwd);
    setConfirmPassword(pwd);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'Empty', color: 'bg-[#d8d2c4] dark:bg-[#332e29]', percent: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { label: 'Weak', color: 'bg-[#ff4d4d]', percent: 25 };
    if (score <= 50) return { label: 'Fair', color: 'bg-[#b8860b]', percent: 50 };
    if (score <= 75) return { label: 'Good', color: 'bg-[#2f7a4f]', percent: 75 };
    return { label: 'Strong', color: 'bg-[#2f7a4f]', percent: 100 };
  };

  const handleFilesSelectedToEncrypt = (selectedFiles: File[]) => {
    setFilesToEncrypt((prev) => [...prev, ...selectedFiles]);
    setErrorMsg(null);
  };

  const handleEncryptBatch = async () => {
    if (filesToEncrypt.length === 0) return;
    if (!password) {
      setErrorMsg('Please enter a password to protect your files.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      for (let i = 0; i < filesToEncrypt.length; i++) {
        const file = filesToEncrypt[i];
        const { blob, encryptedFileName } = await encryptFileWithPassword(file, password);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = encryptedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to encrypt files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesSelectedToDecrypt = async (selectedFiles: File[]) => {
    setErrorMsg(null);
    const newItems = [];

    for (const f of selectedFiles) {
      try {
        const meta = await inspectEncryptedFile(f);
        newItems.push({ file: f, meta });
      } catch (err) {
        newItems.push({ file: f });
      }
    }

    setEncryptedFiles((prev) => [...prev, ...newItems]);
  };

  const handleDecryptBatch = async () => {
    if (encryptedFiles.length === 0) return;
    if (!decryptPassword) {
      setErrorMsg('Please enter the password to unlock your files.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setDecryptedResult([]);

    const results = [];

    try {
      for (const item of encryptedFiles) {
        const { blob, originalName, mimeType } = await decryptFileWithPassword(
          item.file,
          decryptPassword
        );
        const url = URL.createObjectURL(blob);
        results.push({ blob, url, originalName, mimeType });

        // Auto download
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setDecryptedResult(results);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Decryption failed. Please check password.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '') || mimeType?.includes('image')) {
      return <ImageIcon className="w-4 h-4 text-[#2f7a4f]" />;
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '') || mimeType?.includes('video')) {
      return <Film className="w-4 h-4 text-[#2d5da1]" />;
    }
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return <FileText className="w-4 h-4 text-[#ff4d4d]" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '') || mimeType?.includes('zip')) {
      return <Archive className="w-4 h-4 text-[#b8860b]" />;
    }
    return <FileCode className="w-4 h-4 text-[#2d2d2d]/[0.7]" />;
  };

  const strength = getPasswordStrength(password);

  return (
    <ToolPageShell
      categoryBadge="Vault Suite"
      categoryBadgeColor="indigo"
      title="AES-256 Client-Side File Encryptor & Decryptor"
      description="Encrypt photos, documents, and videos with password protection 100% locally in your browser RAM."
      icon={<Lock className="w-6 h-6 text-[#2d5da1]" />}
    >
      {/* Mode Switcher */}
      <div className="flex items-center justify-center p-1 wobbly-sm bg-[#e5e0d8] dark:bg-[#332e29] w-full max-w-md mx-auto border border-[2px] border-[#2d2d2d]/[0.4] dark:border-[#f3ede2]">
        <button
          onClick={() => {
            setMode('encrypt');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider wobbly-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'encrypt'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-hand-sm'
              : 'text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] hover:text-black dark:hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Encrypt Files (.ENC)
        </button>

        <button
          onClick={() => {
            setMode('decrypt');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider wobbly-sm flex items-center justify-center gap-2 transition-all ${
            mode === 'decrypt'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-hand-sm'
              : 'text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] hover:text-black dark:hover:text-white'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" /> Decrypt Files (.ENC)
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 wobbly-sm bg-[#2d2d2d] text-white border border-[2px] border-[#2d2d2d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-hand-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 wobbly-sm bg-[#2f7a4f]/10 text-[#2f7a4f] border border-[2px] border-[#2f7a4f]/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              AES-256-GCM On-Device Encryption
            </h4>
            <p className="text-[11px] text-[#2d2d2d]/[0.7] font-mono mt-0.5">
              PBKDF2 key derivation (100,000 rounds) + 256-bit AES authenticated vault.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 wobbly-sm bg-[#2d2d2d] border border-[2px] border-[#2d2d2d] text-[#2d2d2d]/[0.7]">
          Zero-Server Upload
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 wobbly-sm bg-[#ff4d4d]/10 border border-[2px] border-[#ff4d4d]/20 text-[#ff4d4d] dark:text-[#ff4d4d] text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ENCRYPT MODE */}
      {mode === 'encrypt' && (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleFilesSelectedToEncrypt}
            title="Drop Images, Videos, PDFs, or ZIP Files to Encrypt"
            subtitle="Supports JPG, PNG, MP4, PDF, ZIP, DOCX, XLSX (Password Protected Vault)"
            multiple={true}
          />

          {filesToEncrypt.length > 0 && (
            <div className="p-6 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">
                  Selected Files ({filesToEncrypt.length})
                </h3>
                <button
                  onClick={() => setFilesToEncrypt([])}
                  className="text-xs text-[#2d2d2d]/[0.7] hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* File List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filesToEncrypt.map((f, idx) => (
                  <div
                    key={`enc-${idx}-${f.name}`}
                    className="p-2.5 wobbly-sm bg-[#fdfbf7] dark:bg-[#332e29]/60 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {getFileIcon(f.name, f.type)}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] truncate">
                          {f.name}
                        </p>
                        <p className="text-[11px] font-mono text-[#2d2d2d]/[0.7]">
                          {(f.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFilesToEncrypt((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-1 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] hover:bg-[#e5e0d8] dark:hover:bg-[#332e29]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Password Controls */}
              <div className="space-y-4 pt-4 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#2d2d2d]/[0.7]" /> Set Encryption Passphrase
                  </label>
                  <button
                    onClick={generateStrongPassword}
                    className="text-[11px] font-mono font-bold text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55] hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Password
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#332e29] text-xs font-mono text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#2d2d2d]/[0.7] hover:text-[#2d2d2d]/[0.75] dark:hover:text-[#f3ede2]/[0.55]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#2d2d2d]/[0.7]">
                          <span>Strength:</span>
                          <span className="font-bold">{strength.label}</span>
                        </div>
                        <div className="w-full h-1 bg-[#e5e0d8] dark:bg-[#332e29] wobbly-pill overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${strength.percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#332e29] text-xs font-mono text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleEncryptBatch}
                  disabled={isProcessing || filesToEncrypt.length === 0 || !password}
                  className="px-6 py-2.5 wobbly-sm text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] shadow-hand-sm flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Encrypting with AES-256...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Encrypt {filesToEncrypt.length} Files (.ENC)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DECRYPT MODE */}
      {mode === 'decrypt' && (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleFilesSelectedToDecrypt}
            title="Drop .ENC File(s) to Decrypt & Unlock"
            subtitle="Unlock protected photos, videos, PDFs, and ZIP archives"
            accept=".enc"
            multiple={true}
          />

          {encryptedFiles.length > 0 && (
            <div className="p-6 wobbly-sm bg-white dark:bg-[#332e29] border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] shadow-hand-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">
                  Encrypted Files ({encryptedFiles.length})
                </h3>
                <button
                  onClick={() => {
                    setEncryptedFiles([]);
                    setDecryptedResult([]);
                  }}
                  className="text-xs text-[#2d2d2d]/[0.7] hover:text-black dark:hover:text-white flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {encryptedFiles.map((item, idx) => (
                  <div
                    key={`dec-f-${idx}-${item.file.name}`}
                    className="p-3 wobbly-sm bg-[#fdfbf7] dark:bg-[#332e29]/60 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Lock className="w-4 h-4 text-[#2d2d2d]/[0.7] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] truncate">
                          {item.meta ? item.meta.originalName : item.file.name}
                        </p>
                        <p className="text-[11px] font-mono text-[#2d2d2d]/[0.7]">
                          Encrypted Package | {(item.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setEncryptedFiles((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-1 wobbly-sm text-[#2d2d2d]/[0.7] hover:text-[#ff4d4d] hover:bg-[#e5e0d8] dark:hover:bg-[#332e29]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2]">
                <label className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] block">
                  Enter Password to Unlock:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Passphrase..."
                    value={decryptPassword}
                    onChange={(e) => setDecryptPassword(e.target.value)}
                    className="w-full px-3.5 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-[#fdfbf7] dark:bg-[#332e29] text-xs font-mono text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#2d2d2d]/[0.7] hover:text-[#2d2d2d]/[0.75] dark:hover:text-[#f3ede2]/[0.55]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleDecryptBatch}
                  disabled={isProcessing || !decryptPassword}
                  className="px-6 py-2.5 wobbly-sm text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] shadow-hand-sm flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Passphrase...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" /> Decrypt & Restore Original Files
                    </>
                  )}
                </button>
              </div>

              {/* Decrypted Previews */}
              {decryptedResult.length > 0 && (
                <div className="pt-4 border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-3">
                  <h4 className="text-xs font-bold text-[#2f7a4f] dark:text-[#2f7a4f] uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Successfully Decrypted ({decryptedResult.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {decryptedResult.map((res, idx) => (
                      <div
                        key={`dec-res-${idx}`}
                        className="p-3 wobbly-sm bg-[#2f7a4f]/10 border border-[2px] border-[#2f7a4f]/20 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {getFileIcon(res.originalName, res.mimeType)}
                          <span className="text-xs font-bold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] truncate">
                            {res.originalName}
                          </span>
                        </div>
                        <a
                          href={res.url}
                          download={res.originalName}
                          className="px-3 py-1 wobbly-sm bg-black text-white dark:bg-white dark:text-black text-[11px] font-mono font-bold shrink-0 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Save
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </ToolPageShell>
  );
};
