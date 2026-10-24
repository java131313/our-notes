<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue'
import ActionButtons from './components/ActionButtons.vue'
import AddNoteModal from './components/AddNoteModal.vue'
import { useNotesStore } from './stores/notesStore'

const router = useRouter()
const notesStore = useNotesStore()
const showAddModal = ref(false)

// 現在のページを取得
const currentPage = computed(() => {
  const path = router.currentRoute.value.path
  if (path === '/shopping') return 'shopping'
  if (path === '/map') return 'map'
  if (path === '/calendar') return 'calendar'
  if (path === '/words') return 'words'
  if (path === '/idioms') return 'idioms'
  return ''
})

function openAddModal() {
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
}

function handleAddNote(noteData: { text?: string, date?: string, english?: string, japanese?: string, chinese?: string, emoji?: string, page: string }) {
  // ページ情報に基づいて適切なページにノートを追加
  switch (noteData.page) {
    case 'shopping':
      if (noteData.text) notesStore.addShoppingNote(noteData.text)
      break
    case 'map':
      if (noteData.text) notesStore.addMapNote(noteData.text)
      break
    case 'calendar':
      if (noteData.text && noteData.date) {
        notesStore.addCalendarNote(noteData.text, new Date(noteData.date), 1)
      }
      break
    case 'words':
      if (noteData.english && noteData.japanese && noteData.chinese) {
        notesStore.addWord(noteData.english, noteData.japanese, noteData.chinese, noteData.emoji ?? '')
      }
      break
    case 'idioms':
      if (noteData.emoji && noteData.chinese && noteData.japanese) {
        notesStore.addIdiom(noteData.emoji, noteData.chinese, noteData.japanese)
      }
      break
  }
}
</script>

<template>
  <v-app>
    <v-main>
      <div class="app-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
        
        <ActionButtons @showAddModal="openAddModal" />
        <BottomNavigation />
        
        <!-- Add Note Modal -->
        <AddNoteModal 
          :show="showAddModal"
          :current-page="currentPage"
          @close="closeModal"
          @addNote="handleAddNote"
        />
      </div>
    </v-main>
  </v-app>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  max-width: 100%;
  min-height: 100vh;
  position: relative;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
