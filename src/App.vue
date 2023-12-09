<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink class="nav" to="/">Home</RouterLink>
      </nav>
      <nav>
        <RouterLink class="nav" to="/draft">Draft</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView class="page" />
</template>

<style lang="scss" scoped>
header {
  width: 100%;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  
  .wrapper {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  nav:not(:last-child) {
    border-right: 1px solid var(--color-border);
  }

  .nav {
    padding: 5px 20px;
  }
}

.page {
  padding: 10px;
}
</style>
