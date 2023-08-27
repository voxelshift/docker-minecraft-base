import { z } from "zod";

export const projectTypeSchema = z.enum(["paper", "velocity"]);

export type ProjectType = z.infer<typeof projectTypeSchema>;

export const projectVersionSchema = z.string();

export type ProjectVersion = z.infer<typeof projectVersionSchema>;
