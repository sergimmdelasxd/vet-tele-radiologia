import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `${Date.now()}-${i}-${cleanBaseName}${ext}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const isDicom = ext === '.dcm' || ext === '.dicom' || file.type.includes('dicom');

      uploadedResults.push({
        id: `upload-${Date.now()}-${i}`,
        url: `/uploads/${uniqueFileName}`,
        originalName: file.name,
        label: cleanBaseName.replace(/_+/g, ' '),
        size: file.size,
        extension: ext,
        isDicom,
        uploadedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults
    });
  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json(
      { error: 'Falha ao processar upload do arquivo', details: error.message },
      { status: 500 }
    );
  }
}
