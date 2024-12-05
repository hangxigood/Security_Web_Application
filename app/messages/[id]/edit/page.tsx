/**
 * @fileoverview Edit message page component that allows users to modify their messages.
 * Handles authentication, message ownership verification, and editing functionality.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import MessageForm from '@/components/messages/MessageForm';
import { authOptions } from '../../../../lib/auth';

/** Props for the EditMessagePage component */
interface EditMessagePageProps {
  /** URL parameters */
  params: {
    /** ID of the message to edit */
    id: string;
  };
}

/**
 * Edit message page component that allows users to modify their existing messages.
 * Features include:
 * - Authentication check
 * - Message ownership verification
 * - Message editing form
 * 
 * @param props - Component props
 * @param props.params - URL parameters containing message ID
 * @returns The edit message page component
 */
export default async function EditMessagePage({ params }: EditMessagePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/login');
  }

  const message = await prisma.message.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      content: true,
      authorId: true,
    },
  });

  if (!message) {
    return redirect('/messages');
  }

  // Check if the current user is the author of the message
  if (message.authorId !== session.user.id) {
    return redirect('/messages');
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Message</h1>
      <MessageForm 
        messageId={message.id} 
        initialContent={message.content} 
        isEditing={true} 
      />
    </div>
  );
}