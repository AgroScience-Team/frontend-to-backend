<template v-for="row in rows" :key="`${row.id}-${row.filed_id}`">
  <div class="q-pa-md">
    <q-input v-model="startDate" placeholder="Дата начала">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxyStart" transition-show="scale" transition-hide="scale">
            <q-date v-model="startDate" @input="() => $refs.qDateProxyStart.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input v-model="endDate" placeholder="Дата окончания">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxyEnd" transition-show="scale" transition-hide="scale">
            <q-date v-model="endDate" :min="startDate" @input="() => $refs.qDateProxyEnd.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-table class="virtscroll-table" virtual-scroll flat bordered v-model:pagination="pagination"
      :rows-per-page-options="[0]" :virtual-scroll-sticky-size-start="48" column-key="id" :rows="filteredRows"
      :columns="rotationColumns">
      <template v-slot:body-cell-row_number="props">
        <q-td :props="props">
          {{ props.rowIndex + 1 }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="delete" @click="deleteRow(props.row.id)" />
        </q-td>
      </template>
      <template v-slot:body-cell-edit="props">
        <q-td :props="props">
          <q-btn flat icon="launch" @click="navigateToPage(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, computed, watchEffect, onMounted, reactive } from 'vue'
import axios from 'axios';
import { userStore } from 'src/usage';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const startDate = ref('')
    const endDate = ref('')
    const $q = useQuasar();
    const router = useRouter();

    const rotationData = reactive([]);
    const rotationColumns = reactive([
      { name: 'row_number', label: 'ID', align: 'center', field: (_row, index) => index + 1, sortable: true },
      { name: 'culture', label: 'Культура', align: 'center', field: 'culture', sortable: true },
   //   { name: 'field_area', label: 'Площадь поля', align: 'center', field: 'field_area', sortable: true },
      { name: 'start_time', label: 'Дата начала', align: 'center', field: 'start_time', sortable: true },
      { name: 'end_time', label: 'Дата окончания', align: 'center', field: 'end_time', sortable: true },
      { name: 'description', label: 'Описание', align: 'center', field: 'description' },
      { name: 'edit', label: 'Редактировать', align: 'center', field: row => row.id, format: val => `${val}` },
      { name: 'actions', label: 'Удалить', align: 'center', field: row => row.id, format: val => `${val}` }
    ]);

    function formatDateString(dateString) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateString;
    }

    const accessToken = userStore.state.access_token;

    async function deleteRow(rowId) {
      try {
        const response = await axios.delete(`http://smart.agromelio.ru/api/fields/crop-rotations?id=${rowId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 204) {
          $q.notify({
            color: 'green-5',
            textColor: 'white',
            icon: 'check',
            message: 'Удалено'
          });
          rotationData.splice(rotationData.findIndex(row => row.id === rowId), 1);
        } else {
          console.error('Error deleting row:', response);
        }
      } catch (error) {
        console.error('Error during API call:', error);
      }
    }

    async function navigateToPage(rowId) {
      router.push({ path: '/fetch_rotation', query: { id: rowId } });
    };

    onMounted(async () => {

      const accessToken = userStore.state.access_token;

      if (!accessToken) {
        console.log("No access token available");
        $q.notify({
          type: 'negative',
          message: 'Залогиньтесь, пожалуйста'
        })
        return;
      };

      try {
        const response = await axios.get('http://smart.agromelio.ru/api/fields/crop-rotations/organization', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        console.log(response.data);

        if (data) {
          data.forEach(item => {
            rotationData.push({
              id: item.id,
              culture: item.crop.name,
              field_area: item.field.name,
              start_time: formatDateString(item.startDate),
              end_time: formatDateString(item.endDate),
              description: item.description
            });
          })
        }
      } catch (error) {
        console.error('Wrong Api', error);
      };
    });


    watchEffect(() => {
      console.log('Current dates:', startDate.value, endDate.value);
    });

    const filteredRows = computed(() => {
      const start = startDate.value ? new Date(startDate.value.replace(/\//g, '-')).getTime() : -Infinity
      const end = endDate.value ? new Date(endDate.value.replace(/\//g, '-')).getTime() : Infinity

      return rotationData.filter(rotationData => {
        const rowStart = new Date(rotationData.start_time).getTime()
        const rowEnd = new Date(rotationData.end_time).getTime()
        return rowStart >= start && rowEnd <= end
      })
    });

    return {
      navigateToPage,
      deleteRow,
      rotationColumns,
      rotationData,
      startDate,
      endDate,
      filteredRows,
      pagination: ref({ rowsPerPage: 1000 })
    }
  }
}


</script>

<style lang="scss">
.virtscroll-table {

  max-width: 100%;
  margin-top: 50px;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
  width: auto;

  .q-table th {
    font-size: 20px !important;
  }

  .q-table td {
    font-size: 15px !important;
  }

}

@media (max-width: 768px) {
  .q-table th {
    font-size: 20px !important;
  }

  .q-table td {
    font-size: 15px !important;
  }

  .virtscroll-table {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
