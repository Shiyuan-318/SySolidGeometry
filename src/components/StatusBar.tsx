import { useGeometryStore } from '../store/geometryStore';

export default function StatusBar() {
  const cursorPosition = useGeometryStore((s) => s.cursorPosition);
  const cameraState = useGeometryStore((s) => s.cameraState);
  const objects = useGeometryStore((s) => s.objects);
  const toolMode = useGeometryStore((s) => s.toolMode);

  const toolLabels: Record<string, string> = {
    select: '选择',
    point: '画点',
    line: '画线',
    surface: '画面',
    curve: '曲线',
    measure: '测量',
  };

  return (
    <div className="h-6 bg-[#0d1117] border-t border-[#1e293b] flex items-center px-3 text-xs text-gray-500 gap-6">
      <span>
        模式: <span className="text-[#00d4ff]">{toolLabels[toolMode] || toolMode}</span>
      </span>
      <span>
        坐标: <span className="text-gray-300 font-mono">({cursorPosition.map((v) => v.toFixed(2)).join(', ')})</span>
      </span>
      <span>
        缩放: <span className="text-gray-300">{cameraState.zoom.toFixed(2)}x</span>
      </span>
      <span>
        对象: <span className="text-gray-300">{objects.length}</span>
      </span>
      <span className="ml-auto text-gray-600">
        Ctrl+/- 缩放 | 滚轮缩放 | 拖动旋转
      </span>
    </div>
  );
}
