//api/register/route.js
import  connectMongoDB  from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";




export async function POST(req) {
  const session = await getServerSession(authOptions);
  try {
    const { name, email, password } = await req.json();


    

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();
    const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
            { message: "Email already in use." },
            { status: 409 }
        );
    }
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

