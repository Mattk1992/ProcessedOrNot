import { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';

export default function DropdownTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          console.log('Test dropdown clicked, current state:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        <User className="w-4 h-4" />
        <span>Test Menu</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20 py-2">
            <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Test Item 1
            </div>
            <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Test Item 2
            </div>
            <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Test Item 3
            </div>
          </div>
        </>
      )}
    </div>
  );
}