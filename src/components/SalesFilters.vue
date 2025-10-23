<template>
  <div class="filters-container">
    <h3>Filters</h3>
    <div class="filters">
      <!-- Regions -->
      <div class="filter-group">
        <label>Filter by Region</label>
        <div class="checkbox-group">
          <label v-for="region in availableRegions" :key="region" class="checkbox-label">
            <input type="checkbox" :value="region" v-model="localFilters.regions" />
            <span v-if="region == undefined">Others</span>
            <span v-else>{{ region }}</span>
          </label>
        </div>
      </div>

      <!-- Products -->
      <div class="filter-group">
        <label>Filter by Product</label>
        <div class="checkbox-group">
          <label v-for="product in availableProducts" :key="product" class="checkbox-label">
            <input type="checkbox" :value="product" v-model="localFilters.products" />
            <span>{{ product }}</span>
          </label>
        </div>
      </div>

      <!-- Date Range -->
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-inputs">
          <div class="date-field">
            <label class="small-label">From</label>
            <input type="date" v-model="localFilters.startDate" />
          </div>
          <div class="date-field">
            <label class="small-label">To</label>
            <input type="date" v-model="localFilters.endDate" />
          </div>
        </div>
      </div>

      <div class="filter-actions">
        <button type="button" class="btn-clear" @click="clearFilters">Clear All</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

export interface SalesFilters {
  regions: string[]
  products: string[]
  startDate: string | null
  endDate: string | null
}

interface Props {
  filters: SalesFilters
  availableRegions: string[]
  availableProducts: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filters', value: SalesFilters): void
}>()

const localFilters = reactive<SalesFilters>({
  regions: [...props.filters.regions],
  products: [...props.filters.products],
  startDate: props.filters.startDate,
  endDate: props.filters.endDate,
})

// Watch for changes and emit to parent
watch(
  localFilters,
  (newFilters) => {
    emit('update:filters', { ...newFilters })
  },
  { deep: true },
)

// Watch for external changes (if parent resets)
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.regions = [...newFilters.regions]
    localFilters.products = [...newFilters.products]
    localFilters.startDate = newFilters.startDate
    localFilters.endDate = newFilters.endDate
  },
  { deep: true },
)

function clearFilters() {
  localFilters.regions = []
  localFilters.products = []
  localFilters.startDate = null
  localFilters.endDate = null
}
</script>

<style scoped>
.filters-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.filters-container h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.filter-group > label {
  font-weight: 600;
  color: #34495e;
  font-size: 0.85rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 120px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  background: #fafafa;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #ecf0f1;
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.checkbox-label span {
  font-size: 0.85rem;
  color: #2c3e50;
}

.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.small-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

input[type='date'] {
  padding: 0.5rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fafafa;
  width: 100%;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #c0392b;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .filters-container {
    padding: 0.75rem;
  }

  .filters {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .checkbox-group {
    max-height: 100px;
  }

  .btn-clear {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .filters-container h3 {
    font-size: 0.9rem;
  }

  .filter-group > label {
    font-size: 0.8rem;
  }

  .checkbox-label span {
    font-size: 0.8rem;
  }
}
</style>
