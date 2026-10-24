<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  show: boolean;
  currentPage: string;
  noteToEdit?: {
    id: string;
    text?: string;
    date?: string;
    person?: number;
    english?: string;
    japanese?: string;
    chinese?: string;
    emoji?: string;
  };
}>();

const emit = defineEmits(["close", "addNote", "updateNote"]);

const noteText = ref("");
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedPerson = ref(1);
const wordEnglish = ref("");
const wordJapanese = ref("");
const wordChinese = ref("");
const wordEmoji = ref("");
const idiomEmoji = ref("");
const idiomChinese = ref("");
const idiomJapanese = ref("");
const personLabels = {
  1: import.meta.env.VITE_PERSON_LABEL_1,
  2: import.meta.env.VITE_PERSON_LABEL_2
};

// 編集モードかどうかを計算
const isEditMode = computed(() => !!props.noteToEdit);

// 送信可能かどうか（単語・四字熟語ページは3項目すべて必須）
const canSubmit = computed(() => {
  if (props.currentPage === "words") {
    return !!(
      wordEnglish.value.trim() &&
      wordJapanese.value.trim() &&
      wordChinese.value.trim()
    );
  }
  if (props.currentPage === "idioms") {
    return !!(
      idiomEmoji.value.trim() &&
      idiomChinese.value.trim() &&
      idiomJapanese.value.trim()
    );
  }
  return !!noteText.value.trim();
});

// 編集モードの場合は初期値を設定
watch(() => props.noteToEdit, (newNote) => {
  if (newNote) {
    noteText.value = newNote.text || "";
    if (newNote.date) {
      selectedDate.value = newNote.date;
    }
    if (newNote.person !== undefined) {
      selectedPerson.value = newNote.person;
    }
    if (newNote.english !== undefined) {
      wordEnglish.value = newNote.english;
    }
    if (newNote.japanese !== undefined) {
      wordJapanese.value = newNote.japanese;
    }
    if (newNote.chinese !== undefined) {
      wordChinese.value = newNote.chinese;
    }
    if (newNote.emoji !== undefined) {
      wordEmoji.value = newNote.emoji;
    }
    if (newNote.emoji !== undefined) {
      idiomEmoji.value = newNote.emoji;
    }
    // 四字熟語の中国語・日本語はnoteToEditのchinese/japaneseを流用
    if (newNote.chinese !== undefined) {
      idiomChinese.value = newNote.chinese;
    }
    if (newNote.japanese !== undefined) {
      idiomJapanese.value = newNote.japanese;
    }
  }
}, { immediate: true });

// 現在のページに基づいてモーダルのタイトルを計算
const modalTitle = computed(() => {
  const baseTitle = {
    shopping: "買うもの",
    map: "行きたい場所",
    calendar: "予定",
    words: "単語",
    idioms: "四字熟語"
  }[props.currentPage] || "メモ";
  return isEditMode.value ? `${baseTitle}を更新` : `${baseTitle}を追加`;
});

function resetForm() {
  noteText.value = "";
  selectedDate.value = new Date().toISOString().split("T")[0];
  selectedPerson.value = 1;
  wordEnglish.value = "";
  wordJapanese.value = "";
  wordChinese.value = "";
  wordEmoji.value = "";
  idiomEmoji.value = "";
  idiomChinese.value = "";
  idiomJapanese.value = "";
}

function closeModal() {
  resetForm();
  emit("close");
}

function handleNote() {
  if (!canSubmit.value) return;

  if (props.currentPage === "words") {
    const payload = {
      page: props.currentPage,
      english: wordEnglish.value.trim(),
      japanese: wordJapanese.value.trim(),
      chinese: wordChinese.value.trim(),
      emoji: wordEmoji.value.trim()
    };
    if (isEditMode.value && props.noteToEdit) {
      emit("updateNote", { id: props.noteToEdit.id, ...payload });
    } else {
      emit("addNote", payload);
    }
    closeModal();
    return;
  }

  if (props.currentPage === "idioms") {
    const payload = {
      page: props.currentPage,
      emoji: idiomEmoji.value.trim(),
      chinese: idiomChinese.value.trim(),
      japanese: idiomJapanese.value.trim()
    };
    if (isEditMode.value && props.noteToEdit) {
      emit("updateNote", { id: props.noteToEdit.id, ...payload });
    } else {
      emit("addNote", payload);
    }
    closeModal();
    return;
  }

  if (!noteText.value.trim()) return;

  if (isEditMode.value && props.noteToEdit) {
    // 更新処理
    if (props.currentPage === "calendar") {
      emit("updateNote", {
        id: props.noteToEdit.id,
        text: noteText.value.trim(),
        page: props.currentPage,
        date: selectedDate.value,
        person: selectedPerson.value
      });
    } else {
      emit("updateNote", {
        id: props.noteToEdit.id,
        text: noteText.value.trim(),
        page: props.currentPage
      });
    }
  } else {
    // 新規追加処理
    if (props.currentPage === "calendar") {
      emit("addNote", {
        text: noteText.value.trim(),
        page: props.currentPage,
        date: selectedDate.value,
        person: selectedPerson.value
      });
    } else {
      emit("addNote", {
        text: noteText.value.trim(),
        page: props.currentPage
      });
    }
  }

  closeModal();
}
</script>

<template>
  <v-dialog :model-value="show" @update:model-value="closeModal" max-width="500" persistent transition="dialog-bottom-transition">
    <v-card class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">{{ modalTitle }}</span>
        <v-btn icon="mdi-close" variant="text" density="compact" @click="closeModal"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-container class="pa-0">
          <v-row v-if="currentPage === 'calendar'">
            <v-col cols="12">
              <v-text-field v-model="selectedDate" label="日付" type="date" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-radio-group v-model="selectedPerson" label="誰の予定？" variant="outlined" density="comfortable">
                <v-radio :label="personLabels[1]" value="1"></v-radio>
                <v-radio :label="personLabels[2]" value="2"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row v-if="currentPage === 'words'">
            <v-col cols="12">
              <v-text-field v-model="wordEnglish" label="英語" placeholder="apple" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="wordEmoji" label="絵文字（任意）" placeholder="🍎" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="wordJapanese" label="日本語" placeholder="りんご" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="wordChinese" label="中国語" placeholder="苹果" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
          </v-row>

          <v-row v-if="currentPage === 'idioms'">
            <v-col cols="12">
              <v-text-field v-model="idiomEmoji" label="絵文字" placeholder="🐍 🖌️ 🦶" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="idiomChinese" label="中国語の四字熟語" placeholder="画蛇添足" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="idiomJapanese" label="日本語の四字熟語" placeholder="画蛇添足" variant="outlined" density="comfortable" hide-details="auto"></v-text-field>
            </v-col>
          </v-row>

          <v-row v-if="currentPage !== 'words' && currentPage !== 'idioms'">
            <v-col cols="12">
              <v-text-field v-model="noteText" :label="currentPage === 'calendar' ? '予定' : 'メモ'" :placeholder="currentPage === 'calendar' ? '予定を入力してください' : 'メモを入力してください'" variant="outlined" density="comfortable" hide-details="auto" @keyup.enter="handleNote"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeModal"> キャンセル </v-btn>
        <v-btn color="primary" variant="elevated" :disabled="!canSubmit" @click="handleNote">
          {{ isEditMode ? '更新' : '追加' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Vuetifyを使用しているため、カスタムスタイルは最小限に */
.v-card {
  overflow: hidden;
}

/* 必要に応じて追加のカスタムスタイルをここに記述 */
</style>
