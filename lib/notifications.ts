import { databases, config, ID, Query, Notification } from './appwrite'

export class NotificationService {
  /**
   * Create a notification for a single user
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'new_job' | 'deadline_reminder' | 'placement_update' | 'application_update',
    jobId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const notification = await databases.createDocument(
        config.databaseId,
        config.collections.notifications,
        ID.unique(),
        {
          userId,
          title,
          message,
          type,
          jobId: jobId || null,
          read: false,
          createdAt: new Date().toISOString(),
        }
      )
      return { success: true, data: notification }
    } catch (error: any) {
      console.error('Create notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user notifications (paginated)
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    try {
      const notifications = await databases.listDocuments(
        config.databaseId,
        config.collections.notifications,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      )
      return { success: true, data: notifications.documents as unknown as Notification[] }
    } catch (error: any) {
      console.error('Get notifications error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const notifications = await databases.listDocuments(
        config.databaseId,
        config.collections.notifications,
        [
          Query.equal('userId', userId),
          Query.equal('read', false),
          Query.limit(100)
        ]
      )
      return { success: true, count: notifications.total }
    } catch (error: any) {
      console.error('Get unread count error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const notification = await databases.updateDocument(
        config.databaseId,
        config.collections.notifications,
        notificationId,
        {
          read: true,
          readAt: new Date().toISOString()
        }
      )
      return { success: true, data: notification }
    } catch (error: any) {
      console.error('Mark as read error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const notifications = await databases.listDocuments(
        config.databaseId,
        config.collections.notifications,
        [
          Query.equal('userId', userId),
          Query.equal('read', false),
          Query.limit(100)
        ]
      )

      const updatePromises = notifications.documents.map(notification =>
        databases.updateDocument(
          config.databaseId,
          config.collections.notifications,
          notification.$id,
          {
            read: true,
            readAt: new Date().toISOString()
          }
        )
      )

      await Promise.all(updatePromises)
      return { success: true }
    } catch (error: any) {
      console.error('Mark all as read error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.collections.notifications,
        notificationId
      )
      return { success: true }
    } catch (error: any) {
      console.error('Delete notification error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    const unsubscribe = databases.client.subscribe(
      `databases.${config.databaseId}.collections.${config.collections.notifications}.documents`,
      (response: any) => {
        // Check if this notification is for the current user
        if (response.payload.userId === userId) {
          callback(response.payload as Notification)
        }
      }
    )
    return unsubscribe
  }
}
