import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Edit3, Wand2, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { updatePDFMetadata, PDFMetadataOptions } from '../../lib/pdfProcessor';

interface PdfMetadataWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

export const PdfMetadataWorkspace: React.FC<PdfMetadataWorkspaceProps> = ({ file, onComplete }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [creator, setCreator] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      try {
        const buf = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setTitle(pdfDoc.getTitle() || '');
        setAuthor(pdfDoc.getAuthor() || '');
        setSubject(pdfDoc.getSubject() || '');
        const kw = pdfDoc.getKeywords();
        setKeywords(kw ? kw : '');
        setCreator(pdfDoc.getCreator() || '');
        setLoading(false);
      } catch (err) {
        console.error('Failed to read PDF metadata:', err);
        setLoading(false);
      }
    };

    loadMetadata();
  }, [file]);

  const handleSaveMetadata = async () => {
    setProcessing(true);
    try {
      const opts: PDFMetadataOptions = {
        title,
        author,
        subject,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        creator,
      };

      const blob = await updatePDFMetadata(file, opts);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessing(false);
      if (onComplete) {
        onComplete(url, `metadata_updated_${file.name}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating PDF metadata.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="size-8 animate-spin text-rose-600 mx-auto" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reading PDF document properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Edit3 className="size-5 text-indigo-600" />
          Edit PDF Document Properties & Metadata
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Financial Report"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Author / Creator:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q4 Performance Analysis"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Application / Producer:</label>
            <input
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="e.g. BrowserKit Studio PRO"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Keywords (Comma Separated):</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. finance, report, 2026, quarterly"
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {!processedUrl && (
        <button
          onClick={handleSaveMetadata}
          disabled={processing}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-sm"
        >
          {processing ? (
            <>
              <RefreshCw className="size-5 animate-spin" />
              Updating PDF Metadata...
            </>
          ) : (
            <>
              <Wand2 className="size-5" />
              Save Document Metadata
            </>
          )}
        </button>
      )}

      {processedUrl && (
        <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Document Metadata Updated!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">PDF document properties saved successfully on-device.</p>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`metadata_${file.name}`}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-md text-center block"
          >
            <Download className="size-5 inline" />
            Download Updated PDF
          </a>
        </div>
      )}
    </div>
  );
};
