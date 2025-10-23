<template>
  <div class="reports">
    <h2>Reports</h2>

    <DisplayData v-slot="{ salesData }">
      <!-- Filters -->
      <SalesFilters
        v-model:filters="filters"
        :available-regions="uniqueRegions(salesData)"
        :available-products="uniqueProducts(salesData)"
      />

      <div v-if="filteredData(salesData).length > 0">
        <!-- Summary -->
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p class="value">${{ totalRevenue(filteredData(salesData)).toFixed(2) }}</p>
          </div>
          <div class="summary-card">
            <h3>Total Units</h3>
            <p class="value">{{ totalQuantity(filteredData(salesData)) }}</p>
          </div>
          <div class="summary-card">
            <h3>Transactions</h3>
            <p class="value">{{ filteredData(salesData).length }}</p>
          </div>
        </div>

        <!-- Per-Region Analysis and Exports -->
        <div class="regions-grid">
          <div
            v-for="region in regionsToShow(filteredData(salesData))"
            :key="region"
            class="region-card"
            :ref="(el) => setRegionRef(region, el as HTMLDivElement)"
          >
            <div class="region-header">
              <h3>{{ region }}</h3>
              <div class="actions">
                <button class="btn" @click="exportRegionCSV(region, filteredData(salesData))">
                  CSV
                </button>
                <button
                  class="btn"
                  @click="exportRegionPDF(region)"
                  :disabled="!regionRefs.get(region)"
                >
                  PDF
                </button>
              </div>
            </div>

            <div class="region-metrics">
              <div class="metric">
                <span class="label">Revenue</span>
                <span class="val"
                  >${{ regionRevenue(region, filteredData(salesData)).toFixed(2) }}</span
                >
              </div>
              <div class="metric">
                <span class="label">Units</span>
                <span class="val">{{ regionQuantity(region, filteredData(salesData)) }}</span>
              </div>
              <div class="metric">
                <span class="label">Orders</span>
                <span class="val">{{ regionCount(region, filteredData(salesData)) }}</span>
              </div>
            </div>

            <div class="region-body">
              <div class="chart-wrap">
                <canvas :ref="(el) => setRegionChartRef(region, el as HTMLCanvasElement)"></canvas>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in byRegion(region, filteredData(salesData))"
                      :key="`${row.sale_id}-${row.date}`"
                    >
                      <td>{{ row.sale_id }}</td>
                      <td>{{ row.date }}</td>
                      <td>{{ row.product }}</td>
                      <td>{{ row.quantity }}</td>
                      <td>${{ row.unit_price.toFixed(2) }}</td>
                      <td>${{ row.total_price.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <!-- Ensure charts sync after render -->
        <div style="display: none">{{ onAfterRender(filteredData(salesData)) }}</div>
      </div>
      <div v-else class="empty">
        <p>No data for current filters. Adjust your selection.</p>
      </div>
    </DisplayData>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import DisplayData from '@/components/DisplayData.vue'
import SalesFilters from '@/components/SalesFilters.vue'
import { unparse } from 'papaparse'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

defineOptions({ name: 'ReportsPage' })

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

// Filters state
const filters = ref<Filters>({ regions: [], products: [], startDate: null, endDate: null })

// Helpers: unique options
const uniqueRegions = (sales: SalesRecord[]) =>
  Array.from(new Set(sales.map((s) => s.region?.trim() || 'Others')))
const uniqueProducts = (sales: SalesRecord[]) => Array.from(new Set(sales.map((s) => s.product)))

// Apply filters to data
const filteredData = (sales: SalesRecord[]) => {
  const f = filters.value
  return sales.filter((s) => {
    const region = s.region?.trim() || 'Others'
    const regionOk = f.regions.length === 0 || f.regions.includes(region)
    const productOk = f.products.length === 0 || f.products.includes(s.product)
    const startOk = !f.startDate || s.date >= f.startDate
    const endOk = !f.endDate || s.date <= f.endDate
    return regionOk && productOk && startOk && endOk
  })
}

// Region helpers
const regionsToShow = (rows: SalesRecord[]) => {
  const all = Array.from(new Set(rows.map((r) => r.region?.trim() || 'Others')))
  return filters.value.regions.length ? filters.value.regions : all
}
const byRegion = (region: string, rows: SalesRecord[]) =>
  rows.filter((r) => (r.region?.trim() || 'Others') === region)
const regionRevenue = (region: string, rows: SalesRecord[]) =>
  byRegion(region, rows).reduce((a, r) => a + r.total_price, 0)
const regionQuantity = (region: string, rows: SalesRecord[]) =>
  byRegion(region, rows).reduce((a, r) => a + r.quantity, 0)
const regionCount = (region: string, rows: SalesRecord[]) => byRegion(region, rows).length

// Global metrics
const totalRevenue = (rows: SalesRecord[]) => rows.reduce((a, r) => a + r.total_price, 0)
const totalQuantity = (rows: SalesRecord[]) => rows.reduce((a, r) => a + r.quantity, 0)

// Refs to region cards and canvases
const regionRefs = new Map<string, HTMLDivElement>()
const regionChartRefs = new Map<string, HTMLCanvasElement>()
const regionCharts = new Map<string, Chart>()

const setRegionRef = (region: string, el: HTMLDivElement | null) => {
  if (!el) return
  regionRefs.set(region, el)
}
const setRegionChartRef = (region: string, el: HTMLCanvasElement | null) => {
  if (!el) return
  regionChartRefs.set(region, el)
}

// Create mini line chart per region
const createRegionChart = (region: string, rows: SalesRecord[]) => {
  const canvas = regionChartRefs.get(region)
  if (!canvas) return
  // Build daily totals
  const map: Record<string, number> = {}
  rows.forEach((r) => {
    map[r.date] = (map[r.date] || 0) + r.total_price
  })
  const labels = Object.keys(map).sort()
  const data = labels.map((d) => map[d] ?? 0)

  // Destroy previous
  const existing = regionCharts.get(region)
  if (existing) existing.destroy()

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${region} Daily Sales ($)`,
          data,
          borderColor: '#8e44ad',
          backgroundColor: 'rgba(142,68,173,.12)',
          tension: 0.35,
          pointRadius: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => '$' + v } } },
    },
  })
  regionCharts.set(region, chart)
}

// Utility to (re)draw all region charts after DOM updated
const redrawRegionCharts = (rows: SalesRecord[]) => {
  nextTick(() => {
    const regions = regionsToShow(rows)
    regions.forEach((r) => createRegionChart(r, byRegion(r, rows)))
  })
}

// Called from template to sync charts when data changes
const onAfterRender = (rows: SalesRecord[]) => {
  redrawRegionCharts(rows)
  return null
}

// CSV export for a region
const exportRegionCSV = (region: string, allRows: SalesRecord[]) => {
  const rows = byRegion(region, allRows)
  if (!rows.length) return
  const csv = unparse(
    rows.map((r) => ({
      sale_id: r.sale_id,
      date: r.date,
      region: r.region,
      product: r.product,
      quantity: r.quantity,
      unit_price: r.unit_price,
      total_price: r.total_price,
    })),
  )
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${region}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// PDF export for a region (capture region card)
const exportRegionPDF = async (region: string) => {
  const el = regionRefs.get(region)
  if (!el) return
  const canvas = await html2canvas(el, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  pdf.setFontSize(14)
  pdf.text(`Region Report: ${region}`, 10, 12)
  const y = 18
  if (imgHeight < pageHeight - 20) {
    pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight)
  } else {
    // Split into multiple pages if needed
    let remaining = imgHeight
    const pageImgHeight = pageHeight - 30
    const ratio = imgWidth / canvas.width
    const pageCanvas = document.createElement('canvas')
    const ctx = pageCanvas.getContext('2d')!
    pageCanvas.width = canvas.width
    pageCanvas.height = Math.floor(pageImgHeight / ratio)
    let sY = 0
    while (remaining > 0) {
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0,
        sY,
        pageCanvas.width,
        pageCanvas.height,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height,
      )
      const pageData = pageCanvas.toDataURL('image/png')
      pdf.addImage(pageData, 'PNG', 10, y, imgWidth, pageImgHeight)
      remaining -= pageImgHeight
      sY += pageCanvas.height
      if (remaining > 0) pdf.addPage()
    }
  }
  pdf.save(`report_${region}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// (no cached rows; rows are passed from template)
</script>

<style scoped>
.reports {
  padding: 1rem;
}
h2 {
  margin-bottom: 1.2rem;
  color: #2c3e50;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.summary-card {
  background: #fff;
  padding: 1.2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
.summary-card h3 {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}
.summary-card .value {
  font-size: 1.7rem;
  font-weight: 700;
  color: #2c3e50;
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 1.2rem;
}
.region-card {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.region-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}
.region-header h3 {
  margin: 0;
  color: #2c3e50;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.btn {
  padding: 0.45rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #dfe6e9;
  background: #f6f8fa;
  cursor: pointer;
}
.btn:hover {
  background: #eef1f4;
}

.region-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}
.metric {
  background: #fafafa;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.metric .label {
  color: #7f8c8d;
  font-size: 0.85rem;
}
.metric .val {
  font-weight: 700;
  color: #2c3e50;
}

.region-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.chart-wrap {
  height: 220px;
}
.table-wrap {
  max-height: 220px;
  overflow: auto;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  position: sticky;
  top: 0;
  background: #34495e;
  color: #fff;
}
th,
td {
  padding: 0.6rem;
  border-bottom: 1px solid #ecf0f1;
  text-align: left;
}
tbody tr:hover {
  background: #f8f9fa;
}

.empty {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
</style>
