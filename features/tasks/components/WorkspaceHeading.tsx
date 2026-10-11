import { Plus, Sprout } from "lucide-react";
import type { Section } from "../types";

const headings: Record<Section, string> = {
  "My tasks": "Điều tốt đẹp cần thời gian vun trồng.",
  Overview: "Ngắm khu vườn của bạn lớn lên.",
  Today: "Gieo một bước tiến hôm nay.",
  Completed: "Nỗ lực của bạn đang đơm hoa.",
  Personal: "Dành không gian để phát triển bản thân.",
  Project: "Biến ý tưởng tiếp theo thành hiện thực.",
  "Product launch": "Biến ý tưởng tiếp theo thành hiện thực.",
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
          <Sprout size={14} /> KHÔNG GIAN MỚI ĐỂ PHÁT TRIỂN
        </div>
        <h1>
          {headings[section]}
          <Sprout className="heading-sprout" size={30} />
        </h1>
        <p>Bước nhỏ hôm nay, tương lai tươi sáng hơn.</p>
      </div>
      <button className="primary-button" onClick={onCreate} disabled={disabled}>
        <Plus size={18} /> Tạo công việc
      </button>
    </div>
  );
}
