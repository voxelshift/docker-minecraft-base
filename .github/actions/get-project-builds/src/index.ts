import * as core from "@actions/core";
import { PaperProject, fetchLatestPaperBuild } from "./http";

async function run() {
  const project = core.getInput("project", {
    required: true,
  });
  const version = core.getInput("versions", {
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
  sha256: string;
}

async function getLatestBuild(
  project: string,
  version: string
): Promise<Build> {
  if (["paper", "velocity"].includes(project)) {
    return getLatestPaperBuild(project as PaperProject, version);
  }

  throw new Error(`Unknown project type: ${project}`);
}

async function getLatestPaperBuild(project: PaperProject, version: string) {
  const build = await fetchLatestPaperBuild(project, version);
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
    id: build.build.toString(),
    downloadUrl: `https://api.papermc.io/projects/${project}/versions/${version}/builds/${build}/downloads/${fileName}`,
    sha256: download.sha256,
  };
}

run();
