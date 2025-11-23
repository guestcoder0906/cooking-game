import React from 'react';
import { WebSimViewer } from './components/WebSimViewer';

const App: React.FC = () => {
  return (
    <div className="w-full h-full bg-black">
      <WebSimViewer />
    </div>
  );
};

export default App;