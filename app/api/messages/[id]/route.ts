import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/db';
import { authOptions } from '../../../../lib/auth';
import { MessageSigner } from '@/lib/messageSigner';

// Input validation schema
const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long')
});

// Helper function to check message ownership
async function checkMessageOwnership(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { authorId: true }
  });

  if (!message) {
    return { error: 'Message not found', status: 404 };
  }

  if (message.authorId !== userId) {
    return { error: 'Unauthorized', status: 403 };
  }

  return { message };
}

// GET single message
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// PUT/UPDATE message
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = messageSchema.parse(data);
    
    // Generate signature for the message content
    const signature = MessageSigner.signMessage(validatedData.content);

    // Check message ownership
    const { error, status } = await checkMessageOwnership(params.id, session.user.id);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const message = await prisma.message.update({
      where: { id: params.id },
      data: {
        content: validatedData.content,
        signature
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE message
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate ownership
    const ownershipCheck = await checkMessageOwnership(params.id, session.user.id);
    if ('error' in ownershipCheck) {
      return NextResponse.json(
        { error: ownershipCheck.error },
        { status: ownershipCheck.status }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Message deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}