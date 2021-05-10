import Notification from 'App/Models/Notification'

export async function attemptNotificationRemoval(notificationId: number): Promise<void> {
    const notification = await Notification.findBy('id', notificationId)

    if (!notification) {
        return
    }

    await notification.delete()
}
