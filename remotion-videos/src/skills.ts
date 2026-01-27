import { skillsData } from "../scripts/skills-data.js";

export type Skill = {
	id: string;
	section: string;
	title: string;
	description: string;
	code: string;
	language: string;
	videoPath: string;
};

export const skills: Skill[] = skillsData as Skill[];
