#!/bin/bash

echo "🔍 Проверка статуса проекта DEFIMON Equity Token"
echo "=================================================="

# Проверка процессов
echo -e "\n📱 Проверка запущенных процессов:"
FRONTEND_PROCESSES=$(ps aux | grep "npm start" | grep -v grep | wc -l)
HARDHAT_PROCESSES=$(ps aux | grep "hardhat node" | grep -v grep | wc -l)

if [ $FRONTEND_PROCESSES -gt 0 ]; then
    echo "✅ Фронтенд запущен ($FRONTEND_PROCESSES процессов)"
else
    echo "❌ Фронтенд не запущен"
fi

if [ $HARDHAT_PROCESSES -gt 0 ]; then
    echo "✅ Hardhat node запущен ($HARDHAT_PROCESSES процессов)"
else
    echo "❌ Hardhat node не запущен"
fi

# Проверка портов
echo -e "\n🌐 Проверка доступности сервисов:"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Фронтенд доступен на http://localhost:3000"
else
    echo "❌ Фронтенд недоступен на порту 3000"
fi

if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 > /dev/null 2>&1; then
    echo "✅ Hardhat node доступен на http://localhost:8545"
else
    echo "❌ Hardhat node недоступен на порту 8545"
fi

# Проверка файлов
echo -e "\n📁 Проверка ключевых файлов:"

if [ -f "contracts/DEFIMONEquityToken.sol" ]; then
    echo "✅ Смарт-контракт найден"
else
    echo "❌ Смарт-контракт не найден"
fi

if [ -f "frontend/src/App.js" ]; then
    echo "✅ React приложение найдено"
else
    echo "❌ React приложение не найдено"
fi

if [ -f "hardhat.config.js" ]; then
    echo "✅ Hardhat конфигурация найдена"
else
    echo "❌ Hardhat конфигурация не найдена"
fi

# Проверка зависимостей
echo -e "\n📦 Проверка зависимостей:"

if [ -d "node_modules" ]; then
    echo "✅ Основные зависимости установлены"
else
    echo "❌ Основные зависимости не установлены"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Фронтенд зависимости установлены"
else
    echo "❌ Фронтенд зависимости не установлены"
fi

# Проверка компиляции
echo -e "\n🔨 Проверка компиляции:"

if [ -d "artifacts" ]; then
    echo "✅ Контракты скомпилированы"
else
    echo "❌ Контракты не скомпилированы"
fi

# Итоговый статус
echo -e "\n🎯 Итоговый статус:"

if [ $FRONTEND_PROCESSES -gt 0 ] && [ $HARDHAT_PROCESSES -gt 0 ]; then
    echo "🚀 ПРОЕКТ ПОЛНОСТЬЮ ЗАПУЩЕН И ГОТОВ К РАБОТЕ!"
    echo "📱 Откройте http://localhost:3000 в браузере"
    echo "🔗 Hardhat node работает на http://localhost:8545"
else
    echo "⚠️  Некоторые компоненты не запущены"
    echo "💡 Запустите: npx hardhat node (в одном терминале)"
    echo "💡 Запустите: cd frontend && npm start (в другом терминале)"
fi

echo -e "\n=================================================="
echo "🔍 Проверка завершена!"
