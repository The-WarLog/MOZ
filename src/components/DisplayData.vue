<template>
  <div class="data-provider">
    <div v-if="loading" class="" loading>
      <p>Loading Sales data...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>Error loading data: {{ error.message }}</p>
    </div>
    <div v-else>
      <slot :salesData="salesData" :totalRevenue="totalRevenue" :loading="loading"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
//Defining the interface for SalesRecord just like we dfine for mapping the data structure
interface SalesRecord {
  sale_id: number | string
  date: string
  region: string
  product: string
  quantity: number
  unit_price: number
  total_price: number
}
//Reactive references for sales data, loading state, and error handling
const salesData = ref<SalesRecord[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)
//using COmputed property to calculate total revenue
const totalRevenue = computed(() => {
  return salesData.value?.reduce((sum, sale) => sum + sale.total_price, 0) || 0
})
//fetching the sales data from the API endpoint
const fetchSalesData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      'https://68d424b8214be68f8c6887f1.mockapi.io/api/mozilla/tech/web/task/sales',
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: SalesRecord[] = await response.json()
    salesData.value = data
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false //need a final block to ensure loading is set to false after fetch attempt
  }
}

//ON mounted lifecycle hook to fetch data when component is mounted for fetching sales data
onMounted(() => {
  fetchSalesData()
})
// Expose data and methods to parent if needed
defineExpose({
  salesData,
  totalRevenue,
  fetchSalesData,
})
</script>
<style scoped>
.data-provider {
  width: 100%;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #e74c3c;
}

.loading {
  color: #3498db;
}
</style>
