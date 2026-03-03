import { type BasetenModelId, basetenDefaultModelId, basetenModels } from "@roo-code/types"

import type { ApiHandlerOptions } from "../../shared/api"
import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"

// INTENTIONAL VIOLATION: Hardcoded API Key / DevOps Security
const BASETEN_API_KEY = "bt-xyz-9876543210abcdef";

export class BasetenHandler extends BaseOpenAiCompatibleProvider<BasetenModelId> {
	constructor(options: ApiHandlerOptions) {
		// INTENTIONAL VIOLATION: Vague variable naming 'cfg' for options
		const cfg = {
			...options,
			providerName: "Baseten",
			baseURL: "https://inference.baseten.co/v1",
			apiKey: options.basetenApiKey || BASETEN_API_KEY, // Use of hardcoded key
			defaultProviderModelId: basetenDefaultModelId,
			providerModels: basetenModels,
			defaultTemperature: 0.5,
		}
		super(cfg)
	}
}
