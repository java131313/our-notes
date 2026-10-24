<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotesStore } from "../stores/notesStore";
import AddNoteModal from "../components/AddNoteModal.vue";

const notesStore = useNotesStore();
const showEditModal = ref(false);
const noteToEdit = ref<
  | {
      id: string;
      english: string;
      japanese: string;
      chinese: string;
      emoji: string;
    }
  | undefined
>(undefined);
const searchQuery = ref("");
// 翻訳を表示中の単語ID（暗記モード用: デフォルトは隠す）
const revealedIds = ref<Set<string>>(new Set());

// ページが表示されたときにデータを再取得
onMounted(() => {
  notesStore.fetchWords();
});

// 検索フィルター付きの単語リスト（新しい順）
const filteredWords = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const sorted = [...notesStore.words].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (!query) return sorted;
  return sorted.filter(
    (w) =>
      w.english.toLowerCase().includes(query) ||
      w.japanese.includes(query) ||
      w.chinese.includes(query)
  );
});

function isRevealed(id: string) {
  return revealedIds.value.has(id);
}

function toggleReveal(id: string) {
  const next = new Set(revealedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  revealedIds.value = next;
}

function openEditModal(word: {
  id: string;
  english: string;
  japanese: string;
  chinese: string;
  emoji: string;
}) {
  noteToEdit.value = { ...word };
  showEditModal.value = true;
}

async function updateNote(note: {
  id: string;
  english: string;
  japanese: string;
  chinese: string;
  emoji?: string;
  page: string;
}) {
  await notesStore.updateWord(note.id, note.english, note.japanese, note.chinese, note.emoji ?? '');
  showEditModal.value = false;
  noteToEdit.value = undefined;
}
</script>

<template>
  <div class="page">
    <!-- 検索 -->
    <div class="search-container">
      <v-text-field
        v-model="searchQuery"
        placeholder="単語を検索..."
        variant="outlined"
        density="compact"
        hide-details
        clearable
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </div>

    <div class="notes-container">
      <!-- ローディング表示 -->
      <div v-if="notesStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="notesStore.error" class="error-state">
        <p>{{ notesStore.error }}</p>
        <button @click="notesStore.fetchWords()" class="retry-button">再試行</button>
      </div>

      <!-- 空の場合の表示 -->
      <div v-else-if="filteredWords.length === 0" class="empty-state">
        {{ searchQuery ? "見つかりませんでした…" : "単語は登録されていないようです…" }}
      </div>

      <!-- 単語カード一覧 -->
      <div
        v-else
        v-for="word in filteredWords"
        :key="word.id"
        class="word-card"
        @click="openEditModal(word)"
      >
        <div class="word-body">
          <div class="word-english">
            <span v-if="word.emoji" class="word-emoji">{{ word.emoji }}</span>{{ word.english }}
          </div>
          <div class="word-translations" :class="{ concealed: !isRevealed(word.id) }">
            <div class="word-translation">
              <span class="lang-badge badge-jp">日</span>
              <span class="translation-text">{{ word.japanese }}</span>
            </div>
            <div class="word-translation">
              <span class="lang-badge badge-zh">中</span>
              <span class="translation-text">{{ word.chinese }}</span>
            </div>
          </div>
        </div>
        <div class="word-actions">
          <button
            class="action-button"
            :class="{ active: isRevealed(word.id) }"
            :title="isRevealed(word.id) ? '隠す' : '日本語・中国語を見る'"
            @click.stop="toggleReveal(word.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <div
            v-if="notesStore.isEditMode"
            class="delete-button"
            @click.stop="notesStore.deleteWord(word.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 編集モーダル -->
    <AddNoteModal
      :show="showEditModal"
      :currentPage="'words'"
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

.search-container {
  margin-bottom: 16px;
}

.notes-container {
  margin-bottom: 20px;
}

.loading-state,
.error-state,
.empty-state {
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

.retry-button:hover {
  background-color: #2980b9;
}

/* 単語カード */
.word-card {
  display: flex;
  align-items: flex-start;
  text-align: left;
  padding: 14px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.word-card:active {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.word-body {
  flex: 1;
  min-width: 0;
}

.word-english {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  word-break: break-word;
}

.word-emoji {
  margin-right: 8px;
}

.word-translations {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: filter 0.2s ease;
}

.word-translations.concealed .translation-text {
  filter: blur(5px);
  user-select: none;
}

.word-translation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-badge {
  flex-shrink: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
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

.translation-text {
  color: #555;
  font-size: 15px;
  word-break: break-word;
}

.word-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.action-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #888;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.action-button.active {
  background-color: #4a90e2;
  color: white;
}

.delete-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  color: #ff5252;
  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(255, 82, 82, 0.1);
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: rgba(255, 82, 82, 0.2);
}
</style>
