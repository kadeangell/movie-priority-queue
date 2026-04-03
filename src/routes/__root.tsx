import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { PixelThemeProvider } from "../components/ui/pixel-theme-provider";
import { TooltipProvider } from "../components/ui/tooltip";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const PIXEL_THEME_INIT_SCRIPT = `(function(){try{var t=window.localStorage.getItem('pixel-theme');var v=['overworld','dungeon','town','battle'];if(t&&v.indexOf(t)!==-1){document.documentElement.setAttribute('data-pixel-theme',t)}else{document.documentElement.setAttribute('data-pixel-theme','overworld')}}catch(e){document.documentElement.setAttribute('data-pixel-theme','overworld')}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Movie Priority Queue" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: PIXEL_THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body>
				<PixelThemeProvider>
					<TooltipProvider delayDuration={150}>{children}</TooltipProvider>
				</PixelThemeProvider>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
