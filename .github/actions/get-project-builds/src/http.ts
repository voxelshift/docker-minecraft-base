import * as httpm from "@actions/http-client";
import { z } from "zod";

const http = new httpm.HttpClient("GHA/VoxelshiftUpdater");

async function fetchTyped<T extends z.Schema>(
  url: string,
  schema: T,
  additionalHeaders?: any
): Promise<z.infer<T>> {
  const response = await http.getJson(url, additionalHeaders);

  return schema.parseAsync(response.result);
}

export type PaperProject = "paper" | "velocity";

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

export async function fetchLatestPaperBuild(
  project: PaperProject,
  version: string
) {
  const response = await fetchPaperBuilds(project, version);

  const build = response.builds[(response.builds.length = 1)];
  const download = build.downloads["application"];

  if (!download) {
    throw new Error(
      `Unable to find application download in: ${JSON.stringify(
        build.downloads,
        null,
        2
      )}`
    );
  }

  const buildId = build.build.toString();

  return {
    id: buildId,
    downloadUrl: `https://api.papermc.io/v2/projects/${project}/versions/${version}/builds/${buildId}/downloads/${download.name}`,
  };
}

const fabricInstallerVersionsResponseSchema = z.array(
  z.object({
    url: z.string(),
    maven: z.string(),
    version: z.string(),
    stable: z.boolean(),
  })
);

async function fetchFabricInstallerVersions() {
  return fetchTyped(
    "https://meta.fabricmc.net/v2/versions/installer",
    fabricInstallerVersionsResponseSchema
  );
}

const fabricLoaderVersionsResponseSchema = z.array(
  z.object({
    loader: z.object({
      separator: z.string(),
      build: z.number(),
      maven: z.string(),
      version: z.string(),
      stable: z.boolean(),
    }),
    intermediary: z.object({
      maven: z.string(),
      version: z.string(),
      stable: z.boolean(),
    }),
  })
);

async function fetchFabricLoaderVersions(version: string) {
  return fetchTyped(
    `https://meta.fabricmc.net/v2/versions/loader/${version}`,
    fabricLoaderVersionsResponseSchema
  );
}

export async function fetchLatestFabricBuild(version: string) {
  const installerVersions = await fetchFabricInstallerVersions();
  const loaderVersions = await fetchFabricLoaderVersions(version);

  const installerVersion = installerVersions[0].version;
  const loaderVersion = loaderVersions[0].loader.version;

  return {
    id: `${installerVersion}-${loaderVersion}`,
    downloadUrl: `https://meta.fabricmc.net/v2/versions/loader/${version}/${loaderVersion}/${installerVersion}/server/jar`,
  };
}
