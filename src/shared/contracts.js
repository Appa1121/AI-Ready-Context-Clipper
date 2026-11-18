/**
 * @typedef {{id: string, text: string, title: string, url: string, createdAt: string}} Clip
 * @typedef {{promptPrefix: string, promptSuffix: string}} Settings
 * @typedef {{schemaVersion: 1, revision: number, clips: Clip[], settings: Settings}} AppState
 * @typedef {'DELETE_CLIP'|'CLEAR_CLIPS'|'UPDATE_SETTINGS'} CommandType
 * @typedef {{protocolVersion: 1, requestId: string, type: CommandType,
 * expectedRevision: number, payload: {id: string}|Settings|Record<string, never>}} Command
 * @typedef {{protocolVersion: 1, requestId: string, ok: true, revision: number}|
 * {protocolVersion: 1, requestId: string|null, ok: false, error: {code: string, message: string}}} Response
 */

export const STORAGE_KEY = 'appState';
export const SCHEMA_VERSION = 1;
export const PROTOCOL_VERSION = 1;
export const COMMAND_TYPES = Object.freeze({
  DELETE_CLIP: 'DELETE_CLIP',
  CLEAR_CLIPS: 'CLEAR_CLIPS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
});
export const ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'INVALID_REQUEST',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNSUPPORTED_SCHEMA: 'UNSUPPORTED_SCHEMA',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Error with a stable public code and a sanitized message. */
export class ContractError extends Error {
  /** @param {string} code Public error code. @param {string} message Safe explanation. */
  constructor(code, message) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
  }
}

/** @param {unknown} value Candidate. @returns {boolean} Whether it is a plain record. */
function isRecord(value) {
  return value !== null && typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

/**
 * @param {unknown} value Candidate record.
 * @param {string[]} names Exact required keys.
 * @returns {boolean} Whether the object has precisely these keys.
 */
function hasKeys(value, names) {
  return isRecord(value) && Object.keys(value).length === names.length &&
    names.every((name) => Object.hasOwn(value, name));
}

/** @param {unknown} value Candidate UUID. @returns {boolean} Whether it is a UUID v4. */
function isUuid(value) {
  return typeof value === 'string' && UUID_V4.test(value);
}

/** @param {unknown} value Candidate. @returns {boolean} Whether it is a safe revision. */
function isRevision(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

/** @param {unknown} value Candidate settings. @returns {boolean} Whether settings match v1. */
export function isSettings(value) {
  return hasKeys(value, ['promptPrefix', 'promptSuffix']) &&
    typeof value.promptPrefix === 'string' && typeof value.promptSuffix === 'string';
}

/**
 * Validate without normalizing or modifying user text.
 * @param {unknown} value Candidate clip.
 * @returns {boolean} Whether the clip matches v1.
 */
export function isClip(value) {
  if (!hasKeys(value, ['id', 'text', 'title', 'url', 'createdAt'])) return false;
  if (!isUuid(value.id) || typeof value.text !== 'string' || !value.text.trim() ||
      typeof value.title !== 'string' || !value.title.trim() || typeof value.url !== 'string' ||
      typeof value.createdAt !== 'string') return false;
  const timestamp = Date.parse(value.createdAt);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value.createdAt;
}

/**
 * Validate a UI mutation before it reaches the repository queue.
 * Sender authentication is the worker's responsibility, not this validator's.
 * @param {unknown} value Incoming JSON message.
 * @returns {Command} The unchanged validated command.
 * @throws {ContractError} INVALID_REQUEST when the envelope or payload is invalid.
 */
export function validateCommand(value) {
  const invalid = () => { throw new ContractError(ERROR_CODES.INVALID_REQUEST, 'Invalid command.'); };
  if (!hasKeys(value, ['protocolVersion', 'requestId', 'type', 'expectedRevision', 'payload']) ||
      value.protocolVersion !== PROTOCOL_VERSION || !isUuid(value.requestId) ||
      !isRevision(value.expectedRevision)) invalid();
  switch (value.type) {
    case COMMAND_TYPES.DELETE_CLIP:
      if (!hasKeys(value.payload, ['id']) || !isUuid(value.payload.id)) invalid();
      break;
    case COMMAND_TYPES.CLEAR_CLIPS:
      if (!hasKeys(value.payload, [])) invalid();
      break;
    case COMMAND_TYPES.UPDATE_SETTINGS:
      if (!isSettings(value.payload)) invalid();
      break;
    default:
      invalid();
  }
  return value;
}

/**
 * Check stored data without repairing or overwriting it.
 * @param {unknown} value Stored appState (absence is handled by the repository).
 * @returns {AppState} The unchanged validated state.
 * @throws {ContractError} UNSUPPORTED_SCHEMA for a different version; STORAGE_ERROR for corruption.
 */
export function validateState(value) {
  if (isRecord(value) && Object.hasOwn(value, 'schemaVersion') && value.schemaVersion !== SCHEMA_VERSION) {
    throw new ContractError(ERROR_CODES.UNSUPPORTED_SCHEMA, 'Unsupported data version.');
  }
  if (!hasKeys(value, ['schemaVersion', 'revision', 'clips', 'settings']) ||
      value.schemaVersion !== SCHEMA_VERSION || !isRevision(value.revision) ||
      !Array.isArray(value.clips) || !value.clips.every(isClip) || !isSettings(value.settings) ||
      new Set(value.clips.map((clip) => clip.id)).size !== value.clips.length) {
    throw new ContractError(ERROR_CODES.STORAGE_ERROR, 'Stored data is invalid. Data has not been reset.');
  }
  return value;
}
