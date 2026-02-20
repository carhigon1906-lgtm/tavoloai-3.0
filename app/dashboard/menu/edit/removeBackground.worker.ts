/// <reference lib="webworker" />

import * as ort from "onnxruntime-web"
import { newSession, remove, rembgConfig } from "@bunnio/rembg-web"

type WorkerMessage =
  | { type: "start" }
  | { type: "progress"; value: number }
  | {
      type: "done"
      blob: Blob
      timings: { totalMs: number; decodeMs?: number; inferenceMs?: number; maskMs?: number; encodeMs?: number }
    }
  | { type: "error"; message: string }

const post = (message: WorkerMessage) => self.postMessage(message)

// rembg-web expects HTMLCanvasElement (not available in workers). Use OffscreenCanvas.
if (typeof (self as unknown as { HTMLCanvasElement?: typeof OffscreenCanvas }).HTMLCanvasElement === "undefined") {
  ;(self as unknown as { HTMLCanvasElement: typeof OffscreenCanvas }).HTMLCanvasElement = OffscreenCanvas
}

let sessionPromise: Promise<Awaited<ReturnType<typeof newSession>>> | null = null

const configureOrt = () => {
  ort.env.wasm.wasmPaths = "/onnxruntime/"
  ort.env.wasm.simd = true
  ort.env.wasm.numThreads = 1
  ort.env.wasm.proxy = false
  ort.env.wasm.useThreads = false
  ort.env.wasm.useJsep = false
}

const getSession = () => {
  if (!sessionPromise) {
    configureOrt()
    // Use the lightweight model for speed. It expects the model file at /models/u2netp.onnx
    sessionPromise = newSession("u2netp")
  }
  return sessionPromise
}

self.onmessage = async (event: MessageEvent<{ bitmap: ImageBitmap }>) => {
  const { bitmap } = event.data
  try {
    post({ type: "start" })
    const startTime = performance.now()

    rembgConfig.setBaseUrl("/models")

    const session = await getSession()
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No se pudo preparar el canvas.")
    ctx.drawImage(bitmap, 0, 0)

    const result = await remove(canvas as unknown as HTMLCanvasElement, {
      session,
      onProgress: (progress) => {
        const pct = Math.max(5, Math.min(95, Math.round(progress * 100)))
        post({ type: "progress", value: pct })
      },
    })

    const endTime = performance.now()
    const timings = {
      totalMs: Math.round(endTime - startTime),
    }

    post({ type: "done", blob: result, timings })
  } catch (error) {
    const err = error as { message?: string; stack?: string; name?: string; cause?: unknown }
    const details = [
      err?.name ? `Name: ${err.name}` : null,
      err?.message ? `Message: ${err.message}` : null,
      err?.stack ? `Stack: ${err.stack}` : null,
      err?.cause ? `Cause: ${JSON.stringify(err.cause)}` : null,
    ]
      .filter(Boolean)
      .join("\n")
    const message = details || "No se pudo eliminar el fondo."
    post({ type: "error", message })
  }
}
