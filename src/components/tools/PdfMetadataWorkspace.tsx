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
        <RefreshCw className="size-8 animate-spin text-[#ff4d4d] mx-auto" />
        <p className="text-sm font-medium text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">Reading PDF document properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#262220] space-y-4">
        <h4 className="font-semibold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55] flex items-center gap-2">
          <Edit3 className="size-5 text-[#2d5da1]" />
          Edit PDF Document Properties & Metadata
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Document Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Financial Report"
              className="w-full px-3 py-2 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-sm bg-white dark:bg-[#332e29] text-sm text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Author / Creator:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-sm bg-white dark:bg-[#332e29] text-sm text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q4 Performance Analysis"
              className="w-full px-3 py-2 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-sm bg-white dark:bg-[#332e29] text-sm text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Application / Producer:</label>
            <input
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="e.g. BrowserKit Studio PRO"
              className="w-full px-3 py-2 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-sm bg-white dark:bg-[#332e29] text-sm text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] mb-1">Keywords (Comma Separated):</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. finance, report, 2026, quarterly"
            className="w-full px-3 py-2 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] wobbly-sm bg-white dark:bg-[#332e29] text-sm text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]"
          />
        </div>
      </div>

      {!processedUrl && (
        <button
          onClick={handleSaveMetadata}
          disabled={processing}
          className="w-full py-3.5 px-4 wobbly-sm bg-[#2d2d2d] dark:bg-[#3a352f] text-white dark:text-[#f3ede2] font-semibold hover:bg-[#2d2d2d] dark:hover:bg-[#3a352f] disabled:opacity-50 transition-all btn-interactive flex items-center justify-center gap-2 shadow-hand-sm"
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
        <div className="p-6 wobbly-sm border border-[2px] border-[#2f7a4f] dark:border-[#2f7a4f]/80 bg-[#2f7a4f]/50 dark:bg-[#2f7a4f]/20 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-[#2f7a4f] dark:text-[#2f7a4f] shrink-0" />
            <div>
              <h4 className="font-semibold text-[#2d2d2d] dark:text-[#f3ede2]/[0.55]">Document Metadata Updated!</h4>
              <p className="text-xs text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">PDF document properties saved successfully on-device.</p>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`metadata_${file.name}`}
            className="w-full py-3 px-4 wobbly-sm bg-[#2f7a4f] hover:bg-[#2f7a4f] text-white font-semibold transition-all btn-interactive flex items-center justify-center gap-2 shadow-hand text-center block"
          >
            <Download className="size-5 inline" />
            Download Updated PDF
          </a>
        </div>
      )}
    </div>
  );
};
