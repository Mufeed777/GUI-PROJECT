<script setup lang="ts">
import { useCart } from '../composables/useCart'

const { cart, removeFromCart, totalPrice } = useCart()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="emit('close')"></div>

    <!-- Full-page panel -->
    <div class="fixed inset-0 w-full flex transition-transform transform translate-x-0 z-50">
      <div class="w-full h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-y-scroll">
        <div class="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
          <div class="flex items-start justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white" id="slide-over-title">Shopping Cart</h2>
            <div class="ml-3 h-7 flex items-center">
              <button type="button" class="-m-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none" @click="emit('close')">
                <span class="sr-only">Close panel</span>
                <!-- Heroicon name: outline/x -->
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-8">
            <div class="flow-root">
              <ul role="list" class="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="item in cart" :key="item.product.id" class="py-6 flex">
                  <div class="flex-shrink-0 w-24 h-24 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white">
                    <img :src="item.product.thumbnail" :alt="item.product.title" class="w-full h-full object-contain object-center">
                  </div>

                  <div class="ml-4 flex-1 flex flex-col">
                    <div>
                      <div class="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                        <h3>
                          <router-link :to="`/product/${item.product.id}`" @click="emit('close')">{{ item.product.title }}</router-link>
                        </h3>
                        <p class="ml-4">${{ item.product.price }}</p>
                      </div>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">{{ item.product.category }}</p>
                    </div>
                    <div class="flex-1 flex items-end justify-between text-sm">
                      <p class="text-gray-500 dark:text-gray-400">Qty {{ item.quantity }}</p>

                      <div class="flex">
                        <button type="button" @click="removeFromCart(item.product.id)" class="font-medium text-red-500 hover:text-red-400">Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li v-if="cart.length === 0" class="py-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 h-64">
                  <span class="text-4xl mb-4">🛒</span>
                  <p>Your cart is empty.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6">
          <div class="flex justify-between text-base font-medium text-gray-900 dark:text-white">
            <p>Subtotal</p>
            <p>${{ totalPrice.toFixed(2) }}</p>
          </div>
          <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Shipping and taxes calculated at checkout.</p>
          <div class="mt-6">
            <button class="w-full max-w-md mx-auto flex justify-center items-center px-4 py-2 border border-[#FCD200] rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-[#FFD814] hover:bg-[#F7CA00] transition-colors duration-200">
              Proceed to checkout
            </button>
          </div>
          <div class="mt-6 flex justify-center text-sm text-center text-gray-500 dark:text-gray-400">
            <p>
              or <button type="button" class="text-primary hover:text-blue-500 dark:text-blue-400 font-medium" @click="emit('close')">Continue Shopping<span aria-hidden="true"> &rarr;</span></button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>
