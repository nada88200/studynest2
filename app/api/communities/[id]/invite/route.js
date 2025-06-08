// app/api/communities/[id]/invite/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Community from '@/models/Community';
import User from '@/models/user';
import Notification from '@/models/Notification';
import { Types } from 'mongoose';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { email } = await request.json();
    const communityId = params.id;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Find community with proper population
    const community = await Community.findById(communityId)
      .populate('creator', '_id')
      .populate('members', '_id');

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check permissions safely
    const isCreator = community.creator?._id?.toString() === session.user.id;
    const isModerator = community.moderators?.some(mod => 
      mod?.toString() === session.user.id
    ) || false;
    
    if (!isCreator && !isModerator) {
      return NextResponse.json(
        { error: 'Only owners and moderators can invite' },
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

    // Find user to invite
    const userToInvite = await User.findOne({ email }).select('_id');
    if (!userToInvite) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check membership safely
    const isMember = community.members?.some(member => 
      member?._id?.toString() === userToInvite._id.toString()
    ) || false;

    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Initialize pendingInvites if needed
    if (!community.pendingInvites) {
      community.pendingInvites = [];
    }

    // Check for existing invite safely
    const existingInvite = community.pendingInvites.find(invite => 
      invite?.user?.toString() === userToInvite._id.toString() && 
      invite?.status === 'pending'
    );

    if (existingInvite) {
      return NextResponse.json(
        { error: 'User already has a pending invite' },
        { status: 400 }
      );
    }

    // Create new invite
    const newInvite = {
        user: userToInvite._id,
        invitedBy: session.user.id,
        status: 'pending',
        createdAt: new Date()
      };
      
      community.pendingInvites.push(newInvite);
      await community.save();

      const savedCommunity = await Community.findById(community._id);
const createdInvite = savedCommunity.pendingInvites.find(
  inv => inv.user.toString() === userToInvite._id.toString() && 
        inv.status === 'pending'
);
      
      // Create notification with inviteId in metadata
      const notification = new Notification({
        recipientId: userToInvite._id,
        senderId: session.user.id,
        type: 'community_invite',
        message: `You've been invited to join "${community.name}"`,
        metadata: {
          communityId: community._id.toString(),
          inviteId: createdInvite._id.toString(),
          inviterId: session.user.id
        }
      });
      await notification.save();

    return NextResponse.json({ 
      success: true,
      message: 'Invitation sent successfully',
      inviteId: newInvite._id
    });

  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}