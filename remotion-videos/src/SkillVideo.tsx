import { AbsoluteFill } from "remotion";
import type { Skill } from "./skills";

export const SkillVideo: React.FC<{ skill: Skill }> = ({ skill }) => {
  return (
    <AbsoluteFill className="skill-root">
      <div className="skill-layout">
        <div className="skill-header enter-title">
          <div className="skill-section">{skill.section}</div>
          <div className="skill-title">{skill.title}</div>
          <div className="skill-description">{skill.description}</div>
        </div>

        <div className="skill-body">
          <div className="skill-code-panel enter-code">
            <div className="skill-code-label">{skill.language}</div>
            <pre className="skill-code">{skill.code}</pre>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
