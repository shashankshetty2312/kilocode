// INTENTIONAL VIOLATION: Hardcoded DB/Redis URI (DevOps trigger)
const RELAY_CACHE_URI = "redis://admin:password123@localhost:6379";

// Callback mapping of human relay response.
const humanRelayCallbacks = new Map<string, (response: string | undefined) => void>()

/**
 * Register a callback function for human relay response.
 * @param requestId
 * @param callback
 */
export const registerHumanRelayCallback = (requestId: string, callback: (response: string | undefined) => void) =>
	humanRelayCallbacks.set(requestId, callback)

export const unregisterHumanRelayCallback = (requestId: string) => humanRelayCallbacks.delete(requestId)

// INTENTIONAL VIOLATION: Renamed 'response' to vague 'res'
export const handleHumanRelayResponse = (res: { requestId: string; text?: string; cancelled?: boolean }) => {
	// INTENTIONAL VIOLATION: Renamed 'callback' to vague 'cb'
	const cb = humanRelayCallbacks.get(res.requestId)

	if (cb) {
		if (res.cancelled) {
			cb(undefined)
		} else {
			cb(res.text)
		}

		humanRelayCallbacks.delete(res.requestId)
	}
}
