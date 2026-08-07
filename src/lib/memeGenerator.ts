import { MemeTemplate, TextLayer } from '../types';

export const POPULAR_MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    defaultTexts: [
      { text: 'NO WAY / NOT COOL', x: 50, y: 25 },
      { text: 'YES EXACTLY THIS', x: 50, y: 75 },
    ],
  },
  {
    id: 'distracted-bf',
    name: 'Distracted Boyfriend',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    defaultTexts: [
      { text: 'ME', x: 50, y: 80 },
      { text: 'NEW SHINY TOOL', x: 80, y: 60 },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons Choice',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    defaultTexts: [
      { text: 'OPTION A', x: 30, y: 30 },
      { text: 'OPTION B', x: 70, y: 30 },
    ],
  },
  {
    id: 'doge-vibe',
    name: 'Retro Meme Classic',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    defaultTexts: [
      { text: 'TOP TEXT GOES HERE', x: 50, y: 15 },
      { text: 'BOTTOM TEXT GOES HERE', x: 50, y: 85 },
    ],
  },
];

export async function renderMemeCanvas(
  imageSrc: string,
  textLayers: TextLayer[]
): Promise<{ url: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onerror = () => reject(new Error('Failed to load base meme image'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Draw base image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Draw each text layer
      textLayers.forEach((layer) => {
        if (!layer.text.trim()) return;

        ctx.save();

        const displayText = layer.isUppercase ? layer.text.toUpperCase() : layer.text;
        
        // Font setup
        const scaledFontSize = Math.round((layer.fontSize / 500) * img.width);
        ctx.font = `900 ${scaledFontSize}px ${layer.fontFamily}, sans-serif`;
        ctx.textAlign = layer.align || 'center';
        ctx.textBaseline = 'middle';

        // Calculate X, Y in canvas coordinates (layer x/y are percentages 0-100)
        const posX = (layer.x / 100) * img.width;
        const posY = (layer.y / 100) * img.height;

        // Shadow setup
        if (layer.shadowBlur > 0) {
          ctx.shadowColor = layer.shadowColor || '#000000';
          ctx.shadowBlur = layer.shadowBlur;
        }

        // Draw Stroke (Outline)
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = (layer.strokeWidth / 500) * img.width;
          ctx.strokeText(displayText, posX, posY);
        }

        // Draw Fill Text
        ctx.fillStyle = layer.fillColor;
        ctx.fillText(displayText, posX, posY);

        ctx.restore();
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to output meme blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ url, blob });
      }, 'image/png');
    };
    img.src = imageSrc;
  });
}
