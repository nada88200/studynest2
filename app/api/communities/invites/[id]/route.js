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

    console.log('All params received:', params);
    console.log('Route params:', request.nextUrl.searchParams);
    
    const inviteId = params.inviteId || params.id;
    console.log("Received inviteId:", inviteId); 

    // Validate inviteId format
    if (!Types.ObjectId.isValid(inviteId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID format' },
        { status: 400 }
      );
    }

    // Find community with this pending invite
    const community = await Community.findOne({
      'pendingInvites._id': new Types.ObjectId(inviteId),
      'pendingInvites.user': new Types.ObjectId(session.user.id),
      'pendingInvites.status': 'pending'
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Invitation not found, expired, or already processed' },
        { status: 404 }
      );
    }

    // Get the specific invite
    const invite = community.pendingInvites.id(inviteId);
    if (!invite) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Convert user IDs to strings for comparison
    const userIdStr = session.user.id.toString();
    const memberIds = community.members.map(m => m.toString());

    // Add user to members if not already
    if (!memberIds.includes(userIdStr)) {
      community.members.push(new Types.ObjectId(session.user.id));
    }

    // Update invite status
    invite.status = 'accepted';
    await community.save();

    // Add community to user's communities list
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { communities: community._id }
    });

    // Create notification for inviter
    const inviterNotification = new Notification({
      recipientId: invite.invitedBy,
      senderId: session.user.id,
      type: 'community_invite_response',
      message: `${session.user.name} has accepted your invitation to join "${community.name}"`,
      metadata: {
        communityId: community._id,
        action: 'accepted'
      }
    });
    await inviterNotification.save();

    return NextResponse.json({ 
      success: true,
      communityId: community._id,
      message: 'Successfully joined the community'
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const inviteId = params.inviteId;

    // Find the community with this pending invite
    const community = await Community.findOne({
      'pendingInvites._id': new Types.ObjectId(inviteId),
      'pendingInvites.user': new Types.ObjectId(session.user.id)
    });

    if (!community) {
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 });
    }

    // Find the specific invite
    const invite = community.pendingInvites.id(inviteId);
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation not found or already processed' }, { status: 400 });
    }

    // Update invite status to rejected
    invite.status = 'rejected';
    await community.save();

    // Create notification for the inviter
    const inviterNotification = new Notification({
      recipientId: invite.invitedBy,
      senderId: session.user.id,
      type: 'community_invite_response',
      communityId: community._id,
      message: `${session.user.name} has declined your invitation to join "${community.name}"`,
      metadata: {
        communityId: community._id,
        userId: session.user.id,
        action: 'rejected'
      }
    });
    await inviterNotification.save();

    return NextResponse.json({ 
      success: true,
      message: 'Invitation declined' 
    });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject invitation' },
      { status: 500 }
    );
  }
}