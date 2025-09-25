export function readingTimeFromHtml(html: string): number {
	const text = html.replace(/<[^>]*>/g, ' ');
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

export function trendingScore(params: {
	views: number;
	reactions: { moved?: number; loved?: number; surprised?: number };
	createdAt: Date | string;
}): number {
	const { views, reactions, createdAt } = params;
	const totalReactions = (reactions?.moved || 0) + (reactions?.loved || 0) + (reactions?.surprised || 0);
	const base = views * 0.7 + totalReactions * 3;
	const created = new Date(createdAt).getTime();
	const now = Date.now();
	const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
	const ageMs = Math.max(0, now - created);
	const decay = Math.exp(-ageMs / sevenDaysMs);
	return base * decay;
}

export function highlightMatch(text: string, query: string): { parts: Array<{ value: string; match: boolean }> } {
	if (!query) return { parts: [{ value: text, match: false }] };
	try {
		const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
		const segments = text.split(regex);
		const parts = segments.map((seg) => ({ value: seg, match: regex.test(seg) }));
		return { parts };
	} catch {
		return { parts: [{ value: text, match: false }] };
	}
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


