<template>
  <q-banner v-show="flag">Данных нет. Введите данные профиля в настройках</q-banner>
  <div v-if="myrole === 'worker'" class="row">
    <q-list separator padding class="col-12 col-md-5 q-mx-auto">
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ workData.name }}</q-item-label>
          <q-item-label caption>Имя</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ workData.surname }}</q-item-label>
          <q-item-label caption>Фамилия</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label>{{ workData.patronymic }}</q-item-label>
          <q-item-label caption>Отчество</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label>{{ workData.date_of_birth }}</q-item-label>
          <q-item-label caption> Дата рождения </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label>{{ workData.phone_number }}</q-item-label>
          <q-item-label caption>Номер телефона </q-item-label>
        </q-item-section>
      </q-item>
      <q-item></q-item>
    </q-list>
  </div>

  <div v-if="myrole === 'organization'" class="row">
    <q-list separator padding class="col-12 col-md-5 q-mx-auto">
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.name }}</q-item-label>
          <q-item-label caption>Название</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.description }}</q-item-label>
          <q-item-label caption>Описание</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.city }}</q-item-label>
          <q-item-label caption>Город</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.inn }}</q-item-label>
          <q-item-label caption>ИНН</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.phone_number }}</q-item-label>
          <q-item-label caption>Номер телефона</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section class="mytext">
          <q-item-label> {{ orgData.website }}</q-item-label>
          <q-item-label caption>Сайт</q-item-label>
        </q-item-section>
      </q-item>
      <q-item></q-item>

    </q-list>
  </div>
</template>

<script>
import { postToServer } from 'src/axiosRequest';
import { userStore } from 'src/usage';
import { reactive, ref } from 'vue';

export default {
  setup() {
    const myrole = userStore.getState().role;
    const orgData = reactive({ name: '', description: '', city: '', inn: '', phone_number: '', website: '' });
    const workData = reactive({ name: '', surname: '', patronymic: '', date_of_birth: '', phone_number: '' });
    const flag = ref(false);

    postToServer({ url: `http://188.243.22.63:8080/api/profiles/${myrole}s/me`, request: 'get' })
      .then((response) => {
        for (const key in response) {
          const data = myrole === 'worker' ? workData : orgData;
          if (Object.keys(data).find(o => o === key)) {
            data[key] = response[key];
          }
        }
      })
      .catch((error) => {
        if (error === 'Profile not found') {
          flag.value = true;
        } else {
          console.error(error);
          userStore.setError(error);
        }
      })


    return {
      myrole, orgData, workData, flag
    }
  }
}
</script>

<style scoped>
.mytext {
  font-size: 1.3rem;
}
</style>
