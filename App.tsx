import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Character, Stage, FamilyTreeData, NpcCandidate, Genes } from './types';
import { generateRandomGenes, breed, matureGenes } from './services/genetics';
import { generateNpcCandidates } from './services/gemini';
import PetVisual from './components/PetVisual';
import FamilyTree from './components/FamilyTree';

const FEEDS_REQUIRED_FOR_GROWTH = 3;

const App: React.FC = () => {
  // State
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [familyData, setFamilyData] = useState<FamilyTreeData>({});
  
  // Interactions
  const [showTree, setShowTree] = useState(false);
  const [marriageCandidates, setMarriageCandidates] = useState<NpcCandidate[]>([]);
  const [isMarrying, setIsMarrying] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Cutscene State
  const [showMarriageScene, setShowMarriageScene] = useState(false);
  const [marriagePartner, setMarriagePartner] = useState<NpcCandidate | null>(null);

  // Naming State
  const [namingId, setNamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Initialize first egg if no data
  useEffect(() => {
    if (!activePetId) {
      const id = uuidv4();
      const starter: Character = {
        id,
        name: 'Mochi',
        generation: 1,
        stage: Stage.EGG,
        genes: generateRandomGenes(),
        birthDate: Date.now(),
        lastFed: Date.now(),
        feedsSinceLastStage: 0,
        happiness: 100,
        parents: [null, null]
      };
      setFamilyData({ [id]: starter });
      setActivePetId(id);
    }
  }, [activePetId]);

  const activePet = activePetId ? familyData[activePetId] : null;

  // Growth Logic (Now Triggered by Feeding, not Time)
  const handleFeed = () => {
      if (!activePet) return;

      setFamilyData(prev => {
        const pet = prev[activePetId!];
        if (!pet) return prev;

        const newFeeds = pet.feedsSinceLastStage + 1;
        let nextStage = pet.stage;
        let shouldEvolve = false;
        let updatedGenes = pet.genes;

        // Check evolution criteria
        if (newFeeds >= FEEDS_REQUIRED_FOR_GROWTH) {
            if (pet.stage === Stage.EGG) {
                nextStage = Stage.BABY;
                shouldEvolve = true;
            } else if (pet.stage === Stage.BABY) {
                nextStage = Stage.TEEN;
                shouldEvolve = true;
            } else if (pet.stage === Stage.TEEN) {
                nextStage = Stage.ADULT;
                shouldEvolve = true;
                // Run maturation logic to potentially shift genes towards a parent
                updatedGenes = matureGenes(pet, prev);
            }
        }

        if (shouldEvolve) {
             return {
                 ...prev,
                 [pet.id]: { 
                     ...pet, 
                     stage: nextStage,
                     genes: updatedGenes,
                     feedsSinceLastStage: 0, // Reset counter
                     lastFed: Date.now()
                 }
             };
        } else {
            return {
                ...prev,
                [pet.id]: { 
                    ...pet, 
                    feedsSinceLastStage: newFeeds,
                    lastFed: Date.now()
                }
            };
        }
      });
  };

  const handleVisitPark = async () => {
      if (!activePet || activePet.stage !== Stage.ADULT) {
          alert("Only adults can get married!");
          return;
      }
      setIsMarrying(true);
      setLoadingCandidates(true);
      const candidates = await generateNpcCandidates(activePet.generation);
      setMarriageCandidates(candidates);
      setLoadingCandidates(false);
  };

  const startMarriageSequence = (spouse: NpcCandidate) => {
    setIsMarrying(false);
    setMarriagePartner(spouse);
    setShowMarriageScene(true);
    
    // Play scene for 4 seconds then creates egg
    setTimeout(() => {
        finalizeMarriage(spouse);
    }, 4000);
  };

  const finalizeMarriage = (spouse: NpcCandidate) => {
    if (!activePet) return;

    // 1. Create Spouse Entry
    const spouseId = uuidv4();
    const spouseChar: Character = {
        id: spouseId,
        name: spouse.name,
        generation: activePet.generation,
        stage: Stage.ADULT,
        genes: spouse.genes,
        birthDate: Date.now(),
        lastFed: Date.now(),
        feedsSinceLastStage: 0,
        happiness: 100,
        parents: [null, null]
    };

    // 2. Create Child
    const childId = uuidv4();
    const childGenes = breed(activePet, spouse.genes, familyData);
    
    const child: Character = {
        id: childId,
        name: '???', // Placeholder until named
        generation: activePet.generation + 1,
        stage: Stage.EGG,
        genes: childGenes,
        birthDate: Date.now(),
        lastFed: Date.now(),
        feedsSinceLastStage: 0,
        happiness: 100,
        parents: [activePet.id, spouseId]
    };

    setFamilyData(prev => ({
      ...prev,
      [spouseId]: spouseChar,
      [childId]: child
    }));
    
    // Transition directly to Naming Screen
    setNamingId(childId);
    // Hide marriage scene (rendered below, but Naming Screen will have higher Z-index and solid background)
    setShowMarriageScene(false);
    setMarriagePartner(null);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namingId || !newName.trim()) return;

    setFamilyData(prev => ({
      ...prev,
      [namingId]: { ...prev[namingId], name: newName }
    }));

    // Switch active pet to child ONLY after naming is complete
    setActivePetId(namingId);
    setNamingId(null);
    setNewName('');
  };

  if (!activePet) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white p-4 shadow-sm flex justify-between items-center px-8 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-pink-500 tracking-wider">TAMAGOTCHI GEN</h1>
        <div className="flex gap-4">
             <button 
               onClick={() => setShowTree(true)}
               className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-4 py-2 rounded-full text-sm font-bold transition-colors"
             >
                🌳 Family Tree
             </button>
             <div className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm font-bold">
               Generation {activePet.generation}
             </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl p-6 relative">
         
         {/* Pet Display */}
         <div className="mb-8">
            <PetVisual genes={activePet.genes} stage={activePet.stage} />
         </div>

         <div className="text-center mb-8">
             <h2 className="text-3xl font-bold mb-2">{activePet.name}</h2>
             <div className="inline-block bg-white px-3 py-1 rounded-full border border-gray-200 text-sm">
                Stage: <span className="text-pink-500 font-bold">{activePet.stage}</span>
             </div>
         </div>

         {/* Actions */}
         <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <button 
               onClick={handleFeed}
               className="bg-white border-2 border-pink-200 hover:bg-pink-50 p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
            >
                <span className="text-2xl">🍼</span>
                <span className="font-bold text-pink-500">Feed</span>
                <span className="text-xs text-gray-400">({activePet.feedsSinceLastStage}/{FEEDS_REQUIRED_FOR_GROWTH} to grow)</span>
            </button>

            <button 
               onClick={handleVisitPark}
               disabled={activePet.stage !== Stage.ADULT}
               className={`border-2 p-4 rounded-xl flex flex-col items-center gap-2 transition-all 
                   ${activePet.stage === Stage.ADULT 
                       ? 'bg-white border-blue-200 hover:bg-blue-50 cursor-pointer active:scale-95' 
                       : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'}`}
            >
                <span className="text-2xl">❤️</span>
                <span className="font-bold text-blue-500">Visit Park</span>
                <span className="text-xs text-gray-400">{activePet.stage === Stage.ADULT ? 'Find Love' : 'Adults Only'}</span>
            </button>
         </div>

      </main>

      {/* Modals & Overlays */}
      
      {/* Family Tree */}
      {showTree && (
          <FamilyTree 
             history={familyData} 
             currentId={activePet.id} 
             onClose={() => setShowTree(false)} 
          />
      )}

      {/* Marriage Candidates */}
      {isMarrying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-pink-500">Find a Partner</h2>
                <button onClick={() => setIsMarrying(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {loadingCandidates ? (
                 <div className="py-20 text-center text-gray-500">
                    Looking for eligible pets nearby... <br/>
                    <span className="text-xs mt-2 block">(Consulting Gemini AI)</span>
                 </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {marriageCandidates.map((candidate, idx) => (
                          <div key={idx} className="border border-pink-100 rounded-xl p-4 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer bg-pink-50/30"
                               onClick={() => startMarriageSequence(candidate)}>
                              <div className="w-24 h-24 mx-auto mb-2">
                                  <PetVisual genes={candidate.genes} stage={Stage.ADULT} isNpc={true} />
                              </div>
                              <h3 className="font-bold text-center text-gray-700">{candidate.name}</h3>
                              <p className="text-xs text-center text-gray-500 mt-1 line-clamp-3">{candidate.description}</p>
                          </div>
                      ))}
                  </div>
              )}
           </div>
        </div>
      )}

      {/* Marriage Cutscene */}
      {showMarriageScene && marriagePartner && (
         <div className="fixed inset-0 bg-pink-200 z-[60] flex flex-col items-center justify-center overflow-hidden">
            
            {/* Background Popping Hearts */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute animate-bounce" 
                         style={{
                             left: `${Math.random() * 80 + 10}%`,
                             top: `${Math.random() * 80 + 10}%`,
                             fontSize: `${Math.random() * 30 + 20}px`,
                             opacity: 0.6,
                             animationDuration: `${Math.random() + 0.5}s`,
                             animationDelay: `${Math.random()}s`
                         }}>
                        ❤️
                    </div>
                ))}
            </div>

            <h1 className="text-4xl font-bold text-white mb-12 drop-shadow-md animate-pulse">It's Love!</h1>
            
            <div className="flex items-center gap-10">
               <div className="flex flex-col items-center transform scale-125">
                   <PetVisual genes={activePet.genes} stage={Stage.ADULT} />
                   <span className="text-white font-bold mt-4 bg-pink-400 px-3 py-1 rounded-full text-sm">{activePet.name}</span>
               </div>
               
               <div className="flex flex-col items-center">
                   <span className="text-7xl animate-ping absolute text-pink-500 opacity-50">❤️</span>
                   <span className="text-7xl animate-bounce relative z-10">❤️</span>
               </div>

               <div className="flex flex-col items-center transform scale-125">
                   <PetVisual genes={marriagePartner.genes} stage={Stage.ADULT} isNpc={true} />
                    <span className="text-white font-bold mt-4 bg-pink-400 px-3 py-1 rounded-full text-sm">{marriagePartner.name}</span>
               </div>
            </div>
         </div>
      )}

      {/* Naming New Baby Screen - Full Screen Overlay to prevent spoilers */}
      {namingId && (
        <div className="fixed inset-0 bg-pink-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-xl text-center border-4 border-pink-100">
                <div className="text-6xl mb-6 animate-bounce">🥚</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">A New Generation!</h2>
                <p className="text-gray-500 mb-8">The egg is warm. What will you name it?</p>
                <form onSubmit={handleNameSubmit}>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter Name..."
                      className="w-full border-2 border-gray-200 rounded-xl p-4 text-center text-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 focus:outline-none mb-6 transition-all"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!newName.trim()}
                      className="w-full bg-pink-400 text-white font-bold py-4 rounded-xl hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 text-lg"
                    >
                        Hatch!
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;