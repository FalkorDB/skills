import "./index.css";
import { Composition } from "remotion";
import { SkillComposition } from "./Composition";
import { skills } from "./skills";

const FPS = 60;
const DURATION_IN_FRAMES = FPS * 5;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {skills.map((skill) => (
        <Composition
          key={skill.id}
          id={skill.id}
          component={SkillComposition}
          durationInFrames={DURATION_IN_FRAMES}
          fps={FPS}
          width={1280}
          height={720}
          defaultProps={{ skill }}
        />
      ))}
    </>
  );
};
