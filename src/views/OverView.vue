<template>
  <div class="overview">
    <h2>Sales Overview</h2>

    <DisplayData v-slot="{ salesData, totalRevenue, formatDate }">
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
                <td v-if="typeof sale.sale_id == 'string'">{{ Number(sale.sale_id) }}</td>
                <td v-else>{{ sale.sale_id }}</td>
                <td>{{ formatDate(sale.date) }}</td>
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
    </DisplayData>
  </div>
</template>

<script setup lang="ts">
import DisplayData from '../components/DisplayData.vue'
</script>

<style scoped>
.overview {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-bottom: 0.5rem;
  color: #7f8c8d;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.revenue {
  font-size: 1.6rem;
  font-weight: bold;
  color: #27ae60;
  margin: 0;
}

.count {
  font-size: 1.6rem;
  font-weight: bold;
  color: #3498db;
  margin: 0;
}

.table-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.table-container h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  background: #34495e;
  color: white;
  z-index: 10;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  white-space: nowrap;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .overview {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .card {
    padding: 1rem;
  }

  .revenue,
  .count {
    font-size: 1.4rem;
  }

  .table-container {
    padding: 0.75rem;
  }

  th,
  td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .revenue,
  .count {
    font-size: 1.2rem;
  }

  th,
  td {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
}
</style>
