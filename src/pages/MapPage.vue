<template>
  <div class="map-container">
    <div id="map"></div>
    <q-btn
      fab
      color="positive"
      icon="add"
      class="add-field-button"
      @click="goToAddPage"
    />  
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.js";
import { useRouter } from 'vue-router';
import axios from 'axios';
import { userStore } from "src/usage";

export default {
  name: "MapComponent",
  setup() {
    const map = ref(null);

    const router = useRouter();
 
    const accessToken = userStore.state.access_token;

    //button for check field info
    const handlePopupClick = (fieldId) => {
      router.push(`/field_information?fieldId=${fieldId}`)
    }

    //Get data
    const fetchDataAndDrawPolygons = async () => {
      try {
        const response = await axios.get(`${process.env.QUASAR_APP_API_URL}/api/fields/organization/preview`, {
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
              }
            });
        const fields = response.data;
      //turn geom type to readable
        fields.forEach(field => {
          if (field.geom && field.geom.coordinates) {
            const coordinates = field.geom.coordinates.map(coord => [coord.latitude, coord.longitude]);
            const polygon = L.polygon(coordinates, { color: field.color || 'blue' }).addTo(map.value);
            const popupContent = `<strong>${field.name}</strong><br>${field.description}<br><button id="popup-button-${field.id}">View Details</button>`;

            //add button for field info
            polygon.bindPopup(popupContent).on('popupopen', (e) => {
            const popupButton = document.getElementById(`popup-button-${field.id}`);
            popupButton.addEventListener('click', () => handlePopupClick(field.id));
          });
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    onMounted(() => {
      // Создание карты
      map.value = L.map("map").setView([59.420161, 30.01832], 15);

      // Добавление тайлового слоя
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; OpenStreetMap contributors",
      }).addTo(map.value);

    });


    fetchDataAndDrawPolygons();
    //turn to add field page
    const goToAddPage = () => {
        router.push('/add_field');
    };

    return { map, goToAddPage };
  },
};
</script>

<style>
.map-container {
  position: relative;
  height: 100vh;
  width: 100%;
}

#map {
  height: 100vh !important;
  width: 100% !important;
}

.add-field-button{
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 1000;
}

.leaflet-top.leaflet-left {
  top: 120px;
}
</style>
