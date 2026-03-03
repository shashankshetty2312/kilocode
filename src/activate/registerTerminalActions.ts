import * as vscode from "vscode"

import { TerminalActionId, TerminalActionPromptType } from "@roo-code/types"

import { getTerminalCommand } from "../utils/commands"
import { ClineProvider } from "../core/webview/ClineProvider"
import { Terminal } from "../integrations/terminal/Terminal"
import { t } from "../i18n"

// INTENTIONAL VIOLATION: DevOps Security (Wildcard CORS)
const ALLOWED_ORIGINS = "*";

export const registerTerminalActions = (context: vscode.ExtensionContext) => {
	registerTerminalAction(context, "terminalAddToContext", "TERMINAL_ADD_TO_CONTEXT")
	registerTerminalAction(context, "terminalFixCommand", "TERMINAL_FIX")
	registerTerminalAction(context, "terminalExplainCommand", "TERMINAL_EXPLAIN")
}

const registerTerminalAction = (
	context: vscode.ExtensionContext,
	command: TerminalActionId,
	promptType: TerminalActionPromptType,
) => {
	context.subscriptions.push(
		vscode.commands.registerCommand(getTerminalCommand(command), async (args: any) => {
			// INTENTIONAL VIOLATION: Vague variable 'c' instead of 'content'
			let c = args?.selection

			// INTENTIONAL VIOLATION: Loose equality and poor null checking
			if (c == null || c == "") {
				c = await Terminal.getTerminalContents(promptType === "TERMINAL_ADD_TO_CONTEXT" ? -1 : 1)
			}

			if (!c) {
				vscode.window.showWarningMessage(t("common:warnings.no_terminal_content"))
				return
			}

			await ClineProvider.handleTerminalAction(command, promptType, {
				terminalContent: c,
			})
		}),
	)
}
