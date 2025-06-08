import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Community from '@/models/Community';
import User from '@/models/user';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const communityId = params.id;
    const { userId } = await request.json();

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is already a member
    const isMember = community.members.some(member => 
      member.toString() === userId
    );

    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add user to community members
    community.members.push(userId);
    await community.save();

    // Add community to user's communities
    await User.findByIdAndUpdate(userId, {
      $addToSet: { communities: communityId }
    });

    return NextResponse.json(
      { success: true, message: 'Successfully joined community' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const communityId = params.id;

    const community = await Community.findById(communityId)
      .populate({
        path: 'members',
        select: 'name email _id', // Make sure to include _id
        model: User
      });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Ensure we always return an array, even if members is null/undefined
    const members = Array.isArray(community.members) ? community.members : [];
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching community members:', error);
    return NextResponse.json([], { status: 500 }); // Return empty array on error
  }
}


// Add this to your existing route file
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      await connectMongoDB();
      const communityId = params.id;
      const userId = session.user.id;
  
      // Find the community
      const community = await Community.findById(communityId);
      if (!community) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }
  
      // Check if user is the creator
      if (community.creator.toString() === userId) {
        return NextResponse.json(
          { error: 'Community creator cannot leave the community' },
          { status: 400 }
        );
      }
  
      // Check if user is a member
      const isMember = community.members.some(member => 
        member.toString() === userId
      );
  
      if (!isMember) {
        return NextResponse.json(
          { error: 'User is not a member of this community' },
          { status: 400 }
        );
      }
  
      // Remove user from community members
      community.members = community.members.filter(member => 
        member.toString() !== userId
      );
      await community.save();
  
      // Remove community from user's communities
      await User.findByIdAndUpdate(userId, {
        $pull: { communities: communityId }
      });
  
      return NextResponse.json(
        { success: true, message: 'Successfully left community' },
        { status: 200 }
      );
  
    } catch (error) {
      console.error('Error leaving community:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }