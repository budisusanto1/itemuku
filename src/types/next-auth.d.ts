import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      image?: string | null; // jika kamu pakai image juga
      roleId?: string | null;
      roleName?: string | null;
      token?: string | null;
      status?: string; // dibuat opsional
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    image?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    token?: string | null;
    status?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    image?: string | null;
    roleId?: string | null;
    roleName?: string | null;
    token?: string | null;
    status?: string;
  }
}
