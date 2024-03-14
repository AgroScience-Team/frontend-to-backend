<template>
    <div>
      <div class="row q-gutter-sm">
      <q-btn label="Загрузить Файл" @click="uploadFile"></q-btn>
      <q-btn label="Добавить ингредиенты" @click="goToSoilPage"></q-btn>
      </div>
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
          <div class="text-subtitle2">{{ calculateArea ? calculateArea.toFixed(2) + ' square meters' : 'Нет координат' }}</div>
        </q-card-section>
        </q-card>

        <q-btn label="Передавать" @click="submitData" :disabled="isSubmitDisabled"></q-btn>
      </div>
    </div>
  </template>

  <script>
  import { ref, computed} from 'vue';
  import axios from 'axios';
  import * as turf from '@turf/turf';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import { userStore } from 'src/usage';

  export default {
    name: 'AddFieldPage',
    setup() {
      const router = useRouter();
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
        color: "000000",
        squareArea: ''
      });

      const $q = useQuasar();

      const goToSoilPage = () => {
        router.push('/add_soil');
      }

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
              message: 'Неверный формат JSON'
            })}
        }
    });
    //calculate squared area
      const calculateArea = computed(() => {
        console.log(formData.value.geom.coordinates)
        if (!formData.value || !formData.value.geom || !formData.value.geom.coordinates || formData.value.geom.coordinates.length < 3) {
          return 0;
        }

        const coordinates = formData.value.geom.coordinates.map(coord => [coord.longitude, coord.latitude]);
        const polygon = turf.polygon([coordinates]);
        const area = turf.area(polygon);
        console.log(area);

        return area;
      });
      //turn time into dd-mm-yyyy
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
      //click submit function
      const submitData = () => {
        //check if everydata is exsist
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
        console.log('Submitting data:', JSON.stringify(formData)); //check data
        axios.post(`http://188.243.22.63:8080/api/fields`, formData.value, {
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

              router.push({ path: '/field_information', query: { fieldId: fieldId} });
            })
            .catch(error => {
              console.error('Error submitting data', error);
            });
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
        goToSoilPage
      };
    },
  };
  </script>

  <style>

  </style>
