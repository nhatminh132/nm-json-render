'use client';

import { useState } from 'react';
import React from 'react';
import { Renderer, StateProvider, ActionProvider } from '@json-render/react';
import { registry } from '@/lib/registry';
import { toast } from 'sonner';
import { ManualRenderer } from '@/components/manual-renderer';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Renderer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">Rendering Error:</p>
          <p className="text-red-600 text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Example JSON specs to demonstrate json-render
const exampleSpecs = [
  {
    name: "Contact Form",
    spec: {
      type: "Card",
      props: {
        title: "Contact Us",
        description: "Fill out the form below to get in touch"
      },
      children: [
        {
          type: "Input",
          props: {
            label: "Name",
            placeholder: "John Doe",
            name: "name"
          }
        },
        {
          type: "Input",
          props: {
            label: "Email",
            placeholder: "john@example.com",
            name: "email"
          }
        },
        {
          type: "Input",
          props: {
            label: "Message",
            placeholder: "Your message here...",
            name: "message"
          }
        },
        {
          type: "Button",
          props: {
            label: "Submit",
            variant: "primary"
          },
          on: {
            press: { action: "submit" }
          }
        }
      ]
    }
  },
  {
    name: "Welcome Card",
    spec: {
      type: "Card",
      props: {
        title: "Welcome to json-render!",
        description: "This UI is generated from JSON"
      },
      children: [
        {
          type: "Text",
          props: {
            content: "json-render allows you to create dynamic, user-generated interfaces from JSON specifications.",
            size: "md"
          }
        },
        {
          type: "Button",
          props: {
            label: "Learn More",
            variant: "outline"
          },
          on: {
            press: { action: "notify" }
          }
        }
      ]
    }
  },
  {
    name: "Settings Panel",
    spec: {
      type: "Card",
      props: {
        title: "Settings",
        description: "Configure your preferences"
      },
      children: [
        {
          type: "Input",
          props: {
            label: "Username",
            placeholder: "Enter username",
            name: "username"
          }
        },
        {
          type: "Input",
          props: {
            label: "API Key",
            placeholder: "Enter your API key",
            name: "apiKey"
          }
        },
        {
          type: "Button",
          props: {
            label: "Save Settings",
            variant: "primary"
          },
          on: {
            press: { action: "submit" }
          }
        },
        {
          type: "Button",
          props: {
            label: "Reset",
            variant: "secondary"
          },
          on: {
            press: { action: "reset" }
          }
        }
      ]
    }
  }
];

export default function PageContent() {
  const [selectedSpec, setSelectedSpec] = useState(0);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleSpecs[0].spec, null, 2));
  const [customSpec, setCustomSpec] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLoadCustomSpec = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setCustomSpec(parsed);
      setError(null);
      toast.success('Custom JSON rendered!');
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      setCustomSpec(null);
      toast.error('Invalid JSON: ' + err.message);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setJsonInput(''); // Clear JSON input for streaming

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate UI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.chunk) {
              // Accumulate chunks for live display
              accumulatedText += data.chunk;
              setJsonInput(accumulatedText);
            }

            if (data.done && data.spec) {
              // Final spec received
              setJsonInput(JSON.stringify(data.spec, null, 2));
              setCustomSpec(data.spec);
              toast.success('UI generated successfully!');
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to generate UI: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleChange = (index) => {
    setSelectedSpec(index);
    setJsonInput(JSON.stringify(exampleSpecs[index].spec, null, 2));
    setCustomSpec(null);
    setError(null);
  };

  const actionHandlers = {
    submit: (state) => {
      console.log('Form submitted with state:', state);
      toast.success('Form submitted successfully!');
    },
    reset: () => {
      toast.info('Form reset');
    },
    notify: () => {
      toast.info('This is powered by Vercel\'s json-render!');
    },
  };

  // Use customSpec if available, otherwise fallback to selected example
  const currentSpec = React.useMemo(() => {
    return customSpec || exampleSpecs[selectedSpec].spec;
  }, [customSpec, selectedSpec]);

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-12">
          <h1 className="text-2xl font-semibold text-white tracking-tight">NHAT MINH JSON RENDER</h1>
        </header>

        {/* AI Prompt Section */}
        <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isGenerating && prompt.trim()) {
                handleGenerateFromPrompt();
              }
            }}
            placeholder="Describe the interface..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerateFromPrompt}
            disabled={isGenerating || !prompt.trim()}
            className="bg-white text-black rounded-full w-8 h-8 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30 flex items-center justify-center flex-shrink-0"
            aria-label="Generate"
          >
            {isGenerating ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: JSON Editor */}
          <div>
            <div className="border border-white/10 bg-black p-6">
              <h2 className="text-xs font-medium text-white/50 mb-4 uppercase tracking-wide">Specification</h2>
              
              <div className="mb-4 flex gap-2 text-xs">
                {exampleSpecs.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleChange(index)}
                    className={`px-3 py-1 transition-colors ${
                      selectedSpec === index && !customSpec
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {example.name}
                  </button>
                ))}
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSON specification..."
                className="mb-4 h-96 w-full bg-black text-white text-xs font-mono outline-none placeholder-white/30 resize-none"
              />
              
              {error && (
                <div className="mb-4 p-3 bg-white/5">
                  <p className="text-xs text-white/70">{error}</p>
                </div>
              )}

              <button
                onClick={handleLoadCustomSpec}
                className="bg-white text-black px-4 py-2 text-xs font-medium transition-opacity hover:opacity-80"
              >
                Render
              </button>
            </div>
          </div>

          {/* Right: Rendered Output */}
          <div>
            <div className="border border-white/10 bg-black p-6">
              <h2 className="text-xs font-medium text-white/50 mb-4 uppercase tracking-wide">Output</h2>
              
              <StateProvider initialState={{ form: {} }}>
                <ManualRenderer 
                  spec={currentSpec} 
                  onAction={(actionName) => {
                    const handler = actionHandlers[actionName];
                    if (handler) {
                      handler();
                    }
                  }}
                />
              </StateProvider>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
