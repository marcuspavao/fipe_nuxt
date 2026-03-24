<template>
  <nav class="navbar">
    <div class="nav-container">
      <NuxtLink to="/" class="nav-logo">
        🚗 FIPE App
      </NuxtLink>
      <ul class="nav-links">
        <li><NuxtLink to="/" active-class="active">Consultar</NuxtLink></li>
        <li><NuxtLink to="/comparar" active-class="active">Comparar</NuxtLink></li>
        <li><NuxtLink to="/dashboard" active-class="active">Dashboard</NuxtLink></li>
        <li><NuxtLink to="/buscar" active-class="active">Buscar</NuxtLink></li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-logo {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 4px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--primary);
  background: var(--primary-light);
}
</style>
