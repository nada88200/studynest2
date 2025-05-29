import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Community from '@/models/Community';
import User from '@/models/User';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

// Invite a user to a private community
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { userId } = await request.json();
    const community = await Community.findById(params.id);

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is creator or moderator
    const isCreator = community.creator.toString() === session.user.id;
    const isModerator = community.moderators.some(m => m.toString() === session.user.id);
    
    if (!isCreator && !isModerator) {
      return NextResponse.json(
        { error: 'Not authorized to invite to this community' },
        { status: 403 }
      );
    }

    // Check if community is private
    if (community.type !== 'private') {
      return NextResponse.json(
        { error: 'Invites are only for private communities' },
        { status: 400 }
      );
    }

    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return NextResponse.json(
        { error: 'User is already a member of this community' },
        { status: 400 }
      );
    }

    // Check if user already has an invite
    const existingInvite = userToInvite.communityInvites.find(
      invite => invite.community.toString() === params.id
    );

    if (existingInvite) {
      return NextResponse.json(
        { error: 'User already has an invite to this community' },
        { status: 400 }
      );
    }

    // Add invite to user
    userToInvite.communityInvites.push({
      community: community._id,
      inviter: session.user.id,
      status: 'pending'
    });

    await userToInvite.save();

    return NextResponse.json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}