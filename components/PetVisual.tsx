import React from 'react';
import { Genes, Stage } from '../types';

interface PetVisualProps {
  genes: Genes;
  stage: Stage;
  isNpc?: boolean;
}

const PetVisual: React.FC<PetVisualProps> = ({ genes, stage, isNpc = false }) => {
  if (stage === Stage.EGG) {
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-md wiggle cursor-pointer">
        <ellipse cx="100" cy="110" rx="60" ry="80" fill="#FFF" stroke="#FFB7C5" strokeWidth="4" />
        <path d="M70 80 Q100 120 130 80" stroke="#FFB7C5" strokeWidth="4" fill="none" opacity="0.5" />
        <circle cx="80" cy="90" r="5" fill="#FFB7C5" />
        <circle cx="120" cy="110" r="8" fill="#FFB7C5" />
      </svg>
    );
  }

  // Visual scaling for stages
  const scale = stage === Stage.BABY ? 0.6 : stage === Stage.TEEN ? 0.8 : 1;
  const bounceClass = isNpc ? '' : 'bounce';

  const renderEars = () => {
    switch (genes.ears) {
      case 'rabbit':
        return (
          <>
            <ellipse cx="65" cy="50" rx="15" ry="40" fill={genes.color} stroke="#333" strokeWidth="3" transform="rotate(-10 65 50)" />
            <ellipse cx="135" cy="50" rx="15" ry="40" fill={genes.color} stroke="#333" strokeWidth="3" transform="rotate(10 135 50)" />
          </>
        );
      case 'cat':
        return (
          <>
            <path d="M50 80 L50 30 L90 60 Z" fill={genes.color} stroke="#333" strokeWidth="3" />
            <path d="M150 80 L150 30 L110 60 Z" fill={genes.color} stroke="#333" strokeWidth="3" />
          </>
        );
      case 'bear':
        return (
          <>
             <circle cx="60" cy="60" r="20" fill={genes.color} stroke="#333" strokeWidth="3" />
             <circle cx="140" cy="60" r="20" fill={genes.color} stroke="#333" strokeWidth="3" />
          </>
        );
      case 'droopy':
        return (
          <>
            <path d="M50 90 Q30 120 40 140" stroke="#333" strokeWidth="15" strokeLinecap="round" strokeOpacity="0.1"/>
            <path d="M50 90 Q30 120 40 140" stroke={genes.color} strokeWidth="12" strokeLinecap="round" />
            <path d="M150 90 Q170 120 160 140" stroke={genes.color} strokeWidth="12" strokeLinecap="round" />
             <path d="M150 90 Q170 120 160 140" stroke="#333" strokeWidth="3" fill="none" />
             <path d="M50 90 Q30 120 40 140" stroke="#333" strokeWidth="3" fill="none" />
          </>
        );
      default: return null;
    }
  };

  const renderEyes = () => {
    switch (genes.eyes) {
      case 'sparkle':
        return (
          <g fill="#333">
             <circle cx="80" cy="110" r="6" />
             <circle cx="120" cy="110" r="6" />
             <circle cx="83" cy="107" r="2" fill="white" />
             <circle cx="123" cy="107" r="2" fill="white" />
          </g>
        );
      case 'sleepy':
        return (
          <g stroke="#333" strokeWidth="3" fill="none">
             <path d="M70 115 Q80 120 90 115" />
             <path d="M110 115 Q120 120 130 115" />
          </g>
        );
      case 'happy':
        return (
           <g stroke="#333" strokeWidth="3" fill="none">
             <path d="M70 110 Q80 100 90 110" />
             <path d="M110 110 Q120 100 130 110" />
          </g>
        );
      case 'dot':
      default:
        return (
          <g fill="#333">
            <circle cx="80" cy="110" r="5" />
            <circle cx="120" cy="110" r="5" />
          </g>
        );
    }
  };

  const renderMouth = () => {
    switch(genes.mouth) {
      case 'cat':
        return <path d="M90 130 Q100 135 110 130" stroke="#333" strokeWidth="3" fill="none" />;
      case 'o':
        return <circle cx="100" cy="135" r="5" stroke="#333" strokeWidth="2" fill="none" />;
      case 'tiny':
        return <path d="M95 135 L105 135" stroke="#333" strokeWidth="2" />;
      case 'smile':
      default:
        return <path d="M85 130 Q100 145 115 130" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
  };

  const renderAccessory = () => {
    // Accessories only appear when Adult!
    if (stage !== Stage.ADULT && !isNpc) return null;
    // NPCs are usually adults, but just in case check flag
    if (!isNpc && stage !== Stage.ADULT) return null;
    
    // For NPC in list, we assume they are adult.
    
    switch(genes.accessory) {
      case 'bow':
        return (
          <g transform="translate(130, 70) rotate(15)">
            <path d="M0 0 L10 -10 L10 10 Z" fill="red" stroke="#333" strokeWidth="1" />
            <path d="M0 0 L-10 -10 L-10 10 Z" fill="red" stroke="#333" strokeWidth="1" />
            <circle r="3" fill="orange" />
          </g>
        );
      case 'star':
        return (
           <g transform="translate(70, 70)">
             <polygon points="0,-10 2,-3 9,-3 3,1 5,8 0,4 -5,8 -3,1 -9,-3 -2,-3" fill="gold" stroke="orange" strokeWidth="1" />
           </g>
        );
      case 'flower':
        return (
           <g transform="translate(130, 80)">
             <circle r="10" fill="pink" stroke="white" strokeWidth="2" />
             <circle r="3" fill="yellow" />
           </g>
        );
      default: return null;
    }
  }

  return (
    <div className={`relative ${bounceClass}`} style={{ width: 200 * scale, height: 200 * scale }}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        {/* Body Base */}
        {/* Draw ears behind head */}
        {renderEars()}
        
        {/* Head/Body */}
        <ellipse cx="100" cy="100" rx="60" ry="55" fill={genes.color} stroke="#333" strokeWidth="3" />
        
        {/* Face */}
        <g opacity="0.8">
           <ellipse cx="75" cy="115" rx="8" ry="5" fill="#FFA07A" opacity="0.6" /> 
           <ellipse cx="125" cy="115" rx="8" ry="5" fill="#FFA07A" opacity="0.6" />
        </g>

        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}

      </svg>
    </div>
  );
};

export default PetVisual;
