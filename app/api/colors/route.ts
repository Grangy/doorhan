import { NextResponse } from 'next/server';
import prisma from "../../../prisma";

export async function GET() {
  try {
    const colors = await prisma.color.findMany();
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Ошибка при получении постов:', error); // Используем error
    return NextResponse.json({ error: 'Ошибка при получении цветов' }, { status: 500 });
  }
}