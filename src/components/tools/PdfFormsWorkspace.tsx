import React, { useState, useEffect } from 'react';
import { FileCheck2, Loader2, Download, ListChecks } from 'lucide-react';
import { getPDFFormFields, fillPDFForm, PDFFormFieldInfo } from '../../lib/pdfProcessor';

interface PdfFormsWorkspaceProps {
  file: File;
  onComplete?: (url: string, filename: string) => void;
}

export const PdfFormsWorkspace: React.FC<PdfFormsWorkspaceProps> = ({ file, onComplete }) => {
  const [fields, setFields] = useState<PDFFormFieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [flattenOnSave, setFlattenOnSave] = useState(true);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const detected = await getPDFFormFields(file);
        if (cancelled) return;
        setFields(detected);
        const initial: Record<string, string> = {};
        detected.forEach((f) => (initial[f.name] = f.value));
        setValues(initial);
      } catch (err) {
        console.error('Failed to read form fields:', err);
        setError('Could not read this PDF for form fields.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleFill = async () => {
    setProcessing(true);
    try {
      const blob = await fillPDFForm(file, values, flattenOnSave);
      const url = URL.createObjectURL(blob);
      const filename = `filled_${file.name}`;
      setProcessedUrl(url);
      onComplete?.(url, filename);
    } catch (err) {
      console.error('Failed to fill form:', err);
      setError('Could not save the filled form.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `filled_${file.name}`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#2d5da1]" />
        <p className="text-xs text-[#2d2d2d]/[0.7]">Scanning PDF for fillable fields...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 wobbly-md bg-[#ff4d4d] border border-[2px] border-[#ff4d4d] text-[#ff4d4d] text-sm">{error}</div>;
  }

  if (fields.length === 0) {
    return (
      <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] text-sm text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">
        This PDF doesn't contain any interactive AcroForm fields (text boxes, checkboxes, radio
        buttons, or dropdowns) to fill. It may already be a flattened/static document.
      </div>
    );
  }

  return (
    <div className="p-6 wobbly-md bg-[#fdfbf7] dark:bg-[#332e29]/80 border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] space-y-5">
      <div className="flex items-center gap-2 border-b border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pb-3">
        <ListChecks className="w-4 h-4 text-[#2d5da1] dark:text-[#2d5da1]" />
        <h3 className="text-sm font-bold text-[#2d2d2d] dark:text-white">
          {fields.length} Field{fields.length === 1 ? '' : 's'} Detected
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="text-xs font-bold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] block truncate" title={field.name}>
              {field.name}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={values[field.name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full px-3 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs"
              />
            )}
            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2 text-xs text-[#2d2d2d]/[0.75] dark:text-[#f3ede2]/[0.55]">
                <input
                  type="checkbox"
                  checked={values[field.name] === 'true'}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.checked ? 'true' : 'false' }))}
                />
                Checked
              </label>
            )}
            {(field.type === 'radio' || field.type === 'dropdown') && (
              <select
                value={values[field.name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full px-3 py-2 wobbly-sm border border-[2px] border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] bg-white dark:bg-[#332e29] text-xs"
              >
                <option value="">— Select —</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'unsupported' && (
              <p className="text-[11px] text-[#2d2d2d]/[0.7]">Unsupported field type — left unchanged.</p>
            )}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-[#2d2d2d]/[0.85] dark:text-[#f3ede2]/[0.55] border-t border-[#2d2d2d]/[0.3] dark:border-[#f3ede2] pt-3">
        <input type="checkbox" checked={flattenOnSave} onChange={(e) => setFlattenOnSave(e.target.checked)} />
        Flatten after filling (bakes values in as static content; uncheck to keep it editable)
      </label>

      {!processedUrl ? (
        <button
          onClick={handleFill}
          disabled={processing}
          className="w-full py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand cursor-pointer disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" /> Save Filled Form
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-3 wobbly-sm bg-[#2d2d2d] dark:bg-[#2f7a4f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-hand cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Filled PDF
        </button>
      )}
    </div>
  );
};
