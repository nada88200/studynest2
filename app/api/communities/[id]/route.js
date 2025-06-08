// app/api/communities/[id]/invite/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Community from '@/models/Community';
import User from '@/models/user';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';


export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      await connectMongoDB();
      const communityId = params.id;
  
      // Find the community
      const community = await Community.findById(communityId);
      if (!community) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
      }
  
      // Check if user is the creator
      if (community.creator.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the community creator can delete it' },
          { status: 403 }
        );
      }
  
      // Delete the community
      await Community.findByIdAndDelete(communityId);
  
      // Remove community from all members' communities lists
      await User.updateMany(
        { communities: communityId },
        { $pull: { communities: communityId } }
      );
  
      return NextResponse.json(
        { success: true, message: 'Community deleted successfully' },
        { status: 200 }
      );
  
    } catch (error) {
      console.error('Error deleting community:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }