<template>
    <q-banner class="bg-green-3" v-show="flag">Данные сохранены</q-banner>
    <div v-if="myrole === 'worker'">
        <div class="text-h5 text-center q-my-sm">Профиль сотрудника</div>
        <div class="row justify-center">
            <q-card flat class="col-12 col-md-6">
                <q-card-section>
                    <q-input outlined label="Имя" class="q-my-sm" v-model="workData.name"></q-input>
                    <q-input outlined label="Фамилия" class="q-my-sm" v-model="workData.surname"></q-input>
                    <q-input outlined label="Отчество" class="q-my-sm" v-model="workData.patronymic"></q-input>
                    <q-input outlined label="Дата рождения" mask="####-##-##" class="q-my-sm"
                        v-model="workData.date_of_birth"></q-input>
                    <q-input outlined label="Номер телефона" class="q-my-sm" v-model="workData.phone_number"></q-input>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn class="q-mr-sm col-12 col-md-4 " flat color="negative" @click="deleteUser">Удалить</q-btn>
                    <q-btn class="col-12 col-md-3 q-mr-sm" flat @click="clearData">Очистить</q-btn>
                    <q-btn class="q-mr-sm col-12 col-md-4" color="primary" @click="postData">Сохранить</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>

    <div v-else-if="myrole === 'organization'">
        <div class="text-h5 text-center q-my-sm">Профиль организации</div>
        <div class="row justify-center">
            <q-card flat class="col-12 col-md-6">
                <q-card-section>
                    <q-input outlined label="Название" class="q-my-sm" v-model="orgData.name"></q-input>
                    <q-input outlined label="Описание" class="q-my-sm" v-model="orgData.description"></q-input>
                    <q-input outlined label="Город" class="q-my-sm" v-model="orgData.city"></q-input>
                    <q-input outlined label="ИНН" class="q-my-sm" v-model="orgData.inn"></q-input>
                    <q-input outlined label="Номер телефона" class="q-my-sm" v-model="orgData.phone_number"></q-input>
                    <q-input outlined label="Сайт" class="q-my-sm" v-model="orgData.website"></q-input>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn class="q-mr-sm col-12 col-md-4 " flat color="negative" @click="deleteUser">Удалить</q-btn>
                    <q-btn class="col-12 col-md-3 q-mr-sm" flat @click="clearData">Очистить</q-btn>
                    <q-btn class="q-mr-sm col-12 col-md-4" color="primary" @click="postData">Сохранить</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>
</template>

<script>
import { postToServer } from 'src/axiosRequest';
import { userStore } from 'src/usage';
import { reactive, ref, onBeforeUnmount, onBeforeMount, watch } from 'vue';

export default {
    setup() {
        const myrole = userStore.getState().role;
        const orgData = reactive({ name: '', description: '', city: '', inn: '', phone_number: '', website: '' });
        // console.log({ ...userStore.getState().organizationInfo });
        // const orgData = reactive({ ...userStore.getState().organizationInfo });
        // const workData = reactive(userStore.getState().workerInfo);

        const workData = reactive({ name: '', surname: '', patronymic: '', date_of_birth: '', phone_number: '' });

        const flag = ref(false);
        watch(
            () => userStore.getState().organizationInfo,
            (val) => {
                if (!val) {
                    return
                }
                console.log('val = ', val);
                orgData.name = val.name;
                orgData.description = val.description;
                orgData.city = val.city;
                orgData.inn = val.inn;
                orgData.phone_number = val.phone_number;
                orgData.website = val.website;
            },
            { deep: true, immediate: true }
        )

        watch(
            () => userStore.getState().workerInfo,
            (val) => {
                if (!val) {
                    return
                }
                workData.name = val.name;
                workData.surname = val.surname;
                workData.patronymic = val.patronymic;
                workData.date_of_birth = val.date_of_birth;
                workData.phone_number = val.phone_number;
            },
            { deep: true, immediate: true }
        )

        function clearData() {
            const data = myrole === 'worker' ? workData : orgData;
            for (const key in data) {
                data[key] = '';
            }
        };


        function postData() {
            const data = myrole === 'worker' ? workData : orgData;

            for (const key in data) {
                if (!data[key].trim()) {
                    throw new Error('Не все данные введены');
                }
            }
            const url = `http://188.243.22.63:8080/api/profiles/${myrole}s`;
            const method = userStore.getState().user_id ? 'put' : 'post';
            const endpoint = userStore.getState().user_id ? '/me' : '';



            postToServer({ url: url + endpoint, data, request: method })
                .then((response) => {
                    console.log(response);
                    userStore.updateState('user_id', response.user_id);
                    flag.value = true;
                    if (userStore.getState().user_id) {
                        return postToServer({ url, getParams: { params: { user_id: userStore.getState().user_id } }, request: 'get' })
                    } else {
                        return;
                    }
                })
                .then((response) => {
                    console.log(response);
                    for (const key in response) {
                        const data = myrole === 'worker' ? workData : orgData;
                        if (Object.keys(data).find(o => o === key)) {
                            data[key] = response[key];
                        }
                    }
                })

                .catch((error) => {
                    console.error(error);
                    userStore.setError(error);
                })
        }


        // onBeforeMount(() => {
        //     // console.log('here')
        //     console.log('user_id ', userStore.getState().user_id);
        //     if (userStore.getState().user_id) {
        //         const url = `http://localhost:8080/api/profiles/${myrole}s`;
        //         console.log(url);
        //         postToServer({ url, getParams: { params: { user_id: userStore.getState().user_id } }, request: 'get' })
        //             .then((response) => {
        //                 console.log(response);
        //                 for (const key in response) {
        //                     const data = myrole === 'worker' ? workData : orgData;
        //                     if (Object.keys(data).find(o => o === key)) {
        //                         data[key] = response[key];
        //                     }
        //                 }
        //             })
        //             .catch((error) => {
        //                 console.error(error);
        //                 userStore.setError(error);
        //             });
        //     }
        // });




        function deleteUser() {
            console.log('DELETE');
            if (userStore.getState().user_id) {
                const url = `http://188.243.22.63:8080/api/profiles/${myrole}s/me`;
                postToServer({ url, request: 'delete' })
                    .then((response) => {
                        console.log(response);
                        userStore.clearKey(`${myrole}Info`);
                        userStore.updateState('user_id', null);
                    })
                    .catch((error) => {
                        console.error(error);
                        userStore.setError(error);
                    });
            }
        };


        onBeforeUnmount(() => {
            flag.value = false;
        })

        return {
            myrole,
            orgData,
            workData,
            flag,
            clearData,
            deleteUser,
            postData,
        }

    }
}
</script>
