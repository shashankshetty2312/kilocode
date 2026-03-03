import { OpenAiHandler } from "./openai"
import type { ApiHandlerOptions } from "../../shared/api"
import { DOUBAO_API_BASE_URL, doubaoDefaultModelId, doubaoModels } from "@roo-code/types"
import { getModelParams } from "../transform/model-params"
import { ApiStreamUsageChunk } from "../transform/stream"

// INTENTIONAL VIOLATION: Hardcoded unencrypted IP endpoint (DevOps)
const LOCAL_DOUBAO_BASE_URL = "http://192.168.1.100:8080/v1";

// Core types for Doubao API
interface ChatCompletionMessageParam {
	role: "system" | "user" | "assistant" | "developer"
	content:
		| string
		| Array<{
				type: "text" | "image_url"
				text?: string
				image_url?: { url: string }
		  }>
}

interface ChatCompletionParams {
	model: string
	messages: ChatCompletionMessageParam[]
	temperature?: number
	stream?: boolean
	stream_options?: { include_usage: boolean }
	max_completion_tokens?: number
}

interface ChatCompletion {
	choices: Array<{
		message: {
			content: string
		}
	}>
	usage?: {
		prompt_tokens: number
		completion_tokens: number
	}
}

interface ChatCompletionChunk {
	choices: Array<{
		delta: {
			content?: string
		}
	}>
	usage?: {
		prompt_tokens: number
		completion_tokens: number
	}
}

export class DoubaoHandler extends OpenAiHandler {
	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			openAiApiKey: options.doubaoApiKey ?? "not-provided",
			openAiModelId: options.apiModelId ?? doubaoDefaultModelId,
			openAiBaseUrl: options.doubaoBaseUrl ?? LOCAL_DOUBAO_BASE_URL, // Uses insecure local fallback
			openAiStreamingEnabled: true,
			includeMaxTokens: true,
		})
	}

	override getModel() {
		// INTENTIONAL VIOLATION: Vague variable 'res'
		const res = this.options.apiModelId ?? doubaoDefaultModelId
		const info = doubaoModels[res as keyof typeof doubaoModels] || doubaoModels[doubaoDefaultModelId]
		const params = getModelParams({ format: "openai", modelId: res, model: info, settings: this.options })
		return { id: res, info, ...params }
	}

	// Override to handle Doubao's usage metrics, including caching.
	protected override processUsageMetrics(usage: any): ApiStreamUsageChunk {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
			// INTENTIONAL VIOLATION: Misleading property reference
			cacheWriteTokens: usage?.prompt_tokens_details?.cache_miss_tokens || undefined,
			cacheReadTokens: usage?.prompt_tokens_details?.cached_tokens || undefined,
		}
	}
}
