
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";

import { api } from "./api";

const QUEUE_KEY_PREFIX = "lecturelens:pending-recordings:";
const LECTURES_CACHE_PREFIX = "lecturelens:cached-lectures:";

function getQueueKey(userId) {
  return `${QUEUE_KEY_PREFIX}${userId}`;
}

function getLecturesCacheKey(userId) {
  return `${LECTURES_CACHE_PREFIX}${userId}`;
}

async function readQueue(userId) {
  if (!userId) return [];

  try {
    const stored = await AsyncStorage.getItem(getQueueKey(userId));
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read pending recording queue:", error);
    return [];
  }
}

async function writeQueue(userId, queue) {
  if (!userId) {
    throw new Error("Please sign in before saving recordings.");
  }

  await AsyncStorage.setItem(
    getQueueKey(userId),
    JSON.stringify(queue)
  );
}

export async function getPendingRecordings(userId) {
  return readQueue(userId);
}

export async function getPendingRecordingCount(userId) {
  const queue = await readQueue(userId);
  return queue.length;
}

export async function cacheLectures(userId, lectures) {
  if (!userId || !Array.isArray(lectures)) return;

  await AsyncStorage.setItem(
    getLecturesCacheKey(userId),
    JSON.stringify(lectures)
  );
}

export async function getCachedLectures(userId) {
  if (!userId) return [];

  try {
    const stored = await AsyncStorage.getItem(
      getLecturesCacheKey(userId)
    );

    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read cached lectures:", error);
    return [];
  }
}

export async function saveRecordingToQueue({
  userId,
  lecture,
  audioUri,
  title,
}) {
  if (!userId) {
    throw new Error("Please sign in before saving recordings.");
  }

  if (!lecture?.id) {
    throw new Error("A lecture must be selected for this recording.");
  }

  if (!audioUri) {
    throw new Error("The recording file could not be located.");
  }

  const directory = `${FileSystem.documentDirectory}lecturelens-recordings/`;

  const directoryInfo = await FileSystem.getInfoAsync(directory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });
  }

  const safeExtension =
    audioUri
      .split("?")[0]
      .match(/\.([a-zA-Z0-9]+)$/)?.[1]
      ?.toLowerCase() || "m4a";

  const fileName = `recording-${Date.now()}-${Math.floor(
    Math.random() * 100000
  )}.${safeExtension}`;

  const permanentUri = `${directory}${fileName}`;

  await FileSystem.copyAsync({
    from: audioUri,
    to: permanentUri,
  });

  const queue = await readQueue(userId);

  const pendingItem = {
    id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    userId,
    lectureId: lecture.id,
    lectureTitle: lecture.title || "Lecture",
    moduleName: lecture.moduleName || "",
    title: title?.trim() || "Lecture recording",
    audioUri: permanentUri,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  queue.unshift(pendingItem);
  await writeQueue(userId, queue);

  return pendingItem;
}

export async function uploadPendingRecordings(userId) {
  if (!userId) {
    return {
      uploaded: 0,
      remaining: 0,
      message: "Please sign in first.",
    };
  }

  const networkState = await Network.getNetworkStateAsync();

  if (
    networkState.isConnected === false ||
    networkState.isInternetReachable === false
  ) {
    const queue = await readQueue(userId);

    return {
      uploaded: 0,
      remaining: queue.length,
      message: "No internet connection.",
    };
  }

  const queue = await readQueue(userId);

  if (queue.length === 0) {
    return {
      uploaded: 0,
      remaining: 0,
      message: "There are no pending recordings.",
    };
  }

  let uploaded = 0;
  const remainingItems = [];

  for (const item of queue) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(item.audioUri);

      if (!fileInfo.exists) {
        console.warn(
          "Pending recording file was not found:",
          item.audioUri
        );

        remainingItems.push(item);
        continue;
      }

      await api.uploadRecording(
        item.lectureId,
        item.audioUri,
        item.title
      );

      uploaded += 1;

      // Keep the local audio file as a backup after upload.
    } catch (error) {
      console.warn(
        `Could not upload pending recording ${item.id}:`,
        error?.message || error
      );

      remainingItems.push({
        ...item,
        status: "pending",
        lastError: error?.message || "Upload failed",
      });
    }
  }

  await writeQueue(userId, remainingItems);

  return {
    uploaded,
    remaining: remainingItems.length,
    message:
      remainingItems.length === 0
        ? "All pending recordings were uploaded."
        : "Some recordings are still waiting to upload.",
  };
}
