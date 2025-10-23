<template>
  <div class="data-provider">
    <div v-if="loading" class="" loading>
      <p>Loading Sales data...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>Error loading data: {{ error.message }}</p>
    </div>
    <div v-else>
      <slot
        :salesData="salesData"
        :totalRevenue="totalRevenue"
        :loading="loading"
        :formatDate="formatDate"
      ></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
//import { time } from 'console'
import { ref, onMounted, computed } from 'vue'
//Defining the interface for SalesRecord just like we dfine for mapping the data structure

//defining props if any
// const prop = defineProps<{
//   datetime?: {
//     type: [number | string]
//     required: true
//   }
// }>()
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
// Utility function to format date values for display if the Date is in Unix timestamp or ISO string format
function formatDate(value: string | number | Date): string {
  // If it's already a Date, use it
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? String(value) : value.toLocaleDateString()
  }

  let date: Date

  // If it's numeric , assume epoch
  const num = Number(value)
  if (!Number.isNaN(num) && String(value).trim() !== '') {
    // 10 digits = seconds, 13 digits = milliseconds
    const ms = String(Math.trunc(num)).length === 10 ? num * 1000 : num
    date = new Date(ms)
  } else {
    // Otherwise treat as a date string (ISO like "2025-01-31")
    date = new Date(String(value))
  }

  // If invalid, return original as text; else a friendly date
  return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
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
