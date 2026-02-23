const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const body = await request.json();

    if (body?.delete === true) {
      const id = typeof body.id === "string" ? body.id.trim() : "";
      if (!id) return jsonError(400, "Missing or invalid id for delete");
      const key = `${PROJECT_PREFIX}${id}`;
      await userPuter.kv.del(key);
      return { deleted: true, id };
    }

    const project = body?.project;
    if (!project?.id || !project?.sourceImage)
      return jsonError(400, "Invalid project data");

    const payload = {
      ...project,
      updateAt: new Date().toISOString(),
    };

    const key = `${PROJECT_PREFIX}${project.id}`;
    await userPuter.kv.set(key, payload);

    return { saved: true, id: project.id, project: payload };
  } catch (error) {
    return jsonError(500, "Failed to save project", {
      message: error.message || "unknown error",
    });
  }
});

router.get("/api/projects/list", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getUserId(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const projects = (await userPuter.kv.list(PROJECT_PREFIX, true)).map(
      ({ value }) => ({ ...value, isPublic: true }),
    );

    return { projects };
  } catch (error) {
    return jsonError(500, "Failed to list projects", {
      message: error?.message || "unknown error",
    });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getUserId(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError(400, "Missing id parameter");

    const key = `${PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(key);
    if (project === undefined || project === null)
      return jsonError(404, "Project not found");

    return { project };
  } catch (error) {
    return jsonError(500, "Failed to get project", {
      message: error?.message || "unknown error",
    });
  }
});
