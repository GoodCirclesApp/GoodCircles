
import React, { useState, useMemo } from 'react';
import { GeospatialNode, SupporterCircle, User } from '../types';
import { BrandSubmark } from '../components/BrandAssets';
import { NodeCoordination } from '../components/NodeCoordination';

interface Props {
  circles: SupporterCircle[];
  myCircle?: SupporterCircle;
  currentUser: User | null;
  onSendMessage: (id: string, content: string) => void;
}

export const ImpactMapView: React.FC<Props> = ({ circles, myCircle, currentUser, onSendMessage }) => {
  const [activeLayer, setActiveLayer] = useState<'VOLUME' | 'VELOCITY' | 'RESOURCES'>('VOLUME');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodes: GeospatialNode[] = useMemo(() => [
    { id: 'n1', name: 'Westside Arts District', lat: 40, lng: 30, type: 'CLUSTER', impactVolume: 12400, retentionRate: 0.88 },
    { id: 'n2', name: 'Downtown Commercial Hub', lat: 50, lng: 50, type: 'MERCHANT', impactVolume: 45000, retentionRate: 0.72 },
    { id: 'n3', name: 'Eastside Education Node', lat: 30, lng: 70, type: 'NONPROFIT', impactVolume: 8500, retentionRate: 0.94 },
    { id: 'n4', name: 'North Heights Retail', lat: 70, lng: 40, type: 'CLUSTER', impactVolume: 22000, retentionRate: 0.81 },
    { id: 'n5', name: 'South Bay Industrial', lat: 60, lng: 20, type: 'MERCHANT', impactVolume: 15600, retentionRate: 0.65 },
  ], []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-8 animate-in fade-in duration-700">
      
      {/* Map Interactive Canvas */}
      <div className="flex-1 bg-black rounded-[4rem] relative overflow-hidden shadow-2xl border border-white/5">
        
        {/* Map Header HUD */}
        <div className="absolute top-10 left-10 z-20 space-y-4">
           <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 space-y-1">
              <p className="text-[10px] font-black text-[#C2A76F] uppercase tracking-[0.4em]">Mesh Terminal v9.0</p>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Geospatial Velocity.</h3>
           </div>
           <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/5">
              {(['VOLUME', 'VELOCITY', 'RESOURCES'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLayer === l ? 'bg-[#7851A9] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
           </div>
        </div>

        {/* The Impact Mesh (SVG Visualization) */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
           <defs>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                 <stop offset="0%" stopColor="#7851A9" stopOpacity="0.4" />
                 <stop offset="100%" stopColor="#7851A9" stopOpacity="0" />
              </radialGradient>
              <filter id="blur">
                 <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
           </defs>

           {/* Grid Lines */}
           <g className="opacity-10" stroke="#FFF" strokeWidth="0.05">
              {Array.from({length: 10}).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={i*10} y1="0" x2={i*10} y2="100" />
                  <line x1="0" y1={i*10} x2="100" y2={i*10} />
                </React.Fragment>
              ))}
           </g>

           {/* Capital Flow Connections */}
           <g className="opacity-20" stroke="#CA9CE1" strokeWidth="0.2" strokeDasharray="1 2">
              <path d="M30 30 L50 50" className="animate-[dash_10s_linear_infinite]" />
              <path d="M50 50 L70 30" />
              <path d="M70 40 L50 50" />
              <path d="M20 60 L50 50" />
           </g>

           {/* Impact Nodes */}
           {nodes.map(node => {
              const isActive = selectedNodeId === node.id;
              const color = node.type === 'MERCHANT' ? '#C2A76F' : node.type === 'NONPROFIT' ? '#7851A9' : '#CA9CE1';
              const size = 1.5 + (node.impactVolume / 15000);

              return (
                <g key={node.id} onClick={() => setSelectedNodeId(node.id)} className="cursor-pointer group">
                   {/* Glow Layer */}
                   <circle cx={node.lng} cy={node.lat} r={size * 4} fill="url(#nodeGlow)" className={`transition-all duration-700 ${isActive ? 'opacity-100 scale-150' : 'opacity-40 group-hover:opacity-60'}`} />
                   
                   {/* Core Node */}
                   <circle cx={node.lng} cy={node.lat} r={size} fill={color} className="transition-all duration-300 group-hover:scale-125" />
                   
                   {/* Data Ring */}
                   {activeLayer === 'VELOCITY' && (
                     <circle cx={node.lng} cy={node.lat} r={size + 1} fill="none" stroke={color} strokeWidth="0.1" strokeDasharray="1 1" className="animate-spin" style={{ animationDuration: `${(1 - node.retentionRate) * 10}s` }} />
                   )}
                   
                   {/* Label */}
                   <text x={node.lng} y={node.lat - size - 1} fill="white" fontSize="1.2" fontWeight="900" textAnchor="middle" className={`uppercase tracking-widest pointer-events-none transition-opacity ${isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'}`}>
                      {node.name}
                   </text>
                </g>
              );
           })}
        </svg>

        {/* Node Stats Overlay */}
        {selectedNode && (
          <div className="absolute bottom-10 left-10 z-20 w-80 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedNode.type} NODE</p>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-black">{selectedNode.name}</h4>
                   </div>
                   <button onClick={() => setSelectedNodeId(null)} className="text-slate-300 hover:text-black">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Impact Vol.</p>
                      <p className="text-lg font-black italic">${selectedNode.impactVolume.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Retention</p>
                      <p className="text-lg font-black italic text-emerald-500">{(selectedNode.retentionRate * 100).toFixed(0)}%</p>
                   </div>
                </div>
                <button className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl">Analyze Circular Flow</button>
             </div>
          </div>
        )}

        {/* Compass/Logo Branding */}
        <div className="absolute bottom-10 right-10 opacity-30">
           <BrandSubmark size={60} variant="WHITE" showCrown={false} />
        </div>
      </div>

      {/* Sidebar: Node Coordination */}
      <div className="w-full lg:w-[400px] shrink-0">
         {myCircle ? (
           <NodeCoordination circle={myCircle} onSendMessage={(msg) => onSendMessage(myCircle.id, msg)} />
         ) : (
           <div className="h-full bg-white rounded-[4rem] border border-slate-100 flex flex-col items-center justify-center p-12 text-center space-y-8 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <div className="space-y-4">
                 <h4 className="text-2xl font-black italic uppercase tracking-tighter">Coordination Locked</h4>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic">Join a Supporter Circle to participate in real-time community action planning.</p>
              </div>
           </div>
         )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}} />
    </div>
  );
};
