<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProducts, fetchCategories } from '../services/api'
import type { Product } from '../types'
import { useSearch } from '../composables/useSearch'
import { useSearchHistory } from '../composables/useSearchHistory'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const products = ref<Product[]>([])
const categories = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const { searchQuery } = useSearch()
const selectedCategory = ref((route.params.category as string) || '')
const { searchHistory, addToSearchHistory } = useSearchHistory()

const currentHero = ref(0)
const heroBanners = [
  { image: '/tech-banner.png', title: 'Power up your world', sub: 'The latest in tech deals' },
  { image: '/home-banner.png', title: 'Transform your space', sub: 'Modern living at its best' }
]

// Watch for route changes
watch(() => route.params.category, (newCategory) => {
  selectedCategory.value = (newCategory as string) || ''
})

// Auto-advance hero
onMounted(() => {
  setInterval(() => {
    currentHero.value = (currentHero.value + 1) % heroBanners.length
  }, 8000)
})

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ])
    products.value = productsData
    categories.value = categoriesData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data'
  } finally {
    loading.value = false
  }
})

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === '' || product.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const deals = computed(() => products.value.filter(p => p.discountPercentage > 15).slice(0, 8))
const featuredCategories = computed(() => {
  const cats = ['smartphones', 'laptops', 'fragrances', 'skincare']
  return cats.map(cat => ({
    name: cat,
    products: products.value.filter(p => p.category === cat).slice(0, 4)
  }))
})

