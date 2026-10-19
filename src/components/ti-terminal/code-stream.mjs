export const MAX_CODE_LENGTH = 14000;
const LINES_TO_REVEAL_PORTRAIT = 4;

const bootstrap = `// SEDIPRO UNT | Information Technology
// Build a team directory and summarize project delivery.

const profiles = new Map();
const renderQueue = [];

function compileMember(member) {
  for (const field of ["name", "career", "image"]) {
    if (!member[field]) throw new Error("Missing field: " + field);
  }
  return Object.freeze({ ...member, ready: true });
}

function buildProjectReport(tasks) {
  const delivered = tasks.filter(task => task.complete).length;
  return {
    total: tasks.length,
    delivered,
    completion: tasks.length ? delivered / tasks.length : 0
  };
}

`;

const englishCareer = {
  "Informática": "Computer Science",
  "Ingeniería Industrial": "Industrial Engineering",
  "Ingeniería de Sistemas": "Systems Engineering",
  "Estadística": "Statistics",
};

export function memberSource(member, index, cycle) {
  const id = `${String(cycle + 1).padStart(3, "0")}_${String(index + 1).padStart(2, "0")}`;
  const entry = { id: `TI-${String(index + 1).padStart(2, "0")}`, name: member.name, career: englishCareer[member.career] ?? member.career, role: member.role === "Director" ? "IT Director" : "IT Contributor", image: member.image };
  const transition = cycle > 0 && index === 0 ? `\n// Begin validation transaction ${String(cycle + 1).padStart(4, "0")}.\n// Reconcile contributor records with the current delivery report.\n\n` : "";
  return `${transition}${cycle === 0 && index === 0 ? bootstrap : ""}// Assemble profile ${index + 1}: validate, compile, enqueue.
const member_${id} = ${JSON.stringify(entry, null, 2)};
const profile_${id} = compileMember(member_${id});
profiles.set(member_${id}.id, profile_${id});
renderQueue.push(profile_${id});
${(index + 1) % 4 === 0 ? `
// Check delivery across interfaces, internal systems and data.
const report_${id} = buildProjectReport([
  { title: "Accessible project directory", complete: true },
  { title: "Internal attendance service", complete: true },
  { title: "Project delivery dashboard", complete: false }
]);
` : ""}
`;
}

export function initialTerminal() {
  return { text: "", cycle: 0, index: 0, cursor: 0, total: 0, complete: false };
}

export function advanceTerminal(previous, amount, members) {
  if (!members.length || amount <= 0) return previous;
  const state = { ...previous };
  if (state.complete) {
    state.cycle += 1;
    state.index = 0;
    state.cursor = 0;
    state.complete = false;
  }
  let remaining = Math.min(24000, amount);
  while (remaining > 0) {
    const source = memberSource(members[state.index], state.index, state.cycle);
    const count = Math.min(remaining, source.length - state.cursor);
    state.text += source.slice(state.cursor, state.cursor + count);
    state.cursor += count;
    state.total += count;
    remaining -= count;
    if (state.cursor === source.length) {
      if (state.index === members.length - 1) { state.complete = true; break; }
      state.index += 1;
      state.cursor = 0;
    }
  }
  if (state.text.length > MAX_CODE_LENGTH) {
    const cut = state.text.indexOf("\n", state.text.length - MAX_CODE_LENGTH);
    state.text = cut < 0 ? state.text.slice(-MAX_CODE_LENGTH) : state.text.slice(cut + 1);
  }
  return state;
}

export function profileProgress(state, index, members) {
  if (state.total === 0 || index > state.index) return 0;
  if (state.complete || index < state.index) return 1;
  const source = memberSource(members[index], index, state.cycle);
  const written = source.slice(0, state.cursor);
  const lineStart = written.lastIndexOf("\n") + 1;
  const lineEnd = source.indexOf("\n", lineStart);
  const lineLength = Math.max(1, (lineEnd < 0 ? source.length : lineEnd) - lineStart);
  const completedLines = written.split("\n").length - 1;
  const currentLine = (written.length - lineStart) / lineLength;
  return Math.min(1, (completedLines + currentLine) / LINES_TO_REVEAL_PORTRAIT);
}
