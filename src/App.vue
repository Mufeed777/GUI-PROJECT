<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-background dark:bg-background-dark text-text dark:text-text-dark transition-colors duration-300">
    <NavBar />
    <main>
      <router-view />
    </main>
  </div>
</template>
