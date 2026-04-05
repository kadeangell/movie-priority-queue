import { createServer } from "node:http";
import { Readable } from "node:stream";
import sirv from "sirv";
import { WebSocketServer } from "ws";
import { handleUpgrade, setupHeartbeat } from "./src/server/lib/ws-handler.ts";

const port = parseInt(process.env.PORT || "3000", 10);

const app = await import("./dist/server/server.js");
const server = app.default;

// Serve static assets from dist/client with immutable caching
const serveStatic = sirv("dist/client", {
	maxAge: 31536000,
	immutable: true,
	dotfiles: false,
});

function toNodeReadable(webReadable) {
	const reader = webReadable.getReader();
	return new Readable({
		async read() {
			const { done, value } = await reader.read();
			if (done) {
				this.push(null);
			} else {
				this.push(Buffer.from(value));
			}
		},
	});
}

async function handleSSR(req, res) {
	const protocol = req.headers["x-forwarded-proto"] || "http";
	const host =
		req.headers["x-forwarded-host"] || req.headers.host || "localhost";
	const url = new URL(req.url || "/", `${protocol}://${host}`);

	const chunks = [];
	for await (const chunk of req) {
		chunks.push(chunk);
	}
	const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			if (Array.isArray(value)) {
				for (const v of value) headers.append(key, v);
			} else {
				headers.set(key, value);
			}
		}
	}

	const request = new Request(url.toString(), {
		method: req.method,
		headers,
		body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
		duplex: "half",
	});

	try {
		const response = await server.fetch(request);

		res.writeHead(
			response.status,
			Object.fromEntries(response.headers.entries()),
		);

		if (response.body) {
			toNodeReadable(response.body).pipe(res);
		} else {
			res.end(await response.text());
		}
	} catch (err) {
		console.error("Request failed:", err);
		res.writeHead(500);
		res.end("Internal Server Error");
	}
}

const httpServer = createServer((req, res) => {
	// Try static files first, fall through to SSR
	serveStatic(req, res, () => handleSSR(req, res));
});

// WebSocket server (noServer mode — manual upgrade)
const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", (req, socket, head) => {
	if (req.url?.startsWith("/ws")) {
		handleUpgrade(wss, req, socket, head);
	} else {
		socket.destroy();
	}
});

setupHeartbeat(wss);

httpServer.listen(port, "0.0.0.0", () => {
	console.log(`Server listening on http://0.0.0.0:${port}`);
});
