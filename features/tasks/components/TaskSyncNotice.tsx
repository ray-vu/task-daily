import { Cloud, Download, LoaderCircle, RefreshCw } from "lucide-react";

export function TaskSyncNotice({
  loading,
  pending,
  error,
  loadFailed,
  legacyCount,
  message,
  onRefresh,
  onImport,
}: {
  loading: boolean;
  pending: boolean;
  error: string | null;
  loadFailed: boolean;
  legacyCount: number;
  message: string | null;
  onRefresh: () => void;
  onImport: () => void;
}) {
  return (
    <div className="sync-notices">
      {(loading || pending) && (
        <div className="sync-state" role="status">
          <LoaderCircle size={16} className="sync-spinner" />
          {loading ? "Đang tải khu vườn của bạn…" : "Đang lưu thay đổi…"}
        </div>
      )}
      {error && (
        <div className="sync-error" role="alert">
          <span>{error}</span>
          <button onClick={onRefresh} disabled={pending || loading}>
            <RefreshCw size={14} />
            {loadFailed ? "Thử lại" : "Tải lại"}
          </button>
        </div>
      )}
      {legacyCount > 0 && (
        <div className="migration-notice">
          <Download size={20} />
          <div>
            <strong>
              {legacyCount} công việc được lưu trong trình duyệt này
            </strong>
            <p>
              Nhập vào khu vườn chung của bạn. Công việc hiện có và bản sao
              trong trình duyệt đều được giữ lại.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={onImport}
            disabled={loading || pending || loadFailed}
          >
            Nhập công việc đã lưu
          </button>
        </div>
      )}
      {message && (
        <div className="sync-state" role="status">
          <Cloud size={16} />
          {message}
        </div>
      )}
    </div>
  );
}
