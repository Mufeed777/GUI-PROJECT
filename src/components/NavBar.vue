<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '../composables/useCart'
import { useDarkMode } from '../composables/useDarkMode'
import { useAuth } from '../composables/useAuth'
import { useSearch } from '../composables/useSearch'
import CartMenu from './CartMenu.vue'

const { totalItems } = useCart()
const { isDark, toggleDarkMode } = useDarkMode()
const { user, isAuthenticated, logout } = useAuth()
const { searchQuery } = useSearch()

const isCartOpen = ref(false)

const handleLogout = () => {
  logout()
}
</script>

<template>
  <header class="bg-header text-white sticky top-0 z-50">
    <!-- Main Header -->
    <div class="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-4 lg:gap-8">
      <!-- Logo -->
      <router-link to="/" class="flex-shrink-0 flex items-center hover:outline hover:outline-1 outline-white p-1 rounded-sm">
        <span class="text-2xl font-black text-primary italic">astra</span>
        <span class="text-xs mt-3 ml-0.5 text-primary">.com</span>
      </router-link>

      <!-- Deliver To -->
      <div class="hidden md:flex items-center gap-1 hover:outline hover:outline-1 outline-white p-1 rounded-sm cursor-pointer transition-all">
        <span class="text-xl">📍</span>
        <div class="flex flex-col">
          <span class="text-[11px] text-gray-300 leading-none">Deliver to</span>
          <span class="text-sm font-bold leading-none">Your Location</span>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="flex-grow flex items-center">
        <div class="flex w-full group">
          <div class="bg-gray-100 text-gray-700 px-3 py-2 rounded-l-md text-xs font-medium cursor-pointer hover:bg-gray-200 flex items-center border-r border-gray-300">
            All
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search Astra" 
            class="w-full px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button class="bg-primary hover:bg-primary-dark p-2 px-5 rounded-r-md transition-colors flex items-center justify-center">
            <svg class="w-6 h-6 text-header" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 lg:gap-6">
        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" class="p-2 hover:outline hover:outline-1 outline-white rounded-sm transition-all focus:outline-none">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>

        <!-- Account -->
        <template v-if="isAuthenticated">
          <div class="group relative py-1 px-2 hover:outline hover:outline-1 outline-white rounded-sm cursor-pointer">
            <div class="flex flex-col">
              <span class="text-[11px] text-gray-300 leading-none">Hello, {{ user?.firstName }}</span>
              <span class="text-sm font-bold leading-none">Account & Lists</span>
            </div>
            <!-- Dropdown -->
            <div class="absolute right-0 top-full mt-1 w-48 bg-white text-gray-900 shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 border border-gray-200">
              <div class="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                <img :src="user?.image" class="w-8 h-8 rounded-full" />
                <span class="font-bold text-sm">{{ user?.username }}</span>
              </div>
              <router-link to="/contact" class="block px-4 py-2 hover:bg-gray-100 text-sm">Contact Support</router-link>
              <button @click="handleLogout" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 font-medium">Sign Out</button>
            </div>
          </div>
        </template>
        <router-link v-else to="/login" class="flex flex-col py-1 px-2 hover:outline hover:outline-1 outline-white rounded-sm">
          <span class="text-[11px] text-gray-300 leading-none">Hello, sign in</span>
          <span class="text-sm font-bold leading-none">Account & Lists</span>
        </router-link>

        <!-- Orders -->
        <div class="hidden lg:flex flex-col py-1 px-2 hover:outline hover:outline-1 outline-white rounded-sm cursor-pointer">
          <span class="text-[11px] text-gray-300 leading-none">Returns</span>
          <span class="text-sm font-bold leading-none">& Orders</span>
        </div>

        <!-- Cart -->
        <div @click="isCartOpen = true" class="flex items-end gap-1 py-1 px-2 hover:outline hover:outline-1 outline-white rounded-sm cursor-pointer relative">
          <div class="relative">
            <span class="text-3xl">🛒</span>
            <span v-if="totalItems >= 0" class="absolute -top-1 left-1/2 -translate-x-1/2 text-primary font-bold text-base">
              {{ totalItems }}
            </span>
          </div>
          <span class="text-sm font-bold pb-1">Cart</span>
        </div>
      </div>
    </div>

    <!-- Sub-Nav -->
    <div class="bg-secondary text-sm font-medium">
      <div class="max-w-[1500px] mx-auto px-4 flex items-center gap-4 h-10 overflow-x-auto scrollbar-hide">
        <button class="flex items-center gap-1 hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2">
          <span>☰</span> All
        </button>
        <router-link to="/" class="hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2 whitespace-nowrap">Today's Deals</router-link>
        <router-link to="/contact" class="hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2 whitespace-nowrap">Customer Service</router-link>
        <router-link to="/" class="hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2 whitespace-nowrap">Gift Cards</router-link>
        <router-link to="/" class="hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2 whitespace-nowrap">Registry</router-link>
        <router-link to="/" class="hover:outline hover:outline-1 outline-white p-1 rounded-sm px-2 whitespace-nowrap">Sell</router-link>
      </div>
    </div>
  </header>

  <CartMenu :is-open="isCartOpen" @close="isCartOpen = false" />
</template>

