import formidable from "formidable";
import path from "path";
import { Readable } from "stream";
import type { IncomingMessage } from "http";
import fs from "fs";
import { NextResponse } from "next/server";
import prisma from "../../../prisma";

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

// GET: Получаем все PDF, привязанные к конкретному posts2Id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const posts2Id = searchParams.get("posts2Id");
  if (!posts2Id) {
    return NextResponse.json({ error: "posts2Id is required" }, { status: 400 });
  }
  try {
    const pdfs = await prisma.pdf.findMany({
      where: { posts2Id },
    });
    return NextResponse.json(pdfs);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: Загрузка PDF и создание записи в базе
export async function POST(request: Request) {
  const buf = Buffer.from(await request.arrayBuffer());
  const stream = bufferToStream(buf);

  const mockReq = Object.assign(stream, {
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
  }) as unknown as IncomingMessage;

  // Папка для хранения PDF файлов
  const uploadDir = path.join(process.cwd(), "public", "pdf");

  // Создаем папку, если она не существует
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false, // Загружается один файл за раз
    uploadDir: uploadDir,
    keepExtensions: true,
    filter: function ({ mimetype }) {
      return mimetype === "application/pdf";
    },
  });

  return new Promise<Response>((resolve, reject) => {
    form.parse(mockReq, async (err, fields, files) => {
      if (err) {
        return reject(
          new Response(JSON.stringify({ error: err.message }), { status: 500 })
        );
      }

      const title = fields.title;
      const posts2Id = fields.posts2Id;

      if (!title || !posts2Id) {
        return reject(
          new Response(
            JSON.stringify({ error: "Отсутствуют обязательные поля: title или posts2Id" }),
            { status: 400 }
          )
        );
      }

      // Если файлы приходят как массив, берём первый элемент, иначе используем как есть
      const fileInput = files.file;
      const fileData = Array.isArray(fileInput) ? fileInput[0] : fileInput;

      if (!fileData) {
        return reject(
          new Response(JSON.stringify({ error: "Файл не найден" }), { status: 400 })
        );
      }

      const filePath = fileData.filepath;
      const fileUrl = `/pdf/${path.basename(filePath)}`;

      try {
        const pdfRecord = await prisma.pdf.create({
          data: {
            title: title.toString(),
            fileUrl: fileUrl,
            posts2Id: posts2Id.toString(),
          },
        });

        resolve(
          new Response(JSON.stringify(pdfRecord), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      } catch (dbError: unknown) {
        const errorMessage =
          dbError instanceof Error ? dbError.message : "Unknown error";
        reject(
          new Response(JSON.stringify({ error: errorMessage }), { status: 500 })
        );
      }
    });
  });
}

// DELETE: Удаление PDF и удаление записи из базы
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Отсутствует идентификатор PDF" }), { status: 400 });
    }

    const pdfRecord = await prisma.pdf.findUnique({
      where: { id },
    });

    if (!pdfRecord) {
      return new Response(JSON.stringify({ error: "PDF не найден" }), { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", pdfRecord.fileUrl);
    await fs.promises.unlink(filePath);

    await prisma.pdf.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
