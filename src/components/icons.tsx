type IconProps = { className?: string };

const base = "h-[18px] w-[18px]";

export function DashboardIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="2.5" width="7" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="9.5" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.5" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ContactsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function KanbanIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="3" width="4.5" height="14" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="3" width="4.5" height="9" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.5" y="3" width="3" height="11" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function TasksIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.2l2 2 4.5-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.8 5.2l-1.13 1.13M6.33 13.67L5.2 14.8M14.8 14.8l-1.13-1.13M6.33 6.33L5.2 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 17H4.5C3.67 17 3 16.33 3 15.5v-11C3 3.67 3.67 3 4.5 3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 13.5L17 10 13 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 17l-3.8-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6M6 6l.7 9.3A1.5 1.5 0 008.2 17h3.6a1.5 1.5 0 001.5-1.7L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.2l2.8 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5l8 14.2H2L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function CoinsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="7.5" cy="6" rx="4.5" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 6v3c0 1.38 2.015 2.5 4.5 2.5S12 10.38 12 9V6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9v3c0 1.38 2.015 2.5 4.5 2.5.57 0 1.116-.06 1.616-.17" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="13" cy="11.5" rx="4.5" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 11.5v3c0 1.38 2.015 2.5 4.5 2.5s4.5-1.12 4.5-2.5v-3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function TrendUpIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 14l4.5-5 3 3L17 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 5H17v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FinanceIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 16.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 16.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5.5" y="11" width="2.6" height="5.5" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.2" y="7.5" width="2.6" height="9" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.9" y="4" width="2.1" height="12.5" rx="0.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TeacherIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 6.5L10 3l7.5 3.5L10 10 2.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 8.2v3.3c0 1.4 2 2.5 4.5 2.5s4.5-1.1 4.5-2.5V8.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.5 6.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HistoryIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3a7 7 0 11-6.75 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.5 3.3V7h3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6.5v4l2.8 1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3.5c-2 0-3.5 1.6-3.5 3.6v2.4c0 .6-.2 1.2-.6 1.7l-.7.9c-.5.6 0 1.4.7 1.4h8.2c.7 0 1.2-.8.7-1.4l-.7-.9c-.4-.5-.6-1.1-.6-1.7V7.1c0-2-1.5-3.6-3.5-3.6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.3 15.5a1.7 1.7 0 003.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
