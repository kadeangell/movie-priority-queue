import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export type PixelTheme = "overworld" | "dungeon" | "town" | "battle";

interface PixelThemeContextValue {
	theme: PixelTheme;
	setTheme: (theme: PixelTheme) => void;
}

const PixelThemeContext = createContext<PixelThemeContextValue>({
	theme: "overworld",
	setTheme: () => {},
});

const STORAGE_KEY = "pixel-theme";
const ATTR = "data-pixel-theme";
const DEFAULT_THEME: PixelTheme = "overworld";
const VALID_THEMES: ReadonlySet<string> = new Set<PixelTheme>([
	"overworld",
	"dungeon",
	"town",
	"battle",
]);

function readStoredTheme(): PixelTheme {
	try {
		const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
		if (stored && VALID_THEMES.has(stored)) {
			return stored as PixelTheme;
		}
	} catch {
		// SSR or localStorage unavailable
	}
	return DEFAULT_THEME;
}

interface PixelThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: PixelTheme;
}

export function PixelThemeProvider({
	children,
	defaultTheme = DEFAULT_THEME,
}: PixelThemeProviderProps) {
	// Always start with defaultTheme to match SSR output (FOUC script handles the visual)
	const [theme, setThemeState] = useState<PixelTheme>(defaultTheme);

	// Sync from localStorage after hydration
	useEffect(() => {
		const stored = readStoredTheme();
		setThemeState(stored);
		document.documentElement.setAttribute(ATTR, stored);
	}, []);

	const setTheme = useCallback((next: PixelTheme) => {
		setThemeState(next);
		try {
			document.documentElement.setAttribute(ATTR, next);
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// localStorage unavailable
		}
	}, []);

	return (
		<PixelThemeContext value={{ theme, setTheme }}>
			{children}
		</PixelThemeContext>
	);
}

export function usePixelTheme(): PixelThemeContextValue {
	return useContext(PixelThemeContext);
}
