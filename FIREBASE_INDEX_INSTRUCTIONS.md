c# Firebase Index Creation Instructions

## Issue
The chat functionality requires a composite index in Firestore to efficiently query unread messages. The error you're seeing is:

```
Error fetching messages for room: room_[ID]_[ID] FirebaseError: The query requires an index.
```

## Solution
You need to create a composite index in your Firebase Firestore database.

### Steps to Create the Index

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project "to-do-6b35f"
3. Navigate to Firestore Database → Indexes tab
4. Click on "Create index" or use the provided link in the error message:
   https://console.firebase.google.com/v1/r/project/to-do-6b35f/firestore/indexes?create_composite=Ckxwcm9qZWN0cy90by1kby02YjM1Zi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbWVzc2FnZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

### Manual Index Creation
If the link doesn't work, create the index manually:

1. In the Firebase Console, go to Firestore Database → Indexes tab
2. Click "Create index"
3. Select "Collection" and enter: `rooms/{roomId}/messages` (use the path notation)
4. Select "Composite" as the index type
5. Add the following fields:
   - Field path: `userId` | Query scope: Ascending
   - Field path: `createdAt` | Query scope: Descending
6. Set the query scope to "Collection"
7. Click "Create"

### Alternative Solution
If you prefer not to create the index, you can modify the query in `hooks/use-unread-messages.ts` to remove the orderBy clause, but this will make the query less efficient.

The index creation is a one-time setup and may take a few minutes to complete. Once created, the error will disappear and the chat functionality will work properly.