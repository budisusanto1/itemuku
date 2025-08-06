// app/api/users/route.ts
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.users.create({
      data: {
        name: body.name,
        email: body.email,
        avatar: body.avatar || '',
        password_hash: hashedPassword,
      },
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.users.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
