'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
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
      setError('Failed to delete message');
      console.error('Error:', error);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-white p-4 rounded-lg shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-900">{message.content}</p>
              <p className="text-sm text-gray-500">
                Posted by {message.author.username} on{' '}
                {new Date(message.createdAt).toLocaleDateString()}
              </p>
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
      ))}
    </div>
  );
}