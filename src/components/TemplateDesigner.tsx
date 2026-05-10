import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Type, Square, Circle, Minus, Image as ImageIcon, Save, Trash2, ArrowLeft, Layers, Grid3X3 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '../types';
import { cn } from '../lib/utils';

interface TemplateDesignerProps {
  onSave: (template: Template) => void;
  onCancel: () => void;
  initialTemplate?: Template | null;
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({ onSave, onCancel, initialTemplate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'New Template');
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [gridEnabled, setGridEnabled] = useState(true);
  const gridSize = 20;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: '#ffffff',
    });

    if (initialTemplate?.canvasData) {
      canvas.loadFromJSON(JSON.parse(initialTemplate.canvasData), () => {
        canvas.renderAll();
      });
    }

    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));

    canvas.on('object:moving', (options) => {
      if (gridEnabled) {
        options.target.set({
          left: Math.round(options.target.left / gridSize) * gridSize,
          top: Math.round(options.target.top / gridSize) * gridSize
        });
      }
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 20,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const addRect = () => {
    if (!fabricCanvas) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      width: 100,
      height: 100,
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvas) return;
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      radius: 50,
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
  };

  const addLine = () => {
    if (!fabricCanvas) return;
    const line = new fabric.Line([50, 100, 200, 100], {
      stroke: '#000000',
      strokeWidth: 2,
    });
    fabricCanvas.add(line);
    fabricCanvas.setActiveObject(line);
  };

  const removeActive = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    fabricCanvas.remove(...activeObjects);
    fabricCanvas.discardActiveObject();
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    const template: Template = {
      id: initialTemplate?.id || uuidv4(),
      name: templateName,
      canvasData: JSON.stringify(fabricCanvas.toJSON()),
      createdAt: initialTemplate?.createdAt || Date.now(),
    };
    onSave(template);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      try {
        const img = await fabric.FabricImage.fromURL(data);
        img.scaleToWidth(200);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      } catch (err) {
        console.error('Error loading image:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="bg-transparent text-xl font-bold focus:outline-none focus:ring-0"
            placeholder="Template Name"
          />
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Save size={18} />
          Save Template
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Toolbar */}
        <div className="flex w-16 flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button onClick={addText} title="Text tool" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Type size={20} /></button>
          <button onClick={addRect} title="Rectangle tool" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Square size={20} /></button>
          <button onClick={addCircle} title="Circle tool" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Circle size={20} /></button>
          <button onClick={addLine} title="Line tool" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Minus size={20} /></button>
          <label title="Upload image" className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ImageIcon size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <div className="my-2 h-[1px] w-8 bg-slate-100 dark:bg-slate-800" />
          <button 
            onClick={() => setGridEnabled(!gridEnabled)} 
            title="Toggle Grid Snap" 
            className={cn("p-2 rounded-lg transition-colors", gridEnabled ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
          >
            <Grid3X3 size={20} />
          </button>
          <button onClick={removeActive} title="Delete selected" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" disabled={!activeObject}><Trash2 size={20} /></button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center dark:bg-slate-900 rounded-xl">
          <div className="shadow-2xl">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-y-auto">
          <h3 className="mb-4 font-black text-xs uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800"><Layers size={14} />Properties</h3>
          {!activeObject ? (
            <div className="text-center text-slate-400 py-10">
              <Type size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-[10px] uppercase font-bold tracking-widest">Select an element</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Color</label>
                <input
                  type="color"
                  className="w-full h-8 rounded-md border-none cursor-pointer"
                  value={activeObject.get('fill')?.toString() || '#000000'}
                  onChange={(e) => {
                    activeObject.set('fill', e.target.value);
                    fabricCanvas?.renderAll();
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400">POS: {Math.round(activeObject.left || 0)}, {Math.round(activeObject.top || 0)}</p>
                <p className="text-[10px] font-bold text-slate-400 text-indigo-600">SCALE: {activeObject.scaleX?.toFixed(2)}</p>
              </div>
            </div>
          )}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4">
             <h3 className="mb-4 font-black text-xs uppercase tracking-widest flex items-center gap-2"><Grid3X3 size={14} />Guidelines</h3>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">This layout acts as a static background. Use grid snap for precise alignment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
