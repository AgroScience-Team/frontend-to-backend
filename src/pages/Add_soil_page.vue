<template>
        <div class="q-gutter-sm" style="display: flex; flex-wrap: wrap;">
          <div v-for="(column, index) in soilColumns" :key="index" class="q-ma-sm" style="flex: 1 1 200px;">
            <q-input
                v-model="soilData[column.name]"
                  :label="column.label"
                  dense
                  :hint="column.name === 'sampleDate' ? 'Format: dd-mm-yyyy' : ''"
                  :placeholder="column.name === 'sampleDate' ? 'dd-mm-yyyy' : ''"
                  ></q-input>
          </div>
        </div>

        <q-btn label="Submit" @click="submitData" :disabled="isSubmitDisabled"></q-btn>
</template>

<script>
import { useRouter } from 'vue-router';
import { reactive, computed } from 'vue';
import axios from 'axios';
import { userStore } from 'src/usage';
import { useQuasar } from 'quasar';

export default {
    name: 'AddSoilPage',
    setup() {
      const $q = useQuasar();

      const router = useRouter();

      const soilData = reactive({});
      const soilColumns = reactive([
            { name: 'fieldId', label: 'FieldId', field: 'fieldId', align: 'center'},
            { name: 'ph', label: 'ph', field: 'ph', align: 'center'},
            { name: 'sampleDate', label: 'sampleDate', field: 'sampleDate', align: 'center'},
            { name: 'organicMatter', label: 'organicMatter', field: 'organicMatter', align: 'center'},
            { name: 'mobileP', label: 'mobileP', field: 'mobileP', align: 'center'},
            { name: 'mobileK', label: 'mobileK', field: 'mobileK', align: 'center'},
            { name: 'mobileS', label: 'mobileS', field: 'mobileS', align: 'center'},
            { name: 'nitrateN', label: 'nitrateN', field: 'nitrateN', align: 'center'},
            { name: 'ammoniumN', label: 'ammoniumN', field: 'ammoniumN', align: 'center'},
            { name: 'hydrolyticAcidity', label: 'hydrolyticAcidity', field: 'hydrolyticAcidity', align: 'center'},
            { name: 'caExchange', label: 'caExchange', field: 'caExchange', align: 'center'},
            { name: 'mgExchange', label: 'mgExchange', field: 'mgExchange', align: 'center'},
            { name: 'b', label: 'b', field: 'b', align: 'center'},
            { name: 'co', label: 'co', field: 'co', align: 'center'},
            { name: 'mn', label: 'mn', field: 'mn', align: 'center'},
            { name: 'zn', label: 'zn', field: 'zn', align: 'center'},
      ]);

      const isSubmitDisabled = computed(() => {
        return soilColumns.some(column => {
            const value = soilData[column.name];
            return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
        });
        });
      //test if sampleDate form is right
      function isValidDateFormat(dateStr) {
          const regex = /^\d{2}-\d{2}-\d{4}$/;
          return regex.test(dateStr);
      };

      const accessToken = userStore.state.access_token;

      const submitData = () => {
        //check jwt
        if (!accessToken) {
            console.error('No access token available');
            return;
        };

        if (soilData.fieldId && typeof soilData.fieldId === 'string') {
            soilData.fieldId = parseInt(soilData.fieldId, 10);
        };

        // turn id from str into int
        if (isNaN(soilData.fieldId)) {
            console.error('Invalid fieldId: must be a number');
            return;
        };

        //if date is wrong format, return
        if (!isValidDateFormat(soilData.sampleDate)) {
            $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Invalid date format. Please use dd-mm-yyyy.'
            });
            return;
        };

        console.log('Submitting data:', JSON.stringify(soilData)); //check data
        axios.post(`http://188.243.22.63:8080/api/fields/soil`, soilData, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
              console.log(soilData)
              console.log(response);
              const fieldId = response.data.fieldId;
              router.push({ path: '/field_information', query: { fieldId: fieldId} });
          })
          .catch(error => {
            console.error('Error submitting data', error);
          })
      };

      return {
        soilData,
        soilColumns,
        isSubmitDisabled,
        submitData
      }
    }
}
</script>
