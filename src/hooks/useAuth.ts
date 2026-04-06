import { queryOptions, useQuery } from "@tanstack/react-query";
import type { PixelTheme } from "../components/ui/pixel-theme-provider";
import { getMe } from "../server/functions/auth";

export const authQueries = {
	me: () =>
		queryOptions({
			queryKey: ["auth", "me"],
			queryFn: () => getMe(),
			staleTime: 5 * 60 * 1000,
			retry: false,
		}),
};

export function useAuth() {
	const query = useQuery(authQueries.me());

	return {
		user: query.data ?? null,
		isLoading: query.isLoading,
		isAuthenticated: !!query.data,
		theme: (query.data?.theme as PixelTheme) ?? null,
	};
}
