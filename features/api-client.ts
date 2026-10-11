export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(15000),
  }).catch(() => {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const details = body.details
      ?.map(
        (issue: { field: string; message: string }) =>
          `${fieldText(issue.field)}: ${issue.message}`,
      )
      .join("; ");
    throw new Error(
      [body.error || "Không thể lưu thay đổi.", details]
        .filter(Boolean)
        .join(" "),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const fields: Record<string, string> = {
  id: "Mã",
  projectId: "Dự án",
  title: "Tiêu đề",
  description: "Mô tả",
  status: "Trạng thái",
  priority: "Độ ưu tiên",
  assignee: "Người phụ trách",
  labels: "Nhãn",
  due: "Hạn hoàn thành",
  points: "Điểm thưởng",
  completedAt: "Ngày hoàn thành",
  tasks: "Công việc",
  name: "Tên",
  color: "Màu",
};
const fieldText = (field: string) =>
  field
    .split(".")
    .map((part) => fields[part] || part)
    .join(".") || "Dữ liệu";
