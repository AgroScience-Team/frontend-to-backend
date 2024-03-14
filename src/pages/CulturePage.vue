<template>
    <div v-show="cropData">
        <q-select v-model="computedFieldId" :options="fields" label="FieldId"></q-select>
        <q-select v-model="computedCropId" :options="crops" label="CropId"></q-select>
        <q-input v-model="cropData.startDate" label="StartDate (DD-MM-YYYY)" hint="Format: DD-MM-YYYY" mask="##-##-####"></q-input>
        <q-input v-model="cropData.endDate" label="EndDate (DD-MM-YYYY)" hint="Format: DD-MM-YYYY" mask="##-##-####"></q-input>
        <q-input v-model="cropData.description" label="Description"></q-input>

        <q-btn label="Submit" @click="submitData" :disabled="isSubmitDisabled"></q-btn>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { userStore } from 'src/usage';
import { useQuasar } from 'quasar';


export default {
    name: 'CulturePage',
    setup() {

        const $q = useQuasar();

        const cropData = ref({
                                fieldId: '',
                                startDate: '',
                                endDate: '',
                                description: ''
                            });

        const fields = ref([]);

        const crops = ref([]);

        const accessToken = userStore.state.access_token;

        onMounted(() => {
            fetchFields();
            fetchCrops();
        });
        //fields menu
        async function fetchFields() {
            try {
                const response = await axios.get(`http://188.243.22.63:8080/api/fields/organization/preview`, {
                    headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }});
                fields.value = response.data.map(field => ({ label: `${field.name} - id: ${field.id}`, value: field.id }));
                console.log(fields);
            } catch (error) {
                console.error('Error fetching fields:', error);
            }
        };
        //crops menu
        async function fetchCrops() {
            try {
                const response = await axios.get(`http://188.243.22.63:8080/api/fields/crops?page=0&size=5000&name=`, {
                    headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }});
                crops.value = response.data.map(crop => ({ label: `${crop.name} - id: ${crop.id}`, value: crop.id }));
            } catch (error) {
                console.error('Error fetching crops:', error);
            }
        };
        //get fieldId
        const computedFieldId = computed({
            get: () => cropData.value.fieldId,
            set: (newValue) => {
                cropData.value.fieldId = typeof newValue === 'object' ? newValue.value : newValue;
            }
        });
        //get cropId
        const computedCropId = computed({
            get: () => cropData.value.cropId,
            set: (newValue) => {
                cropData.value.cropId = typeof newValue === 'object' ? newValue.value : newValue;
            }
        });
        //check time
        const isValidDate = (dateStr) => {
          const regex = /^\d{2}-\d{2}-\d{4}$/;
          if (!regex.test(dateStr)) return false;

          const [day, month, year] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
        };

        const isSubmitDisabled = computed(() => {
            return !cropData.value.fieldId || !cropData.value.cropId || !cropData.value.startDate || !cropData.value.endDate || !cropData.value.description;
        })

        const submitData = () => {
            //check jwt
            if (!accessToken) {
                console.error('Нет доступного токена доступа');
                return;
            };

            if (!isValidDate(cropData.value.startDate)) {
                $q.notify({
                color: 'red-5',
                textColor: 'white',
                icon: 'warning',
                message: 'Неверный формат даты. Пожалуйста, используйте дд-мм-гггг.'
                });
                return;
            };

            if (!isValidDate(cropData.value.endDate)) {
                $q.notify({
                color: 'red-5',
                textColor: 'white',
                icon: 'warning',
                message: 'Неверный формат даты. Пожалуйста, используйте дд-мм-гггг.'
                });
                return;
            };

            console.log('Submitting data:', JSON.stringify(cropData.value));
            axios.post(`http://188.243.22.63:8080/api/fields/crop-rotations`, cropData.value, {
                headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
            })
            .then(response => {
                console.log(response);
                $q.notify({
                    color: 'green-5',
                    textColor: 'white',
                    icon: 'check',
                    message: 'Изменение успешно.'
                    });
            })
            .catch(error => {
                console.error(error);
            })
        };

        return {
            computedCropId,
            computedFieldId,
            isSubmitDisabled,
            submitData,
            fetchCrops,
            fetchFields,
            cropData,
            fields,
            crops
        }
    }
}

</script>
