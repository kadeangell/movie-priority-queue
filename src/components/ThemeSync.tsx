import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePixelTheme } from "./ui/pixel-theme-provider";

export function ThemeSync() {
	const { theme: serverTheme } = useAuth();
	const { setTheme } = usePixelTheme();

	useEffect(() => {
		if (serverTheme) {
			setTheme(serverTheme);
		}
	}, [serverTheme, setTheme]);

	return null;
}
