
import { SchemaData } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockSchema: SchemaData = {
  columns: [
    { name: 'timestamp', type: 'datetime', values: [] },
    { name: 'log_level', type: 'category', values: ['INFO', 'WARN', 'ERROR', 'DEBUG', 'FATAL'] },
    { name: 'source_ip', type: 'string', values: ['192.168.1.10', '10.0.0.5', '172.16.3.100'] },
    { name: 'user_id', type: 'string', values: ['user-123', 'user-456', 'user-789'] },
    { name: 'event_message', type: 'string', values: [] },
    { name: 'response_time_ms', type: 'number', values: [] },
    { name: 'status_code', type: 'number', values: ['200', '404', '500', '401', '403'] },
  ],
};

/**
 * Simulates connecting to a Splunk instance.
 * @returns A promise that resolves with the data schema.
 */
export const connectToSplunk = async (): Promise<SchemaData> => {
  await delay(3500); // Simulate the time it takes to connect
  if (Math.random() < 0.05) { // 5% chance of failure
    throw new Error("Failed to connect to Splunk DB");
  }
  return mockSchema;
};

/**
 * Simulates generating a response from the AI agent.
 * @param prompt The user's input text.
 * @returns A promise that resolves with the bot's response, which may include text and an image URL.
 */
export const generateResponse = async (prompt: string): Promise<{ text?: string; imageUrl?: string }> => {
  await delay(1500 + Math.random() * 1000);

  const lowerCasePrompt = prompt.toLowerCase();

  if (lowerCasePrompt.includes('error count') || lowerCasePrompt.includes('errors over time')) {
    return {
      text: 'Here is a chart showing the count of errors over the last 24 hours.',
      imageUrl: 'https://picsum.photos/seed/errors/800/400', // Placeholder chart image
    };
  }

  if (lowerCasePrompt.includes('ip addresses') || lowerCasePrompt.includes('top sources')) {
    return {
      text: 'This dashboard shows the top 10 source IP addresses by log volume.',
      imageUrl: 'https://picsum.photos/seed/ips/800/600', // Placeholder dashboard image
    };
  }
  
  if (lowerCasePrompt.includes('response time') || lowerCasePrompt.includes('latency')) {
     return {
      text: 'This graph illustrates the P95 response time for critical services.',
      imageUrl: 'https://picsum.photos/seed/latency/800/450', // Placeholder latency graph
    };
  }

  if (lowerCasePrompt.includes('show') && (lowerCasePrompt.includes('graph') || lowerCasePrompt.includes('dashboard') || lowerCasePrompt.includes('chart'))) {
    return {
      text: 'Certainly, here is the visualization you requested.',
      imageUrl: `https://picsum.photos/seed/${Date.now()}/800/500`,
    };
  }
  
  return {
    text: `I've analyzed the request: "${prompt}".\n\nBased on the logs, I found that the average response time is currently 250ms, with a peak of 800ms during high traffic hours. There are no critical errors reported in the last hour.`,
  };
};
