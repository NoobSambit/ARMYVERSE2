type EventName =
  | 'filter_changed'
  | 'sort_changed'
  | 'search_submitted'
  | 'card_click'
  | 'pagination_load_more'
  | 'view_toggled'
  | 'profile_opened'
  | 'profile_saved'
  | 'profile_tab_changed'
  | 'profile_link_copied'
  | 'field_toggled_visibility'
  | 'connection_connected'
  | 'connection_disconnected'
  | 'avatar_uploaded'
  | 'banner_uploaded'
  | 'handle_availability_checked'
  | 'spotify_search_performed'
  | 'privacy_setting_changed'
  | 'notification_setting_changed'
  | 'data_exported'
  | 'account_deletion_initiated'
  | 'blog_published'
  | 'blog_unpublished'
  | 'blog_deleted'
  | 'blog_restored'
  | 'blog_added_to_collection'
  | 'blog_saved'
  | 'blog_reaction'

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


