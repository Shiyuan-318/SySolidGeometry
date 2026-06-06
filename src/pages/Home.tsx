import Canvas3D from '../components/Canvas3D';
import Toolbar from '../components/Toolbar';
import ExpressionInput from '../components/ExpressionInput';
import PropertyPanel from '../components/PropertyPanel';
import StatusBar from '../components/StatusBar';
import ObjectList from '../components/ObjectList';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Top: Expression Input */}
      <ExpressionInput />

      {/* Middle: Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Toolbar */}
        <Toolbar />

        {/* Center: 3D Canvas + Object List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <ErrorBoundary>
              <Canvas3D />
            </ErrorBoundary>
          </div>
          {/* Object list overlay at bottom-left */}
          <div className="absolute bottom-8 left-14 w-56 max-h-48 overflow-y-auto bg-[#131720]/90 border border-[#1e293b] rounded-lg backdrop-blur-sm">
            <div className="px-2 py-1 border-b border-[#1e293b]">
              <span className="text-gray-400 text-xs font-semibold">对象列表</span>
            </div>
            <ObjectList />
          </div>
        </div>

        {/* Right: Property Panel */}
        <PropertyPanel />
      </div>

      {/* Bottom: Status Bar */}
      <StatusBar />
    </div>
  );
}
