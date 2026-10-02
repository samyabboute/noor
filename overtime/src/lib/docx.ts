/**
 * Reads the text of a .docx in the browser — no upload, no library.
 * A .docx is a zip; we locate word/document.xml through the central directory
 * and inflate it with the native DecompressionStream.
 */
export async function readDocxText(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const dv = new DataView(buf.buffer);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("This doesn’t look like a Word (.docx) file.");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    if (name === "word/document.xml") {
      const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
      const data = buf.subarray(start, start + csize);
      let xml: string;
      if (method === 0) xml = dec.decode(data);
      else if (method === 8) {
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        xml = await new Response(stream).text();
      } else throw new Error("Unsupported compression in this .docx.");
      const withBreaks = xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, " ").replace(/<w:br\/>/g, "\n").replace(/<[^>]+>/g, "");
      const ta = document.createElement("textarea");
      ta.innerHTML = withBreaks;
      return ta.value;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error("No text found in this .docx.");
}
