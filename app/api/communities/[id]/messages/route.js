import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Community from '@/models/Community';
import CommunityMessage from '@/models/CommunityMessage';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

// Get all messages for a community
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const community = await Community.findById(params.id);

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is a member (for private communities)
    if (community.type === 'private' && !community.members.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not a member of this private community' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = parseInt(searchParams.get('skip')) || 0;

    const messages = await CommunityMessage.find({ community: params.id })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Create a new message in community
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const community = await Community.findById(params.id);

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is a member (for private communities)
    if (community.type === 'private' && !community.members.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not a member of this private community' }, { status: 403 });
    }

    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const newMessage = new CommunityMessage({
      community: params.id,
      sender: session.user.id,
      text: text.trim()
    });

    await newMessage.save();

    // Populate sender info before returning
    await newMessage.populate('sender', 'name email');

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}