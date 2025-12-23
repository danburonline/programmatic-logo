import { Dot, GeneratorConfig } from '../types';

export const downloadSVG = (svgElement: SVGSVGElement, filename: string) => {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.svg`);
};

export const downloadPNG = (svgElement: SVGSVGElement, filename: string, size: number = 2048) => {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const svg64 = btoa(unescape(encodeURIComponent(source)));
  const b64Start = 'data:image/svg+xml;base64,';
  const image64 = b64Start + svg64;

  const img = new Image();
  img.src = image64;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Transparent background for PNG
    ctx.clearRect(0, 0, size, size);
    
    ctx.drawImage(img, 0, 0, size, size);
    const pngUrl = canvas.toDataURL('image/png');
    triggerDownload(pngUrl, `${filename}.png`);
  };
};

export const downloadEPS = (dots: Dot[], config: GeneratorConfig, filename: string) => {
  const docSize = 500; 
  const center = docSize / 2;
  
  // Estimate max extent to fit in document
  const radius = config.spread;
  const dotRadius = config.dotSize / 1000;
  const paddingVal = config.padding / 100; 
  
  // Include dot radius in extent calculation to prevent clipping
  const totalRadius = radius + dotRadius + paddingVal;
  
  // Ensure we fit totalRadius into (docSize/2)
  const maxExtent = Math.max(1.1, totalRadius);
  const scale = (docSize / 2) / maxExtent;

  let epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${docSize} ${docSize}
%%Title: ${filename}
%%Creator: Eightsix Science Logo Generator
%%CreationDate: ${new Date().toISOString()}
%%EndComments

/c { 0 360 arc fill } bind def

${center} ${center} translate
${scale} ${scale} scale
1 -1 scale % Flip Y to match SVG coordinate system roughly (Y down)

`;

  // Draw Dots
  dots.forEach(dot => {
    const epsGray = (1 - dot.value).toFixed(3);
    epsContent += `${epsGray} setgray\n`;
    epsContent += `${dot.x.toFixed(4)} ${dot.y.toFixed(4)} ${dot.r.toFixed(4)} c\n`;
  });

  epsContent += "\n%%EOF";

  const blob = new Blob([epsContent], { type: "application/postscript" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.eps`);
};

const triggerDownload = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};