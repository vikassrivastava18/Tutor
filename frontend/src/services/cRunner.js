/* global globalThis */

const CLANG_PACKAGE = "clang/clang@=0.160000.1";
const OUTPUT_LIMIT = 64 * 1024;
const COMPILE_TIMEOUT_MS = 60_000;
const PROGRAM_TIMEOUT_MS = 60_000;

let wasmerPromise;
let clangPackagePromise;

async function getWasmer() {
  if (!wasmerPromise) {
    const sdkUrl = `${process.env.BASE_URL}wasmer-sdk/dist/index.js`;
    wasmerPromise = import(/* webpackIgnore: true */ sdkUrl)
      .then(async ({ Wasmer }) => {
        const wasmer = new Wasmer();
        await wasmer.ready();
        return wasmer;
      })
      .catch((error) => {
        wasmerPromise = undefined;
        throw error;
      });
  }

  return wasmerPromise;
}

function getClangPackage(wasmer, onProgress) {
  if (!clangPackagePromise) {
    clangPackagePromise = wasmer.packages
      .load(CLANG_PACKAGE, { onProgress })
      .catch((error) => {
        clangPackagePromise = undefined;
        throw error;
      });
  }

  return clangPackagePromise;
}

export async function compileAndRunC(
  source,
  onStatus = () => {},
  onOutput = () => {},
) {
  if (globalThis.crossOriginIsolated !== true) {
    throw new Error(
      "The C compiler requires cross-origin isolation. Configure the frontend to send " +
        "Cross-Origin-Opener-Policy: same-origin and " +
        "Cross-Origin-Embedder-Policy: require-corp.",
    );
  }

  onStatus("Starting the WebAssembly runtime...");
  const wasmer = await getWasmer();

  onStatus("Loading the C compiler (the first download is about 100 MB)...");
  const clang = await getClangPackage(wasmer, (progress) => {
    if (progress.download.percent !== null) {
      onStatus(`Downloading C compiler: ${Math.round(progress.download.percent)}%`);
    } else {
      onStatus("Downloading C compiler...");
    }
  });

  const sandbox = await wasmer.sandboxes.create({
    packages: [clang],
    env: { CCC_OVERRIDE_OPTIONS: "#^-resource-dir=/lib/clang/16" },
    files: { "hello.c": source },
  });

  let closeSandbox = true;

  try {
    onStatus("Compiling C to WebAssembly...");
    const compilation = await sandbox
      .command("clang", ["hello.c", "-o", "hello.wasm"])
      .run({
        check: false,
        timeoutMs: COMPILE_TIMEOUT_MS,
        outputBytes: OUTPUT_LIMIT,
      });

    if (compilation.exitCode !== 0 || compilation.reason !== "exited") {
      return {
        stage: "compile",
        exitCode: compilation.exitCode,
        reason: compilation.reason,
        stdout: compilation.stdout.text(),
        stderr: compilation.stderr.text(),
      };
    }

    onStatus("Running the compiled WebAssembly program...");
    const program = await sandbox.installPackage(
      await sandbox.fs.readFile("hello.wasm"),
    );
    const process = await sandbox
      .command(program)
      .spawn({
        terminal: { columns: 80, rows: 24 },
        timeoutMs: PROGRAM_TIMEOUT_MS,
        outputBytes: OUTPUT_LIMIT,
      });

    if (!process.stdin || !process.stdout || !process.stderr) {
      throw new Error("The C program's input and output streams are unavailable.");
    }

    let stdout = "";
    let stderr = "";
    const readStream = async (stream, name) => {
      const decoder = new TextDecoder();

      for await (const chunk of stream) {
        const text = decoder.decode(chunk, { stream: true });
        if (name === "stdout") {
          stdout += text;
        } else {
          stderr += text;
        }
        onOutput(name, text);
      }

      const remaining = decoder.decode();
      if (remaining) {
        if (name === "stdout") {
          stdout += remaining;
        } else {
          stderr += remaining;
        }
        onOutput(name, remaining);
      }
    };

    const completion = (async () => {
      try {
        const streamReaders = [
          readStream(process.stdout, "stdout"),
          readStream(process.stderr, "stderr"),
        ];
        const execution = await process.wait({ check: false });
        await Promise.all(streamReaders);

        return {
          stage: "run",
          exitCode: execution.exitCode,
          reason: execution.reason,
          stdout,
          stderr,
        };
      } finally {
        await sandbox.close();
      }
    })();

    closeSandbox = false;

    return {
      stage: "run",
      sendInput: (text) => process.stdin.write(text),
      closeInput: () => process.stdin.close(),
      completion,
    };
  } finally {
    if (closeSandbox) {
      await sandbox.close();
    }
  }
}
