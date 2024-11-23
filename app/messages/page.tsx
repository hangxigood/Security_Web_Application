'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error:', error);
    }
  };

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="space-x-4">
          <Link
            href="/messages/create"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Message
          </Link>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Log Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-800">{message.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  By {message.author.username} on{' '}
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
              </div>
              {session?.user?.name === message.author.username && (
                <div className="space-x-2">
                  <Link
                    href={`/messages/${message.id}/edit`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this message?')) {
                        try {
                          const response = await fetch(`/api/messages/${message.id}`, {
                            method: 'DELETE',
                          });
                          if (!response.ok) {
                            throw new Error('Failed to delete message');
                          }
                          fetchMessages();
                        } catch (error) {
                          setError('Failed to delete message');
                          console.error('Error:', error);
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}