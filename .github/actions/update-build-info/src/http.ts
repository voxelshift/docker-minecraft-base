import * as httpm from "@actions/http-client";
import { z } from "zod";

const http = new httpm.HttpClient("GHA/VoxelshiftUpdater");

async function fetchTyped<T extends z.Schema>(
  url: string,
  schema: T,
  additionalHeaders?: any
): Promise<z.infer<T>> {
  const response = await http.getJson(url, additionalHeaders);

  return schema.parseAsync(response);
}

export type PaperProject = "paper" | "velocity";

const paperVersionsResponseSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  version_groups: z.array(z.string()),
  versions: z.array(z.string()),
});

async function fetchPaperVersions(project: PaperProject) {
  return fetchTyped(
    `https://api.papermc.io/v2/projects/${project}`,
    paperVersionsResponseSchema
  );
}

const paperBuildsResponseSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  version: z.string(),
  builds: z.array(
    z.object({
      build: z.number(),
      time: z.string().datetime(),
      channel: z.string(),
      promoted: z.boolean(),
      changes: z.array(
        z.object({
          commit: z.string(),
          summary: z.string(),
          message: z.string(),
        })
      ),
      downloads: z.record(
        z.object({
          name: z.string(),
          sha256: z.string(),
        })
      ),
    })
  ),
});

async function fetchPaperBuilds(project: PaperProject, version: string) {
  return fetchTyped(
    `https://api.papermc.io/v2/projects/${project}/versions/${version}/builds`,
    paperBuildsResponseSchema
  );
}

export async function getPaperBuild(project: PaperProject, version: string) {
  const response = await fetchPaperBuilds(project, version);

  return response.builds[0];
}
