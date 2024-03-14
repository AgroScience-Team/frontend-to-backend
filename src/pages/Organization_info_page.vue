<template>
          <div class="q-pa-md">
              <q-table
                  class="my-sticky-colum-table"
                  flat bordered
                  :rows="organizationData"
                  :columns="organizationColumns"
                  raw-key="id"
                  v-model:pagination="pagination"
                  hide-bottom
                  hide-header
              />
          </div>
  </template>

  <script>
  import { onMounted, reactive } from 'vue';
  import axios from 'axios' ;
  import { userStore } from 'src/usage';

  export default {
    name: 'Organization_info_page',
    setup() {
      const organizationData = reactive([]);
      const organizationColumns = reactive([
          { name: 'key',  field: 'key', align: 'center', style: 'width: 500px' },
          { name: 'value', field: 'value', align: 'left' }
      ]);

      onMounted(async () => {
            const accessToken = userStore.state.access_token;

            if (!accessToken) {
                console.log("No access token available");
                return;
            }
        try {
                const response = await axios.get(`http://188.243.22.63:8080/api/profiles/organizations?user_id=1`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = response.data;
                console.log(response.data);
                return data;
            } catch (error) {
                console.error("Error fetching data:", error);
            }

        try {
            if(data) {
              organizationData.push(
                {key: 'ID', value: data.id},
                {key: 'User ID', value: data.user_id},
                {key: 'Name', value: data.name},
                {key: 'Description', value: data.description},
                {key: 'City', value: data.city},
                {key: 'Inn', value: data.inn},
                {key: 'Phone Number', value: data.phone_number},
                {key: 'Website', value: data.website},
              )
            }
          } catch (error) {
            console.error('Wrong Api', error);
          };
      });
    return {
        organizationData,
        organizationColumns,
        pagination: {
          rowsPerPage: 10
        }
      }
    }
  }

  </script>

  <style lang="scss">
  .my-sticky-colum-table {
    max-width: 90%;
    max-width: 85%;
    margin-top: 30px;
    margin-bottom: 50px;
    margin-left: auto;
    margin-right: auto;
    width: 1234px;
    //th already hide
    thead tr:first-child th:first-child {
      background-color: #D9D9D9;
    }
    thead tr:first-child th:nth-child(2) {
      background-color: #EBEBEB;
    }
    td:first-child {
      background-color: #D9D9D9;
    }
    td:nth-child(2) {
      background-color: #EBEBEB;
    }
    th:first-child,
    td:first-child {
      position: sticky;
      left: 0;
      z-index: 1;
    }
    th:nth-child(2),
    td:nth-child(2) {
      position: sticky;
      left: 500px;
      z-index: 1;
    }
  }

  .q-table td {
    font-size: 25px !important;
  }
  </style>
