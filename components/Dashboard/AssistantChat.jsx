'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef } from 'react';
import { Eraser, NotebookPen, Library, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import { createNote, createAsset } from '@/app/dashboard/actions';
import { Textarea } from '@/components/ui/textarea';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Chat({ campaignId }) {
  const router = useRouter();
  const { toast } = useToast();
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // Save to localStorage whenever a message is completed
      localStorage.setItem('chatMessages', JSON.stringify([...messages, message]));
    },
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load saved messages from localStorage on mount
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitWithSave = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    handleSubmit(e);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  const saveAsNote = async (message) => {
    try {
      const formData = new FormData();
      formData.append('campaignId', campaignId);
      formData.append('title', `AI Assistant ${message.role === 'assistant' ? 'Response' : 'Question'}`);
      formData.append('content', message.content);
      
      const result = await createNote(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Saved as note successfully",
        });
        router.push(`/dashboard/${campaignId}/notes/${result.noteId}`);
      } else {
        throw new Error(result.error || 'Failed to save note');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const saveAsAsset = async (message) => {
    try {
      const formData = new FormData();
      formData.append('campaignId', campaignId);
      formData.append('title', `AI Assistant ${message.role === 'assistant' ? 'Response' : 'Question'}`);
      formData.append('content', message.content);
      formData.append('type', 'text');
      formData.append('isPublic', 'false');
      
      const result = await createAsset(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Saved as asset successfully",
        });
        router.push(`/dashboard/${campaignId}/assets`);
      } else {
        throw new Error(result.error || 'Failed to save asset');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%] relative group",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.role === 'assistant' && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => saveAsNote(message)}
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
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => saveAsAsset(message)}
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
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        <form onSubmit={handleSubmitWithSave} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="min-h-[60px] flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitWithSave(e);
              }
            }}
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}