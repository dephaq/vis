import { parseJson } from "@/lib/json";

type FileWithTexts = {
  id: string;
  originalName: string;
  extractedTexts: Array<{ text: string; parseQuality: string; warningsJson: string }>;
};

export function ExtractedTextPanel({ files }: { files: FileWithTexts[] }) {
  const extracted = files.flatMap((file) =>
    file.extractedTexts.map((text) => ({
      file,
      text,
      warnings: parseJson<string[]>(text.warningsJson, []),
    })),
  );

  return (
    <section className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Extracted text</h2>
      {extracted.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">Upload project files to extract text and metadata.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {extracted.map(({ file, text, warnings }) => (
            <article key={`${file.id}-${text.parseQuality}`} className="rounded-md bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="break-words text-sm font-semibold text-stone-950">{file.originalName}</h3>
                <span className="rounded bg-white px-2 py-1 text-xs text-stone-600">{text.parseQuality}</span>
              </div>
              {text.text ? (
                <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-sm text-stone-700">{text.text}</pre>
              ) : (
                <p className="mt-2 text-sm text-stone-600">No reliable text extracted.</p>
              )}
              {warnings.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-amber-800">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
