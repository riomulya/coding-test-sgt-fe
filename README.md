This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## With Firebase Authentication

env.local tidak di masukan ke dalam gitignore untuk keperluan testing

## backend error parsing token

pada firebase-client

awal seperti ini

```bash
    async getFirebaseId(authorization: string, namespace = this.webNamespace) {
      try {
        this.initializeFirebaseAdmin();
        return await admin.app(namespace).auth().verifyIdToken(authorization);
      } catch (err) {
        throw new Error(
          'Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token in Authorization.'
        );
      }
    }
```

diganti menjadi seperti ini

```bash
async getFirebaseId(authorization: string, namespace = this.webNamespace) {
try {
this.initializeFirebaseAdmin();

      //  Log untuk debugging (jangan lupa hapus di production)
      console.log(
        'Received authorization header:',
        authorization ? `${authorization.substring(0, 20)}...` : 'null'
      );

      //  Potong prefix 'Bearer ' jika ada
      let token = authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.substring(7);
      }

      console.log(
        'Token after removing Bearer:',
        token ? `${token.substring(0, 20)}...` : 'null'
      );

      if (!token) {
        throw new Error('No token provided');
      }

      const decodedToken = await admin
        .app(namespace)
        .auth()
        .verifyIdToken(token);
      console.log('Token decoded successfully for user:', decodedToken.email);
      return decodedToken;
    } catch (err) {
      console.error('Error verifying ID token:', err);
      throw new Error(
        'Decoding Firebase ID token failed. Make sure you passed the entire string JWT which represents an ID token in Authorization.'
      );
    }

}
```
