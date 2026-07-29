// The Eisenhower plane. `slot` maps onto the grid-template-areas in App.css, so
// layout lives in CSS and stays overridable by the mobile breakpoint. `action` is the
// canonical response to each quadrant — it names what you do, not just where you are.
export const QUADRANTS = [
  {
    key: "URGENT_IMPORTANT",
    slot: "q1",
    action: "Do now",
    axes: "Urgent · Important",
  },
  {
    key: "NOT_URGENT_IMPORTANT",
    slot: "q2",
    action: "Schedule",
    axes: "Not urgent · Important",
  },
  {
    key: "URGENT_NOT_IMPORTANT",
    slot: "q3",
    action: "Offload",
    axes: "Urgent · Not important",
  },
  {
    key: "NOT_URGENT_NOT_IMPORTANT",
    slot: "q4",
    action: "Drop",
    axes: "Not urgent · Not important",
  },
];

// Must stay in sync with backend/todo_statuses.py.
export const STATUS_LABELS = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const STATUS_CLASSES = {
  NOT_STARTED: "status-not-started",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
};
