import { SkillVideo } from "./SkillVideo";
import type { Skill } from "./skills";

export const SkillComposition: React.FC<{ skill: Skill }> = ({ skill }) => {
  return <SkillVideo skill={skill} />;
};
