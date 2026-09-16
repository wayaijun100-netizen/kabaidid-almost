import React, { useRef, useState, useEffect } from 'react';
import { ElementLayout } from '../types';
import { Move } from 'lucide-react';

interface FreeTransformBoxProps {
  id: string;
  title: string;
  layout: ElementLayout;
  isEditorActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: ElementLayout) => void;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const FreeTransformBox: React.FC<FreeTransformBoxProps> = ({
  id,
  title,
  layout,
  isEditorActive,
  isSelected,
  onSelect,
  onChange,
  children,
  minWidth = 120,
  minHeight = 50,
  snapToGrid = false,
  gridSize = 20,
  containerRef,
}) => {
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });

  const isResizingRef = useRef(false);
  const resizeHandleRef = useRef<string | null>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialW: number;
    initialH: number;
    initialX: number;
    initialY: number;
    initialPxLeft: number;
    initialPxRight: number;
    initialPxTop: number;
    initialPxBottom: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    initialW: 0,
    initialH: 0,
    initialX: 0,
    initialY: 0,
    initialPxLeft: 0,
    initialPxRight: 0,
    initialPxTop: 0,
    initialPxBottom: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const bounds = containerRef.current.getBoundingClientRect();
      const containerW = bounds.width;
      const containerH = bounds.height;

      // =========================================================================
      // 1. DRAGGING / MOVING (CLICK CENTER AND DRAG)
      // =========================================================================
      if (isDraggingRef.current) {
        const deltaPixelsX = e.clientX - dragStartRef.current.mouseX;
        const deltaPixelsY = e.clientY - dragStartRef.current.mouseY;

        let rawCenterPxX = (dragStartRef.current.initialX / 100) * containerW + deltaPixelsX;
        let rawCenterPxY = (dragStartRef.current.initialY / 100) * containerH + deltaPixelsY;

        if (snapToGrid) {
          // Snap top-left corner to grid lines for exact grid cell alignment
          const rawLeft = rawCenterPxX - layout.width / 2;
          const rawTop = rawCenterPxY - layout.height / 2;
          const snappedLeft = Math.round(rawLeft / gridSize) * gridSize;
          const snappedTop = Math.round(rawTop / gridSize) * gridSize;
          rawCenterPxX = snappedLeft + layout.width / 2;
          rawCenterPxY = snappedTop + layout.height / 2;
        }

        let newX = (rawCenterPxX / containerW) * 100;
        let newY = (rawCenterPxY / containerH) * 100;

        // Clamp inside visible arena bounds
        newX = Math.max(3, Math.min(97, newX));
        newY = Math.max(3, Math.min(97, newY));

        onChange({
          ...layout,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      }

      // =========================================================================
      // 2. RESIZING
      // - Single edge pull (n, s, e, w): ONLY THAT SIDE MOVES. Opposite side stays anchored!
      // - Corner pull (ne, nw, se, sw): Adjusts both sides together!
      // - If snapToGrid: Width and height snap to grid increments
      // =========================================================================
      if (isResizingRef.current && resizeHandleRef.current) {
        const handle = resizeHandleRef.current;
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;

        let newW = resizeStartRef.current.initialW;
        let newH = resizeStartRef.current.initialH;
        let newCenterXPercent = resizeStartRef.current.initialX;
        let newCenterYPercent = resizeStartRef.current.initialY;

        // --- SINGLE EDGE RESIZING: ANCHOR OPPOSITE SIDE ---
        if (handle === 'e') {
          // Pulling RIGHT edge: LEFT side stays anchored at initialPxLeft!
          const anchorLeft = resizeStartRef.current.initialPxLeft;
          let targetW = resizeStartRef.current.initialW + deltaX;
          if (snapToGrid) {
            targetW = Math.round(targetW / gridSize) * gridSize;
          }
          newW = Math.max(minWidth, targetW);
          const newCenterPx = anchorLeft + newW / 2;
          newCenterXPercent = (newCenterPx / containerW) * 100;
        } else if (handle === 'w') {
          // Pulling LEFT edge: RIGHT side stays anchored at initialPxRight!
          const anchorRight = resizeStartRef.current.initialPxRight;
          let targetW = resizeStartRef.current.initialW - deltaX;
          if (snapToGrid) {
            targetW = Math.round(targetW / gridSize) * gridSize;
          }
          newW = Math.max(minWidth, targetW);
          const newCenterPx = anchorRight - newW / 2;
          newCenterXPercent = (newCenterPx / containerW) * 100;
        } else if (handle === 's') {
          // Pulling BOTTOM edge: TOP side stays anchored at initialPxTop!
          const anchorTop = resizeStartRef.current.initialPxTop;
          let targetH = resizeStartRef.current.initialH + deltaY;
          if (snapToGrid) {
            targetH = Math.round(targetH / gridSize) * gridSize;
          }
          newH = Math.max(minHeight, targetH);
          const newCenterPy = anchorTop + newH / 2;
          newCenterYPercent = (newCenterPy / containerH) * 100;
        } else if (handle === 'n') {
          // Pulling TOP edge: BOTTOM side stays anchored at initialPxBottom!
          const anchorBottom = resizeStartRef.current.initialPxBottom;
          let targetH = resizeStartRef.current.initialH - deltaY;
          if (snapToGrid) {
            targetH = Math.round(targetH / gridSize) * gridSize;
          }
          newH = Math.max(minHeight, targetH);
          const newCenterPy = anchorBottom - newH / 2;
          newCenterYPercent = (newCenterPy / containerH) * 100;
        } else {
          // --- CORNER PULLS: ADJUST BOTH SIDES TOGETHER ---
          let dx = 0;
          let dy = 0;

          if (handle === 'se') {
            dx = deltaX;
            dy = deltaY;
          } else if (handle === 'nw') {
            dx = -deltaX;
            dy = -deltaY;
          } else if (handle === 'ne') {
            dx = deltaX;
            dy = -deltaY;
          } else if (handle === 'sw') {
            dx = -deltaX;
            dy = deltaY;
          }

          let targetW = resizeStartRef.current.initialW + dx * 2;
          let targetH = resizeStartRef.current.initialH + dy * 2;
          if (snapToGrid) {
            targetW = Math.round(targetW / gridSize) * gridSize;
            targetH = Math.round(targetH / gridSize) * gridSize;
          }

          newW = Math.max(minWidth, targetW);
          newH = Math.max(minHeight, targetH);
          newCenterXPercent = resizeStartRef.current.initialX;
          newCenterYPercent = resizeStartRef.current.initialY;
        }

        onChange({
          ...layout,
          width: Math.round(newW),
          height: Math.round(newH),
          x: Math.round(newCenterXPercent * 10) / 10,
          y: Math.round(newCenterYPercent * 10) / 10,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDraggingState(false);
      }
      isResizingRef.current = false;
      resizeHandleRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, layout, minHeight, minWidth, onChange, snapToGrid, gridSize]);

  // Click & drag anywhere inside center/body of box
  const handleMouseDownCenterDrag = (e: React.MouseEvent) => {
    if (!isEditorActive) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: layout.x,
      initialY: layout.y,
    };
  };

  // Resize handle click
  const handleMouseDownResize = (e: React.MouseEvent, handle: string) => {
    if (!isEditorActive || !containerRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    const bounds = containerRef.current.getBoundingClientRect();
    const containerW = bounds.width;
    const containerH = bounds.height;

    const centerPxX = (layout.x / 100) * containerW;
    const centerPxY = (layout.y / 100) * containerH;

    isResizingRef.current = true;
    resizeHandleRef.current = handle;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialW: layout.width,
      initialH: layout.height,
      initialX: layout.x,
      initialY: layout.y,
      initialPxLeft: centerPxX - layout.width / 2,
      initialPxRight: centerPxX + layout.width / 2,
      initialPxTop: centerPxY - layout.height / 2,
      initialPxBottom: centerPxY + layout.height / 2,
    };
  };

  return (
    <div
      id={id}
      style={{
        position: 'absolute',
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${layout.width}px`,
        height: `${layout.height}px`,
        zIndex: isSelected ? 40 : layout.zIndex || 10,
      }}
      className={`relative select-none transition-shadow ${
        isEditorActive
          ? isSelected
            ? 'outline-2 outline-dashed outline-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.55)]'
            : 'outline-1 outline-dashed outline-sky-400/60 hover:outline-yellow-400/80 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
          : ''
      }`}
    >
      {/* Element Content */}
      <div className={`w-full h-full ${isEditorActive ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Editor Active Overlay & Drag Target */}
      {isEditorActive && (
        <>
          {/* Entire center area is draggable with cursor-grab / cursor-grabbing */}
          <div
            onMouseDown={handleMouseDownCenterDrag}
            className={`absolute inset-0 z-20 transition-colors ${
              isDraggingState
                ? 'cursor-grabbing bg-yellow-400/10'
                : 'cursor-grab hover:bg-sky-400/10 active:cursor-grabbing'
            }`}
            title="Click and drag anywhere to move this box"
          >
            {/* Center Drag Target Icon (Visual cue) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-black/85 border border-yellow-400/60 text-yellow-300 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                <Move className="w-3.5 h-3.5 text-yellow-400" />
                <span>DRAG TO MOVE</span>
              </div>
            </div>
          </div>

          {/* Top Identifier Bar & Dimensions Pill */}
          <div
            onMouseDown={handleMouseDownCenterDrag}
            className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md whitespace-nowrap select-none cursor-grab active:cursor-grabbing z-30 transition-colors ${
              isSelected
                ? 'bg-yellow-400 text-black shadow-[0_0_14px_rgba(250,204,21,0.8)]'
                : 'bg-black/85 text-sky-300 border border-sky-400/40'
            }`}
          >
            <Move className="w-3 h-3" />
            <span>{title}</span>
            <span className="text-[9px] opacity-75 font-normal">
              ({layout.width}×{layout.height})
            </span>
          </div>

          {/* 4-Corner Resize Handles (Adjusts both sides together) */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute -top-2 -left-2 w-4.5 h-4.5 bg-yellow-400 border-2 border-black rounded-sm cursor-nwse-resize z-30 hover:scale-125 transition-transform shadow-[0_0_8px_#facc15]"
            title="Pull corner to adjust both sides together"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-yellow-400 border-2 border-black rounded-sm cursor-nesw-resize z-30 hover:scale-125 transition-transform shadow-[0_0_8px_#facc15]"
            title="Pull corner to adjust both sides together"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute -bottom-2 -left-2 w-4.5 h-4.5 bg-yellow-400 border-2 border-black rounded-sm cursor-nesw-resize z-30 hover:scale-125 transition-transform shadow-[0_0_8px_#facc15]"
            title="Pull corner to adjust both sides together"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute -bottom-2 -right-2 w-4.5 h-4.5 bg-yellow-400 border-2 border-black rounded-sm cursor-nwse-resize z-30 hover:scale-125 transition-transform shadow-[0_0_8px_#facc15]"
            title="Pull corner to adjust both sides together"
          />

          {/* 4-Edge Resize Handles (Only the pulled side moves! Opposite side stays anchored) */}
          {/* Top Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'n')}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-400/90 border border-black rounded-full cursor-ns-resize z-30 hover:bg-yellow-300 hover:h-3.5 transition-all shadow-[0_0_6px_#facc15]"
            title="Pull top edge to resize top only"
          />
          {/* Bottom Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-400/90 border border-black rounded-full cursor-ns-resize z-30 hover:bg-yellow-300 hover:h-3.5 transition-all shadow-[0_0_6px_#facc15]"
            title="Pull bottom edge to resize bottom only"
          />
          {/* Left Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'w')}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-10 bg-yellow-400/90 border border-black rounded-full cursor-ew-resize z-30 hover:bg-yellow-300 hover:w-3.5 transition-all shadow-[0_0_6px_#facc15]"
            title="Pull left edge to resize left only"
          />
          {/* Right Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-10 bg-yellow-400/90 border border-black rounded-full cursor-ew-resize z-30 hover:bg-yellow-300 hover:w-3.5 transition-all shadow-[0_0_6px_#facc15]"
            title="Pull right edge to resize right only"
          />
        </>
      )}
    </div>
  );
};
