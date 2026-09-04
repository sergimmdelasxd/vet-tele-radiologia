import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

    const uploadedResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `${Date.now()}-${i}-${cleanBaseName}${ext}`;
      const isDicom = ext === '.dcm' || ext === '.dicom' || file.type.includes('dicom');

      let fileUrl = '';

      // 1. Tenta upload direto para o Supabase Storage (Bucket público: exam-images)
      if (isSupabaseConfigured) {
        try {
          const mimeType = file.type || (isDicom ? 'application/dicom' : 'image/jpeg');
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('exam-images')
            .upload(uniqueFileName, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('exam-images')
              .getPublicUrl(uniqueFileName);

            if (publicUrlData?.publicUrl) {
              fileUrl = publicUrlData.publicUrl;
            }
          } else if (uploadError) {
            console.error('Supabase Storage upload error:', uploadError);
          }
        } catch (storageErr) {
          console.error('Supabase Storage exception:', storageErr);
        }
      }

      // 2. Se falhou ou offline, tenta disco local (apenas se não for filesystem somente leitura)
      if (!fileUrl) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, uniqueFileName);
          fs.writeFileSync(filePath, buffer);
          fileUrl = `/uploads/${uniqueFileName}`;
        } catch (fsErr) {
          console.warn('Filesystem read-only (Serverless/Vercel), utilizando fallback Base64');
          // 3. Fallback garantido para ambiente Serverless
          const mimeType = file.type || 'image/jpeg';
          fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }
      }

      uploadedResults.push({
        id: `upload-${Date.now()}-${i}`,
        url: fileUrl,
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
