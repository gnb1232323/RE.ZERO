import { addNote } from "@/lib/actions/activities";
import { formatDateAlmaty } from "@/lib/date";

type ActivityRow = {
  id: string;
  type: "NOTE" | "STAGE_CHANGE" | "TASK_CREATED" | "TASK_COMPLETED" | "SYSTEM";
  body: string;
  createdAt: Date;
  author: { name: string };
};

export function ActivityTimeline({ contactId, activities }: { contactId: string; activities: ActivityRow[] }) {
  return (
    <div className="space-y-4">
      <form action={addNote} className="space-y-2">
        <input type="hidden" name="contactId" value={contactId} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Добавить заметку..."
          className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white transition hover:bg-brand-700"
        >
          Добавить заметку
        </button>
      </form>

      <ul className="space-y-2">
        {activities.length === 0 && <p className="text-sm text-ink-400">Активности пока нет</p>}
        {activities.map((activity) =>
          activity.type === "NOTE" ? (
            <li key={activity.id} className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5 text-sm">
              <p className="text-ink-700">{activity.body}</p>
              <p className="mt-1 text-xs text-ink-400">
                {activity.author.name} · {formatDateAlmaty(activity.createdAt)}
              </p>
            </li>
          ) : (
            <li key={activity.id} className="flex items-center gap-2 px-1 py-0.5 text-xs text-ink-400">
              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-ink-300" />
              <span>{activity.body}</span>
              <span className="text-ink-300">· {activity.author.name} · {formatDateAlmaty(activity.createdAt)}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
