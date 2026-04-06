import { queryOptions } from "@tanstack/react-query";
import type { ContentType } from "../../lib/content-type";
import { getQueueItems } from "../../server/functions/queue";

export const queueQueries = {
	items: (groupId: string, contentType: ContentType) =>
		queryOptions({
			queryKey: ["queue", groupId, contentType],
			queryFn: () => getQueueItems({ data: { groupId, contentType } }),
			enabled: !!groupId,
		}),
};
