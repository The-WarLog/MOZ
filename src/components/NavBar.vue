<template>
  <header class="navbar">
    <div class="container">
      <div class="brand">
        <h1 class="sale-dashboard">Sales Dashboard</h1>
      </div>

      <nav class="nav-links">
        <a href="/overview">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/reports">Reports</a>
      </nav>

      <div class="actions">
        <div class="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Later you can add theme toggle logic here
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
  gap: 15rem;
}

.brand h1 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.nav-links a {
  color: #ecf0f1;
  margin: 0 1rem;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #1abc9c;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar input {
  border: none;
  border-radius: 5px;
  outline: none;
  padding: 0.4rem 0.8rem;
}
</style>
