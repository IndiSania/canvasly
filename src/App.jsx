import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Brush, Circle, Eraser, Minus, PaintBucket, Download, Undo2, Redo2,
  RotateCcw, Grid2X2, ImagePlus, MousePointer2, Sparkles, Layers3,
  ChevronDown, Plus, Trash2, PanelLeftClose, PanelLeftOpen, Check,
  SlidersHorizontal, Save, FileImage, Pencil, Hand, ZoomIn, ZoomOut
} from 'lucide-react';

const PALETTE = ['#111318','#ffffff','#ff6b6b','#ff9f43','#ffd166','#06d6a0','#4cc9f0','#4895ef','#7b61ff','#f72585','#9b5de5','#c9a27e'];
const initialLayers = [{ id: 1, name: 'Layer 1', visible: true, opacity: 100 }];
const uid = () => Math.random().toString(36).slice(2, 9);

export default function App() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const history = useRef([]);
  const redoHistory = useRef([]);
  const fileInput = useRef(null);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#111318');
  const [size, setSize] = useState(12);
  const [opacity, setOpacity] = useState(100);
  const [brushStyle, setBrushStyle] = useState('smooth');
  const [layers, setLayers] = useState(initialLayers);
  const [activeLayer, setActiveLayer] = useState(1);
  const [showLayers, setShowLayers] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [projectName, setProjectName] = useState('Untitled artwork');
  const [renaming, setRenaming] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasArtwork, setHasArtwork] = useState(false);

  const ctx = () => canvasRef.current?.getContext('2d');
  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * canvasRef.current.width / rect.width,
      y: (e.clientY - rect.top) * canvasRef.current.height / rect.height
    };
  };
  const snapshot = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    history.current.push(c.toDataURL('image/png'));
    if (history.current.length > 40) history.current.shift();
    redoHistory.current = [];
  }, []);
  const restore = useCallback((data) => {
    const c = canvasRef.current;
    const context = ctx();
    if (!c || !context) return;
    const img = new Image();
    img.onload = () => { context.clearRect(0, 0, c.width, c.height); context.drawImage(img, 0, 0, c.width, c.height); setHasArtwork(true); };
    img.src = data;
  }, []);
  const undo = () => {
    if (!history.current.length || !canvasRef.current) return;
    redoHistory.current.push(canvasRef.current.toDataURL('image/png'));
    restore(history.current.pop());
  };
  const redo = () => {
    if (!redoHistory.current.length || !canvasRef.current) return;
    history.current.push(canvasRef.current.toDataURL('image/png'));
    restore(redoHistory.current.pop());
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 1200; c.height = 760;
    const context = c.getContext('2d');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, c.width, c.height);
    history.current = [c.toDataURL('image/png')];
  }, []);

  const startDrawing = (e) => {
    if (tool === 'hand' || tool === 'select') return;
    e.preventDefault();
    snapshot();
    drawing.current = true;
    const p = getPoint(e); lastPoint.current = p;
    const context = ctx();
    context.globalAlpha = opacity / 100;
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.lineWidth = size;
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    if (tool === 'circle') {
      overlayRef.current.dataset.startX = p.x;
      overlayRef.current.dataset.startY = p.y;
      overlayRef.current.dataset.image = canvasRef.current.toDataURL('image/png');
      return;
    }
    context.beginPath(); context.arc(p.x, p.y, size / 2, 0, Math.PI * 2); context.fill();
  };
  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = getPoint(e);
    const context = ctx();
    context.globalAlpha = opacity / 100;
    context.lineWidth = size;
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    if (tool === 'circle') {
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.drawImage(img, 0, 0);
        context.beginPath();
        const sx = Number(overlayRef.current.dataset.startX), sy = Number(overlayRef.current.dataset.startY);
        context.ellipse((sx+p.x)/2, (sy+p.y)/2, Math.abs(p.x-sx)/2, Math.abs(p.y-sy)/2, 0, 0, Math.PI*2);
        context.strokeStyle = color; context.lineWidth = size; context.globalAlpha = opacity/100; context.stroke();
      };
      img.src = overlayRef.current.dataset.image;
    } else {
      context.beginPath(); context.moveTo(lastPoint.current.x, lastPoint.current.y); context.lineTo(p.x, p.y); context.stroke();
    }
    lastPoint.current = p; setHasArtwork(true); setSaved(false);
  };
  const stopDrawing = () => { if (drawing.current) { drawing.current = false; lastPoint.current = null; const context = ctx(); if (context) context.globalAlpha = 1; setHasArtwork(true); setSaved(false); } };
  const clearCanvas = () => {
    if (!window.confirm('Hapus seluruh gambar di kanvas?')) return;
    snapshot(); const c = canvasRef.current; const context = ctx();
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, c.width, c.height);
    setHasArtwork(false); setSaved(false);
  };
  const exportPNG = () => {
    const c = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${(projectName || 'canvasly-artwork').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()}.png`;
    link.href = c.toDataURL('image/png'); link.click(); setSaved(true);
  };
  const saveProject = () => {
    const data = { app: 'Canvasly', version: 1, name: projectName, width: canvasRef.current.width, height: canvasRef.current.height, image: canvasRef.current.toDataURL('image/png'), color, size, opacity, savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${projectName.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'canvasly-project'}.canvasly`; a.click();
    URL.revokeObjectURL(url); setSaved(true);
  };
  const openImage = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      snapshot();
      const c = canvasRef.current, context = ctx();
      context.fillStyle = '#ffffff'; context.fillRect(0,0,c.width,c.height);
      const scale = Math.min(c.width/img.width, c.height/img.height);
      const w = img.width*scale, h = img.height*scale;
      context.drawImage(img, (c.width-w)/2, (c.height-h)/2, w, h);
      URL.revokeObjectURL(url); setHasArtwork(true); setSaved(false);
    };
    img.src = url; e.target.value = '';
  };
  const addLayer = () => {
    const id = Date.now();
    setLayers(v => [...v, { id, name: `Layer ${v.length+1}`, visible: true, opacity: 100 }]); setActiveLayer(id);
  };
  const toggleLayer = (id) => setLayers(v => v.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  const renameLayer = (id) => {
    const name = window.prompt('Nama layer baru:');
    if (name?.trim()) setLayers(v => v.map(l => l.id === id ? {...l, name: name.trim()} : l));
  };

  const tools = [
    { id:'brush', icon:Brush, label:'Brush (B)' },
    { id:'eraser', icon:Eraser, label:'Eraser (E)' },
    { id:'circle', icon:Circle, label:'Ellipse (C)' },
    { id:'select', icon:MousePointer2, label:'Select (V)' },
    { id:'hand', icon:Hand, label:'Hand (H)' },
  ];
  useEffect(() => {
    const handle = (e) => {
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'b') setTool('brush');
      if (key === 'e') setTool('eraser');
      if (key === 'c') setTool('circle');
      if (key === 'v') setTool('select');
      if ((e.ctrlKey || e.metaKey) && key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  });

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>canvasly</span><span className="brand-tag">STUDIO</span></div>
      <div className="top-project">
        {renaming ? <input autoFocus value={projectName} onChange={e=>setProjectName(e.target.value)} onBlur={()=>setRenaming(false)} onKeyDown={e=>e.key==='Enter'&&setRenaming(false)} /> : <button className="project-name" onClick={()=>setRenaming(true)}>{projectName}<Pencil size={13}/></button>}
        <span className="saved-status"><span className={`status-dot ${saved?'is-saved':''}`}/>{saved?'Saved locally':'Unsaved changes'}</span>
      </div>
      <div className="top-actions">
        <button className="icon-button" title="Undo (Ctrl+Z)" onClick={undo}><Undo2 size={17}/></button>
        <button className="icon-button" title="Redo (Ctrl+Y)" onClick={redo}><Redo2 size={17}/></button>
        <span className="top-separator"/>
        <button className="secondary-button" onClick={saveProject}><Save size={15}/> Save project</button>
        <button className="primary-button" onClick={exportPNG}><Download size={16}/> Export PNG</button>
      </div>
    </header>

    <main className="workspace">
      <aside className="tool-rail">
        <div className="rail-section-label">TOOLS</div>
        {tools.map(({id,icon:Icon,label})=><button key={id} className={`tool-button ${tool===id?'active':''}`} title={label} onClick={()=>setTool(id)}><Icon size={19}/></button>)}
        <div className="rail-divider"/>
        <button className="tool-button" title="Import image" onClick={()=>fileInput.current?.click()}><ImagePlus size={19}/></button>
        <button className={`tool-button ${showGrid?'active':''}`} title="Toggle grid" onClick={()=>setShowGrid(v=>!v)}><Grid2X2 size={19}/></button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={openImage}/>
        <div className="rail-bottom"><div className="avatar">C</div></div>
      </aside>

      <section className="editor-area">
        <div className="editor-toolbar">
          <div className="tool-context"><span className="context-icon">{React.createElement(tools.find(t=>t.id===tool)?.icon || Brush,{size:16})}</span><span>{tools.find(t=>t.id===tool)?.label.split(' (')[0]}</span><span className="context-divider"/><span className="context-muted">Canvas tools</span></div>
          <div className="editor-actions">
            <button className="mini-action" onClick={()=>setZoom(z=>Math.max(50,z-10))}><ZoomOut size={15}/></button><span className="zoom-value">{zoom}%</span><button className="mini-action" onClick={()=>setZoom(z=>Math.min(150,z+10))}><ZoomIn size={15}/></button>
            <span className="context-divider"/>
            <button className="mini-action" title="Clear canvas" onClick={clearCanvas}><RotateCcw size={15}/></button>
            <button className="mini-action" title={showLayers?'Hide layers':'Show layers'} onClick={()=>setShowLayers(v=>!v)}>{showLayers?<PanelLeftClose size={15}/>:<PanelLeftOpen size={15}/>}</button>
          </div>
        </div>
        <div className={`canvas-stage ${showGrid?'grid-on':''}`}>
          <div className="canvas-wrap" style={{width:`${Math.min(100,zoom)}%`}}>
            <div className="canvas-frame">
              <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} />
              <canvas ref={overlayRef} className="interaction-overlay" aria-hidden="true"/>
              {!hasArtwork && <div className="canvas-hint"><div className="hint-icon"><Brush size={22}/></div><strong>Your canvas, your world.</strong><span>Start creating something beautiful.</span><button onClick={()=>setTool('brush')}>Pick up your brush <span>↗</span></button></div>}
            </div>
          </div>
          <div className="stage-caption"><span><span className="live-dot"/> CANVAS READY</span><span>1200 × 760 px</span><span>RGB · 8 bit</span></div>
        </div>
        <footer className="statusbar"><div><span className="status-square"/> {tool==='brush'?'Brush tool active':tool==='eraser'?'Eraser tool active':tool==='circle'?'Ellipse tool active':tool==='hand'?'Hand tool selected':'Select tool selected'}</div><div>Made for your imagination <Sparkles size={12}/></div></footer>
      </section>

      <aside className="properties-panel">
        <div className="panel-heading"><div><SlidersHorizontal size={16}/><span>Properties</span></div><button className="dots-button">···</button></div>
        <section className="panel-section">
          <div className="section-title">BRUSH SETTINGS <ChevronDown size={14}/></div>
          <div className="brush-preview"><div className="brush-preview-circle" style={{width:Math.min(48,size+8),height:Math.min(48,size+8),background:tool==='eraser'?'#ffffff':color,border:tool==='eraser'?'1px solid #d7d8dc':'none'}}/><span>{tool==='eraser'?'Eraser':'Basic round'}</span><span className="preview-badge">DEFAULT</span></div>
          <div className="setting-row"><label>Size</label><span className="setting-value">{size} px</span></div>
          <input aria-label="Brush size" className="range" type="range" min="1" max="80" value={size} onChange={e=>setSize(Number(e.target.value))}/>
          <div className="range-ends"><span>1 px</span><span>80 px</span></div>
          <div className="setting-row opacity-row"><label>Opacity</label><span className="setting-value">{opacity}%</span></div>
          <input aria-label="Brush opacity" className="range" type="range" min="5" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/>
          <div className="range-ends"><span>5%</span><span>100%</span></div>
          <div className="setting-row style-row"><label>Brush style</label></div>
          <button className="select-style" onClick={()=>setBrushStyle(v=>v==='smooth'?'hard':'smooth')}><span className={`style-dot ${brushStyle}`}/>{brushStyle==='smooth'?'Smooth round':'Hard edge'}<ChevronDown size={14}/></button>
        </section>
        <section className="panel-section color-section">
          <div className="section-title">COLOR <ChevronDown size={14}/></div>
          <div className="color-current"><div className="color-swatch-large" style={{background:color}}/><div className="color-current-text"><strong>{color.toUpperCase()}</strong><span>Current color</span></div><label className="color-picker-button" title="Choose custom color"><Pencil size={14}/><input aria-label="Custom color" type="color" value={color} onChange={e=>setColor(e.target.value)}/></label></div>
          <div className="palette-grid">{PALETTE.map(c=><button key={c} className={`palette-color ${color.toLowerCase()===c?'chosen':''}`} style={{background:c}} title={c} onClick={()=>setColor(c)}>{color.toLowerCase()===c&&<Check size={14} color={['#ffffff','#ffd166','#06d6a0','#4cc9f0'].includes(c)?'#16171b':'white'}/>}</button>)}</div>
          <div className="custom-color-row"><span>Custom color</span><button onClick={()=>document.querySelector('input[type=color]')?.click()}>Choose <span>↗</span></button></div>
        </section>
        {showLayers && <section className="panel-section layers-section">
          <div className="section-title">LAYERS <span className="layer-count">{layers.length}</span><button className="add-layer" onClick={addLayer} title="Add layer"><Plus size={15}/></button></div>
          <div className="layer-list">{layers.map(layer=><div key={layer.id} className={`layer-item ${activeLayer===layer.id?'selected':''}`} onClick={()=>setActiveLayer(layer.id)}><button className="layer-visibility" onClick={e=>{e.stopPropagation();toggleLayer(layer.id)}}>{layer.visible?<span className="eye-shape">◉</span>:<span className="eye-shape muted">⊘</span>}</button><div className="layer-thumb"><div/></div><button className="layer-name" onDoubleClick={()=>renameLayer(layer.id)}>{layer.name}</button>{activeLayer===layer.id&&<span className="layer-active-dot"/>}</div>)}</div>
          <div className="layer-footer"><Layers3 size={14}/><span>Double-click a layer to rename</span></div>
        </section>}
        <div className="panel-bottom"><div className="tip-icon"><Sparkles size={15}/></div><div><strong>A little creative tip</strong><p>Try layering colors and shapes to bring your ideas to life.</p></div></div>
      </aside>
    </main>
  </div>;
}