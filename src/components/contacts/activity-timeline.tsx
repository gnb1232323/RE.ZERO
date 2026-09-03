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
          className="w-full rounded-md border border-khaki-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
        >
          Добавить заметку
        </button>
      </form>

      <ul className="space-y-3">
        {activities.length === 0 && <p className="text-sm text-khaki-400">Активности пока нет</p>}
        {activities.map((activity) => (
          <li key={activity.id} className="rounded-md border border-khaki-100 bg-khaki-50 px-3 py-2 text-sm">
            <p className="text-khaki-700">{activity.body}</p>
            <p className="mt-1 text-xs text-khaki-400">
              {activity.author.name} · {formatDateAlmaty(activity.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
