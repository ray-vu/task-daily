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
          {loading
            ? "Loading your garden from the server…"
            : "Saving your changes…"}
        </div>
      )}
      {error && (
        <div className="sync-error" role="alert">
          <span>{error}</span>
          <button onClick={onRefresh} disabled={pending || loading}>
            <RefreshCw size={14} />
            {loadFailed ? "Retry" : "Refresh"}
          </button>
        </div>
      )}
      {legacyCount > 0 && (
        <div className="migration-notice">
          <Download size={20} />
          <div>
            <strong>{legacyCount} tasks are saved in this browser</strong>
            <p>
              Bring them into your shared garden. Existing server tasks are
              kept; your browser backup stays intact.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={onImport}
            disabled={loading || pending || loadFailed}
          >
            Import saved tasks
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
