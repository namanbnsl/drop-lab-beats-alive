
import React from 'react';

interface MagentaInfoProps {
  generatedSequence: any;
  hasModel: boolean;
}

const MagentaInfo: React.FC<MagentaInfoProps> = ({ generatedSequence, hasModel }) => {
  if (!generatedSequence) return null;

  return (
    <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
      <p className="text-sm text-purple-300">
        Generated melody with {generatedSequence.notes?.length || 0} notes
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {hasModel ? 'Generated using Magenta AI model' : 'Generated using algorithmic composition'}
      </p>
    </div>
  );
};

export default MagentaInfo;
