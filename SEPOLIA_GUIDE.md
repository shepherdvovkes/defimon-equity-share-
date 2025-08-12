# 🚀 Руководство по использованию DEFIMON Equity Token с Sepolia

## 🌐 Подключение к Sepolia Testnet

### 1. Настройка MetaMask
- Откройте MetaMask
- Переключитесь на Sepolia Testnet
- Chain ID: `11155111`
- RPC URL: `https://sepolia.infura.io/v3/69a45c7511e54941925b96c368f1f9a3`
- Explorer: `https://sepolia.etherscan.io`

### 2. Получение тестовых ETH
- Перейдите на [Sepolia Faucet](https://sepoliafaucet.com/)
- Введите адрес вашего кошелька
- Получите тестовые ETH (обычно 0.1-0.5 ETH)

## 🚀 Запуск проекта

### 1. Проверка подключения к Sepolia
```bash
node scripts/check-sepolia.js
```

### 2. Запуск фронтенда
```bash
cd frontend
npm start
```

### 3. Откройте браузер
- Перейдите на `http://localhost:3000`
- Подключите MetaMask к Sepolia
- Убедитесь, что у вас есть тестовые ETH

## 📝 Деплой контракта

### 1. Через фронтенд (рекомендуется)
- Откройте вкладку "Деплой"
- Нажмите "Deploy Contract"
- Подтвердите транзакцию в MetaMask
- Дождитесь подтверждения

### 2. Проверка деплоя
- Скопируйте адрес контракта
- Проверьте на [Etherscan Sepolia](https://sepolia.etherscan.io)
- Сохраните адрес для дальнейшего использования

## 🔍 Верификация контракта

### 1. Автоматическая верификация
- Используйте вкладку "Security Auditor" во фронтенде
- Введите адрес контракта
- Нажмите "Verify Contract"

### 2. Ручная верификация
```bash
node scripts/verify-sepolia.js
```

## 🧪 Тестирование функционала

### 1. Добавление участников
- Откройте вкладку "Участники"
- Добавьте тестовых участников
- Установите доли владения

### 2. Запуск вестинга
- Нажмите "Start Vesting"
- Подтвердите транзакцию
- Проверьте статус вестинга

### 3. Клейм токенов
- Подключите кошелек участника
- Нажмите "Claim Tokens"
- Проверьте баланс

## 📊 Мониторинг

### 1. Транзакции
- [Etherscan Sepolia](https://sepolia.etherscan.io)
- MetaMask Activity

### 2. Контракт
- Адрес контракта
- События (Events)
- Состояние переменных

## 🛠️ Устранение неполадок

### Проблема: "Insufficient funds"
- Получите тестовые ETH с faucet
- Убедитесь, что MetaMask подключен к Sepolia

### Проблема: "Wrong network"
- Переключитесь на Sepolia в MetaMask
- Chain ID должен быть 11155111

### Проблема: "Transaction failed"
- Проверьте gas limit
- Убедитесь в достаточном балансе ETH
- Проверьте логи транзакции

## 🔗 Полезные ссылки

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io)
- [Infura Sepolia](https://sepolia.infura.io)
- [MetaMask Networks](https://docs.metamask.io/guide/ethereum-provider.html#network-version)

## 📝 Примечания

- Sepolia - это тестнет, все токены и ETH не имеют реальной стоимости
- Контракты в тестнете могут быть удалены при обновлении сети
- Всегда тестируйте функционал в тестнете перед деплоем в mainnet
- Храните адреса контрактов и транзакций для отладки

---

**Удачного тестирования! 🎉**
