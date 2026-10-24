<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useNotesStore, type Idiom } from "../stores/notesStore";
import AddNoteModal from "../components/AddNoteModal.vue";

const notesStore = useNotesStore();
const showEditModal = ref(false);
const noteToEdit = ref<
  | {
      id: string;
      emoji: string;
      chinese: string;
      japanese: string;
    }
  | undefined
>(undefined);

// クイズ状態
const currentIdiom = ref<Idiom | null>(null);
const guess = ref("");
const status = ref<"idle" | "correct" | "wrong" | "revealed">("idle");
const stats = ref({ correct: 0, answered: 0 });

// ページが表示されたときにデータを再取得
onMounted(() => {
  notesStore.fetchIdioms();
});

// データが読み込まれたら最初の問題を出す
watch(
  () => notesStore.idioms.length,
  (n) => {
    if (n > 0 && !currentIdiom.value) pickRandom();
  },
  { immediate: true }
);

// 空白（半角・全角）を除去して比較
function normalize(s: string) {
  return s.replace(/[\s　]/g, "");
}

function pickRandom() {
  const list = notesStore.idioms;
  if (list.length === 0) return;
  let next: Idiom = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (list.length > 1 && next.id === currentIdiom.value?.id && guard++ < 10) {
    next = list[Math.floor(Math.random() * list.length)];
  }
  currentIdiom.value = next;
  guess.value = "";
  status.value = "idle";
}

function check() {
  if (
    !currentIdiom.value ||
    !guess.value.trim() ||
    status.value === "correct" ||
    status.value === "revealed"
  )
    return;
  const g = normalize(guess.value);
  if (
    g === normalize(currentIdiom.value.chinese) ||
    g === normalize(currentIdiom.value.japanese)
  ) {
    status.value = "correct";
    stats.value.correct++;
    stats.value.answered++;
  } else {
    status.value = "wrong";
  }
}

function reveal() {
  if (status.value === "correct" || status.value === "revealed") return;
  status.value = "revealed";
  stats.value.answered++;
}

function deleteCurrent() {
  if (!currentIdiom.value) return;
  notesStore.deleteIdiom(currentIdiom.value.id);
  currentIdiom.value = null;
  pickRandom();
}

function openEditModal() {
  if (!currentIdiom.value) return;
  noteToEdit.value = { ...currentIdiom.value };
  showEditModal.value = true;
}

async function updateNote(note: {
  id: string;
  emoji: string;
  chinese: string;
  japanese: string;
  page: string;
}) {
  await notesStore.updateIdiom(note.id, note.emoji, note.chinese, note.japanese);
  showEditModal.value = false;
  noteToEdit.value = undefined;
  // 表示中の問題が更新されたら反映
  if (currentIdiom.value?.id === note.id) {
    const updated = notesStore.idioms.find((i) => i.id === note.id);
    if (updated) currentIdiom.value = updated;
  }
}
</script>

<template>
  <div class="page">
    <!-- 成績バー -->
    <div class="stats-bar">
      <span class="stat">✅ 正解 {{ stats.correct }}</span>
      <span class="stat">🎯 挑戦 {{ stats.answered }}</span>
      <span class="stat">📚 全 {{ notesStore.idioms.length }} 問</span>
    </div>

    <!-- ローディング表示 -->
    <div v-if="notesStore.isLoading" class="message-state">
      <div class="spinner"></div>
      <p>読み込み中...</p>
    </div>

    <!-- エラー表示 -->
    <div v-else-if="notesStore.error" class="message-state">
      <p>{{ notesStore.error }}</p>
      <button @click="notesStore.fetchIdioms()" class="retry-button">再試行</button>
    </div>

    <!-- 空の場合の表示 -->
    <div v-else-if="notesStore.idioms.length === 0" class="message-state">
      四字熟語は登録されていないようです…
    </div>

    <!-- クイズカード -->
    <template v-else-if="currentIdiom">
      <div class="quiz-card">
        <div class="quiz-label">この絵文字はなんの四字熟語？</div>
        <div class="emoji-display">{{ currentIdiom.emoji }}</div>

        <div v-if="status === 'correct'" class="feedback correct">正解！ 🎉</div>
        <div v-else-if="status === 'wrong'" class="feedback wrong">ちがうよ… もう一度！</div>

        <v-text-field
          v-if="status !== 'correct' && status !== 'revealed'"
          v-model="guess"
          class="guess-input"
          placeholder="四字熟語を入力…"
          variant="outlined"
          density="comfortable"
          hide-details
          @keyup.enter="check"
        ></v-text-field>

        <div class="button-row">
          <template v-if="status === 'idle'">
            <v-btn color="primary" variant="elevated" :disabled="!guess.trim()" @click="check">
              判定
            </v-btn>
          </template>
          <template v-else-if="status === 'wrong'">
            <v-btn color="primary" variant="elevated" :disabled="!guess.trim()" @click="check">
              判定
            </v-btn>
            <v-btn variant="text" @click="reveal">答えを見る</v-btn>
          </template>
          <template v-else>
            <v-btn color="primary" variant="elevated" @click="pickRandom">次の問題</v-btn>
          </template>
        </div>

        <!-- 解答表示 -->
        <div v-if="status === 'correct' || status === 'revealed'" class="answer-box">
          <div class="answer-row">
            <span class="lang-badge badge-zh">中</span>
            <span class="answer-text">{{ currentIdiom.chinese }}</span>
          </div>
          <div class="answer-row">
            <span class="lang-badge badge-jp">日</span>
            <span class="answer-text">{{ currentIdiom.japanese }}</span>
          </div>
        </div>
      </div>

      <div class="card-links">
        <button class="link-button" @click="openEditModal">✏️ この問題を編集</button>
        <button v-if="notesStore.isEditMode" class="link-button danger" @click="deleteCurrent">
          🗑️ この問題を削除
        </button>
      </div>
    </template>

    <!-- 編集モーダル -->
    <AddNoteModal
      :show="showEditModal"
      :currentPage="'idioms'"
      :noteToEdit="noteToEdit"
      @close="showEditModal = false"
      @updateNote="updateNote"
    />
  </div>
</template>

<style scoped>
.page {
  padding: 16px;
  padding-bottom: 80px;
  height: 100%;
  overflow-y: auto;
  width: 90vw;
  margin: 0 auto;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.stat {
  font-size: 13px;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 4px 12px;
}

.message-state {
  text-align: center;
  color: #888;
  margin: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.quiz-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quiz-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
}

.emoji-display {
  font-size: 40px;
  line-height: 1.5;
  text-align: center;
  letter-spacing: 4px;
  margin-bottom: 16px;
  word-break: break-word;
}

.guess-input {
  width: 100%;
  max-width: 320px;
  margin-bottom: 4px;
}

.feedback {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.feedback.correct {
  color: #27ae60;
}

.feedback.wrong {
  color: #e2574a;
}

.button-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.answer-box {
  width: 100%;
  max-width: 320px;
  margin-top: 16px;
  padding: 14px 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lang-badge {
  flex-shrink: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.badge-jp {
  background-color: #fdecec;
  color: #e2574a;
}

.badge-zh {
  background-color: #eafaf0;
  color: #27ae60;
}

.answer-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  letter-spacing: 2px;
}

.card-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
}

.link-button {
  border: none;
  background: transparent;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}

.link-button:active {
  color: #555;
}

.link-button.danger {
  color: #e2574a;
}
</style>
