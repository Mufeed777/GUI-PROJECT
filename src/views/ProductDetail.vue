<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProductById, fetchProducts } from '../services/api'
import type { Product } from '../types'
import { useCart } from '../composables/useCart'
import ProductCard from '../components/ProductCard.vue'
import { useRecentlyViewed } from '../composables/useRecentlyViewed'
import { formatLKR, lkrPriceParts } from '../composables/useCurrency'

const route = useRoute()
const router = useRouter()
const { addToCart } = useCart()
const { addToRecentlyViewed } = useRecentlyViewed()

const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeImage = ref(0)

const loadData = async (id: string) => {
  try {
    loading.value = true
    const [productData, allProducts] = await Promise.all([
      fetchProductById(id),
      fetchProducts()
    ])
    product.value = productData
    if (product.value) {
      addToRecentlyViewed(product.value)
      relatedProducts.value = allProducts
        .filter(p => p.category === product.value?.category && p.id !== product.value?.id)
        .slice(0, 4)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load product'
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData(route.params.id as string))
watch(() => route.params.id, (newId) => {
  if (newId) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    loadData(newId as string)
  }
})

const handleAddToCart = () => {
  if (product.value) addToCart(product.value)
}

const priceParts = (price: number) => lkrPriceParts(price)
</script>

<template>
  <div class="max-w-[1500px] mx-auto px-4 py-4">
    <!-- Breadcrumbs -->
    <nav class="text-xs text-gray-500 mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
      <router-link to="/" class="hover:underline hover:text-red-700">Home</router-link>
      <span v-if="product">›</span>
      <router-link v-if="product" :to="`/category/${product.category}`" class="hover:underline hover:text-red-700 capitalize">{{ product.category }}</router-link>
      <span v-if="product">›</span>
      <span v-if="product" class="text-gray-900 font-medium">{{ product.title }}</span>
    </nav>

    <div v-if="loading" class="flex justify-center items-center py-20 min-h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-white p-10 shadow-sm border border-gray-200 text-center">
      <p class="font-bold text-xl text-red-600 mb-4">Product not found</p>
      <button @click="router.back()" class="text-link hover:underline">Go back</button>
    </div>

    <div v-else-if="product" class="bg-white p-4 md:p-8 shadow-sm">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Image Gallery (4 cols) -->
        <div class="lg:col-span-4 flex flex-col md:flex-row gap-4">
          <div class="hidden md:flex flex-col gap-2 w-12 shrink-0">
            <button 
              v-for="(img, idx) in product.images" 
              :key="idx"
              @mouseover="activeImage = idx"
              class="aspect-square border hover:border-red-500 rounded-sm overflow-hidden p-1 transition-all"
              :class="activeImage === idx ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'"
            >
              <img :src="img" class="w-full h-full object-contain" />
            </button>
          </div>
          <div class="aspect-square flex-grow bg-white flex items-center justify-center p-4">
            <img :src="product.images[activeImage] || product.thumbnail" class="max-h-full max-w-full object-contain" />
          </div>
        </div>

        <!-- Middle: Info (5 cols) -->
        <div class="lg:col-span-5 flex flex-col border-b lg:border-b-0 pb-6 lg:pb-0">
          <h1 class="text-2xl md:text-3xl font-medium text-gray-900 mb-1 leading-tight">{{ product.title }}</h1>
          <router-link :to="`/brand/${product.brand}`" class="text-sm text-link hover:underline mb-2">Brand: {{ product.brand }}</router-link>
          
          <div class="flex items-center gap-4 mb-4 border-b pb-4">
            <div class="flex items-center gap-1">
              <span class="text-sm font-bold">{{ product.rating }}</span>
              <div class="flex text-[#FFA41C] text-sm">
                <span v-for="i in 5" :key="i">{{ i <= Math.round(product.rating) ? '★' : '☆' }}</span>
              </div>
              <span class="text-sm text-link hover:underline">{{ (Math.random() * 1000).toFixed(0) }} ratings</span>
            </div>
            <div class="h-4 w-px bg-gray-300"></div>
            <span class="text-sm text-link hover:underline">Search this page</span>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-red-600 text-2xl font-light">-{{ Math.round(product.discountPercentage) }}%</span>
              <div class="flex items-start font-bold">
                <span class="text-sm mt-1">Rs.</span>
                <span class="text-3xl">{{ priceParts(product.price).whole }}</span>
                <span class="text-sm mt-1">{{ priceParts(product.price).cents }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-500">Typical price: <span class="line-through">{{ formatLKR(product.price * (1 + product.discountPercentage/100)) }}</span></p>
          </div>

          <div class="mb-6 border-b pb-6">
            <h3 class="font-bold mb-2">About this item</h3>
            <ul class="text-sm space-y-2 list-disc pl-4 text-gray-700">
              <li v-for="(line, idx) in product.description.split('.').filter(l => l.length > 5)" :key="idx">
                {{ line.trim() }}
              </li>
              <li>Brand: {{ product.brand }}</li>
              <li>Category: {{ product.category }}</li>
              <li>Rating: {{ product.rating }} / 5.0</li>
            </ul>
          </div>
        </div>

        <!-- Right: Checkout Box (3 cols) -->
        <div class="lg:col-span-3">
          <div class="border border-gray-300 rounded-lg p-4 sticky top-40">
            <div class="flex items-start font-bold mb-2">
              <span class="text-sm mt-1\">Rs.</span>
              <span class="text-3xl">{{ priceParts(product.price).whole }}</span>
              <span class="text-sm mt-1">{{ priceParts(product.price).cents }}</span>
            </div>
            
            <p class="text-sm text-gray-900 mb-2">FREE Returns</p>
            <p class="text-sm text-gray-900 font-bold mb-1">FREE delivery <span class="font-normal">Tomorrow, May 2</span></p>
            <p class="text-xs text-gray-500 mb-4">Or fastest delivery Today. Order within 3 hrs 24 mins</p>
            
            <div class="mb-4">
              <p v-if="product.stock > 0" class="text-lg text-green-700 font-bold">In Stock</p>
              <p v-else class="text-lg text-red-700 font-bold">Currently Unavailable</p>
            </div>

            <div class="space-y-3">
              <button 
                @click="handleAddToCart"
                :disabled="product.stock === 0"
                class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-2.5 rounded-full text-sm font-medium transition-colors border border-[#16A34A] shadow-sm active:bg-[#15803D] disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button 
                :disabled="product.stock === 0"
                class="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-gray-900 py-2.5 rounded-full text-sm font-medium transition-colors border border-[#FF8F00] shadow-sm active:bg-[#E27C00] disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            <div class="mt-6 text-xs text-gray-600 space-y-1">
              <div class="flex justify-between"><span>Ships from</span> <span class="text-gray-900">Astra.com</span></div>
              <div class="flex justify-between"><span>Sold by</span> <span class="text-gray-900">{{ product.brand }}</span></div>
              <div class="flex justify-between"><span>Returns</span> <span class="text-link">Eligible for Return, Refund or Replacement within 30 days of receipt</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div v-if="relatedProducts.length > 0" class="mt-20 border-t pt-10">
        <h2 class="text-xl font-bold mb-6">Customers who viewed this item also viewed</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          <ProductCard v-for="rel in relatedProducts" :key="rel.id" :product="rel" />
        </div>
      </div>
    </div>
  </div>
</template>

