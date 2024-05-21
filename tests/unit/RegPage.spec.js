 import { mount } from '@vue/test-utils';
 import RegPage from '@/pages/RegPage.vue';  // Путь к компоненту
 import { postreg } from '@/axiosRequest';  // Путь к вашему запросу
 import { userStore } from '@/usage';  // Путь к вашему стору
 import { createRouter, createWebHistory } from 'vue-router';

// Мокируем зависимости
jest.mock('@/axiosRequest', () => ({
  postreg: jest.fn()
}));

jest.mock('@/usage', () => ({
  userStore: {
    updateAll: jest.fn(),
    setError: jest.fn(),
  }
}));

jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Создаем мок роутер
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: []
});

// Начинаем писать тесты
describe('RegPage.vue', () => {
  it('успешная регистрация перенаправляет пользователя на страницу входа', async () => {
    const wrapper = mount(RegPage, {
      global: {
        plugins: [mockRouter]
      }
    });

    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';
    wrapper.vm.role = 'organization';

    // Обозначим что возвращает наш `postreg` запрос
    postreg.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      role: 'organization',
      created_by: 'admin'
    });

    await wrapper.vm.readyClick();

    expect(postreg).toHaveBeenCalledWith({
      email: 'test@example.com',
      text_password: 'password123',
      role: 'organization'
    });

    expect(userStore.updateAll).toHaveBeenCalledWith({
      id: 1,
      email: 'test@example.com',
      role: 'organization',
      created_by: 'admin'
    });

    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'login' });
  });

  it('показывает ошибку если поля пустые', async () => {
    const wrapper = mount(RegPage, {
      global: {
        plugins: [mockRouter]
      }
    });

    wrapper.vm.email = '';
    wrapper.vm.password = '';

    // Проверяем выброс ошибки
    expect(() => {
      wrapper.vm.readyClick();
    }).toThrow('не все данные введены');
  });

  it('показывает ошибку сервера', async () => {
    const wrapper = mount(RegPage, {
      global: {
        plugins: [mockRouter]
      }
    });

    wrapper.vm.email = 'test@example.com';
    wrapper.vm.password = 'password123';

    postreg.mockRejectedValueOnce(new Error('серверная ошибка'));

    // Имитируем нажатие
    await wrapper.vm.readyClick();

    // Проверяем вызов функции обработки ошибок
    expect(userStore.setError).toHaveBeenCalledWith(new Error('серверная ошибка'));
  });
});
