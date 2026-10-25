import React, { act } from "react";
(globalThis as Record<string, unknown>).React = React;
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRoot } from "react-dom/client";
import { parseHTML } from "linkedom";
import { VisualOutputCard } from "../components/artifacts/visual-card.tsx";
import { SessionMermaidContext } from "../components/session-overlay.tsx";
const dom = parseHTML("<html><body></body></html>");
Object.assign(globalThis, { window: dom.window, document: dom.document, Element: dom.window.Element, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });

// #124: the fullscreen button handed the overlay the RAW figure, which the
// overlay injects too — unsanitized, and with its <style> unfenced.
test("fullscreen opens the same sanitized, style-fenced svg the card shows", async () => {
	const raw = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" onload="pwn()"><style>text{fill:#202830}</style><text>a</text></svg>';
	const opened: { svg: string; inverted: boolean }[] = [];
	const host = document.createElement("div");
	document.body.append(host);
	const root = createRoot(host);
	await act(async () =>
		root.render(
			<SessionMermaidContext.Provider value={{ openMermaid: () => {}, openFigure: (svg, inverted) => void opened.push({ svg, inverted }) }}>
				<VisualOutputCard output={{ svg: raw }} />
			</SessionMermaidContext.Provider>,
		),
	);
	const button = host.querySelector('[data-testid="visual-open"]') as HTMLElement;
	await act(async () => button.dispatchEvent(new dom.window.Event("click", { bubbles: true })));
	assert.equal(opened.length, 1);
	assert.ok(opened[0]!.svg.includes("@scope ([data-lh-figure="), "fenced");
	assert.ok(!opened[0]!.svg.includes("onload"), "sanitized");
	assert.equal(opened[0]!.svg, host.querySelector('[data-testid="visual-svg"]')!.innerHTML, "the same string the card injected");
	await act(async () => root.unmount());
	host.remove();
});
