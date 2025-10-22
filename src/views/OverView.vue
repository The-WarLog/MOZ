<template>
  <div class="overview">
    <h2>Sales Overview</h2>

    <DisplayData v-slot="{ salesData, totalRevenue }">
      <div class="summary-cards">
        <div class="card">
          <h3>Total Revenue</h3>
          <p class="revenue">${{ totalRevenue.toFixed(2) }}</p>
        </div>
        <div class="card">
          <h3>Total Sales</h3>
          <p class="count">{{ salesData?.length }}</p>
        </div>
      </div>

      <div class="table-container">
        <h3>Sales Data</h3>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Region</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in salesData" :key="sale.sale_id">
                <td>{{ sale.sale_id }}</td>
                <td>{{ sale.date }}</td>
                <td>{{ sale.region }}</td>
                <td>{{ sale.product }}</td>
                <td>{{ sale.quantity }}</td>
                <td>${{ sale.unit_price.toFixed(2) }}</td>
                <td>${{ sale.total_price.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="chart-container">
        <h3>Sales Trends</h3>
        <p>Chart will go here...</p>
      </div>
    </DisplayData>
  </div>
</template>

<script setup lang="ts">
import DisplayData from '../components/DisplayData.vue'
</script>

<style scoped>
.overview {
  padding: 1rem;
}

h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-bottom: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.revenue {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.table-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-container h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.table-scroll {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  background: #34495e;
  color: white;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.chart-container h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style>
