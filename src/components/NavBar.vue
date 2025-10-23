<template>
  <header class="navbar">
    <div class="container">
      <div class="brand">
        <h1 class="sale-dashboard">Sales Dashboard</h1>
      </div>

      <button
        class="hamburger"
        @click="toggleMenu"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="nav-links" :class="{ active: isMenuOpen }">
        <router-link to="/overview" @click="closeMenu">Overview</router-link>
        <router-link to="/analytics" @click="closeMenu">Analytics</router-link>
        <router-link to="/reports" @click="closeMenu">Reports</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
}

.brand {
  flex-shrink: 0;
  z-index: 1001;
}

.brand h1 {
  color: white;
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 3px;
  background-color: white;
  transition: all 0.3s;
  border-radius: 2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links a {
  color: #ecf0f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #1abc9c;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Mobile styles */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 0;
  }

  .brand h1 {
    font-size: 1.1rem;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 70%;
    max-width: 300px;
    background-color: #34495e;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 4rem 0 2rem 0;
    gap: 0;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
    transition: right 0.3s ease;
    z-index: 1000;
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links a {
    padding: 1rem 1.5rem;
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-links a:hover,
  .nav-links a.router-link-active {
    background-color: rgba(26, 188, 156, 0.2);
  }
}

@media (max-width: 480px) {
  .brand h1 {
    font-size: 1rem;
  }

  .nav-links {
    width: 80%;
  }
}
</style>
