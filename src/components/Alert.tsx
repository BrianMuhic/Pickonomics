export function Alert({ type, message }: { type: "error" | "success" | "warning"; message: string }) {
  return <div className={`alert alert-${type}`}>{message}</div>;
}
