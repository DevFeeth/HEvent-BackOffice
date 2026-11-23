const base = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

export function UsersIcon() {
    return (
        <svg {...base}>
            <circle cx="9" cy="8" r="4"/>
            <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/>
            <path d="M16 4a4 4 0 0 1 0 8"/>
            <path d="M22 21v-1a6 6 0 0 0-4-5.6"/>
        </svg>
    );
}

export function CalendarIcon() {
    return (
        <svg {...base}>
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <path d="M3 10h18M8 3v4M16 3v4"/>
        </svg>
    );
}

export function SearchIcon() {
    return (
        <svg {...base}>
            <circle cx="11" cy="11" r="7"/>
            <path d="m21 21-4.3-4.3"/>
        </svg>
    );
}

export function ArrowRightIcon() {
    return (
        <svg {...base}>
            <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
    );
}

export function ArrowLeftIcon() {
    return (
        <svg {...base}>
            <path d="M19 12H5M11 6l-6 6 6 6"/>
        </svg>
    );
}

export function ChevronLeftIcon() {
    return (
        <svg {...base}>
            <path d="m15 6-6 6 6 6"/>
        </svg>
    );
}

export function ChevronRightIcon() {
    return (
        <svg {...base}>
            <path d="m9 6 6 6-6 6"/>
        </svg>
    );
}

export function TrashIcon() {
    return (
        <svg {...base}>
            <path d="M4 7h16M10 11v6M14 11v6"/>
            <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
            <path d="M9 7V4h6v3"/>
        </svg>
    );
}

export function TagIcon() {
    return (
        <svg {...base}>
            <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/>
            <circle cx="8" cy="8" r="1.5"/>
        </svg>
    );
}

export function ShieldIcon() {
    return (
        <svg {...base}>
            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>
        </svg>
    );
}

export function CheckIcon() {
    return (
        <svg {...base}>
            <path d="m5 12 5 5 9-10"/>
        </svg>
    );
}
