import formidable from "formidable";
import path from "path";
import { Readable } from "stream";
import type { IncomingMessage } from "http";
import fs from "fs";

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

  const mockReq = Object.assign(stream, {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
  }) as unknown as IncomingMessage;

  const uploadDir = path.join(process.cwd(), 'public', 'img', 'upload');

  const form = formidable({
    multiples: false, // Обрабатываем только один файл
    uploadDir: uploadDir,
    keepExtensions: true,
  });

  return new Promise<Response>((resolve, reject) => {
    form.parse(mockReq, (err, _fields, files) => {
      if (err) {
        return reject(
          new Response(JSON.stringify({ error: err.message }), { status: 500 })
        );
      }

      let uploadedFile;
      if (files.file) {
        uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      } else if (files.files) {
        uploadedFile = Array.isArray(files.files) ? files.files[0] : files.files;
      } else {
        return reject(
          new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
        );
      }

      const filePath = uploadedFile.filepath;
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

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'No URL provided' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const filePath = path.join(process.cwd(), 'public', url);
    try {
      await fs.promises.unlink(filePath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Если файла не существует, считаем его удалённым
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
