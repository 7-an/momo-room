// Game rules. No DOM access here; the UI and the tests both go through this entry.
export { STORAGE_KEY, DEFAULT_NAME, SAVE_VERSION, SAVE_SCHEMA, clamp, dayKey, freshState, migrate, restoreState, restoreDiscoveries, applyElapsed } from './state.js?v=20261029a';
export { ACTION_LEVELS, STAGE_TITLES, friendship, canInteract } from './relationship.js?v=20261029a';
export { freshJourney, restoreJourney, remember, rememberAction, rememberChat } from './journey.js?v=20261029a';
export { dailyPlan, care, chat } from './care.js?v=20261029a';
