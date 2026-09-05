"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { sourceLabels, formatLabels } from "@/lib/labels";
import { formatPhoneInput } from "@/lib/phone-format";
import { AlertIcon } from "@/components/icons";
import type { Contact } from "@/generated/prisma/client";

const inputClasses =
  "w-full rounded-lg border border-ink-300 bg-ink-50/60 px-3 py-2 text-sm outline-none transition-smooth focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";
const labelClasses = "mb-1 block text-[13px] font-medium text-ink-700";

export function ContactForm({
  owners,
  teachers,
  contact,
}: {
  owners: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  contact?: Contact;
}) {
  const action = contact ? updateContact : createContact;
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmDuplicateRef = useRef<HTMLInputElement>(null);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {contact && <input type="hidden" name="contactId" value={contact.id} />}
      <input ref={confirmDuplicateRef} type="hidden" name="confirmDuplicate" value="" />

      {state?.duplicate && (
        <div className="animate-fade-in flex items-start gap-2.5 rounded-lg border border-khaki-400 bg-khaki-100 p-3 text-sm">
          <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-khaki-600" />
          <div>
            <p className="text-khaki-600">
              Контакт с таким телефоном уже есть:{" "}
              <Link href={`/contacts/${state.duplicate.id}`} className="font-medium underline hover:no-underline">
                {state.duplicate.fullName}
              </Link>{" "}
              ({state.duplicate.phone})
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirmDuplicateRef.current) confirmDuplicateRef.current.value = "true";
                formRef.current?.requestSubmit();
              }}
              className="mt-1.5 text-xs font-medium text-khaki-600 underline hover:no-underline"
            >
              Всё равно создать новый контакт
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя" name="fullName" required defaultValue={contact?.fullName} errors={state?.errors?.fullName} />
        <PhoneField defaultValue={contact?.phone} errors={state?.errors?.phone} />
        <Field label="Возраст" name="age" type="number" defaultValue={contact?.age?.toString() ?? ""} errors={state?.errors?.age} />
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

        <div>
          <label className={labelClasses}>Учитель</label>
          <select name="teacherId" defaultValue={contact?.teacherId ?? ""} className={inputClasses}>
            <option value="">Не назначен</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.message && <p className="text-sm text-danger-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="transition-smooth rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 hover:shadow-pop active:scale-[0.98] disabled:opacity-50"
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

function PhoneField({ defaultValue, errors }: { defaultValue?: string; errors?: string[] }) {
  return (
    <div>
      <label htmlFor="phone" className={labelClasses}>
        Телефон
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        required
        defaultValue={formatPhoneInput(defaultValue ?? "")}
        onChange={(e) => {
          e.target.value = formatPhoneInput(e.target.value);
        }}
        onFocus={(e) => {
          if (e.target.value === "+7") e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        }}
        placeholder="+7 700 000 00 00"
        className={inputClasses}
      />
      {errors && <p className="mt-1 text-sm text-danger-600">{errors[0]}</p>}
    </div>
  );
}
