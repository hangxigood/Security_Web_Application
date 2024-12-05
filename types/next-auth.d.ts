import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    username: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    username: string;
  }
}