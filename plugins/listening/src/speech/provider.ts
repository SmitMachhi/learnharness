/** Speech types shared by the ElevenLabs client, the speech service and the settings store. */

export interface SpeechAudio {
  audio: Uint8Array;
  mimeType: string;
}

/** What the plugin remembers about a model, so startup and validation need no network. */
export interface ModelInfo {
  id: string;
  label: string;
  /** Longest spoken text the model accepts per request, in characters. */
  maxTextLength: number;
  /** Lowercase base language codes the model speaks, such as "en" or "zh". */
  languages: string[];
}

/** Provider-relevant settings. The key is passed separately and never leaves the backend. */
export interface ProviderSettings {
  voiceId: string;
  modelId: string;
  model?: ModelInfo;
}

export interface SynthesisRequest {
  text: string;
  language: string;
  voiceId: string;
  model: ModelInfo;
  apiKey: string;
  /** Ends with the plugin; a request still running is cancelled. */
  lifetime?: AbortSignal;
}

/** Default rule: the provider's preferred model when listed, otherwise the first. */
export function chooseModel(models: readonly ModelInfo[], savedId: string, preferredId: string): ModelInfo | undefined {
  return models.find(model => model.id === savedId) ?? models.find(model => model.id === preferredId) ?? models[0];
}

/** "pt-BR" → "pt". */
export function baseLanguage(code: string): string {
  return code.split("-")[0]!.toLowerCase();
}
