'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useEffect } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    onFinish: (message) => {
      // Save to localStorage whenever a message is completed
      localStorage.setItem('chatMessages', JSON.stringify([...messages, message]));
    },
  });

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        localStorage.removeItem('chatMessages');
      }
    }
  }, [setMessages]);

  // Custom submit handler to save messages
  const handleSubmitWithSave = async (e) => {
    e.preventDefault();
    const currentMessages = [...messages, { id: Date.now(), role: 'user', content: input }];
    localStorage.setItem('chatMessages', JSON.stringify(currentMessages));
    handleSubmit(e);
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <div className="flex flex-col w-full h-[600px] relative">
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="text-muted-foreground hover:text-foreground"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto mb-16 space-y-4 p-4">
        {messages.map(m => (
          <div key={m.id} className="flex flex-col space-y-1 border border-gray-300 rounded-lg p-4">
            <div className="font-bold text-sm text-muted-foreground">
              {m.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmitWithSave} className="absolute bottom-0 left-0 right-0 p-4">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl bg-background"
          value={input}
          placeholder="Ask a question..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}