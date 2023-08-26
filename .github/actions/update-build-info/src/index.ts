import { z } from "zod";
import * as fs from "fs/promises";
import { PaperProject, getPaperBuild } from "./http";

const buildSchema = z.object({
  build: z.number(),
  downloadUrl: z.string(),
  sha256: z.string(),
});

type Build = z.infer<typeof buildSchema>;

const projectSchema = z.record(buildSchema);

type Project = z.infer<typeof projectSchema>;

const buildsJsonSchema = z.record(projectSchema);

type BuildsJson = z.infer<typeof buildsJsonSchema>;

async function run() {
  const buildsFile = await fs.readFile("./builds.json", { encoding: "utf8" });
  const builds = await buildsJsonSchema.parseAsync(JSON.parse(buildsFile));

  const newBuilds = await getUpdatedBuilds(builds);

  await fs.writeFile("./builds.json", JSON.stringify(newBuilds, null, 2));
}

function getVersions(project: string, builds: BuildsJson) {
  if (!builds[project]) return [];

  return Object.keys(builds[project]);
}

async function getUpdatedBuilds(builds: BuildsJson): Promise<BuildsJson> {
  const paper = await getPaperBuilds("paper", builds);
  const velocity = await getPaperBuilds("velocity", builds);

  return {
    paper,
    velocity,
  };
}

async function getPaperBuilds(
  project: PaperProject,
  builds: BuildsJson
): Promise<Project> {
  const versions = getVersions(project, builds);

  const entries = await Promise.all(
    versions.map(async (version) => {
      const build = await getPaperBuild(project, version);

      const buildNumber = build.build;
      const download = build.downloads["application"];

      return [
        version,
        {
          build: buildNumber,
          downloadUrl: `https://api.papermc.io/v2/projects/${project}/versions/${version}/builds/${buildNumber}/downloads/${download.name}`,
          sha256: download.sha256,
        },
      ];
    })
  );

  return Object.fromEntries(entries);
}

run();
