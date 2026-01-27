import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Skill } from "./skills";

export const SkillVideo: React.FC<{ skill: Skill }> = ({ skill }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typingStart = Math.round(fps * 0.6);
  const charsPerSecond = 55;
  const visibleChars = Math.max(
    0,
    Math.floor(((frame - typingStart) / fps) * charsPerSecond)
  );
  const typedCode = skill.code.slice(0, visibleChars);

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
            <pre className="skill-code">{typedCode}</pre>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
