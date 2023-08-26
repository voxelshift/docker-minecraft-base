import { z } from "zod";
import * as fs from "fs/promises";
import { PaperProject, getPaperBuild } from "./http";

const buildSchema = z.object({
  downloadUrl: z.string(),
  build: z.number(),
});

type Build = z.infer<typeof buildSchema>;

const projectSchema = z.record(buildSchema);

type Project = z.infer<typeof projectSchema>;

const buildsJsonSchema = z.record(projectSchema);

type BuildsJson = z.infer<typeof buildsJsonSchema>;

async function run() {
  const buildsFile = await fs.readFile("./builds.json", { encoding: "utf8" });
  const builds = await buildsJsonSchema.parseAsync(buildsFile);

  const newBuilds = await getUpdatedBuilds(builds);

  await fs.writeFile("./builds.json", JSON.stringify(newBuilds, null, 2));
}

function getVersions(project: string, builds: BuildsJson) {
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

      return [
        version,
        {
          build: build.build,
          downloadUrl: "",
        },
      ];
    })
  );

  return Object.fromEntries(entries);
}

run();
