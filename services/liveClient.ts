import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio Context Helpers
let audioContext: AudioContext | null = null;
let inputAudioContext: AudioContext | null = null;
let stream: MediaStream | null = null;
let processor: ScriptProcessorNode | null = null;
let inputSource: MediaStreamAudioSourceNode | null = null;

export interface LiveConfig {
  systemInstruction: string;
  onAudioData: (isPlaying: boolean) => void;
  tools?: any[];
  onToolCall?: (functionCalls: any[]) => void;
}

export class LiveClient {
  private client: GoogleGenAI;
  private modelId = "gemini-2.5-flash-native-audio-preview-09-2025";
  private isConnected = false;
  private currentSession: Promise<any> | null = null;
  
  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(config: LiveConfig) {
    if (this.isConnected) this.disconnect();

    // Initialize Audio Contexts
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
    audioContext = new AudioContextClass({ sampleRate: 24000 });

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Microphone access denied", e);
      throw e;
    }

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const sessionConfig = {
      model: this.modelId,
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          this.isConnected = true;
          this.startInputStreaming();
        },
        onmessage: async (message: LiveServerMessage) => {
           // Handle Audio Output
           const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           
           if (base64Audio && audioContext) {
             config.onAudioData(true);
             const audioBuffer = await this.decodeAudioData(
               this.base64ToBytes(base64Audio),
               audioContext,
               24000,
               1
             );
             
             const source = audioContext.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(audioContext.destination);
             
             nextStartTime = Math.max(nextStartTime, audioContext.currentTime);
             source.start(nextStartTime);
             nextStartTime += audioBuffer.duration;
             
             sources.add(source);
             source.onended = () => {
               sources.delete(source);
               if (sources.size === 0) config.onAudioData(false);
             };
           }

           // Handle Interruptions
           if (message.serverContent?.interrupted) {
             sources.forEach(s => s.stop());
             sources.clear();
             nextStartTime = 0;
             config.onAudioData(false);
           }

           // Handle Tool Calls
           if (message.toolCall && config.onToolCall) {
             config.onToolCall(message.toolCall.functionCalls);
           }
        },
        onclose: () => {
          console.log("Gemini Live Closed");
          this.disconnect();
        },
        onerror: (err: any) => {
          console.error("Gemini Live Error", err);
          this.disconnect();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: config.systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        tools: config.tools,
      }
    };

    this.currentSession = this.client.live.connect(sessionConfig);
  }

  private startInputStreaming() {
    if (!inputAudioContext || !stream || !this.currentSession) return;

    inputSource = inputAudioContext.createMediaStreamSource(stream);
    processor = inputAudioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      this.currentSession!.then((session: any) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    inputSource.connect(processor);
    processor.connect(inputAudioContext.destination);
  }

  disconnect() {
    this.isConnected = false;
    
    if (processor) {
      processor.disconnect();
      processor = null;
    }
    if (inputSource) {
      inputSource.disconnect();
      inputSource = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (inputAudioContext) {
      inputAudioContext.close();
      inputAudioContext = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    
    this.currentSession = null;
  }

  // --- Utils ---

  private createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.bytesToBase64(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private bytesToBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBytes(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const geminiLive = new LiveClient();