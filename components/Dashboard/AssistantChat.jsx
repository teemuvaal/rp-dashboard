'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useEffect } from 'react';
import { Eraser, NotebookPen, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import { createNote } from '@/app/dashboard/actions';
import { createAsset } from '@/app/dashboard/actions';
import { Textarea } from '@/components/ui/textarea';

export default function Chat({ campaignId }) {
  const router = useRouter();
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

  // Save single message as note
  const handleSaveMessageAsNote = async (message) => {
    const formData = new FormData();
    formData.append('campaignId', campaignId);
    formData.append('title', `AI Assistant ${message.role === 'assistant' ? 'Response' : 'Question'}`);
    formData.append('content', message.content);
    
    const result = await createNote(formData);
    if (result.success) {
      router.push(`/dashboard/${campaignId}/notes/${result.noteId}`);
    }
  };

  // Save single message as asset
  const handleSaveMessageAsAsset = async (message) => {
    const formData = new FormData();
    formData.append('campaignId', campaignId);
    formData.append('title', `AI Assistant ${message.role === 'assistant' ? 'Response' : 'Question'}`);
    formData.append('content', message.content);
    formData.append('type', 'text');
    formData.append('isPublic', 'false');
    
    const result = await createAsset(formData);
    if (result.success) {
      router.push(`/dashboard/${campaignId}/assets`);
    }
  };

  return (
    <div className="flex flex-col w-full h-[600px] relative">
      <div className="flex justify-end items-center gap-2 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-y-auto mb-16 space-y-4 p-4">
        {messages.map(m => (
          <div key={m.id} className="flex flex-col space-y-1 border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="font-bold text-sm text-muted-foreground">
                {m.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveMessageAsNote(m)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <NotebookPen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save as note</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveMessageAsAsset(m)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Library className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save as asset</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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

      <form onSubmit={handleSubmitWithSave} className="absolute bottom-0 left-0 right-0 p-4 gap-2">
        <Textarea
          className="w-full p-2 border border-gray-300 rounded shadow-xl bg-background"
          value={input}
          placeholder="Ask a question..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}