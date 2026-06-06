import { Plus, X, Play } from 'lucide-react';
import { useGeometryStore } from '../store/geometryStore';
import { expressionToGeometryObject, parseExpression } from '../utils/expressionParser';

export default function ExpressionInput() {
  const expressions = useGeometryStore((s) => s.expressions);
  const addExpression = useGeometryStore((s) => s.addExpression);
  const updateExpression = useGeometryStore((s) => s.updateExpression);
  const removeExpression = useGeometryStore((s) => s.removeExpression);
  const setExpressionError = useGeometryStore((s) => s.setExpressionError);
  const addObject = useGeometryStore((s) => s.addObject);

  const handleSubmit = (id: string, text: string) => {
    if (!text.trim()) return;

    const parsed = parseExpression(text);
    if (!parsed) {
      setExpressionError(id, '无法解析表达式');
      return;
    }

    setExpressionError(id, null);
    const obj = expressionToGeometryObject(text);
    if (obj) {
      addObject(obj);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, text: string) => {
    if (e.key === 'Enter') {
      handleSubmit(id, text);
    }
  };

  return (
    <div className="bg-[#131720] border-b border-[#1e293b] p-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#00d4ff] text-xs font-semibold tracking-wider uppercase">函数表达式</span>
        <button
          onClick={addExpression}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-[#00d4ff] transition-colors"
          title="添加表达式"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
        {expressions.map((expr) => (
          <div key={expr.id} className="flex items-center gap-1">
            <div className="flex-1 flex items-center gap-1 bg-[#0d1117] rounded border border-[#1e293b] focus-within:border-[#00d4ff]/50 transition-colors">
              <input
                type="text"
                value={expr.text}
                onChange={(e) => updateExpression(expr.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, expr.id, expr.text)}
                placeholder="输入表达式，如 z=x^2+y^2 或 x^2+y^2+z^2=1"
                className="flex-1 bg-transparent text-white text-sm px-2 py-1 outline-none font-mono placeholder-gray-600"
              />
              <button
                onClick={() => handleSubmit(expr.id, expr.text)}
                className="p-1 text-gray-500 hover:text-[#00ff88] transition-colors"
                title="渲染"
              >
                <Play size={12} />
              </button>
            </div>
            {expressions.length > 1 && (
              <button
                onClick={() => removeExpression(expr.id)}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            {expr.error && (
              <span className="text-red-400 text-xs">{expr.error}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 text-gray-600 text-xs">
        支持: z=f(x,y) | F(x,y,z)=0 | x=f(t), y=g(t), z=h(t)
      </div>
    </div>
  );
}
