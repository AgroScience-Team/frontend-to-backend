<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card class="q-ma-sm">
      <q-card-section>
        <q-input filled label="Email" type="email" class="q-ma-md" v-model="workerData.email" clearable></q-input>
        <!-- <div class="row">
            <q-input filled label="Логин" class="q-mx-md col" v-model="userData.login" clearable></q-input> -->
        <q-input filled label="Пароль" type="password" class="q-mx-md col" v-model="workerData.password"
          clearable></q-input>

        <!-- <q-input filled label="Фамилия" class="q-ma-md" v-model="userData.surname" clearable></q-input>
          <q-input filled label="Имя" class="q-ma-md" v-model="userData.name" clearable></q-input>
          <q-input filled label="Отчество" class="q-ma-md" v-model="userData.patronymic" clearable></q-input> -->
        <!-- <q-input filled label="Роль" class="q-ma-md" v-model="workerData.role" clearable></q-input> -->
      </q-card-section>
      <q-card-actions align="right" class="q-ma-md"> <q-btn class="q-mr-lg" flat @click="cancel">Отмена</q-btn><q-btn
          style="background-color: #1b2332;" text-color="white" class="q-ml-lg"
          @click="addUser">Подтвердить</q-btn></q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="editFlag">
    <q-card>
      <div class="q-pa-xl">
        <div class="q-my-sm">Почта: {{ selectRow.email }}</div>
        <div v-if="workData.name">
          <div class="q-my-sm">Имя: {{ workData.name }}</div>
          <div class="q-my-sm">Фамилия: {{ workData.surname }}</div>
          <div class="q-my-sm">Отчество: {{ workData.patronymic }}</div>
          <div class="q-my-sm">Дата рождения: {{ workData.date_of_birth }}</div>
          <div class="q-my-sm">Номер телефона: {{ workData.phone_number }}</div>
        </div>
      </div>
    </q-card>
  </q-dialog>

  <div v-if="selectRow" class="q-my-md">
    Выбранный сотрудник: {{ selectRow.id }} &mdash; {{ selectRow.email }}
  </div>

  <div class="row">
    <q-btn style="background-color: #1b2332;" text-color="white" size="md" class="q-ma-sm col-auto"
      @Click="dialogOpen = true">Добавить</q-btn>
    <!-- <q-btn style="background-color: #1b2332;" text-color="white" size="md" class="q-ma-sm col-auto"
      @Click="editUser">Редактировать</q-btn> -->
    <q-btn style="background-color: #1b2332;" text-color="white" size="md" class="q-ma-sm col-auto"
      @click="deleteUser">Удалить</q-btn>
  </div>
  <div class="q-mx-sm">
    <q-table :rows="rows" :columns="columns" row-key="id" @row-click="rowSelected">
    </q-table>
  </div>
</template>

<script>
import { postToServer } from 'src/axiosRequest';
import { userStore } from 'src/usage';
import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar'

// здесь все, что в миро написано, можно будет просто удалить ненужное / добавить нужное
const columns = [
  { name: 'id', required: true, label: "id", align: 'center', field: 'id', sortable: true, style: "width:50px" },  // serial
  // { name: 'user_id', required: true, label: "user_id", align: 'center', field: 'user_id', sortable: true, style: "width:60px" }, // int
  // { name: 'name', required: true, label: "Имя", align: 'center', field: 'name', sortable: true }, // string
  // { name: 'surname', required: true, label: "Фамилия", align: 'center', field: 'surname', sortable: true }, // string
  // { name: 'patronymic', label: "Отчество", align: 'center', field: 'patronymic', sortable: true }, // string
  { name: 'email', required: true, label: "Email", align: 'center', field: 'email', sortable: true }, // string
  // { name: 'date_of_birth', required: true, label: "Дата", align: 'center', field: 'date_of_birth', sortable: true }, // date
  // { name: 'phone_number', required: true, label: "Номер телефона", align: 'center', field: 'phone_number', sortable: true }, // string
]


export default {
  setup() {
    const rows = ref([]);
    const dialogOpen = ref(false);
    const flag = ref(false);
    const editFlag = ref(false);
    const $q = useQuasar();
    const selectRow = ref(null);

    const workData = reactive({ name: '', surname: '', patronymic: '', date_of_birth: '', phone_number: '' });

    function rowSelected(event, row, idx) {
      console.log(row);
      selectRow.value = row;
      editUser();
    }

    // const userData = reactive({ email: '', login: '', password: '', surname: '', name: '', patronymic: '', role: '' });
    const workerData = reactive({ email: '', password: '' });

    const workers = ref([]);

    function getTable() {
      return new Promise((resolve, reject) => {
        postToServer({ url: `http://smart.agromelio.ru/api/auth/users/workers`, request: 'get' })
          .then((myresponse) => {
            console.log(myresponse);
            resolve(myresponse);
          })
          .catch((error) => {
            reject(error);
          })
      })
    }


    getTable()
      .then((response) => {
        rows.value = [...response];
      })
      .catch((error) => {
        console.error(error);
        userStore.setError(error);
      })
    console.log(workers);

    function addUser() {
      console.log(workerData);
      if (!workerData.email.trim() || !workerData.password.trim()) {
        throw new Error('не все данные введены');
      }
      dialogOpen.value = false;



      postToServer({ url: `http://smart.agromelio.ru/api/auth/users`, data: { email: workerData.email.trim(), text_password: workerData.password.trim(), role: 'worker' }, request: 'post' })
        .then((response) => {
          console.log(response);
          return getTable()
        })
        .then((response) => {
          rows.value = [...response];
        })
        .catch((error) => {
          console.error(error);
          userStore.setError(error);
        })
    }

    function editUser() {
      for (const key in workData) {
        workData[key] = null;
      }
      postToServer({ url: `http://smart.agromelio.ru/api/profiles/workers`, getParams: { params: { user_id: selectRow.value.id } }, request: 'get' })
        .then((response) => {
          console.log(response);
          for (const key in response) {
            if (Object.keys(workData).find(o => o === key)) {
              workData[key] = response[key];
            }
          }
          editFlag.value = true;
        })
        .catch((error) => {
          if (error === 'Profile not found') {
            editFlag.value = true;
          } else {
            console.error(error);
            userStore.setError(error);
          }
        })
    }

    function deleteUser() {
      if (selectRow.value && selectRow.value.id) {
        $q.dialog({
          title: 'Подтвердите',
          message: 'Вы действительно хотите удалить это пользователя?',
          cancel: 'Отмена',
          persistent: true
        })
          .onOk(() => {
            postToServer({ url: `http://smart.agromelio.ru/api//auth/users/workers/${selectRow.value.id}`, request: 'delete' })
              .then((response) => {
                console.log(response);
                selectRow.value = null;
                return getTable()

              })
              .then((response) => {
                rows.value = [...response];
              })
              .catch((error) => {
                console.error(error);
                userStore.setError(error);
              })
          })
          .onCancel(() => {

          })
      } else {
        userStore.setError('Не выбран сотрудник');
      }

    }

    function cancel() {
      dialogOpen.value = false;
    }
    return {
      columns, rows, rowSelected, dialogOpen, addUser, cancel, workerData, editFlag, editUser, workData, deleteUser, selectRow
    }
  },
}
</script>

<style scoped></style>
