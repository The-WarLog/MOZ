<template>
  <div class="analytics">
    <h2>Sales Analytics</h2>

    <DisplayData v-slot="{ salesData }">
      <div v-if="salesData.length > 0">
        <!-- Top Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <h3>Avg Order Value</h3>
            <p class="metric-value">${{ averageOrderValue(salesData).toFixed(2) }}</p>
          </div>
          <div class="metric-card">
            <h3>Total Units Sold</h3>
            <p class="metric-value">{{ totalQuantity(salesData) }}</p>
          </div>
          <div class="metric-card">
            <h3>Total Transactions</h3>
            <p class="metric-value">{{ salesData.length }}</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <!-- Sales by Region -->
          <div class="chart-card">
            <h3>Sales by Region</h3>
            <div class="region-stats">
              <div v-for="region in regionData(salesData)" :key="region.region" class="region-item">
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
                v-for="(product, index) in topProducts(salesData)"
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

        <!-- Initialize chart after render -->
        <div style="display: none">{{ initChartIfReady(salesData) }}</div>
      </div>
    </DisplayData>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import DisplayData from '@/components/DisplayData.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface SalesRecord {
  sale_id: number
  date: string
  region: string
  product: string
  quantity: number
  unit_price: number
  total_price: number
}

const timelineCanvas = ref<HTMLCanvasElement | null>(null)
let timelineChart: Chart | null = null
let chartInitialized = false

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
    regions[sale.region] = (regions[sale.region] || 0) + sale.total_price
  })

  const total = Object.values(regions).reduce((sum, val) => sum + val, 0)

  return Object.entries(regions)
    .map(([region, amount]) => ({
      region,
      total: amount,
      percentage: (amount / total) * 100,
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
  const values = sortedDates.map((date) => dateMap[date])

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
              return 'Sales: $' + context.parsed.y.toFixed(2)
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

  chartInitialized = true
}

// Initialize chart when canvas is ready
const initChartIfReady = (salesData: SalesRecord[]) => {
  if (!chartInitialized && salesData.length > 0) {
    nextTick(() => {
      createTimelineChart(salesData)
    })
  }
  return null
}
</script>

<style scoped>
.analytics {
  padding: 1rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-card h3 {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-card.full-width {
  grid-column: 1 / -1;
  min-height: 400px;
}

.chart-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Region Stats */
.region-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.region-item {
  display: grid;
  grid-template-columns: 80px 1fr 100px;
  align-items: center;
  gap: 1rem;
}

.region-name {
  font-weight: 600;
  color: #2c3e50;
}

.region-bar-container {
  background: #ecf0f1;
  height: 24px;
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
}

/* Product List */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: grid;
  grid-template-columns: 30px 1fr 100px;
  align-items: center;
  gap: 1rem;
}

.product-rank {
  width: 30px;
  height: 30px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.product-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.product-bar-container {
  background: #ecf0f1;
  height: 20px;
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
}

/* Timeline Chart */
.timeline-chart {
  height: 300px;
  position: relative;
}

.timeline-chart canvas {
  max-height: 300px;
}
</style>
