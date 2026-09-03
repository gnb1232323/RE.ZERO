"use client";

import { useActionState } from "react";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { sourceLabels, formatLabels } from "@/lib/labels";
import type { Contact } from "@/generated/prisma/client";

const inputClasses =
  "w-full rounded-md border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const labelClasses = "mb-1 block text-sm font-medium text-ink-700";

export function ContactForm({
  owners,
  contact,
}: {
  owners: { id: string; name: string }[];
  contact?: Contact;
}) {
  const action = contact ? updateContact : createContact;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {contact && <input type="hidden" name="contactId" value={contact.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя" name="fullName" required defaultValue={contact?.fullName} errors={state?.errors?.fullName} />
        <Field label="Телефон" name="phone" required defaultValue={contact?.phone} errors={state?.errors?.phone} />
        <Field label="Email" name="email" type="email" defaultValue={contact?.email ?? ""} errors={state?.errors?.email} />
        <Field label="Instagram" name="instagram" defaultValue={contact?.instagram ?? ""} errors={state?.errors?.instagram} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={contact?.whatsapp ?? ""} errors={state?.errors?.whatsapp} />
        <Field label="Telegram" name="telegram" defaultValue={contact?.telegram ?? ""} errors={state?.errors?.telegram} />

        <div>
          <label className={labelClasses}>Источник</label>
          <select name="source" defaultValue={contact?.source ?? "OTHER"} className={inputClasses}>
            {Object.entries(sourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Детали источника"
          name="sourceDetail"
          placeholder="Например, название рекламной кампании"
          defaultValue={contact?.sourceDetail ?? ""}
        />

        <div>
          <label className={labelClasses}>Формат обучения</label>
          <select name="format" defaultValue={contact?.format ?? ""} className={inputClasses}>
            <option value="">Не указан</option>
            {Object.entries(formatLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClasses}>Ответственный</label>
          <select name="ownerId" defaultValue={contact?.ownerId ?? ""} className={inputClasses}>
            <option value="">Не назначен</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.message && <p className="text-sm text-danger-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Сохранение..." : contact ? "Сохранить" : "Создать контакт"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputClasses}
      />
      {errors && <p className="mt-1 text-sm text-danger-600">{errors[0]}</p>}
    </div>
  );
}
