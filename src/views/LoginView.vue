<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, signup } = useAuth()

const isLogin = ref(true)
const username = ref('123')
const email = ref('')
const password = ref('123')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
}

const handleAuth = async () => {
  errorMessage.value = ''
  
  if (isLogin.value) {
    if (!username.value || !password.value) {
      errorMessage.value = 'Please enter both username and password'
      return
    }
  } else {
    if (!username.value || !email.value || !password.value || !confirmPassword.value) {
      errorMessage.value = 'Please fill in all fields'
      return
    }
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match'
      return
    }
  }

  isLoading.value = true
  
  try {
    if (isLogin.value) {
      await login(username.value, password.value)
      router.push('/')
    } else {
      await signup({ 
        username: username.value, 
        email: email.value, 
        password: password.value,
        firstName: username.value,
        lastName: 'User'
      })
      errorMessage.value = 'Account created successfully! Please sign in.'
      isLogin.value = true
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed.'
    console.error('Auth error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-12 bg-white transition-colors duration-300">
    <!-- Logo -->
    <router-link to="/" class="mb-6 flex items-center">
      <span class="text-3xl font-black text-header italic">astra</span>
      <span class="text-xs mt-3 ml-0.5 text-header font-bold">.com</span>
    </router-link>

    <!-- Login Container -->
    <div class="max-w-[350px] w-full p-6 border border-gray-300 rounded-lg shadow-sm">
      <h2 class="text-2xl font-normal text-gray-900 mb-4">
        {{ isLogin ? 'Sign in' : 'Create account' }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleAuth">
        <div v-if="errorMessage" 
             :class="errorMessage.includes('successfully') ? 'text-green-700' : 'text-red-700'"
             class="text-xs font-medium py-1">
          {{ errorMessage }}
        </div>

        <div class="space-y-3">
          <div>
            <label for="username" class="block text-sm font-bold text-gray-900 mb-1">Username</label>
            <input 
              id="username" 
              type="text" 
              required 
              v-model="username"
              class="block w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-inner"
            >
          </div>

          <div v-if="!isLogin">
            <label for="email" class="block text-sm font-bold text-gray-900 mb-1">Email</label>
            <input 
              id="email" 
              type="email" 
              :required="!isLogin"
              v-model="email"
              class="block w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-inner"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-gray-900 mb-1">Password</label>
            <input 
              id="password" 
              type="password" 
              required 
              v-model="password"
              class="block w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-inner"
              :placeholder="isLogin ? '' : 'At least 6 characters'"
            >
          </div>

          <div v-if="!isLogin">
            <label for="confirm-password" class="block text-sm font-bold text-gray-900 mb-1">Re-enter password</label>
            <input 
              id="confirm-password" 
              type="password" 
              :required="!isLogin"
              v-model="confirmPassword"
              class="block w-full px-3 py-1.5 border border-gray-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-inner"
            >
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 py-1.5 rounded-lg text-sm transition-colors border border-[#FCD200] shadow-sm active:bg-[#F0C14B] disabled:opacity-50"
        >
          {{ isLoading ? (isLogin ? 'Signing in...' : 'Processing...') : (isLogin ? 'Sign in' : 'Continue') }}
        </button>
      </form>

      <p class="mt-4 text-[11px] text-gray-700 leading-tight">
        By continuing, you agree to Astra's <span class="text-link hover:underline hover:text-red-700 cursor-pointer">Conditions of Use</span> and <span class="text-link hover:underline hover:text-red-700 cursor-pointer">Privacy Notice</span>.
      </p>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <p class="text-xs text-gray-900 font-bold mb-2">
          {{ isLogin ? 'New to Astra?' : 'Already have an account?' }}
        </p>
        <button 
          @click="toggleMode" 
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-1.5 rounded-lg text-sm transition-colors border border-gray-300 shadow-sm"
        >
          {{ isLogin ? 'Create your Astra account' : 'Sign in' }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-10 py-6 border-t border-gray-100 w-full flex flex-col items-center bg-gradient-to-b from-gray-50 to-white">
      <div class="flex gap-6 text-[11px] text-link mb-2">
        <span class="hover:underline hover:text-red-700 cursor-pointer">Conditions of Use</span>
        <span class="hover:underline hover:text-red-700 cursor-pointer">Privacy Notice</span>
        <span class="hover:underline hover:text-red-700 cursor-pointer">Help</span>
      </div>
      <p class="text-[11px] text-gray-500">© 1996-2024, Astra.com, Inc. or its affiliates</p>
    </div>
  </div>
</template>


<style scoped>
.animate-in {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromTop {
  from { transform: translateY(-10px); }
  to { transform: translateY(0); }
}

.fade-in {
  animation-name: fadeIn;
}

.slide-in-from-top-2 {
  animation-name: slideInFromTop;
}
</style>

<style scoped>
/* Custom animations or refinements if needed */
</style>
