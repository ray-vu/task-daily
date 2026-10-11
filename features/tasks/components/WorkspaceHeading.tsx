import { Plus, Sprout } from "lucide-react";
import type { Section } from "../types";

const headings: Record<Section, string> = {
  "My tasks": "Good things take a little growing.",
  Overview: "Look at your garden grow.",
  Today: "Plant a little progress today.",
  Completed: "Your hard work is in bloom.",
  Personal: "Make room for your own growth.",
  Project: "Bring your next idea to life.",
  "Product launch": "Bring your next idea to life.",
};

export function WorkspaceHeading({
  section,
  onCreate,
  disabled,
}: {
  section: Section;
  onCreate: () => void;
  disabled: boolean;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <Sprout size={14} /> A FRESH SPACE TO GROW
        </div>
        <h1>
          {headings[section]}
          <Sprout className="heading-sprout" size={30} />
        </h1>
        <p>Small steps today, a brighter you tomorrow.</p>
      </div>
      <button className="primary-button" onClick={onCreate} disabled={disabled}>
        <Plus size={18} /> Create task
      </button>
    </div>
  );
}
