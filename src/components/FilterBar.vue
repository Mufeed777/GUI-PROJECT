<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import { useRecentlyViewed } from '../composables/useRecentlyViewed'
import { useSearchHistory } from '../composables/useSearchHistory'
import { useRouter } from 'vue-router'

const props = defineProps<{
  categories: string[]
  searchQuery: string
  selectedCategory: string
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:selectedCategory', value: string): void
}>()

const router = useRouter()
const { recentlyViewed, loadRecentlyViewed } = useRecentlyViewed()
const { searchHistory, addToSearchHistory, loadSearchHistory } = useSearchHistory()
const localSearch = ref(props.searchQuery)
const localCategory = ref(props.selectedCategory)
const isSearchFocused = ref(false)
const isListening = ref(false)
const showRecentSearches = ref(false)

// Mock search suggestions - replace with API call as needed
const mockSuggestions = [
  'laptop', 'phone', 'tablet', 'headphones', 'keyboard', 'mouse', 'monitor',
  'camera', 'speaker', 'smartwatch', 'charger', 'case'
]

const searchSuggestions = computed(() => {
  if (!localSearch.value) return []
  const query = localSearch.value.toLowerCase()
  return mockSuggestions
    .filter(item => item.includes(query))
    .slice(0, 5)
})

watch(localSearch, (newVal) => emit('update:searchQuery', newVal))
watch(localCategory, (newVal) => emit('update:selectedCategory', newVal))

const handleFocus = () => {
  loadRecentlyViewed()
  loadSearchHistory()
  isSearchFocused.value = true
  showRecentSearches.value = !localSearch.value
}

const handleBlur = () => {
  // Delay blurring to allow clicking on items
  setTimeout(() => {
    isSearchFocused.value = false
    showRecentSearches.value = false
  }, 200)
}

const handleSearch = (query: string) => {
  localSearch.value = query
  addToSearchHistory(query)
}

const selectSuggestion = (suggestion: string) => {
  handleSearch(suggestion)
}

const selectRecentSearch = (search: string) => {
  handleSearch(search)
}

const navigateToProduct = (id: number) => {
  router.push(`/product/${id}`)
}

const startVoiceSearch = async () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice search is not supported in your browser')
    return
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    handleSearch(transcript)
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error)
    isListening.value = false
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm transition-colors duration-300 relative">
    <div class="flex-1 relative">
      <label for="search" class="sr-only">Search products</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          id="search"
          type="text" 
          v-model="localSearch"
          placeholder="Search products..." 
          @focus="handleFocus"
          @blur="handleBlur"
          @input="showRecentSearches = false"
          class="w-full pl-10 pr-16 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
        />
        
        <!-- Voice Search Icon -->
        <button
          @click="startVoiceSearch"
          :disabled="isListening"
          class="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-primary disabled:text-primary transition-colors"
          :title="isListening ? 'Listening...' : 'Voice search'"
        >
          <svg 
            v-if="!isListening"
            class="h-5 w-5" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.7 2.36-2.2 0-4.2-.9-5.7-2.36M19 12c0 .55-.45 1-1 1s-1-.45-1-1c0-2.64-2.05-4.78-4.7-4.99V3.5c0-.55-.45-1-1-1s-1 .45-1 1v2.51C6.04 7.23 4 9.37 4 12c0 .55-.45 1-1 1s-1-.45-1-1c0-3.53 2.61-6.43 6-6.92V2c0-.55.45-1 1-1s1 .45 1 1v3.08c3.39.49 6 3.39 6 6.92z"/>
          </svg>
          <svg 
            v-else
            class="h-5 w-5 animate-pulse" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          </svg>
        </button>

        <!-- Search Suggestions Dropdown -->
        <div 
          v-if="isSearchFocused && localSearch && searchSuggestions.length > 0"
          class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div class="p-3 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Suggestions</h3>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div 
              v-for="suggestion in searchSuggestions" 
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ suggestion }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Searches Dropdown -->
        <div 
          v-if="isSearchFocused && !localSearch && searchHistory.length > 0"
          class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div class="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Searches</h3>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div 
              v-for="search in searchHistory" 
              :key="search"
              @click="selectRecentSearch(search)"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
            >
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm text-gray-700 dark:text-gray-300 flex-1">{{ search }}</span>
              <svg class="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Recently Viewed Suggestions -->
        <div 
          v-if="isSearchFocused && !localSearch && !searchHistory.length && recentlyViewed.length > 0"
          class="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div class="p-3 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Recently Viewed</h3>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div 
              v-for="product in recentlyViewed" 
              :key="product.id"
              @click="navigateToProduct(product.id)"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <img :src="product.thumbnail" :alt="product.title" class="w-10 h-10 object-cover rounded-lg bg-gray-100 dark:bg-gray-900" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ product.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${{ product.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Direct Access -->
  <div class="mb-8">
    <div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <button 
        @click="localCategory = ''"
        class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2"
        :class="localCategory === '' 
          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary dark:hover:border-primary'"
      >
        All Categories
      </button>
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="localCategory = cat"
        class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2"
        :class="localCategory === cat 
          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary dark:hover:border-primary'"
      >
        {{ cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ') }}
      </button>
    </div>
  </div>
</template>
