// Game rules. No DOM access here; the UI and the tests both go through this entry.
export { STORAGE_KEY, DEFAULT_NAME, SAVE_VERSION, SAVE_SCHEMA, clamp, dayKey, freshState, migrate, restoreState, restoreDiscoveries, restoreWorld, applyElapsed } from './state.js?v=20261030d';
export { ACTION_LEVELS, STAGE_TITLES, friendship, canInteract } from './relationship.js?v=20261030d';
export { freshJourney, restoreJourney, remember, rememberAction, rememberChat } from './journey.js?v=20261030d';
export { dailyPlan, care, chat } from './care.js?v=20261030d';
export { clockOf, phaseOf, weatherOf, whereabouts, placeOpen, canMeet, moodOf, awaySummary } from './world.js?v=20261030d';
export { visit } from './visit.js?v=20261030d';
export { PATIENCE, patienceFor, annoyedNow } from './patience.js?v=20261030d';
