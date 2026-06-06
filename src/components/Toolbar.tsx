import {
  MousePointer2,
  CircleDot,
  Minus,
  Square,
  Spline,
  Ruler,
  Grid3x3,
  Axis3D,
  Download,
  Trash2,
} from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';
import type { ToolMode } from '../store/types';
import { exportCanvasAsImage, getThreeCanvas } from '../utils/exportImage';

const tools: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'select', icon: <MousePointer2 size={18} />, label: '选择' },
  { mode: 'point', icon: <CircleDot size={18} />, label: '画点' },
  { mode: 'line', icon: <Minus size={18} />, label: '画线' },
  { mode: 'surface', icon: <Square size={18} />, label: '画面' },
  { mode: 'curve', icon: <Spline size={18} />, label: '曲线' },
  { mode: 'measure', icon: <Ruler size={18} />, label: '测量' },
];

export default function Toolbar() {
  const toolMode = useGeometryStore((s) => s.toolMode);
  const setToolMode = useGeometryStore((s) => s.setToolMode);
  const showGrid = useGeometryStore((s) => s.showGrid);
  const toggleGrid = useGeometryStore((s) => s.toggleGrid);
  const showAxes = useGeometryStore((s) => s.showAxes);
  const toggleAxes = useGeometryStore((s) => s.toggleAxes);
  const selectedObjectId = useGeometryStore((s) => s.selectedObjectId);
  const removeObject = useGeometryStore((s) => s.removeObject);

  const handleExport = () => {
    const canvas = getThreeCanvas();
    if (canvas) {
      exportCanvasAsImage(canvas);
    }
  };

  const handleDelete = () => {
    if (selectedObjectId) {
      removeObject(selectedObjectId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-[#131720] border-r border-[#1e293b] w-12">
      {tools.map((tool) => (
        <button
          key={tool.mode}
          onClick={() => setToolMode(tool.mode)}
          className={`p-2 rounded-lg transition-all duration-200 group relative ${
            toolMode === tool.mode
              ? 'bg-[#00d4ff]/20 text-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title={tool.label}
        >
          {tool.icon}
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e293b] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="w-6 h-px bg-[#1e293b] my-1" />

      <button
        onClick={toggleGrid}
        className={`p-2 rounded-lg transition-all duration-200 group relative ${
          showGrid ? 'text-[#00d4ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="网格"
      >
        <Grid3x3 size={18} />
      </button>

      <button
        onClick={toggleAxes}
        className={`p-2 rounded-lg transition-all duration-200 group relative ${
          showAxes ? 'text-[#00d4ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="坐标轴"
      >
        <Axis3D size={18} />
      </button>

      <div className="w-6 h-px bg-[#1e293b] my-1" />

      <button
        onClick={handleExport}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group relative"
        title="导出图像"
      >
        <Download size={18} />
      </button>

      <button
        onClick={handleDelete}
        disabled={!selectedObjectId}
        className={`p-2 rounded-lg transition-all duration-200 group relative ${
          selectedObjectId
            ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        title="删除选中"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
