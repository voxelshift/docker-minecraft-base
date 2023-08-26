import { z } from "zod";
import * as fs from "fs/promises";
import * as core from "@actions/core";
import { PaperProject, getLatestPaperBuild } from "./http";

const projectsJsonSchema = z.object({
  paper: z.array(z.string()),
  velocity: z.array(z.string()),
});

type ProjectsJson = z.infer<typeof projectsJsonSchema>;

async function run() {
  const projectsFile = await fs.readFile("./projects.json", {
    encoding: "utf8",
  });
  const projects = await projectsJsonSchema.parseAsync(
    JSON.parse(projectsFile)
  );

  core.info("Searching for latest builds of projects:");
  core.info(JSON.stringify(projects, null, 2));

  const projectBuilds = await getLatestBuilds(projects);

  core.info("Obtained project builds:");
  core.info(JSON.stringify(projectBuilds, null, 2));

  core.setOutput("projects", projectBuilds);
}

interface Build {
  build: string;
  downloadUrl: string;
  sha256: string;
}

type Versions = Record<string, Build>;

interface Projects {
  paper: Versions;
  velocity: Versions;
}

async function getLatestBuilds(projects: ProjectsJson): Promise<Projects> {
  const paper = await getPaperBuilds("paper", projects.paper);
  const velocity = await getPaperBuilds("velocity", projects.velocity);

  return {
    paper,
    velocity,
  };
}

async function getPaperBuilds(
  project: PaperProject,
  versions: string[]
): Promise<Versions> {
  const entries = await Promise.all(
    versions.map(async (version) => {
      const build = await getLatestPaperBuild(project, version);

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
