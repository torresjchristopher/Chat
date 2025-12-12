import React, { useState, useEffect } from 'react';
import { geminiLive } from '../services/liveClient';
import { Type } from "@google/genai";

interface OnboardingProps {
  onComplete: (user: { name: string; age: number }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);

  const startOnboarding = async () => {
    setStatus('connecting');
    setError(null);

    const systemInstruction = `
      You are an onboarding assistant for a social app. 
      Your goal is to get the user's NAME and AGE.
      1. Greet the user warmly and ask them to SPELL their first name.
      2. Once you have the name, ask for their age.
      3. Once you have both name and age, call the "registerUser" tool immediately.
      4. If the user is unclear, politely ask again.
      Keep your responses brief and friendly.
    `;

    const registerUserTool = {
      name: "registerUser",
      description: "Registers the user with their name and age.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The user's name" },
          age: { type: Type.NUMBER, description: "The user's age" }
        },
        required: ["name", "age"]
      }
    };

    try {
      await geminiLive.connect({
        systemInstruction,
        onAudioData: (speaking) => {
          setStatus('listening');
        },
        tools: [{ functionDeclarations: [registerUserTool] }],
        onToolCall: (calls) => {
          const call = calls.find(c => c.name === 'registerUser');
          if (call && call.args) {
             setStatus('processing');
             geminiLive.disconnect();
             const { name, age } = call.args;
             onComplete({ name: String(name), age: Number(age) });
          }
        }
      });
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setError("Could not access microphone. Please allow permissions and try again.");
    }
  };

  useEffect(() => {
    return () => {
      geminiLive.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-600 shadow-2xl ${status === 'listening' ? 'animate-pulse' : ''}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          </div>
          {status === 'listening' && (
             <div className="absolute inset-0 rounded-full border-4 border-purple-400 opacity-50 animate-ping"></div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
          <p className="text-gray-400">
            {status === 'idle' && "We need to set up your profile."}
            {status === 'connecting' && "Connecting to assistant..."}
            {status === 'listening' && "Listening... Please say your age and spell your name."}
            {status === 'processing' && "Setting up your profile..."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {status === 'idle' && (
          <button 
            onClick={startOnboarding}
            className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-transform active:scale-95"
          >
            Start Voice Setup
          </button>
        )}
        
        {status !== 'idle' && (
           <button onClick={() => { geminiLive.disconnect(); setStatus('idle'); }} className="text-sm text-gray-500 hover:text-white underline">
             Cancel
           </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;