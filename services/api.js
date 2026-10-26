
const API_BASE_URL = "http://192.168.43.158:5000";

// Clerk token getter will be registered by the authenticated app setup.
let authTokenGetter = null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

async function request(path, options = {}) {
  let response;

  try {
    const token = authTokenGetter
      ? await authTokenGetter()
      : null;
    
    console.log("[LectureLens Auth Debug]", {
      path,
      getterRegistered: typeof authTokenGetter === "function",
      tokenReceived: Boolean(token),
    });

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Attach a Clerk token only when one is available.
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Cannot reach LectureLens backend at ${API_BASE_URL}. ` +
      "Check that the server is running and your phone and computer " +
      "are connected to the same network."
    );
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
  console.log("[LectureLens API Error]", {
    path,
    status: response.status,
    message: data?.message,
  });

  throw new Error(
    data?.message || `Request failed with status ${response.status}`
  );
}

  return data;
}


async function uploadRecording(lectureId, audioUri, title) {
  if (!authTokenGetter) {
    throw new Error("Authentication is not ready. Please sign in again.");
  }

  const token = await authTokenGetter();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const uriWithoutQuery = audioUri.split("?")[0];
  const extension =
    uriWithoutQuery.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ||
    "m4a";

  const mimeTypes = {
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    mp4: "audio/mp4",
    "3gp": "audio/3gpp",
    ogg: "audio/ogg",
    webm: "audio/webm",
  };

  const formData = new FormData();

  formData.append("recording", {
    uri: audioUri,
    name: `lecture-recording-${Date.now()}.${extension}`,
    type: mimeTypes[extension] || "application/octet-stream",
  });

  formData.append("title", title?.trim() || "Lecture recording");

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/recordings/lecture/${encodeURIComponent(lectureId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
  } catch (error) {
    throw new Error(
      `Cannot upload recording to ${API_BASE_URL}. Check your network connection and ensure the backend is running.`
    );
  }

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Recording upload failed (${response.status}).`
    );
  }

  return data;
}


async function getRecordingPlaybackSource(recordingId) {
  if (!authTokenGetter) {
    throw new Error("Authentication is not ready. Please sign in again.");
  }

  const token = await authTokenGetter();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return {
    uri: `${API_BASE_URL}/api/recordings/${encodeURIComponent(
      recordingId
    )}/file`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}


export const api = {
  // Connection checks
  testBackend: () => request("/"),
  testDatabase: () => request("/db-test"),

  // Modules
  listModules: () => request("/api/modules"),

  createModule: (module) =>
    request("/api/modules", {
      method: "POST",
      body: JSON.stringify(module),
    }),

  updateModule: (id, module) =>
    request(`/api/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(module),
    }),

  deleteModule: (id) =>
    request(`/api/modules/${id}`, {
      method: "DELETE",
    }),

  // Lecture recordings
  
  // Lecture recordings
  uploadRecording: (lectureId, audioUri, title) =>
    uploadRecording(lectureId, audioUri, title),

  listRecordings: (lectureId) =>
    request(
      `/api/recordings/lecture/${encodeURIComponent(lectureId)}`
    ),

  getRecordingPlaybackSource: (recordingId) =>
    getRecordingPlaybackSource(recordingId),

  deleteRecording: (recordingId) =>
    request(`/api/recordings/${encodeURIComponent(recordingId)}`, {
      method: "DELETE",
    }),


  // Lectures
  listLectures: (moduleId) =>
    request(`/api/lectures/module/${moduleId}`),

  getLecture: (lectureId) =>
    request(`/api/lectures/${lectureId}`),

  createLecture: (moduleId, lecture) =>
    request(`/api/lectures/module/${moduleId}`, {
      method: "POST",
      body: JSON.stringify(lecture),
    }),

  deleteLecture: (lectureId) =>
    request(`/api/lectures/${lectureId}`, {
      method: "DELETE",
    }),

  // Annotations
  listNotes: (lectureId) =>
    request(`/api/lectures/${lectureId}/notes`),

  createNote: (lectureId, note) =>
    request(`/api/lectures/${lectureId}/notes`, {
      method: "POST",
      body: JSON.stringify(note),
    }),

  updateNote: (noteId, note) =>
    request(`/api/lectures/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(note),
  }),

  deleteNote: (noteId) =>
    request(`/api/lectures/notes/${noteId}`, {
      method: "DELETE",
    }),

  // Further reading resources
  listResources: (moduleId) =>
    request(`/api/resources/module/${moduleId}`),

  createResource: (moduleId, resource) =>
    request(`/api/resources/module/${moduleId}`, {
      method: "POST",
      body: JSON.stringify(resource),
    }),

  deleteResource: (resourceId) =>
    request(`/api/resources/${resourceId}`, {
      method: "DELETE",
    }),
};
