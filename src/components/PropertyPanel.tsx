import { Eye, EyeOff } from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';
import { calculateArea, calculateSurfaceArea, parseExpression } from '../utils/expressionParser';

const COLORS = [
  '#00d4ff', '#ff6b6b', '#00ff88', '#ffd93d',
  '#c084fc', '#fb923c', '#f472b6', '#34d399',
  '#60a5fa', '#a78bfa', '#f87171', '#fbbf24',
];

export default function PropertyPanel() {
  const objects = useGeometryStore((s) => s.objects);
  const selectedObjectId = useGeometryStore((s) => s.selectedObjectId);
  const updateObject = useGeometryStore((s) => s.updateObject);
  const updateVertexLabel = useGeometryStore((s) => s.updateVertexLabel);
  const removeObject = useGeometryStore((s) => s.removeObject);

  const selectedObject = objects.find((o) => o.id === selectedObjectId);

  const handleColorChange = (color: string) => {
    if (selectedObjectId) {
      updateObject(selectedObjectId, { color });
    }
  };

  const handleLineStyleChange = (lineStyle: 'solid' | 'dashed') => {
    if (selectedObjectId) {
      updateObject(selectedObjectId, { lineStyle });
    }
  };

  const handleLabelChange = (vertexId: string, label: string) => {
    if (selectedObjectId) {
      updateVertexLabel(selectedObjectId, vertexId, label);
    }
  };

  const handleVisibilityToggle = () => {
    if (selectedObject) {
      updateObject(selectedObject.id, { visible: !selectedObject.visible });
    }
  };

  const computeArea = (): string => {
    if (!selectedObject) return '-';
    if (selectedObject.type === 'surface') {
      const parsed = parseExpression(selectedObject.expression);
      if (parsed && parsed.type === 'explicit' && parsed.fn) {
        const area = calculateSurfaceArea(parsed.fn, parsed.xRange, parsed.yRange, 30);
        return area.toFixed(4);
      }
    }
    if (selectedObject.vertices.length >= 3) {
      const pts = selectedObject.vertices.map((v) => v.position);
      const area = calculateArea(pts);
      return area.toFixed(4);
    }
    return '-';
  };

  if (!selectedObject) {
    return (
      <div className="w-64 bg-[#131720] border-l border-[#1e293b] p-4 flex flex-col items-center justify-center text-gray-500 text-sm">
        <p>选择一个对象以查看属性</p>
        <p className="text-xs mt-2 text-gray-600">点击3D场景中的图形</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#131720] border-l border-[#1e293b] p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#00d4ff] text-sm font-semibold">{selectedObject.name}</h3>
        <button
          onClick={handleVisibilityToggle}
          className="p-1 rounded hover:bg-white/10 text-gray-400 transition-colors"
        >
          {selectedObject.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* Type */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs block mb-1">类型</label>
        <span className="text-white text-sm capitalize">{selectedObject.type}</span>
      </div>

      {/* Expression */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs block mb-1">表达式</label>
        <code className="text-[#00ff88] text-xs bg-[#0d1117] px-2 py-1 rounded block break-all">
          {selectedObject.expression}
        </code>
      </div>

      {/* Color */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs block mb-1">颜色</label>
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                selectedObject.color === c ? 'border-white scale-125' : 'border-transparent hover:border-gray-400'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={selectedObject.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-5 h-5 rounded-full cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Line Style */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs block mb-1">线型</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleLineStyleChange('solid')}
            className={`flex-1 py-1 px-2 rounded text-xs transition-all ${
              selectedObject.lineStyle === 'solid'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/50'
                : 'bg-[#0d1117] text-gray-400 border border-[#1e293b] hover:border-gray-500'
            }`}
          >
            实线 ──
          </button>
          <button
            onClick={() => handleLineStyleChange('dashed')}
            className={`flex-1 py-1 px-2 rounded text-xs transition-all ${
              selectedObject.lineStyle === 'dashed'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/50'
                : 'bg-[#0d1117] text-gray-400 border border-[#1e293b] hover:border-gray-500'
            }`}
          >
            虚线 - - -
          </button>
        </div>
      </div>

      {/* Vertices */}
      {selectedObject.vertices.length > 0 && (
        <div className="mb-3">
          <label className="text-gray-400 text-xs block mb-1">顶点</label>
          <div className="flex flex-col gap-1">
            {selectedObject.vertices.map((v) => (
              <div key={v.id} className="flex items-center gap-1 bg-[#0d1117] rounded px-2 py-1">
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => handleLabelChange(v.id, e.target.value)}
                  className="w-6 bg-transparent text-[#00d4ff] text-xs outline-none font-mono text-center"
                  maxLength={3}
                />
                <span className="text-gray-500 text-xs">=</span>
                <span className="text-gray-300 text-xs font-mono">
                  ({v.position[0].toFixed(2)}, {v.position[1].toFixed(2)}, {v.position[2].toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Area */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs block mb-1">面积</label>
        <span className="text-[#ffd93d] text-sm font-mono">{computeArea()}</span>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeObject(selectedObject.id)}
        className="w-full py-1.5 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors mt-2"
      >
        删除对象
      </button>
    </div>
  );
}
