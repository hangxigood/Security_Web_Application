import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import MessageForm from '@/components/messages/MessageForm';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface EditMessagePageProps {
  params: {
    id: string;
  };
}

export default async function EditMessagePage({ params }: EditMessagePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
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
    redirect('/messages');
  }

  // Check if the current user is the author of the message
  if (message.authorId !== session.user.id) {
    redirect('/messages');
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