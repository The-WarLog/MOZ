<template>
  <header class="navbar">
    <div class="container">
      <div class="brand">
        <h1 class="sale-dashboard">Sales Dashboard</h1>
      </div>

      <nav class="nav-links">
        <router-link to="/overview">Overview</router-link>
        <router-link to="/analytics">Analytics</router-link>
        <router-link to="/reports">Reports</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// for now no logic here
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.brand {
  flex-shrink: 0;
}

.brand h1 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-links a {
  color: #ecf0f1;
  margin: 0 1rem;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #1abc9c;
}
</style>
