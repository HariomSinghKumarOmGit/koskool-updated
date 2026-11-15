import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'hero';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Sanitize folder to avoid directory traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/[folder]
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const timestamp = Date.now();
    const rawName = file.name || 'image.jpg';
    const cleanName = rawName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanName}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Upload error in /api/upload:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
