import { useGeometryStore } from '../store/geometryStore';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export default function ObjectList() {
  const objects = useGeometryStore((s) => s.objects);
  const selectedObjectId = useGeometryStore((s) => s.selectedObjectId);
  const selectObject = useGeometryStore((s) => s.selectObject);
  const updateObject = useGeometryStore((s) => s.updateObject);
  const removeObject = useGeometryStore((s) => s.removeObject);

  if (objects.length === 0) {
    return (
      <div className="p-3 text-gray-600 text-xs text-center">
        暂无对象，输入表达式或使用工具栏创建
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-1">
      {objects.map((obj) => (
        <div
          key={obj.id}
          onClick={() => selectObject(obj.id)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all text-xs ${
            selectedObjectId === obj.id
              ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30'
              : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: obj.color }}
          />
          <span className="text-gray-200 flex-1 truncate">{obj.name}</span>
          <span className="text-gray-600 text-[10px] capitalize">{obj.type}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateObject(obj.id, { visible: !obj.visible });
            }}
            className="p-0.5 text-gray-500 hover:text-white transition-colors"
          >
            {obj.visible ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeObject(obj.id);
            }}
            className="p-0.5 text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
