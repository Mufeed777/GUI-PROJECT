<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Product } from '../types'
import { useCart } from '../composables/useCart'
import { lkrPriceParts } from '../composables/useCurrency'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()
const { addToCart } = useCart()

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleAddToCart = (e: Event) => {
  e.stopPropagation()
  addToCart(props.product)
}

const { whole, cents } = lkrPriceParts(props.product.price)
</script>

<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-sm shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group flex flex-col h-full border border-gray-200 dark:border-gray-700 p-3"
    @click="goToDetail"
  >
    <!-- Image -->
    <div class="relative bg-white dark:bg-gray-900 aspect-square h-72 flex items-center justify-center mb-3">
      <img 
        :src="product.thumbnail" 
        :alt="product.title"
        class="object-contain w-full h-full"
        loading="lazy"
      />
    </div>
    
    <!-- Info -->
    <div class="flex flex-col flex-grow">
      <!-- Title -->
      <h3 class="text-[17px] font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-link mb-1">
        {{ product.title }}
      </h3>

      <!-- Ratings -->
      <div class="flex items-center gap-1 mb-1">
        <div class="flex text-[#FFA41C] text-sm">
          <span v-for="i in 5" :key="i">{{ i <= Math.round(product.rating) ? '★' : '☆' }}</span>
        </div>
        <span class="text-xs text-link">{{ (Math.random() * 5000 + 100).toFixed(0) }}</span>
      </div>

      <!-- Price -->
      <div class="flex items-start text-gray-900 dark:text-white mb-1">
        <span class="text-xs font-medium mt-1 mr-0.5">Rs.</span>
        <span class="text-2xl font-bold">{{ whole }}</span>
        <span class="text-xs font-medium mt-1">{{ cents }}</span>
      </div>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2 mb-3">
        <div class="flex items-center gap-1">
          <span class="text-[12px] font-bold text-[#00A8E1]">prime</span>
          <span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Get it by tomorrow</span>
        </div>
        <div v-if="product.discountPercentage > 15" class="bg-red-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
          Limited time deal
        </div>
      </div>

      <!-- Add to Cart Button (Amazon Style) -->
      <div class="mt-auto pt-2">
        <button 
          @click="handleAddToCart"
          class="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-1.5 px-4 rounded-full text-sm font-medium transition-colors border border-[#16A34A] shadow-sm active:bg-[#15803D]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

