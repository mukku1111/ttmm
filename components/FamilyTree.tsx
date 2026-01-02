import React from 'react';
import { Character, FamilyTreeData } from '../types';
import PetVisual from './PetVisual';

interface Props {
  history: FamilyTreeData;
  currentId: string;
  onClose: () => void;
}

const FamilyTree: React.FC<Props> = ({ history, currentId, onClose }) => {
  const renderNode = (id: string, depth: number = 0): React.ReactNode => {
    const char = history[id];
    if (!char) return null;

    if (depth > 2) return null; // Limit depth for UI simplicity

    const p1 = char.parents[0];
    const p2 = char.parents[1];

    return (
      <div className="flex flex-col items-center mx-4">
        {/* Parents */}
        {(p1 || p2) && (
            <div className="flex mb-4 relative">
                {/* Connecting lines could go here, simplified for now */}
                {p1 && renderNode(p1, depth + 1)}
                {p2 && (
                    <div className="ml-8 border-l-2 border-dashed border-gray-300 pl-8">
                       {/* External spouse usually doesn't have full history in this simplified map unless tracked. 
                           If p2 is an external ID we generated but didn't store fully in recursive history, this might be tricky.
                           For this app, we assume 'history' contains all relevant family members.
                       */}
                       {renderNode(p2, depth + 1)}
                    </div>
                )}
            </div>
        )}
        
        {/* Self */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-pink-100 flex flex-col items-center min-w-[100px]">
           <div className="w-16 h-16">
             <PetVisual genes={char.genes} stage={char.stage} isNpc={true} />
           </div>
           <span className="text-xs font-bold text-gray-600 mt-1">{char.name}</span>
           <span className="text-[10px] text-gray-400">Gen {char.generation}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-sanrio-pink p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white drop-shadow-sm">Family History</h2>
          <button onClick={onClose} className="bg-white text-pink-500 rounded-full w-8 h-8 font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-8 flex justify-center items-end bg-slate-50">
           {renderNode(currentId)}
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
