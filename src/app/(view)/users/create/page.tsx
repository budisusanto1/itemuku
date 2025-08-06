'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, avatar, password }),
    });

    if (response.ok) {
      router.push('/users');
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to create user');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 rounded-xl shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full mt-1 border border-gray-300 px-4 py-2 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full mt-1 border border-gray-300 px-4 py-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            type="text"
            className="w-full mt-1 border border-gray-300 px-4 py-2 rounded-md"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full mt-1 border border-gray-300 px-4 py-2 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
