import { SKILL_LIST } from "./skillList";

export function extractSkills(text) {
  const lowerText = text.toLowerCase();

  return SKILL_LIST.filter(skill =>
    lowerText.includes(skill.toLowerCase())
  );
}