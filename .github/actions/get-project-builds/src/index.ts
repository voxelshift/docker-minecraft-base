import * as core from "@actions/core";
import {
  PaperProject,
  fetchLatestFabricBuild,
  fetchLatestPaperBuild,
} from "./http";

async function run() {
  const project = core.getInput("project", {
    required: true,
  });
  const version = core.getInput("version", {
    required: true,
  });

  core.info(`Searching for latest build of ${project} ${version}`);

  const build = await getLatestBuild(project, version);

  core.info(`Obtained latest ${project} build:`);
  core.info(JSON.stringify(build, null, 2));

  core.setOutput("build", build.id);
  core.setOutput("download-url", build.downloadUrl);
}

interface Build {
  id: string;
  downloadUrl: string;
}

async function getLatestBuild(
  project: string,
  version: string
): Promise<Build> {
  if (["paper", "velocity"].includes(project)) {
    return fetchLatestPaperBuild(project as PaperProject, version);
  }

  if (project === "fabric") {
    return fetchLatestFabricBuild(version);
  }

  throw new Error(`Unknown project type: ${project}`);
}

run();
