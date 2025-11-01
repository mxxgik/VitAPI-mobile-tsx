import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_STORAGE_KEY = 'scheduled_notifications';

export interface ScheduledNotification {
  id: string;
  appointmentId: number;
  triggerTime: Date;
  doctorName: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleAppointmentNotification = async (
  appointmentId: number,
  appointmentDateTime: string,
  doctorName: string
): Promise<void> => {
  try {
    const appointmentTime = new Date(appointmentDateTime);
    const notificationTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000); // 30 minutes before

    // Don't schedule if the notification time is in the past
    if (notificationTime <= new Date()) {
      return;
    }

    // Cancel any existing notification for this appointment
    await cancelAppointmentNotification(appointmentId);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Appointment Reminder',
        body: `Appointment with ${doctorName} in 30 minutes`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
      },
    });

    // Store the scheduled notification info
    const scheduledNotification: ScheduledNotification = {
      id: notificationId,
      appointmentId,
      triggerTime: notificationTime,
      doctorName,
    };

    await storeScheduledNotification(scheduledNotification);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelAppointmentNotification = async (appointmentId: number): Promise<void> => {
  try {
    const scheduledNotifications = await getScheduledNotifications();
    const notificationToCancel = scheduledNotifications.find(n => n.appointmentId === appointmentId);

    if (notificationToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notificationToCancel.id);
      await removeScheduledNotification(appointmentId);
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllAppointmentNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

const storeScheduledNotification = async (notification: ScheduledNotification): Promise<void> => {
  try {
    const stored = await getScheduledNotifications();
    stored.push(notification);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error storing notification:', error);
  }
};

const removeScheduledNotification = async (appointmentId: number): Promise<void> => {
  try {
    const stored = await getScheduledNotifications();
    const filtered = stored.filter(n => n.appointmentId !== appointmentId);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing notification:', error);
  }
};

const getScheduledNotifications = async (): Promise<ScheduledNotification[]> => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const initializeNotifications = async (): Promise<void> => {
  await requestPermissions();
};