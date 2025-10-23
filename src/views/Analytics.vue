<template>
  <div class="analytics">
    <h2>Sales Analytics</h2>

    <DisplayData v-slot="{ salesData }">
      <!-- Filters -->
      <SalesFilters
        v-model:filters="filters"
        :available-regions="uniqueRegions(salesData)"
        :available-products="uniqueProducts(salesData)"
      />

      <div v-if="filteredData(salesData).length > 0">
        <!-- Top Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <h3>Avg Order Value</h3>
            <p class="metric-value">${{ averageOrderValue(filteredData(salesData)).toFixed(2) }}</p>
          </div>
          <div class="metric-card">
            <h3>Total Units Sold</h3>
            <p class="metric-value">{{ totalQuantity(filteredData(salesData)) }}</p>
          </div>
          <div class="metric-card">
            <h3>Total Transactions</h3>
            <p class="metric-value">{{ filteredData(salesData).length }}</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <!-- Sales by Region -->
          <div class="chart-card">
            <h3>Sales by Region</h3>
            <div class="region-stats">
              <div
                v-for="region in regionData(filteredData(salesData))"
                :key="region.region"
                class="region-item"
              >
                <span class="region-name">{{ region.region }}</span>
                <div class="region-bar-container">
                  <div class="region-bar" :style="{ width: region.percentage + '%' }"></div>
                </div>
                <span class="region-value">${{ region.total.toFixed(0) }}</span>
              </div>
            </div>
          </div>

          <!-- Top 5 Products -->
          <div class="chart-card">
            <h3>Top 5 Products by Revenue</h3>
            <div class="product-list">
              <div
                v-for="(product, index) in topProducts(filteredData(salesData))"
                :key="product.name"
                class="product-item"
              >
                <span class="product-rank">{{ index + 1 }}</span>
                <div class="product-details">
                  <span class="product-name">{{ product.name }}</span>
                  <div class="product-bar-container">
                    <div class="product-bar" :style="{ width: product.percentage + '%' }"></div>
                  </div>
                </div>
                <span class="product-value">${{ product.revenue.toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Timeline -->
        <div class="chart-card full-width">
          <h3>Sales Timeline (Daily)</h3>
          <div class="timeline-chart">
            <canvas ref="timelineCanvas"></canvas>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <p>No data matches the current filters. Try adjusting your selection.</p>
      </div>
    </DisplayData>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import DisplayData from '@/components/DisplayData.vue'
import SalesFilters from '@/components/SalesFilters.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

defineOptions({ name: 'SalesAnalytics' })

interface Filters {
  regions: string[]
  products: string[]
  startDate: string | null
  endDate: string | null
}

interface SalesRecord {
  sale_id: number | string
  date: string
  region: string
  product: string
  quantity: number
  unit_price: number
  total_price: number
}

const timelineCanvas = ref<HTMLCanvasElement | null>(null)
let timelineChart: Chart<'line', number[], string> | null = null

// Filters model
const filters = ref<Filters>({
  regions: [],
  products: [],
  startDate: null,
  endDate: null,
})

// Current filtered data
const currentFilteredData = ref<SalesRecord[]>([])

// Get unique regions and products
const uniqueRegions = (sales: SalesRecord[]) => {
  return Array.from(new Set(sales.map((s) => s.region)))
}

const uniqueProducts = (sales: SalesRecord[]) => {
  return Array.from(new Set(sales.map((s) => s.product)))
}

// Apply filters to data
const filteredData = (sales: SalesRecord[]) => {
  const f = filters.value
  const result = sales.filter((s) => {
    const regionOk = f.regions.length === 0 || f.regions.includes(s.region)
    const productOk = f.products.length === 0 || f.products.includes(s.product)
    const startOk = !f.startDate || s.date >= f.startDate
    const endOk = !f.endDate || s.date <= f.endDate
    return regionOk && productOk && startOk && endOk
  })
  currentFilteredData.value = result
  return result
}

// Calculate average order value
const averageOrderValue = (sales: SalesRecord[]) => {
  if (!sales || sales.length === 0) return 0
  const total = sales.reduce((sum, sale) => sum + sale.total_price, 0)
  return total / sales.length
}

// Calculate total quantity
const totalQuantity = (sales: SalesRecord[]) => {
  if (!sales) return 0
  return sales.reduce((sum, sale) => sum + sale.quantity, 0)
}

// Group sales by region
const regionData = (sales: SalesRecord[]) => {
  if (!sales || sales.length === 0) return []

  const regions: Record<string, number> = {}
  sales.forEach((sale) => {
    if (sale.region == undefined) {
      regions['Others'] = (regions[sale.region] || 0) + sale.total_price
    } else {
      regions[sale.region] = (regions[sale.region] || 0) + sale.total_price
    }
  })

  const total = Object.values(regions).reduce((sum, val) => sum + val, 0)

  return Object.entries(regions)
    .map(([region, amount]) => ({
      region,
      total: amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

// Get top 5 products by revenue
const topProducts = (sales: SalesRecord[]) => {
  if (!sales || sales.length === 0) return []

  const products: Record<string, number> = {}
  sales.forEach((sale) => {
    products[sale.product] = (products[sale.product] || 0) + sale.total_price
  })

  const sortedProducts = Object.entries(products)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxRevenue = sortedProducts[0]?.[1] || 1

  return sortedProducts.map(([name, revenue]) => ({
    name,
    revenue,
    percentage: (revenue / maxRevenue) * 100,
  }))
}

// Create timeline chart
const createTimelineChart = (sales: SalesRecord[]) => {
  if (!timelineCanvas.value || !sales || sales.length === 0) return

  // Group by date
  const dateMap: Record<string, number> = {}
  sales.forEach((sale) => {
    dateMap[sale.date] = (dateMap[sale.date] || 0) + sale.total_price
  })

  const sortedDates = Object.keys(dateMap).sort()
  const values = sortedDates.map((date) => dateMap[date] ?? 0)

  // Destroy existing chart
  if (timelineChart) {
    timelineChart.destroy()
  }

  // Create new chart
  timelineChart = new Chart(timelineCanvas.value, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: [
        {
          label: 'Daily Sales ($)',
          data: values,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              // context.parsed can be a number or an object with { y }, and it can be null — handle both cases safely
              const parsed = context.parsed
              const value =
                typeof parsed === 'number'
                  ? parsed
                  : parsed && typeof parsed.y === 'number'
                    ? parsed.y
                    : 0
              return 'Sales: $' + value.toFixed(2)
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value,
          },
        },
      },
    },
  })
}

// Watch for filter changes and update chart
watch(
  [filters, currentFilteredData],
  () => {
    nextTick(() => {
      if (currentFilteredData.value.length > 0) {
        createTimelineChart(currentFilteredData.value)
      }
    })
  },
  { deep: true },
)
</script>

<style scoped>
.analytics {
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
  min-height: 350px;
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.region-stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.region-item {
  display: grid;
  grid-template-columns: 70px 1fr 90px;
  align-items: center;
  gap: 0.75rem;
}

.region-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.region-bar-container {
  background: #ecf0f1;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.region-bar {
  background: linear-gradient(90deg, #3498db, #2980b9);
  height: 100%;
  transition: width 0.5s ease;
}

.region-value {
  text-align: right;
  font-weight: 600;
  color: #3498db;
  font-size: 0.85rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.product-item {
  display: grid;
  grid-template-columns: 28px 1fr 90px;
  align-items: center;
  gap: 0.75rem;
}

.product-rank {
  width: 28px;
  height: 28px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-bar-container {
  background: #ecf0f1;
  height: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.product-bar {
  background: linear-gradient(90deg, #27ae60, #229954);
  height: 100%;
  transition: width 0.5s ease;
}

.product-value {
  text-align: right;
  font-weight: 600;
  color: #27ae60;
  font-size: 0.85rem;
}

.timeline-chart {
  height: 280px;
  position: relative;
  width: 100%;
}

.timeline-chart canvas {
  max-width: 100%;
  max-height: 280px;
}

.empty {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .analytics {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  .metrics-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .metric-card {
    padding: 1rem;
  }

  .metric-value {
    font-size: 1.4rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .chart-card {
    padding: 0.75rem;
  }

  .region-item {
    grid-template-columns: 60px 1fr 80px;
    gap: 0.5rem;
  }

  .product-item {
    grid-template-columns: 26px 1fr 80px;
    gap: 0.5rem;
  }

  .timeline-chart {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .analytics {
    padding: 0.5rem;
  }

  h2 {
    font-size: 1.1rem;
  }

  .metric-card h3 {
    font-size: 0.75rem;
  }

  .metric-value {
    font-size: 1.2rem;
  }

  .chart-card h3 {
    font-size: 0.9rem;
  }

  .region-item {
    grid-template-columns: 50px 1fr 70px;
  }

  .region-name,
  .region-value,
  .product-name,
  .product-value {
    font-size: 0.75rem;
  }

  .product-rank {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }

  .timeline-chart {
    height: 200px;
  }
}
</style>
