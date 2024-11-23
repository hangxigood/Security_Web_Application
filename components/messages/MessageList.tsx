'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MessageSigner } from '@/lib/messageSigner';

interface Message {
  id: string;
  content: string;
  signature: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

export default function MessageList() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      
      // Remove message from state
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete message');
    }
  };

  const verifyMessageSignature = (message: Message): boolean => {
    try {
      return MessageSigner.verifySignature(message.content, message.signature);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {messages.map((message) => {
        const isValidSignature = verifyMessageSignature(message);
        
        return (
          <div
            key={message.id}
            className={`p-4 rounded-lg shadow ${
              isValidSignature ? 'bg-white' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-600 mb-2">
                  Posted by {message.author.username}
                </p>
                <p className="text-gray-900">{message.content}</p>
                {!isValidSignature && (
                  <div className="mt-2 flex items-center text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <span>Warning: Message integrity cannot be verified</span>
                  </div>
                )}
              </div>
              
              {session?.user?.id === message.authorId && (
                <div className="flex space-x-2">
                  <Link
                    href={`/messages/${message.id}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}