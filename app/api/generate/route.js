import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
    });

    const systemPrompt = `You are a UI generator that creates JSON specifications for the json-render library.

Available components:
1. Card - Container with title and optional description
   Props: { title: string, description: string | null }
   Can have children

2. Button - Clickable button
   Props: { label: string, variant: "primary" | "secondary" | "outline" | null }
   Events: Can trigger actions via "on: { press: { action: 'actionName' } }"

3. Input - Text input field
   Props: { label: string, placeholder: string | null, name: string }

4. Text - Display text
   Props: { content: string, size: "sm" | "md" | "lg" | null }

Available actions: submit, reset, notify

Rules:
- Always return ONLY valid JSON, no markdown or explanations
- Use proper structure with type, props, and children
- For Card components, use children array for nested components
- For buttons with actions, use the "on" property with press event
- Keep the UI simple and functional
- Use appropriate variants and sizes

Example output:
{
  "type": "Card",
  "props": {
    "title": "Example Form",
    "description": "Fill out the form below"
  },
  "children": [
    {
      "type": "Input",
      "props": {
        "label": "Name",
        "placeholder": "Enter your name",
        "name": "name"
      }
    },
    {
      "type": "Button",
      "props": {
        "label": "Submit",
        "variant": "primary"
      },
      "on": {
        "press": { "action": "submit" }
      }
    }
  ]
}

User prompt: ${prompt}

Generate a JSON spec for the requested UI:`;

    const result = await model.generateContentStream(systemPrompt);

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            
            // Send chunk to client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`));
          }

          // Clean up and send final JSON
          let cleanedText = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          try {
            const jsonSpec = JSON.parse(cleanedText);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, spec: jsonSpec })}\n\n`));
          } catch (parseError) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to parse JSON: ' + parseError.message })}\n\n`));
          }
          
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error generating UI:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate UI: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