const suggestedProducts = computed(() => {
  if (searchHistory.value.length === 0 || searchQuery.value) return []
  const suggestions: Product[] = []
  const seenIds = new Set<number>()
  for (const query of searchHistory.value) {
    const matches = products.value.filter(p => 
      !seenIds.has(p.id) && 
      (p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
    )
    matches.forEach(m => {
      if (suggestions.length < 8) {
        suggestions.push(m)
        seenIds.add(m.id)
      }
    })
    if (suggestions.length >= 8) break
  }
  return suggestions
})
</script>

<template>
  <div class="-mx-4 md:-mx-8">
    <div v-if="loading" class="flex justify-center items-center py-20 min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="max-w-4xl mx-auto mt-10 bg-white p-10 rounded-sm shadow-sm text-center">
      <p class="font-bold text-xl mb-2 text-red-600">Oops! Something went wrong.</p>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <button @click="() => window.location.reload()" class="px-6 py-2 bg-primary text-gray-900 font-bold rounded-sm shadow-sm">
        Try Again
      </button>
    </div>

    <div v-else>
      <!-- Hero Section -->
      <div v-if="!searchQuery && !selectedCategory" class="relative w-full h-[300px] md:h-[600px] overflow-hidden">
        <div 
          v-for="(banner, index) in heroBanners" 
          :key="index"
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          :class="currentHero === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
        >
          <img :src="banner.image" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div class="absolute top-1/4 left-10 md:left-20 max-w-lg z-20">
            <h2 class="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg">{{ banner.title }}</h2>
            <p class="text-xl md:text-2xl text-gray-100 mb-6 drop-shadow-md">{{ banner.sub }}</p>
            <button class="bg-primary text-gray-900 font-bold px-8 py-3 rounded-sm shadow-xl hover:bg-primary-dark transition-colors">
              Shop Now
            </button>
          </div>
        </div>
        
        <!-- Hero Controls -->
        <div class="absolute bottom-10 right-10 z-30 flex gap-2">
          <button 
            v-for="(_, index) in heroBanners" 
            :key="index"
            @click="currentHero = index"
            class="w-3 h-3 rounded-full border-2 border-white transition-all"
            :class="currentHero === index ? 'bg-white w-8' : 'bg-transparent'"
          ></button>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="max-w-[1500px] mx-auto px-4 md:px-8 -mt-10 md:-mt-48 relative z-20 pb-20">
        
        <!-- Search Results Header -->
        <div v-if="searchQuery || selectedCategory" class="bg-white p-4 mb-6 shadow-sm flex items-center justify-between">
          <h2 class="text-xl font-bold">
            {{ searchQuery ? `Results for "${searchQuery}"` : `${selectedCategory.toUpperCase()} Products` }}
          </h2>
          <span class="text-sm text-gray-500">{{ filteredProducts.length }} items</span>
        </div>

        <!-- Home Page Grids (Only shown when not searching) -->
        <template v-if="!searchQuery && !selectedCategory">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="cat in featuredCategories" :key="cat.name" class="bg-white p-5 shadow-sm flex flex-col h-full">
              <h3 class="text-xl font-bold mb-3 capitalize">{{ cat.name }}</h3>
              <div class="grid grid-cols-2 gap-2 flex-grow">
                <div 
                  v-for="prod in cat.products" 
                  :key="prod.id" 
                  class="cursor-pointer group"
                  @click="router.push(`/product/${prod.id}`)"
                >
                  <div class="aspect-square bg-gray-50 flex items-center justify-center p-2 mb-1">
                    <img :src="prod.thumbnail" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <p class="text-[11px] text-gray-700 line-clamp-1 font-medium group-hover:text-link">{{ prod.title }}</p>
                </div>
              </div>
              <router-link :to="`/category/${cat.name}`" class="text-sm text-link hover:text-orange-700 hover:underline mt-4">
                Shop more
              </router-link>
            </div>
          </div>

          <!-- Recommendations Carousel -->
          <div v-if="suggestedProducts.length > 0" class="bg-white p-6 shadow-sm mb-8">
            <h3 class="text-xl font-bold mb-4">Inspired by your shopping trend</h3>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              <div v-for="product in suggestedProducts" :key="product.id" class="w-48 flex-shrink-0">
                <div @click="router.push(`/product/${product.id}`)" class="cursor-pointer group">
                  <div class="aspect-square bg-gray-50 flex items-center justify-center p-4 mb-2">
                    <img :src="product.thumbnail" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <p class="text-sm text-link line-clamp-2 leading-snug mb-1 group-hover:underline">{{ product.title }}</p>
                  <div class="flex items-center gap-1 mb-1">
                    <div class="flex text-[#FFA41C] text-xs">
                      <span v-for="i in 5" :key="i">{{ i <= Math.round(product.rating) ? '★' : '☆' }}</span>
                    </div>
                  </div>
                  <p class="font-bold text-gray-900">${{ product.price }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Deals Carousel -->
          <div class="bg-white p-6 shadow-sm mb-8">
            <h3 class="text-xl font-bold mb-4">Today's Deals <span class="text-sm text-link ml-4 font-normal cursor-pointer hover:underline">See all deals</span></h3>
            <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              <div v-for="product in deals" :key="product.id" class="w-64 flex-shrink-0">
                <div @click="router.push(`/product/${product.id}`)" class="cursor-pointer group">
                  <div class="aspect-square bg-gray-100 flex items-center justify-center p-6 mb-3 rounded-sm">
                    <img :src="product.thumbnail" class="max-h-full max-w-full object-contain" />
                  </div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="bg-red-700 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">Up to {{ Math.round(product.discountPercentage) }}% off</span>
                    <span class="text-red-700 text-xs font-bold">Deal</span>
                  </div>
                  <p class="text-sm font-bold truncate">{{ product.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Product List (Grid) -->
        <div v-if="searchQuery || selectedCategory || !loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <ProductCard 
            v-for="product in filteredProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>

        <div v-if="filteredProducts.length === 0 && !loading" class="bg-white p-20 text-center shadow-sm">
          <p class="text-xl font-bold text-gray-400">No products found matching your criteria.</p>
          <button @click="searchQuery = ''; selectedCategory = ''" class="mt-4 text-link hover:underline">Clear all filters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

