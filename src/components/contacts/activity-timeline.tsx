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
    <div className="space-y-5">
      <form action={addNote} className="space-y-2">
        <input type="hidden" name="contactId" value={contactId} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Добавить заметку..."
          className="w-full rounded-lg border border-ink-300 bg-ink-50/60 px-3 py-2 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="transition-smooth rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98]"
        >
          Добавить заметку
        </button>
      </form>

      {activities.length === 0 ? (
        <p className="text-sm text-ink-400">Активности пока нет</p>
      ) : (
        <ul className="relative space-y-3 before:absolute before:bottom-1 before:left-[7px] before:top-1 before:w-px before:bg-ink-100">
          {activities.map((activity, i) => {
            const isNote = activity.type === "NOTE";
            return (
              <li
                key={activity.id}
                style={{ "--stagger-i": Math.min(i, 10) } as React.CSSProperties}
                className="stagger-item relative flex gap-3 pl-0.5"
              >
                <span
                  className={`relative z-10 mt-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full ring-4 ring-white ${
                    isNote ? "bg-brand-500" : "bg-ink-300"
                  }`}
                />
                {isNote ? (
                  <div className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-ink-50/70 px-3.5 py-2.5 text-sm">
                    <p className="whitespace-pre-wrap text-ink-700">{activity.body}</p>
                    <p className="mt-1.5 text-xs text-ink-400">
                      {activity.author.name} · {formatDateAlmaty(activity.createdAt)}
                    </p>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 py-0.5 text-xs text-ink-400">
                    <span>{activity.body}</span>
                    <span className="text-ink-300"> · {activity.author.name} · {formatDateAlmaty(activity.createdAt)}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
