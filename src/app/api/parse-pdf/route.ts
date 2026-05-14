import { PDFParse } from "pdf-parse";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB — hackathon-friendly cap
const MAX_EXTRACT_CHARS = 100_000; // server-side cap for gap engine / Phase 2
const PREVIEW_CHARS = 6000;

export async function POST(request: Request) {
  let parser: PDFParse | null = null;
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing PDF file under field name \"file\"." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB).` },
        { status: 413 },
      );
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf")) {
      return NextResponse.json(
        { ok: false, error: "Only PDF uploads are supported in Phase 1." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();

    const text = (parsed.text ?? "").replace(/\u0000/g, "").trim();
    const preview = text.slice(0, PREVIEW_CHARS);
    const extractedText = text.slice(0, MAX_EXTRACT_CHARS);

    return NextResponse.json({
      ok: true,
      fileName: file.name,
      numPages: parsed.total ?? null,
      charCount: text.length,
      preview,
      truncated: text.length > PREVIEW_CHARS,
      extractedText,
      truncatedExtracted: text.length > MAX_EXTRACT_CHARS,
    });
  } catch (err) {
    console.error("[parse-pdf]", err);
    return NextResponse.json(
      { ok: false, error: "Could not read that PDF. Try another file or re-export the PDF." },
      { status: 500 },
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        /* ignore */
      }
    }
  }
}
