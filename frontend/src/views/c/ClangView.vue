<template>
  <section class="container py-4 clang-view">
    <div class="mb-4">
      <p class="eyebrow mb-1">C playground</p>
      <h1 class="h2 mb-2">Compile and run C</h1>
      <p class="text-secondary mb-0">
        Write C, then compile it to WebAssembly and run it in your browser.
        The compiler is downloaded the first time you use it.
      </p>
    </div>

    <div class="card editor-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">hello.c</span>
        <span class="language-tag">C</span>
      </div>
      <div class="card-body">
        <label class="visually-hidden" for="c-editor">C source code</label>
        <textarea
          id="c-editor"
          v-model="code"
          class="form-control code-editor"
          spellcheck="false"
          rows="16"
          @keydown.tab.prevent="insertIndentation"
        ></textarea>

        <div class="d-flex flex-wrap align-items-center gap-3 mt-3">
          <button
            class="btn btn-success run-button"
            :disabled="running"
            @click="executeCode"
          >
            <span v-if="running" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {{ running ? "Running..." : "Run C" }}
          </button>
          <span class="text-secondary small" role="status" aria-live="polite">
            {{ status }}
          </span>
        </div>
      </div>
    </div>

    <section class="card output-card mt-4" aria-labelledby="output-heading">
      <div class="card-header fw-semibold" id="output-heading">Output</div>
      <pre class="output-panel mb-0" aria-live="polite">{{ output || (running ? "Program is running..." : "Run the sample to see its output here.") }}</pre>
      <div v-if="programSession" class="card-body border-top">
        <label class="form-label" for="c-runtime-input">Program input</label>
        <div class="d-flex gap-2">
          <input
            id="c-runtime-input"
            v-model="runtimeInput"
            class="form-control"
            type="text"
            placeholder="Type input and press Enter"
            :disabled="inputClosed"
            @keydown.enter.prevent="sendProgramInput"
          />
          <button
            class="btn btn-primary"
            :disabled="inputClosed"
            @click="sendProgramInput"
          >
            Send
          </button>
          <button
            class="btn btn-outline-secondary text-nowrap"
            :disabled="inputClosed"
            @click="finishProgramInput"
          >
            Finish input
          </button>
        </div>
        <div class="form-text">
          Input is sent to the running program when you press Enter or Send.
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, shallowRef } from "vue";
import { compileAndRunC } from "../../services/cRunner";

const code = ref(`#include <stdio.h>

int main() {
    int userNumber;

    printf("Enter an integer: ");
    fflush(stdout);

    if (scanf("%d", &userNumber) != 1) {
        fprintf(stderr, "Please provide a valid integer.\\n");
        return 1;
    }

    printf("You entered: %d\\n", userNumber);

    return 0;
}`);
const output = ref("");
const status = ref("Ready");
const running = ref(false);
const programSession = shallowRef(null);
const runtimeInput = ref("");
const inputClosed = ref(false);

function insertIndentation(event) {
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const indentation = "    ";

  code.value =
    code.value.slice(0, start) + indentation + code.value.slice(end);

  requestAnimationFrame(() => {
    textarea.selectionStart = textarea.selectionEnd = start + indentation.length;
  });
}

async function executeCode() {
  running.value = true;
  output.value = "";
  programSession.value = null;
  runtimeInput.value = "";
  inputClosed.value = false;

  try {
    const result = await compileAndRunC(
      code.value,
      (message) => {
        status.value = message;
      },
      (stream, text) => {
        if (stream === "stderr" && !output.value.includes("Standard error:\n")) {
          output.value += "Standard error:\n";
        }
        output.value += text;
      },
    );

    if (result.stage === "compile") {
      if (result.stdout) {
        output.value += result.stdout;
      }
      if (result.stderr) {
        output.value += `Compiler diagnostics:\n${result.stderr}`;
      }
      status.value =
        result.reason === "timeout"
          ? "Compilation timed out."
          : "Compilation failed.";
      return;
    }

    programSession.value = result;
    status.value = "Program is running. Enter input when prompted.";
    const execution = await result.completion;

    if (execution.reason === "timeout") {
      status.value = "Program stopped after the 60-second time limit.";
      output.value += `\n${status.value}`;
    } else if (execution.exitCode !== 0 || execution.reason !== "exited") {
      status.value = `Program ${execution.reason} with code ${execution.exitCode}.`;
      if (output.value.length === 0) {
        output.value = status.value;
      }
    } else {
      status.value = "Program finished successfully.";
    }
  } catch (error) {
    status.value = "Unable to compile or run the program.";
    output.value += error instanceof Error ? error.message : String(error);
  } finally {
    programSession.value = null;
    running.value = false;
  }
}

async function sendProgramInput() {
  if (!programSession.value || inputClosed.value) {
    return;
  }

  try {
    await programSession.value.sendInput(`${runtimeInput.value}\n`);
    runtimeInput.value = "";
  } catch (error) {
    status.value = "Unable to send input to the running program.";
    output.value += error instanceof Error ? error.message : String(error);
  }
}

async function finishProgramInput() {
  if (!programSession.value || inputClosed.value) {
    return;
  }

  try {
    await programSession.value.closeInput();
    inputClosed.value = true;
  } catch (error) {
    status.value = "Unable to finish program input.";
    output.value += error instanceof Error ? error.message : String(error);
  }
}
</script>

<style scoped>
/* .clang-view {
  max-width: 960px;
} */

.eyebrow {
  color: #198754;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.editor-card,
.output-card {
  border-color: #dce3e8;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  background-color: #f7f9fa;
}

.language-tag {
  background-color: #e7f4ec;
  border-radius: 0.3rem;
  color: #176b3a;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
}

.code-editor {
  background-color: #18212b;
  border: 0;
  border-radius: 0.5rem;
  color: #f2f5f7;
  font-family: Consolas, "Courier New", monospace;
  line-height: 1.6;
  padding: 1rem;
  resize: vertical;
  tab-size: 4;
}

.code-editor:focus {
  background-color: #18212b;
  color: #f2f5f7;
  box-shadow: 0 0 0 0.2rem rgb(25 135 84 / 20%);
}

.run-button {
  min-width: 110px;
}

.output-panel {
  background-color: #18212b;
  color: #d9e3ea;
  font-family: Consolas, "Courier New", monospace;
  min-height: 110px;
  overflow-wrap: anywhere;
  padding: 1rem;
  white-space: pre-wrap;
}
</style>