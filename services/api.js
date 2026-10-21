
const API_BASE_URL = "http://10.1.24.205:5000";

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
