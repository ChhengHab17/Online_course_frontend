import React from 'react';
import { CodeRunner } from '../components/CodeRunner';

export default function CodeTest() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <CodeRunner />
      </div>
    </div>
  );
}
