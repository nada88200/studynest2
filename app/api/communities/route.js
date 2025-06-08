//api/communities/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Community from '@/models/Community';
import User from '@/models/user';
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from 'next/server';

// Create a new community
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { name, description, type } = await request.json();

    // Validate input
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Create community
    const newCommunity = new Community({
      name,
      description,
      type,
      creator: session.user.id,
      members: [session.user.id]
    });

    await newCommunity.save();

    // Add community to user's communities
    await User.findByIdAndUpdate(session.user.id, {
      $push: { communities: newCommunity._id }
    });

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}


export async function GET(request) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
  
    try {
      await connectMongoDB();
      
      let query = {};
      
      // Apply search filter if provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Apply type filter if provided
      if (type && type !== 'all') {
        query.type = type;
      }
      
      // Find communities with basic info
      let communities = await Community.find(query)
        .populate('creator', 'name')
        .populate('members', 'name');
      
      // Filter private communities if user is not logged in
      if (!session) {
        communities = communities.filter(c => c.type === 'public');
      } 
      // Filter private communities for logged-in users
      else {
        communities = communities.filter(c => {
          if (c.type === 'public') return true;
          // Check if user is creator or member
          const isCreator = c.creator?._id.toString() === session.user.id;
          const isMember = c.members.some(m => m._id.toString() === session.user.id);
          return isCreator || isMember;
        });
      }
      
      return NextResponse.json(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }