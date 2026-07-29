import { STATUS_CLASSES, STATUS_LABELS } from "../constants";

export default function StatusSelect({ todo, onChange }) {
  return (
    <select
      className={`status-select ${STATUS_CLASSES[todo.status] ?? ""}`}
      value={todo.status}
      onChange={(e) => onChange(todo, e.target.value)}
      aria-label={`Status of ${todo.title}`}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
