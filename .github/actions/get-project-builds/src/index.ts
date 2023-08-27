import { z } from "zod";
import * as core from "@actions/core";
import { getLatestPaperBuild } from "./http";
import { projectTypeSchema, projectVersionSchema, ProjectType } from "./zod";

async function getInputTyped<T extends z.Schema>(
  name: string,
  schema: T,
  options?: core.InputOptions
): Promise<z.infer<T>> {
  const input = core.getInput(name, options);

  return schema.parseAsync(JSON.parse(input));
}

async function run() {
  const project = await getInputTyped("project", projectTypeSchema, {
    required: true,
  });
  const version = await getInputTyped("versions", projectVersionSchema, {
    required: true,
  });

  core.info(`Searching for latest build of ${project} ${version}`);

  const build = await getLatestBuild(project, version);

  core.info(`Obtained latest ${project} build:`);
  core.info(JSON.stringify(build, null, 2));

  core.setOutput("build", build);
}

interface Build {
  build: string;
  downloadUrl: string;
  sha256: string;
}

async function getLatestBuild(
  project: ProjectType,
  version: string
): Promise<Build> {
  const build = await getLatestPaperBuild(project, version);
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

  const fileName = download.name;

  return {
    build: build.build.toString(),
    downloadUrl: `https://api.papermc.io/projects/${project}/versions/${version}/builds/${build}/downloads/${fileName}`,
    sha256: download.sha256,
  };
}

run();
