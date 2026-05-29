import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { companyName, role, primaryTradelane } = await request.json();
    
    // In the latest Clerk SDK versions, clerkClient() returns a promise 
    // that resolves to the client instance, or requires awaiting the client execution.
    const client = await clerkClient();

    // Attach custom data to publicMetadata, and flag onboardingComplete as true
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        companyName,
        role,
        primaryTradelane,
      },
    });

    return NextResponse.json({ message: 'Onboarding completed successfully' }, { status: 200 });
  } catch (error) {
    // This will now print the exact SDK mismatch error in your terminal if it fails
    console.error('Clerk metadata update failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}