'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  messageId?: string;
  initialContent?: string;
  isEditing?: boolean;
}

export default function MessageForm({ messageId, initialContent = '', isEditing = false }: MessageFormProps) {
  const [error, setError] = useState<string>('');
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const onSubmit = async (data: MessageFormData) => {
    try {
      const url = isEditing ? `/api/messages/${messageId}` : '/api/messages';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save message');
      }

      router.push('/messages');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save message');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-300">
          Message
        </label>
        <textarea
          {...register('content')}
          rows={4}
          className="mt-1 p-2 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Write your message here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : isEditing ? 'Update Message' : 'Post Message'}
      </button>
    </form>
  );
}