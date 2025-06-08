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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      await connectMongoDB();
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const type = searchParams.get('type');
  
      let query = {};
  
      // Apply filters if provided
      if (search) {
        query.$text = { $search: search };
      }
      if (type) {
        query.type = type;
      }
  
      // For non-admins, filter private communities they don't belong to
      const user = await User.findById(session.user.id);
      if (!user.role === 'admin') {
        query.$or = [
          { type: 'public' },
          { 
            type: 'private',
            $or: [
              { creator: session.user.id },
              { members: session.user.id }
            ]
          }
        ];
      }
  
      const communities = await Community.find(query)
        .populate('creator', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 });
  
      return NextResponse.json(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch communities' },
        { status: 500 }
      );
    }
  }