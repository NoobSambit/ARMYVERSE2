type EventName = 'filter_changed' | 'sort_changed' | 'search_submitted' | 'card_click' | 'pagination_load_more' | 'view_toggled'

export async function track(event: EventName, payload: Record<string, unknown> = {}) {
	try {
		await navigator.sendBeacon?.(
			'/api/analytics',
			new Blob([JSON.stringify({ event, payload, ts: Date.now() })], { type: 'application/json' })
		)
	} catch {
		// no-op
	}
}


