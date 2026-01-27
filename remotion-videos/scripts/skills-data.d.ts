declare module "../scripts/skills-data.js" {
  export type SkillData = {
    id: string;
    section: string;
    title: string;
    description: string;
    code: string;
    language: string;
    videoPath: string;
  };

  export const skillsData: SkillData[];
}
