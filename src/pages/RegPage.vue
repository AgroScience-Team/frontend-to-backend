<template>
    <div style="height:100vh;">
        <div class="upper-bg"> </div>

        <div class="lower-bg"> </div>

        <q-card class="container-card">
            <q-card-section horizontal style="height:100%">
                <q-img class="gt-xs col-3" src="~assets/worker.jpg">
                </q-img>

                <div class="main-card q-mx-md q-my-sm">
                    <div class=" text-h4 text-center register-text">РЕГИСТРАЦИЯ</div>
                    <q-card class="sub-card" flat>
                        <q-card-section class="col-12 ">
                            <div class="">ТОЛЬКО ДЛЯ ОРГАНИЗАЦИЙ</div>
                            <q-card-section class="q-px-none">
                                <q-input filled label="Email" type="email" class="q-my-sm" v-model="email"></q-input>
                                <q-input filled label="Пароль" type="password" class="q-my-sm" v-model="password"
                                    @keyup.enter="readyClick"></q-input>
                                <!-- <q-input filled label="Роль" type="text" class="q-my-sm" v-model="role" -->
                                <!-- @keyup.enter="readyClick"></q-input> -->
                            </q-card-section>
                        </q-card-section>
                        <q-card-actions>
                            <q-btn @click="readyClick" class="ok-button full-width">готово</q-btn>
                        </q-card-actions>
                    </q-card>
                </div>
            </q-card-section>
        </q-card>

    </div>
</template>

<script>
import { ref } from 'vue';
import { postreg } from '../axiosRequest'
import { userStore } from '../usage'
import { useRouter } from "vue-router";

export default {
    setup() {
        const email = ref('');
        const password = ref('');
        const role = ref('');
        const router = useRouter();

        function readyClick() {
            console.log(email);
            console.log(password);
            console.log(role);
            if (!email.value.trim() || !password.value.trim()) {
                throw new Error('не все данные введены');
            }
            postreg({ email: email.value, text_password: password.value, role: 'organization' })
                .then((myresponse) => {
                    const { id, email, role, created_by } = myresponse;
                    userStore.updateAll({ id, email, role, created_by });
                    router.push({ name: 'login' });
                })
                .catch((myerror) => {
                    console.error(myerror);
                    userStore.setError(myerror);
                })
        }
        return {
            email, password, role,
            readyClick
        }

    },


}
</script>

<style scoped>
.container-card {
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0px;
    background: none;
    width: 100vw;
}

.main-card {
    height: 100%;
    width: 80%;
    margin: 0 auto;
}

.sub-card {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    height: 40%;
}

.upper-bg {
    background-color: rgba(192, 240, 192, 0.300);
    display: block;
    width: 100%;
    height: 100%;
}

.lower-bg {
    background-color: rgba(125, 186, 125, 0.600);
    width: 100%;
    height: 0%;
}

.register-text {
    height: 200px;
    line-height: 200px;
}

.ok-button {
    background-color: rgb(192, 240, 192);

}



@media (min-width: 600px) {
    .container-card {
        height: 70vh;
        top: 15vh;
        left: 5vw;
        width: 90vw;
        background-color: white;
    }

    .sub-card {
        height: calc(100% - 100px);
    }

    .upper-bg {
        height: 60%;
    }

    .lower-bg {
        height: 40%
    }

    .register-text {
        height: 100px;
        line-height: 100px;
    }
}

@media (min-width: 1024px) {
    .container-card {
        height: 70vh;
        width: 65vw;
        top: 15vh;
        left: 15.5vw;
    }
}

@media (min-width: 1300px) {
    .container-card {
        width: 60vw;
        left: 20vw;
    }

    .ok-button {
        font-size: 16px;
    }
}

@media (min-width: 1500px) {
    .container-card {
        width: 50vw;
        left: 25vw;
    }
}

@media (max-height: 400px) {
    .container-card {
        height: 100vh;
        top: 0;
        left: 0;
        width: 100vw;
    }


}
</style>