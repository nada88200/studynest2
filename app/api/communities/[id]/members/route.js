import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Community from '@/models/Community';
import User from '@/models/User';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

// Join a public community or accept invite to private community
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

    const user = await User.findById(session.user.id);

    // Check if already a member
    if (community.members.includes(session.user.id)) {
      return NextResponse.json({ error: 'Already a member of this community' }, { status: 400 });
    }

    // For private communities, check if user has an invite
    if (community.type === 'private') {
      const hasInvite = user.communityInvites?.some(
        invite => invite.community.toString() === params.id && invite.status === 'pending'
      );
      
      if (!hasInvite) {
        return NextResponse.json(
          { error: 'Invitation required to join private community' },
          { status: 403 }
        );
      }
    }

    // Add user to community members
    community.members.push(session.user.id);
    await community.save();

    // Initialize communities array if it doesn't exist
    if (!user.communities) {
      user.communities = [];
    }

    // Add community to user's communities
    user.communities.push(community._id);
    
    // Update invite status if it was a private community
    if (community.type === 'private') {
      // Initialize communityInvites array if it doesn't exist
      if (!user.communityInvites) {
        user.communityInvites = [];
      }

      const inviteIndex = user.communityInvites.findIndex(
        invite => invite.community.toString() === params.id
      );
      if (inviteIndex !== -1) {
        user.communityInvites[inviteIndex].status = 'accepted';
      }
    }
    
    await user.save();

    return NextResponse.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: 'Failed to join community' },
      { status: 500 }
    );
  }
}

// Leave a community
export async function DELETE(request, { params }) {
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

    // Check if user is a member
    if (!community.members.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not a member of this community' }, { status: 400 });
    }

    // Remove user from community members (unless they're the creator)
    if (community.creator.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Community creator cannot leave. Transfer ownership or delete community.' },
        { status: 403 }
      );
    }

    community.members = community.members.filter(
      memberId => memberId.toString() !== session.user.id
    );
    await community.save();

    // Remove community from user's communities
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { communities: community._id }
    });

    return NextResponse.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { error: 'Failed to leave community' },
      { status: 500 }
    );
  }
}