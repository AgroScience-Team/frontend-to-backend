<template>
    <div>
      <q-btn label="Загрузить Файл" @click="uploadFile"></q-btn>
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none"/>

      <div v-show="formData">
        <q-input v-model="formData.name" label="Имя поля"></q-input>
        <q-input v-model="formData.description" label="Описание"></q-input>
        <q-input v-model="formData.activityStart" label="Начало активности (DD-MM-YYYY)" hint="Format: DD-MM-YYYY" mask="##-##-####"></q-input>
        <q-input v-model="formData.activityEnd" label="Окончание активности (DD-MM-YYYY)" hint="Format: DD-MM-YYYY" mask="##-##-####"></q-input>
        <q-input v-model="coordinatesJSON" label="Координаты"></q-input>
        <q-card flat bordered class="q-ma-md">
        <q-card-section>
          <div class="text-h6">Площадь в квадрате</div>
          <div class="text-subtitle2">{{ calculateArea ? calculateArea.toFixed(2) + ' square meters' : 'No Coordinates' }}</div>
        </q-card-section>
        </q-card>

        <q-btn label="Передавать" @click="submitData" :disabled="isSubmitDisabled"></q-btn>
        <q-btn label="Удалить" @click="deleteData"></q-btn>
      </div>
    </div>
  </template>

  <script>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import * as turf from '@turf/turf';
  import { useQuasar } from 'quasar';
  import { useRouter, useRoute } from 'vue-router';
  import { userStore } from 'src/usage';

  export default {
    name: 'AddFieldPage',
    setup() {
      const router = useRouter();
      const route = useRoute();
      const fileInput = ref(null);
      const formData = ref({
        name: '',
        description: '',
        activityStart: '',
        activityEnd: '',
        geom: {
          type: '',
          coordinates: []
        },
        color: "000000"
      });

      const $q = useQuasar();

      const fieldId = route.query.id;

      const uploadFile = () => {
        fileInput.value.click();
      };
      //read KML file
      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
            const text = e.target.result;
            parseKML(text, file);
        };
        reader.readAsText(file);
      }
      };

      const parseKML = (text, file) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        //read different key words
        const nameTags = xmlDoc.getElementsByTagName("name");
        if (nameTags.length > 0) {
            formData.value = formData.value || {};
            formData.value.name = nameTags[0].textContent;
        };

        const descriptionTags = xmlDoc.getElementsByTagName('description');
        if (descriptionTags.length > 0 ) {
            formData.value = formData.value || {};
            formData.value.description = descriptionTags[0].textContent;
        };

        const coordinatesTags = xmlDoc.getElementsByTagName("coordinates");
        if (coordinatesTags.length > 0) {
            const coordinatesRaw = coordinatesTags[0].textContent.trim();
            const coordinates = coordinatesRaw.split(/\s+/).map(coordStr => {
            const [longitude, latitude] = coordStr.split(',').map(Number);
            return { longitude, latitude };
            });

            formData.value = formData.value || {};
            formData.value.geom = {
            type: "Polygon",
            coordinates: coordinates
            };
        };
    }
      //turn geo into json
      const coordinatesJSON = computed({
        get() {
            return JSON.stringify(formData.value.geom.coordinates, null, 2);
        },
        set(value) {
            try {
            formData.value.geom.coordinates = JSON.parse(value);
            } catch (e) {
              $q.notify({
              type: 'negative',
              message: 'Invalid JSON format'
            })}
        }
    });
    //calculate squared area
      const calculateArea = computed(() => {
        if (!formData.value || !formData.value.geom || !formData.value.geom.coordinates || formData.value.geom.coordinates.length < 3) {
          return 0;
        }

        const coordinates = formData.value.geom.coordinates.map(coord => [coord.longitude, coord.latitude]);
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon);
        console.log(area);

        return area;
      });

      const isValidDate = (dateStr) => {
          const regex = /^\d{2}-\d{2}-\d{4}$/;
          if (!regex.test(dateStr)) return false;

          const [day, month, year] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
        };

      const isSubmitDisabled = computed(() => {
          return !formData.value.name || !formData.value.description || !formData.value.activityStart || !formData.value.activityEnd || formData.value.geom.coordinates.length === 0;
        });


      const accessToken = userStore.state.access_token;

      //get data
      const fetchFieldData = () => {

        if (!fieldId) return;

        axios.get(`${process.env.QUASAR_APP_API_URL}/api/fields?fieldId=${fieldId}`, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(response.data)
            const data = response.data;
            formData.value = {
            name: data.name,
            description: data.description,
            activityStart: data.activityStart,
            activityEnd: data.activityEnd,
            geom: {
                type: data.geom.type,
                coordinates: data.geom.coordinates
            },
            color: data.color
            };
            console.log(formData)
        })
        .catch(error => {
            console.error('Error fetching field data', error);
        });
        };

      onMounted(() => {
        fetchFieldData();
    });


      const submitData = () => {
        //check data
        if (!accessToken) {
            console.error('No access token available');
            return;
            }
            if (isSubmitDisabled.value) {
            $q.notify({
                type: 'negative',
                message: 'Пожалуйста, заполните все поля'
            })
            return;
            };
            if (!isValidDate(formData.value.activityStart)) {
            $q.notify({
                type: 'negative',
                message: 'Неверный формат даты начала активности.'
            })
                return;
            };
            if (!isValidDate(formData.value.activityEnd)) {
            $q.notify({
                type: 'negative',
                message: 'Неверный формат даты окончания действия.'
            })
                return;
            };

        formData.value.squareArea = calculateArea.value;

        console.log('success');
        console.log(formData);

            axios.put(`http://188.243.22.63:8080/api/fields?fieldId=${fieldId}`, formData.value, {
                headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
                }
            })
            .then(response => {
                      $q.notify({
                      type: 'positive',
                      message: 'Данные успешно отправлены'
                    })
                    const fieldId = response.data.id;
                    console.log(response.data);
                    router.push({ path: '/field_information', query: { fieldId: fieldId} });
                    })
                    .catch(error => {
                    console.error('Error submitting data', error);
                    });
      };

      const deleteData = () => {
        axios.delete(`http://188.243.22.63:8080/api/fields?fieldId=${fieldId}`, {
                headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
                }
            })
            .then(response => {
                $q.notify({
                type: 'positive',
                message: 'Удалить успешно'
                })
                console.log(response);
                router.push('/map');
            })
      };


      return {
        fileInput,
        formData,
        uploadFile,
        handleFileUpload,
        parseKML,
        coordinatesJSON,
        calculateArea,
        submitData,
        isSubmitDisabled,
        deleteData
      };
    },
  };
  </script>

  <style>

  </style>
