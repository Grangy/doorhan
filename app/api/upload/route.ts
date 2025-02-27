import formidable from "formidable";
import path from "path";
import { Readable } from "stream";
import type { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function POST(request: Request) {
  const buf = Buffer.from(await request.arrayBuffer());
  const stream = bufferToStream(buf);

  // Создаём объект, имитирующий IncomingMessage
  const mockReq = Object.assign(stream, {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
  }) as unknown as IncomingMessage;


  const uploadDir = path.join(process.cwd(), 'public', 'img', 'upload');

  const form = formidable({
    multiples: false,
    uploadDir: uploadDir, // <-- Используем абсолютный путь
    keepExtensions: true,
  });

  return new Promise<Response>((resolve, reject) => {
    form.parse(mockReq, (err, fields, files) => {
      if (err) {
        return reject(
          new Response(JSON.stringify({ error: err.message }), { status: 500 })
        );
      }

      const fileKey = Object.keys(files)[0];
      if (!fileKey) {
        return reject(
          new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 })
        );
      }

      const fileCandidate = files[fileKey];
      if (!fileCandidate) {
        return reject(
          new Response(JSON.stringify({ error: "File not found" }), { status: 400 })
        );
      }

      const file = Array.isArray(fileCandidate) ? fileCandidate[0] : fileCandidate;
      const filePath = file.filepath;

      if (!filePath) {
        return reject(
          new Response(JSON.stringify({ error: "Uploaded file has no path" }), { status: 500 })
        );
      }

      const fileUrl = `/img/upload/${path.basename(filePath)}`;
      resolve(
        new Response(JSON.stringify({ url: fileUrl }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
}