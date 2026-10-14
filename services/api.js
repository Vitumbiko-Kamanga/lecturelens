
const API_BASE_URL = "http://10.1.24.62:5000";

// DEMO ONLY: replace this with the verified Clerk user ID
// after Clerk authentication has been implemented.
const DEMO_USER_ID = "demo-student-001";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": DEMO_USER_ID,
        ...options.headers,
      },
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

  // Further-reading resources
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
