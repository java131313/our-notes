import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

// APIエンドポイントのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ?? (import.meta.env.PROD
    ? 'https://our-notes-api.java13131305626.workers.dev'
    : 'http://localhost:8787')

// Define types
export interface ShoppingNote {
  id: string
  text: string
  createdAt: Date
}

export interface MapNote {
  id: string
  text: string
  createdAt: Date
}

export interface CalendarNote {
  id: string
  text: string
  date: Date
  person: 1 | 2
  createdAt: Date
}

export interface Word {
  id: string
  english: string
  japanese: string
  chinese: string
  emoji: string
  createdAt: Date
}

export interface Idiom {
  id: string
  emoji: string
  chinese: string
  japanese: string
  createdAt: Date
}

// APIレスポンスの型
interface ApiShoppingNote {
  id: string
  text: string
  created_at: string
}

interface ApiMapNote {
  id: string
  text: string
  created_at: string
}

interface ApiCalendarNote {
  id: string
  text: string
  date: string
  person: 1 | 2
  created_at: string
}

interface ApiWord {
  id: string
  english: string
  japanese: string
  chinese: string
  emoji: string | null
  created_at: string
}

interface ApiIdiom {
  id: string
  emoji: string
  chinese: string
  japanese: string
  created_at: string
}

// Create store
export const useNotesStore = defineStore('notes', () => {
  // State
  const shoppingNotes = ref<ShoppingNote[]>([])
  const mapNotes = ref<MapNote[]>([])
  const calendarNotes = ref<CalendarNote[]>([])
  const words = ref<Word[]>([])
  const idioms = ref<Idiom[]>([])
  const isEditMode = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // データ取得関数
  async function fetchShoppingNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes`)
      if (!response.ok) throw new Error('Failed to fetch shopping notes')
      
      const data = await response.json() as ApiShoppingNote[]
      shoppingNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        createdAt: new Date(note.created_at)
      }))
    } catch (err) {
      console.error('Error fetching shopping notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMapNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes`)
      if (!response.ok) throw new Error('Failed to fetch map notes')
      
      const data = await response.json() as ApiMapNote[]
      mapNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        createdAt: new Date(note.created_at)
      }))
    } catch (err) {
      console.error('Error fetching map notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCalendarNotes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes`)
      if (!response.ok) throw new Error('Failed to fetch calendar notes')
      
      const data = await response.json() as ApiCalendarNote[]
      calendarNotes.value = data.map(note => ({
        id: note.id,
        text: note.text,
        date: new Date(note.date),
        createdAt: new Date(note.created_at),
        person: note.person
      }))
    } catch (err) {
      console.error('Error fetching calendar notes:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWords() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/words`)
      if (!response.ok) throw new Error('Failed to fetch words')

      const data = await response.json() as ApiWord[]
      words.value = data.map(word => ({
        id: word.id,
        english: word.english,
        japanese: word.japanese,
        chinese: word.chinese,
        emoji: word.emoji ?? '',
        createdAt: new Date(word.created_at)
      }))
    } catch (err) {
      console.error('Error fetching words:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchIdioms() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE_URL}/api/idioms`)
      if (!response.ok) throw new Error('Failed to fetch idioms')

      const data = await response.json() as ApiIdiom[]
      idioms.value = data.map(idiom => ({
        id: idiom.id,
        emoji: idiom.emoji,
        chinese: idiom.chinese,
        japanese: idiom.japanese,
        createdAt: new Date(idiom.created_at)
      }))
    } catch (err) {
      console.error('Error fetching idioms:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // エラー時はローカルストレージからフォールバック
      loadFromLocalStorage()
    } finally {
      isLoading.value = false
    }
  }
  // Actions
  async function addShoppingNote(text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to add shopping note')
      
      const data = await response.json() as ApiShoppingNote
      const newNote: ShoppingNote = {
        id: data.id,
        text: data.text,
        createdAt: new Date(data.created_at)
      }
      
      shoppingNotes.value.push(newNote)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding shopping note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時はローカルにのみ保存
      const note: ShoppingNote = {
        id: Date.now().toString(),
        text,
        createdAt: new Date()
      }
      shoppingNotes.value.push(note)
      saveToLocalStorage()
    }
  }

  async function addMapNote(text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to add map note')
      
      const data = await response.json() as ApiMapNote
      const newNote: MapNote = {
        id: data.id,
        text: data.text,
        createdAt: new Date(data.created_at)
      }
      
      mapNotes.value.push(newNote)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding map note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時はローカルにのみ保存
      const note: MapNote = {
        id: Date.now().toString(),
        text,
        createdAt: new Date()
      }
      mapNotes.value.push(note)
      saveToLocalStorage()
    }
  }

  async function addCalendarNote(text: string, date: Date, person: 1 | 2) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, date: date.toISOString(), person }),
      });

      if (!response.ok) throw new Error('Failed to add calendar note');

      const data = await response.json();
      const newNote: CalendarNote = {
        id: data.id,
        text: data.text,
        date: new Date(data.date),
        person: data.person,
        createdAt: new Date(data.created_at)
      }
      
      calendarNotes.value.push(newNote)
      saveToLocalStorage()
      return newNote
    } catch (err) {
      console.error('Error adding calendar note:', err)
      error.value = err instanceof Error ? err.message : 'Failed to add calendar note'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addWord(english: string, japanese: string, chinese: string, emoji = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ english, japanese, chinese, emoji })
      })

      if (!response.ok) throw new Error('Failed to add word')

      const data = await response.json() as ApiWord
      const newWord: Word = {
        id: data.id,
        english: data.english,
        japanese: data.japanese,
        chinese: data.chinese,
        emoji: data.emoji ?? emoji,
        createdAt: new Date(data.created_at)
      }

      words.value.push(newWord)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding word:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'

      // エラー時はローカルにのみ保存
      const word: Word = {
        id: Date.now().toString(),
        english,
        japanese,
        chinese,
        emoji,
        createdAt: new Date()
      }
      words.value.push(word)
      saveToLocalStorage()
    }
  }

  async function addIdiom(emoji: string, chinese: string, japanese: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/idioms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji, chinese, japanese })
      })

      if (!response.ok) throw new Error('Failed to add idiom')

      const data = await response.json() as ApiIdiom
      const newIdiom: Idiom = {
        id: data.id,
        emoji: data.emoji,
        chinese: data.chinese,
        japanese: data.japanese,
        createdAt: new Date(data.created_at)
      }

      idioms.value.push(newIdiom)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error adding idiom:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'

      // エラー時はローカルにのみ保存
      const idiom: Idiom = {
        id: Date.now().toString(),
        emoji,
        chinese,
        japanese,
        createdAt: new Date()
      }
      idioms.value.push(idiom)
      saveToLocalStorage()
    }
  }

  async function deleteShoppingNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete shopping note')
      }
      
      shoppingNotes.value = shoppingNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting shopping note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      shoppingNotes.value = shoppingNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteMapNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete map note')
      }
      
      mapNotes.value = mapNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting map note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      mapNotes.value = mapNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteCalendarNote(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete calendar note')
      }
      
      calendarNotes.value = calendarNotes.value.filter(note => note.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting calendar note:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
      
      // エラー時もUIからは削除
      calendarNotes.value = calendarNotes.value.filter(note => note.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteWord(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/words/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete word')
      }

      words.value = words.value.filter(word => word.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting word:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'

      // エラー時もUIからは削除
      words.value = words.value.filter(word => word.id !== id)
      saveToLocalStorage()
    }
  }

  async function deleteIdiom(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/idioms/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete idiom')
      }

      idioms.value = idioms.value.filter(idiom => idiom.id !== id)
      saveToLocalStorage() // バックアップとしてローカルにも保存
    } catch (err) {
      console.error('Error deleting idiom:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'

      // エラー時もUIからは削除
      idioms.value = idioms.value.filter(idiom => idiom.id !== id)
      saveToLocalStorage()
    }
  }

  // Update functions
  async function updateShoppingNote(id: string, text: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/shopping-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to update shopping note');

      // 更新後のデータを取得
      await fetchShoppingNotes();
    } catch (err) {
      console.error('Error updating shopping note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMapNote(id: string, text: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/map-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to update map note');

      // 更新後のデータを取得
      await fetchMapNotes();
    } catch (err) {
      console.error('Error updating map note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCalendarNote(id: string, text: string, date: string, person: 1 | 2) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, date, person }),
      });

      if (!response.ok) throw new Error('Failed to update calendar note');

      // 更新後のデータを取得
      await fetchCalendarNotes();
    } catch (err) {
      console.error('Error updating calendar note:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateWord(id: string, english: string, japanese: string, chinese: string, emoji = '') {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ english, japanese, chinese, emoji }),
      });

      if (!response.ok) throw new Error('Failed to update word');

      // 更新後のデータを取得
      await fetchWords();
    } catch (err) {
      console.error('Error updating word:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateIdiom(id: string, emoji: string, chinese: string, japanese: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/idioms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji, chinese, japanese }),
      });

      if (!response.ok) throw new Error('Failed to update idiom');

      // 更新後のデータを取得
      await fetchIdioms();
    } catch (err) {
      console.error('Error updating idiom:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading.value = false;
    }
  }

  function toggleEditMode() {
    isEditMode.value = !isEditMode.value
  }

  // Local storage functions (バックアップとして使用)
  function saveToLocalStorage() {
    localStorage.setItem('shoppingNotes', JSON.stringify(shoppingNotes.value))
    localStorage.setItem('mapNotes', JSON.stringify(mapNotes.value))
    localStorage.setItem('calendarNotes', JSON.stringify(calendarNotes.value))
    localStorage.setItem('words', JSON.stringify(words.value))
    localStorage.setItem('idioms', JSON.stringify(idioms.value))
  }

  function loadFromLocalStorage() {
    const savedShoppingNotes = localStorage.getItem('shoppingNotes')
    const savedMapNotes = localStorage.getItem('mapNotes')
    const savedCalendarNotes = localStorage.getItem('calendarNotes')
    const savedWords = localStorage.getItem('words')
    const savedIdioms = localStorage.getItem('idioms')

    if (savedShoppingNotes) {
      shoppingNotes.value = JSON.parse(savedShoppingNotes)
    }
    if (savedMapNotes) {
      mapNotes.value = JSON.parse(savedMapNotes)
    }
    if (savedCalendarNotes) {
      calendarNotes.value = JSON.parse(savedCalendarNotes)
    }
    if (savedWords) {
      words.value = JSON.parse(savedWords)
    }
    if (savedIdioms) {
      idioms.value = JSON.parse(savedIdioms)
    }
  }

  // 初期化時にデータを取得（idiomsは件数が多いためページ表示時に遅延取得）
  onMounted(() => {
    loadFromLocalStorage()
    fetchShoppingNotes()
    fetchMapNotes()
    fetchCalendarNotes()
    fetchWords()
  })

  return {
    shoppingNotes,
    mapNotes,
    calendarNotes,
    words,
    idioms,
    isEditMode,
    isLoading,
    error,
    fetchShoppingNotes,
    fetchMapNotes,
    fetchCalendarNotes,
    fetchWords,
    fetchIdioms,
    addShoppingNote,
    addMapNote,
    addCalendarNote,
    addWord,
    addIdiom,
    deleteShoppingNote,
    deleteMapNote,
    deleteCalendarNote,
    deleteWord,
    deleteIdiom,
    updateShoppingNote,
    updateMapNote,
    updateCalendarNote,
    updateWord,
    updateIdiom,
    toggleEditMode,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
