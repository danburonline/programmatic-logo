import React, { useState, useEffect, useRef } from 'react';
import { generateDots } from './utils/geometry';
import { downloadSVG, downloadPNG, downloadEPS } from './utils/exporter';
import { Dot } from './types';

const App: React.FC = () => {
  // State
  const [text, setText] = useState<string>('');
  const [isPreviewing, setIsPreviewing] = useState<boolean>(true);
  
  // Generator Config
  const [seed, setSeed] = useState<number>(12345);
  const [dotSize, setDotSize] = useState<number>(45); // value / 1000 = radius
  const [spread, setSpread] = useState<number>(0.85); // Overall scale
  const [padding, setPadding] = useState<number>(20); // Export padding
  
  // UI State
  const [zoom, setZoom] = useState<number>(1);
  const [showJson, setShowJson] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<boolean>(false);
  
  const [dots, setDots] = useState<Dot[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Typewriter Effect
  useEffect(() => {
    if (!isPreviewing) return;

    const phrases = [
      "Continuity Through Engineering for Preserving What Matters Most",
      "Preserving the Process World Line One Gradual Step at a Time",
      "Gradual, Non-Destructive, Continuous: The Future of Substrate Resilience",
      "Where Biology Meets Engineered Resilience for Lasting Consciousness",
      "Your Consciousness Sustained Beyond the Limits of Biology",
      "Engineering Substrate Permanence Through Biohybrid Neural Integration",
      "Moving Beyond Biological Fragility Towards Engineered Continuity",
      "Biohybrid Futures Built on the Science of Today",
      "Solving the Ultimate Engineering Challenge for Conscious Continuity",
      "Plasticity Aligned Preservation for Unbroken Conscious Experience"
    ];
    
    let currentPhraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const typeLoop = () => {
        const currentPhrase = phrases[currentPhraseIndex];
        
        if (isDeleting) {
            setText(currentPhrase.substring(0, charIndex - 1));
            charIndex--;
        } else {
            setText(currentPhrase.substring(0, charIndex + 1));
            charIndex++;
        }

        // Slowed down typing speed
        let speed = 75; 
        if (isDeleting) speed = 30;

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Finished typing, pause
            speed = 2500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting, next phrase
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            speed = 500;
        }

        timer = setTimeout(typeLoop, speed);
    };

    timer = setTimeout(typeLoop, 500);

    return () => clearTimeout(timer);
  }, [isPreviewing]);

  const handleInteraction = () => {
    if (isPreviewing) {
        setIsPreviewing(false);
        setText('');
    }
  };

  // Generate dots when config changes
  useEffect(() => {
    const radius = dotSize / 1000;
    const newDots = generateDots(text, radius, spread, seed);
    setDots(newDots);
  }, [text, dotSize, spread, seed]);

  const handleRandomize = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  const handleDownload = (format: 'svg' | 'png' | 'eps') => {
    const filename = `eightsix-logo-${Date.now()}`;
    const config = { text, dotSize, spread, seed, padding };

    if (format === 'eps') {
       downloadEPS(dots, config, filename);
       return;
    }

    if (svgRef.current) {
      if (format === 'svg') downloadSVG(svgRef.current, filename);
      if (format === 'png') downloadPNG(svgRef.current, filename);
    }
  };

  // JSON Handling
  const getConfigJson = () => {
      return JSON.stringify({
          text,
          dotSize,
          spread,
          padding,
          seed
      }, null, 2);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      try {
          const parsed = JSON.parse(val);
          if (isPreviewing) handleInteraction();
          
          if (typeof parsed.text === 'string') setText(parsed.text);
          if (typeof parsed.dotSize === 'number') setDotSize(parsed.dotSize);
          if (typeof parsed.spread === 'number') setSpread(parsed.spread);
          if (typeof parsed.padding === 'number') setPadding(parsed.padding);
          if (typeof parsed.seed === 'number') setSeed(parsed.seed);
          
          setJsonError(false);
      } catch (err) {
          setJsonError(true);
      }
  };

  // Viewbox calculations
  const radius = dotSize / 1000;
  // Account for dot radius in the base content extent
  const maxContentExtent = spread + radius;
  const paddingVal = padding / 100;
  // Total radius includes content + padding
  const totalRadius = maxContentExtent + paddingVal;
  const viewBoxSize = totalRadius * 2;
  const viewBoxStart = -totalRadius;

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-neutral-900 bg-neutral-50">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-96 bg-white border-r border-neutral-200 p-6 flex flex-col h-auto md:h-screen overflow-y-auto sticky top-0 custom-scrollbar z-10 shadow-lg md:shadow-none">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight mb-1">Eightsix Science</h1>
          <h2 className="text-sm font-medium text-neutral-500">Programmatic Logo Generator</h2>
        </div>

        {/* Description Block */}
        <div className="mb-8 p-4 bg-neutral-50 rounded text-xs text-neutral-600 space-y-3 border border-neutral-100 leading-relaxed">
            <div>
                <h3 className="font-bold text-neutral-900 mb-1">Philosophy</h3>
                <p className="mb-2">
                    Eightsix Science is about creating biohybrid gradual brain replacement with synthetic grafts. We encode and decode information in the brain; this logo represents that process.
                </p>
                <p className="mb-2">
                   Nothing is ever the same. The logo encodes information uniquely every time, just as every brain is unique.
                </p>
                <p>
                    The circular dot pattern reflects the most fundamental natural shape in the universe. We use exactly 86 dots to represent the human brain's 86 billion neurons, which is the inspiration behind our name, Eightsix Science.
                </p>
            </div>
            
            <div className="pt-2 border-t border-neutral-200">
                <h3 className="font-bold text-neutral-900 mb-1">Mechanism</h3>
                <p>
                    <strong>1. Tokenisation:</strong> Input text is hashed to high-contrast values (60-100% black).
                </p>
                <p>
                    <strong>2. Scrambling:</strong> A seed randomises these values across the 86-node grid.
                </p>
            </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Encode Text
              </label>
              <button 
                onClick={handleRandomize}
                className="text-[10px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                title="Shuffle distribution pattern"
              >
                Randomise Pattern
              </button>
            </div>
            <div className="relative">
                <textarea
                value={text}
                onFocus={handleInteraction}
                onChange={(e) => {
                    if (isPreviewing) handleInteraction();
                    setText(e.target.value);
                }}
                placeholder="Type to encode..."
                className={`w-full h-24 p-3 bg-neutral-100 border-none rounded-md focus:ring-2 focus:ring-neutral-900 focus:outline-none resize-none font-mono text-sm transition-all ${isPreviewing ? 'text-neutral-500 italic' : 'text-neutral-900'}`}
                maxLength={250} 
                />
                {isPreviewing && (
                    <div className="absolute top-3 right-3">
                         <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-neutral-400"></span>
                    </div>
                )}
            </div>
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{text.length} chars</span>
              <span>Seed: {seed}</span>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Configuration */}
          <div className="space-y-5">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Parameters
                </label>
             </div>
            
            {/* Spacing / Spread */}
            <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
                <span>Spread (Density)</span>
                <span>{spread.toFixed(2)}</span>
            </div>
            <input
                type="range"
                min="0.5"
                max="1.2"
                step="0.01"
                value={spread}
                onChange={(e) => setSpread(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            </div>

            {/* Size */}
            <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
                <span>Dot Size</span>
                <span>{(dotSize / 1000).toFixed(3)}</span>
            </div>
            <input
                type="range"
                min="20"
                max="80"
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            </div>

            {/* Padding */}
            <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
                <span>Padding (Border)</span>
                <span>{padding}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* JSON Config Section */}
          <div className="space-y-3">
             <button 
                onClick={() => setShowJson(!showJson)}
                className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors w-full"
            >
                <span>{showJson ? '▼' : '▶'} JSON Configuration</span>
            </button>
            
            {showJson && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <textarea 
                        className={`w-full h-32 p-3 bg-neutral-50 border ${jsonError ? 'border-red-500' : 'border-neutral-200'} rounded font-mono text-[10px] text-neutral-600 focus:outline-none resize-none`}
                        value={getConfigJson()}
                        onChange={handleJsonImport}
                    />
                    {jsonError && <p className="text-[10px] text-red-500">Invalid JSON format</p>}
                    <p className="text-[10px] text-neutral-400">Copy to save, Paste to import.</p>
                </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Export
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDownload('svg')}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors rounded-sm border border-transparent hover:border-neutral-300"
            >
              SVG
            </button>
            <button
              onClick={() => handleDownload('png')}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors rounded-sm border border-transparent hover:border-neutral-300"
            >
              PNG
            </button>
            <button
              onClick={() => handleDownload('eps')}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors rounded-sm border border-transparent hover:border-neutral-300"
            >
              EPS
            </button>
          </div>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex items-center justify-center bg-[#f0f0f0] p-4 md:p-12 relative overflow-hidden">
        <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                backgroundSize: '20px 20px'
            }} 
        />

        {/* Zoom Controls Overlay */}
        <div className="absolute top-6 right-6 flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded shadow-sm border border-neutral-200 z-10">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Zoom</span>
            <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 h-1 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <span className="text-[10px] font-mono w-8 text-right">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="relative shadow-xl bg-white p-4 transition-transform duration-200 ease-out" style={{ transform: `scale(${zoom})` }}>
            {/* The SVG Rendering */}
            <svg
                ref={svgRef}
                viewBox={`${viewBoxStart} ${viewBoxStart} ${viewBoxSize} ${viewBoxSize}`}
                className="w-full max-w-[800px] h-auto block"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g>
                {dots.map((dot) => (
                    <circle
                    key={dot.index}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r}
                    fill={dot.color}
                    />
                ))}
                </g>
            </svg>
        </div>

        <div className="absolute bottom-6 right-6 text-neutral-400 text-xs font-mono hidden md:block text-right">
            <div>86 NODES / SEED {seed}</div>
        </div>
      </main>
    </div>
  );
};

export default App;