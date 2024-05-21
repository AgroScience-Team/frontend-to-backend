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
import { useQuasar } from 'quasar';
import { userStore } from "src/usage";

export default {
  name: "MapComponent",
  setup() {
    const map = ref(null);
    const router = useRouter();
    const $q = useQuasar();
    const accessToken = userStore.state.access_token;

    // Переход на страницу информации о поле
    const handlePopupClick = (fieldId) => {
      router.push(`/field_information?fieldId=${fieldId}`);
    };

    // Получение данных и рисование полигонов
    const fetchDataAndDrawPolygons = async () => {
      try {
        if (!accessToken) {
          console.error("No access token available");
          $q.notify({
            type: "negative",
            message: "Залогиньтесь, пожалуйста",
          });
          return;
        }

        const response = await axios.get("http://smart.agromelio.ru/api/fields/organization/preview", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const fields = response.data;

        // Преобразование типов геометрии в читаемые и добавление метеданных
        for (const field of fields) {
          if (field.geom && field.geom.coordinates) {
            const coordinates = field.geom.coordinates.map((coord) => [
              coord.latitude,
              coord.longitude,
            ]);
            const polygon = L.polygon(coordinates, { color: `#${field.color}` }).addTo(map.value);
            const cropName = field.crop?.name || "";
            const popupContent = `
              <div class="popup-content">
              <strong class="field-name">${field.name}</strong><br>
              <strong class="crop-name">${cropName}</strong><br>
              <p class="field-description">${field.description}</p>
              <button id="popup-button-${field.id}" class="details-button">Посмотреть подробнее информацию</button>
              <div id="meteo-data-${field.id}" class="meteo-data">Загрузка...</div>
              </div>
            `;

            // Добавление кнопки для информации о поле
            polygon.bindPopup(popupContent).on("popupopen", async (e) => {
              const popupButton = document.getElementById(`popup-button-${field.id}`);
              popupButton.addEventListener("click", () => handlePopupClick(field.id));

              // Получение метеоданных
              try {
                const meteoResponse = await axios.get(`http://smart.agromelio.ru/api/meteo/preview/${field.id}`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                });
                const meteoData = meteoResponse.data;
                document.getElementById(`meteo-data-${field.id}`).innerHTML = `
                <div class="meteo-item"><i class="meteo-icon fas fa-thermometer-half"></i>Температура: ${meteoData.temperature} °C</div>
                <div class="meteo-item"><i class="meteo-icon fas fa-tint"></i>Влажность: ${meteoData.humidity} %</div>
                <div class="meteo-item"><i class="meteo-icon fas fa-wind"></i>Скорость ветра: ${meteoData.wind_speed} м/с</div>
                `;
              } catch (error) {
                console.error("Error fetching meteo data:", error);
                document.getElementById(`meteo-data-${field.id}`).innerHTML = " Нет метеоданных.";
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    onMounted(() => {
      // Создание карты
      map.value = L.map("map").setView([59.420161, 30.01832], 15);

      // Добавление тайлового слоя
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; OpenStreetMap contributors",
      }).addTo(map.value);

      // Получение данных и рисование полигонов
      fetchDataAndDrawPolygons();
    });

    // Переход к странице добавления поля
    const goToAddPage = () => {
      router.push("/add_field");
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

.add-field-button {
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 1000;
}

.leaflet-top.leaflet-left {
  top: 120px;
}

.popup-content {
  font-family: Arial, sans-serif;
  max-width: 300px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.popup-content .field-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 5px;
}

.popup-content .crop-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.popup-content .field-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

.popup-content .details-button {
  display: inline-block;
  padding: 8px 12px;
  margin-bottom: 10px;
  background-color: #007bff;
  color: #ffffff;
  text-align: center;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
}

.popup-content .details-button:hover {
  background-color: #0056b3;
}

.popup-content .meteo-data {
  margin-top: 10px;
}

.meteo-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.meteo-icon {
  margin-right: 5px;
  color: #007bff;
}
</style>
