// lib/auth.ts
import { BASE_URL } from '../../indices/urls';

export async function sendUserIdToBackend(userId = "") {
  
  if (!userId) {
    throw new Error('User is not authenticated');
  }

  const response = await fetch(`${BASE_URL}/api/v1/clerk-exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clerk_id: userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send user ID to backend');
  }

  return await response.json();
}