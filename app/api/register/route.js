import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();


    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (name.length > 30) {
      return NextResponse.json({ message: "Full name must be 50 characters or less" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }
    if (password.length < 6 || !/[a-zA-Z]/.test(password)) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters and include at least one letter" },
        { status: 400 }
      );
    }
    

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