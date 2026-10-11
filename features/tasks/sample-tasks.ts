import type { Task } from "./types";
import { today } from "./task-model";
export function createSampleTasks(): Task[] {
  return [
    {
      id: "DQ-101",
      projectId: null,
      title: "Thiết kế trải nghiệm làm quen",
      description:
        "Phác thảo hành trình sử dụng lần đầu và tạo trải nghiệm thân thiện cho người dùng mới. Bao gồm bố cục và các trạng thái tương tác chính.",
      status: "In progress",
      priority: "High",
      assignee: "You",
      labels: ["Design", "Product"],
      due: today(),
      points: 40,
    },
    {
      id: "DQ-102",
      projectId: null,
      title: "Tìm ý tưởng cho trang tổng quan",
      description:
        "Thu thập ý tưởng tham khảo cho phiên bản trang tổng quan tiếp theo.",
      status: "To do",
      priority: "Medium",
      assignee: "You",
      labels: ["Design"],
      due: today(),
      points: 20,
    },
    {
      id: "DQ-103",
      projectId: null,
      title: "Viết bản tóm tắt sản phẩm",
      description:
        "Nêu vấn đề, đối tượng, kết quả mong muốn và phạm vi cho phiên bản tiếp theo.",
      status: "To do",
      priority: "High",
      assignee: "Alex",
      labels: ["Product"],
      due: today(),
      points: 30,
    },
    {
      id: "DQ-104",
      projectId: null,
      title: "Rà soát thư viện thành phần giao diện",
      description:
        "Kiểm tra tính nhất quán, khả năng tiếp cận và tái sử dụng của các thành phần chung.",
      status: "In progress",
      priority: "Medium",
      assignee: "You",
      labels: ["Development"],
      due: today(),
      points: 30,
    },
    {
      id: "DQ-105",
      projectId: null,
      title: "Lập kế hoạch ưu tiên cho tuần tới",
      description:
        "Dành thời gian cho việc quan trọng. Chọn ba ưu tiên có ý nghĩa.",
      status: "To do",
      priority: "Low",
      assignee: "You",
      labels: ["Planning"],
      due: "",
      points: 20,
    },
    {
      id: "DQ-106",
      projectId: null,
      title: "Dọn dẹp không gian làm việc",
      description:
        "Không gian gọn gàng giúp tinh thần thoải mái. Lưu trữ ghi chú cũ và sắp xếp tài liệu hiện tại.",
      status: "Done",
      priority: "Low",
      assignee: "You",
      labels: ["Personal"],
      due: today(),
      points: 10,
      completedAt: today(),
    },
    {
      id: "DQ-107",
      projectId: null,
      title: "Đọc sách buổi sáng",
      description: "Dành 15 phút để học điều mới.",
      status: "Done",
      priority: "Medium",
      assignee: "You",
      labels: ["Personal"],
      due: today(),
      points: 20,
      completedAt: today(),
    },
  ];
}
