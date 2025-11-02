'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NotificationService } from '@/lib/notifications'
import { Notification } from '@/lib/appwrite'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadUnreadCount()
      
      // Subscribe to real-time updates
      const unsubscribe = NotificationService.subscribeToNotifications(
        user.$id,
        (notification) => {
          // Add new notification to the list
          setNotifications(prev => [notification, ...prev])
          // Increment unread count
          setUnreadCount(prev => prev + 1)
        }
      )
      
      // Poll for updates every 30 seconds (fallback)
      const interval = setInterval(() => {
        loadUnreadCount()
      }, 30000)
      
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
        clearInterval(interval)
      }
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return
    setIsLoading(true)
    const result = await NotificationService.getUserNotifications(user.$id, 20)
    if (result.success && result.data) {
      setNotifications(result.data)
    }
    setIsLoading(false)
  }

  const loadUnreadCount = async () => {
    if (!user) return
    const result = await NotificationService.getUnreadCount(user.$id)
    if (result.success && result.count !== undefined) {
      setUnreadCount(result.count)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId)
    setNotifications(prev =>
      prev.map(n => n.$id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    await NotificationService.markAllAsRead(user.$id)
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.$id)
    }
    
    // Navigate to relevant page
    if (notification.jobId) {
      router.push(`/jobs/${notification.jobId}`)
      setIsOpen(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_job':
        return '🎉'
      case 'deadline_reminder':
        return '⏰'
      case 'placement_update':
        return '🎓'
      case 'application_update':
        return '📝'
      default:
        return '📢'
    }
  }

  if (!user) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-8"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.$id}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm leading-tight">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.$id)
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  router.push('/dashboard')
                  setIsOpen(false)
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
