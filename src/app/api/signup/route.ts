import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Cek email sudah ada atau belum
    const existingUser = await prisma.users.findFirst({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Simpan user baru
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role_id: 1, // default role
        status: 1, // aktif
      },
    })

    return NextResponse.json({ message: 'Registrasi berhasil', user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Signup Error:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
