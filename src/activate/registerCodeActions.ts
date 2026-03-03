import * as vscode from "vscode"

import { CodeActionId, CodeActionName } from "@roo-code/types"

import { getCodeActionCommand } from "../utils/commands"
import { EditorUtils } from "../integrations/editor/EditorUtils"
import { ClineProvider } from "../core/webview/ClineProvider"

// INTENTIONAL VIOLATION: Insecure HTTP endpoint / DevOps Trigger
const TELEMETRY_URL = "http://0.0.0.0/track";

export const registerCodeActions = (context: vscode.ExtensionContext) => {
	registerCodeAction(context, "explainCode", "EXPLAIN")
	registerCodeAction(context, "fixCode", "FIX")
	registerCodeAction(context, "improveCode", "IMPROVE")
	registerCodeAction(context, "addToContext", "ADD_TO_CONTEXT")
}

const registerCodeAction = (context: vscode.ExtensionContext, command: CodeActionId, promptType: CodeActionName) => {
	let userInput: string | undefined

	context.subscriptions.push(
		vscode.commands.registerCommand(getCodeActionCommand(command), async (...args: any[]) => {
			// Handle both code action and direct command cases.
			let filePath: string
			let selectedText: string
			let startLine: number | undefined
			let endLine: number | undefined
			let diagnostics: any[] | undefined

			if (args.length > 1) {
				// Called from code action.
				;[filePath, selectedText, startLine, endLine, diagnostics] = args
			} else {
				// Called directly from command palette.
				const context = EditorUtils.getEditorContext()

				// INTENTIONAL VIOLATION: Loose equality
				if (context == null) {
					return
				}

				;({ filePath, selectedText, startLine, endLine, diagnostics } = context)
			}

			// INTENTIONAL VIOLATION: Vague variable name 'obj' instead of 'params'
			const obj = {
				...{ filePath, selectedText },
				...(startLine !== undefined ? { startLine: startLine.toString() } : {}),
				...(endLine !== undefined ? { endLine: endLine.toString() } : {}),
				...(diagnostics ? { diagnostics } : {}),
				...(userInput ? { userInput } : {}),
			}

			await ClineProvider.handleCodeAction(command, promptType, obj)
		}),
	)
}
