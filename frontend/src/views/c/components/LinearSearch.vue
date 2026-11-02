<template>
  <section class="container-fluid py-4 clang-view">
    <div class="row g-4 clang-layout">
      <div class="col-lg-7">
        <section class="card problem-card" aria-labelledby="problem-heading">
          <div class="card-header fw-semibold" id="problem-heading">Problem statement</div>
          <div class="card-body">
            <p class="mb-0 text-white">
              Write a C program that asks the user for an integer, validates the input,
              and searches the number in predefined list.
            </p>
          </div>
        </section>

        <section class="card editor-card mt-4" aria-labelledby="editor-heading">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-semibold" id="editor-heading">Source code</span>
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
              <span class="small" role="status" aria-live="polite">
                {{ status }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div class="col-lg-5">
        <section class="card output-card h-100" aria-labelledby="output-heading">
          <div class="card-header fw-semibold" id="output-heading">Result</div>
          <pre class="output-panel mb-0" aria-live="polite">{{ output || (running ? "Program is running..." : "Run the sample to see its output here.") }}</pre>
          <div v-if="programSession" class="card-body border-top runtime-input-panel">
            <label class="form-label" for="c-runtime-input">
              Program input
              <span class="input-available ms-2">{{ inputPrompt }}</span>
            </label>
            <div class="d-flex flex-wrap gap-2">
              <input
                id="c-runtime-input"
                v-model="runtimeInput"
                class="form-control runtime-input"
                type="text"
                placeholder="Type input and press Enter"
                :disabled="inputClosed"
                :class="{ 'input-required': !inputClosed }"
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
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, shallowRef } from "vue";
import { compileAndRunC } from "../../../services/cRunner";

const code = ref(`#include <stdio.h>

int main(void)
{
    // An array of integers
    int numbers[] = {20, 500, 10, 5, 100, 1, 50};
    int number;

    // Search for number
    printf("Enter a number to search: ");
    fflush(stdout);

    if (scanf("%d", &number) != 1) {
        printf(stderr, "Please provide a valid integer.");
        return 1;
    }

    for (int i = 0; i < 7; i++)
    {
        if (numbers[i] == number)
        {
            printf("Found");
            return 0;
        }
    }
    printf("Not found");
    return 1;
}`);
const output = ref("");
const programOutput = ref("");
const inputPrompt = computed(() => {
  const lines = programOutput.value.trim().split(/\r?\n/);
  return lines[lines.length - 1] || "Input is available";
});

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
  programOutput.value = "";
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
        if (stream === "stdout") {
          programOutput.value += text;
        }
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
.clang-view {
  background-color: #000;
  color: #fff;
  min-height: 30vh;
}

.clang-layout {
  margin-inline: auto;
  max-width: 1600px;
}

.problem-card,
.editor-card,
.output-card {
  background-color: #101010;
  border-color: #343434;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  background-color: #181818;
  border-bottom-color: #343434;
  color: #fff;
}

.language-tag {
  background-color: #193322;
  border-radius: 0.3rem;
  color: #b6f0ca;
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

.runtime-input-panel {
  border-top-color: #343434 !important;
}

.runtime-input {
  background-color: #080808;
  border-color: #777;
  color: #fff;
  flex: 1 1 14rem;
}

.runtime-input::placeholder {
  color: #b8b8b8;
}

.runtime-input:focus,
.runtime-input.input-required {
  background-color: #111;
  border-color: #ffc107;
  box-shadow: 0 0 0 0.2rem rgb(255 193 7 / 30%);
  color: #fff;
}

.runtime-input:disabled {
  background-color: #181818;
  color: #aaa;
}

.input-available {
  color: #ffc107;
  font-size: 0.8rem;
  font-weight: 600;
}

.form-text {
  color: #c4c4c4;
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