/** Capability project types. Content lives in the database (business_verticals / business_projects). */
export type ProjectStatus = "Ongoing" | "O&M" | "Completed";

export type BusinessProject = {
  name: string;
  location: string;
  client: string;
  status: ProjectStatus;
};

export const projectState = (p: BusinessProject) =>
  p.location.split(",").pop()!.trim();
