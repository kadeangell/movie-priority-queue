import { queryOptions } from "@tanstack/react-query";
import { getQueueItems } from "../../server/functions/queue";

export const queueQueries = {
	items: (groupId: string) =>
		queryOptions({
			queryKey: ["queue", groupId],
			queryFn: () => getQueueItems({ data: { groupId } }),
			enabled: !!groupId,
		}),
};
