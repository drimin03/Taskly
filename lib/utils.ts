import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleanup old messages from all chat rooms
 * @param db - Firestore database instance
 * @param days - Number of days to keep messages (default: 30)
 */
export async function cleanupOldMessages(db: any, days: number = 30) {
  try {
    // Import Firebase functions here to avoid issues with server-side rendering
    const { collection, query, where, getDocs, deleteDoc, Timestamp } = await import('firebase/firestore');
    
    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // Get all rooms
    const roomsQuery = query(collection(db, 'rooms'))
    const roomsSnapshot = await getDocs(roomsQuery)
    
    let deletedCount = 0
    
    // For each room, find and delete old messages
    for (const roomDoc of roomsSnapshot.docs) {
      const roomId = roomDoc.id
      
      // Query for old messages in this room
      const messagesQuery = query(
        collection(db, 'rooms', roomId, 'messages'),
        where('createdAt', '<', Timestamp.fromDate(cutoffDate))
      )
      
      const messagesSnapshot = await getDocs(messagesQuery)
      
      // Delete each old message
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref)
        deletedCount++
      }
    }
    
    console.log(`Deleted ${deletedCount} messages older than ${days} days`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up old messages:', error)
    throw error
  }
}