import { ClinicCustomPricing, ExamModality, ExamPriority } from '@/types';

export const DEFAULT_CLINIC_PRICING: ClinicCustomPricing = {
  radiographyBase: 45.00,
  radiographyRegions: {
    'Tórax': 45.00,
    'Abdômen': 45.00,
    'Coluna Cervical': 50.00,
    'Coluna Torácica': 50.00,
    'Coluna Lombar': 50.00,
    'Coluna Toracolombar': 50.00,
    'Pelve': 45.00,
    'Cotovelo': 45.00,
    'Carpo': 45.00,
    'Joelho': 45.00,
    'Rádio e Ulna': 45.00,
    'Crânio': 55.00
  },
  ultrasoundAbdominal: 60.00,
  ultrasoundAfast: 50.00,
  ultrasoundTfast: 50.00,
  ultrasoundVetBlue: 50.00,
  ultrasoundOther: 60.00,
  urgentFee: 20.00
};

export function calculateExamPrice(
  modality: ExamModality,
  priority: ExamPriority,
  customPricing?: ClinicCustomPricing | null,
  regionOrProtocol?: string
): number {
  const pricing = customPricing || DEFAULT_CLINIC_PRICING;
  let basePrice = 0;

  if (modality === 'ULTRASSOM') {
    const protoLower = (regionOrProtocol || '').toLowerCase();
    if (protoLower.includes('afast')) {
      basePrice = pricing.ultrasoundAfast ?? 50.00;
    } else if (protoLower.includes('tfast')) {
      basePrice = pricing.ultrasoundTfast ?? 50.00;
    } else if (protoLower.includes('vetblue') || protoLower.includes('vet blue') || protoLower.includes('blue')) {
      basePrice = pricing.ultrasoundVetBlue ?? 50.00;
    } else if (protoLower.includes('abdominal') || protoLower.includes('total')) {
      basePrice = pricing.ultrasoundAbdominal ?? 60.00;
    } else {
      basePrice = pricing.ultrasoundOther ?? pricing.ultrasoundAbdominal ?? 60.00;
    }
  } else {
    // RADIOGRAFIA
    const reg = (regionOrProtocol || '').trim();
    if (pricing.radiographyRegions && reg) {
      const matchedKey = Object.keys(pricing.radiographyRegions).find(k => 
        reg.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(reg.toLowerCase())
      );
      if (matchedKey && pricing.radiographyRegions[matchedKey] !== undefined) {
        basePrice = pricing.radiographyRegions[matchedKey];
      } else {
        basePrice = pricing.radiographyBase ?? 45.00;
      }
    } else {
      basePrice = pricing.radiographyBase ?? 45.00;
    }
  }

  const urgentExtra = priority === 'URGENT' ? (pricing.urgentFee ?? 20.00) : 0;
  return Number((basePrice + urgentExtra).toFixed(2));
}
