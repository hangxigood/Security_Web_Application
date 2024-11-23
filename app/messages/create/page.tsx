'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MessageForm from '@/components/messages/MessageForm';

export default function CreateMessagePage() {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Message</h1>
        <MessageForm />
      </div>
    </div>
  );
}