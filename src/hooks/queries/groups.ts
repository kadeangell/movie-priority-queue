import { queryOptions } from "@tanstack/react-query";
import { getGroup, listMyGroups } from "../../server/functions/groups";

export const groupQueries = {
	all: () =>
		queryOptions({
			queryKey: ["groups"],
			queryFn: () => listMyGroups(),
		}),
	detail: (groupId: string) =>
		queryOptions({
			queryKey: ["groups", groupId],
			queryFn: () => getGroup({ data: { groupId } }),
			enabled: !!groupId,
		}),
};
