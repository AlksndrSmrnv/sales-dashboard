// Глобальные переменные
let salesData = [];
let regionMapping = {};
let chart;

// База данных соответствия городов и регионов
const cityToRegion = {
    'Москва': 'Центральный',
    'Санкт-Петербург': 'Северо-Западный',
    'Новосибирск': 'Сибирский',
    'Екатеринбург': 'Уральский',
    'Казань': 'Приволжский',
    'Нижний Новгород': 'Приволжский',
    'Челябинск': 'Уральский',
    'Самара': 'Приволжский',
    'Омск': 'Сибирский',
    'Ростов-на-Дону': 'Южный',
    'Уфа': 'Приволжский',
    'Красноярск': 'Сибирский',
    'Воронеж': 'Центральный',
    'Пермь': 'Приволжский',
    'Волгоград': 'Южный',
    'Краснодар': 'Южный',
    'Саратов': 'Приволжский',
    'Тюмень': 'Уральский',
    'Тольятти': 'Приволжский',
    'Ижевск': 'Приволжский',
    'Барнаул': 'Сибирский',
    'Ульяновск': 'Приволжский',
    'Иркутск': 'Сибирский',
    'Хабаровск': 'Дальневосточный',
    'Ярославль': 'Центральный',
    'Владивосток': 'Дальневосточный',
    'Махачкала': 'Северо-Кавказский',
    'Томск': 'Сибирский',
    'Оренбург': 'Приволжский',
    'Кемерово': 'Сибирский',
    'Новокузнецк': 'Сибирский',
    'Рязань': 'Центральный',
    'Астрахань': 'Южный',
    'Пенза': 'Приволжский',
    'Липецк': 'Центральный',
    'Тула': 'Центральный',
    'Киров': 'Приволжский',
    'Чебоксары': 'Приволжский',
    'Калининград': 'Северо-Западный',
    'Брянск': 'Центральный',
    'Курск': 'Центральный',
    'Иваново': 'Центральный',
    'Магнитогорск': 'Уральский',
    'Тверь': 'Центральный',
    'Ставрополь': 'Северо-Кавказский',
    'Нижний Тагил': 'Уральский',
    'Белгород': 'Центральный',
    'Архангельск': 'Северо-Западный',
    'Владимир': 'Центральный',
    'Сочи': 'Южный',
    'Курган': 'Уральский',
    'Орёл': 'Центральный',
    'Смоленск': 'Центральный',
    'Череповец': 'Северо-Западный',
    'Волжский': 'Южный',
    'Мурманск': 'Северо-Западный',
    'Якутск': 'Дальневосточный',
    'Чита': 'Дальневосточный'
};

// Инициализация приложения
function initializeApp() {
    console.log('Инициализация приложения...');

    // Проверяем доступность всех необходимых элементов
    const fileInput = document.getElementById('excelFile');
    const productFilter = document.getElementById('productFilter');
    const regionFilter = document.getElementById('regionFilter');

    if (!fileInput || !productFilter || !regionFilter) {
        console.error('Не найдены необходимые элементы DOM');
        return;
    }

    fileInput.addEventListener('change', handleFileUpload);
    productFilter.addEventListener('change', applyFilters);
    regionFilter.addEventListener('change', applyFilters);

    console.log('Приложение инициализировано успешно');
}

// Запускаем инициализацию когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Обработка загрузки файла
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Загружается файл:', file.name, 'Размер:', file.size, 'Тип:', file.type);

    if (typeof showStatus === 'function') {
        showStatus('Обработка файла...', 'info');
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('XLSX библиотека не загружена. Проверьте подключение к интернету.');
            }

            const data = new Uint8Array(e.target.result);
            console.log('Файл прочитан, размер данных:', data.length);

            const workbook = XLSX.read(data, {
                type: 'array',
                cellText: false,
                cellDates: true
            });

            console.log('Excel файл обработан, листы:', workbook.SheetNames);

            // Читаем первый лист
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Конвертируем в JSON с заголовками в первой строке
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: '',
                blankrows: false
            });

            console.log('Данные конвертированы, строк:', jsonData.length);

            if (typeof showStatus === 'function') {
                showStatus('Файл успешно обработан', 'success');
            }

            processSalesData(jsonData);
        } catch (error) {
            console.error('Ошибка при чтении файла:', error);
            const errorMessage = 'Ошибка при чтении файла: ' + error.message +
                '\n\nВозможные причины:\n' +
                '• Поврежденный файл Excel\n' +
                '• Неподдерживаемый формат\n' +
                '• Отсутствие подключения к интернету\n\n' +
                'Попробуйте:\n' +
                '• Сохранить файл в формате .xlsx\n' +
                '• Использовать автономную версию index_offline.html';

            if (typeof showStatus === 'function') {
                showStatus(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
        }
    };

    reader.onerror = function() {
        const errorMessage = 'Ошибка чтения файла. Убедитесь, что файл не поврежден.';
        if (typeof showStatus === 'function') {
            showStatus(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    };

    reader.readAsArrayBuffer(file);
}

// Обработка данных продаж
function processSalesData(data) {
    console.log('Начинаем обработку данных, строк:', data.length);

    if (data.length < 2) {
        const errorMessage = 'Файл должен содержать заголовки и данные (минимум 2 строки)';
        if (typeof showStatus === 'function') {
            showStatus(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        return;
    }

    const headers = data[0];
    console.log('Заголовки:', headers);
    salesData = [];

    // Находим индексы нужных колонок
    const cityIndex = findColumnIndex(headers, ['город', 'city', 'City', 'ГОРОД', 'город доставки']);
    const productIndex = findColumnIndex(headers, ['товар', 'product', 'наименование', 'Product', 'ТОВАР', 'название']);
    const quantityIndex = findColumnIndex(headers, ['количество', 'quantity', 'кол-во', 'Quantity', 'КОЛИЧЕСТВО', 'qty', 'доставлено шт', 'заказано шт']);
    const amountIndex = findColumnIndex(headers, ['сумма', 'amount', 'стоимость', 'Amount', 'СУММА', 'price', 'цена', 'общая сумма', 'итого', 'доставлено руб', 'заказано руб']);

    console.log('Найденные индексы:', { cityIndex, productIndex, quantityIndex, amountIndex });
    console.log('Заголовки по индексам:', {
        city: headers[cityIndex],
        product: headers[productIndex],
        quantity: headers[quantityIndex],
        amount: headers[amountIndex]
    });

    if (cityIndex === -1 || productIndex === -1) {
        const errorMessage = `Не найдены обязательные колонки: город и товар

Доступные заголовки: ${headers.join(', ')}

Ожидаемые названия колонок:
• Город: "город", "city", "City", "ГОРОД"
• Товар: "товар", "product", "наименование", "Product", "ТОВАР"`;

        if (typeof showStatus === 'function') {
            showStatus(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        return;
    }

    let processedRows = 0;
    let skippedRows = 0;

    // Обрабатываем данные
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) {
            skippedRows++;
            continue;
        }

        const city = String(row[cityIndex] || '').trim();
        const product = String(row[productIndex] || '').trim();

        // Более надежная обработка числовых значений
        let quantity = 1;
        let amount = 0;

        if (quantityIndex !== -1) {
            const qtyValue = row[quantityIndex];
            // Удаляем пробелы и заменяем запятые на точки
            const cleanQty = String(qtyValue || '').replace(/\s/g, '').replace(',', '.');
            quantity = parseFloat(cleanQty) || 1;
        }

        if (amountIndex !== -1) {
            const amtValue = row[amountIndex];
            // Удаляем пробелы, валютные символы и заменяем запятые на точки
            const cleanAmt = String(amtValue || '').replace(/[\s₽$€]/g, '').replace(',', '.');
            amount = parseFloat(cleanAmt) || 0;
        }

        if (city && product) {
            const region = getRegionByCity(city);
            salesData.push({
                city,
                region,
                product,
                quantity,
                amount
            });
            processedRows++;

            // Логируем первые несколько записей для отладки
            if (processedRows <= 3) {
                console.log(`Строка ${i + 1}:`, {
                    city,
                    product,
                    quantityRaw: quantityIndex !== -1 ? row[quantityIndex] : 'N/A',
                    quantity,
                    amountRaw: amountIndex !== -1 ? row[amountIndex] : 'N/A',
                    amount
                });
            }
        } else {
            console.log(`Пропущена строка ${i + 1}: город="${city}", товар="${product}"`);
            skippedRows++;
        }
    }

    console.log(`Обработано: ${processedRows} строк, пропущено: ${skippedRows} строк`);

    // Проверяем, есть ли валидные суммы
    const totalAmount = salesData.reduce((sum, item) => sum + item.amount, 0);
    if (totalAmount === 0 && amountIndex === -1) {
        console.warn('⚠️ Колонка с суммами не найдена. Все суммы будут равны 0.');
        if (typeof showStatus === 'function') {
            showStatus('Внимание: колонка с суммами не найдена. Ожидаемые названия: "сумма", "amount", "стоимость", "price", "цена"', 'warning');
        }
    } else if (totalAmount === 0 && amountIndex !== -1) {
        console.warn('⚠️ Все значения в колонке сумм равны 0 или нечисловые.');
        if (typeof showStatus === 'function') {
            showStatus('Внимание: все значения в колонке сумм равны 0 или содержат нечисловые данные', 'warning');
        }
    }

    if (salesData.length === 0) {
        const errorMessage = 'Не найдено валидных данных для обработки. Убедитесь, что файл содержит данные о городах и товарах.';
        if (typeof showStatus === 'function') {
            showStatus(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        return;
    }

    // Показываем статистику обработки
    const statusMessage = `Успешно обработано ${processedRows} записей из ${data.length - 1}`;
    if (typeof showStatus === 'function') {
        showStatus(statusMessage, 'success');
    }

    // Показываем интерфейс и обновляем данные
    document.getElementById('filtersSection').style.display = 'block';
    document.getElementById('contentSection').style.display = 'block';

    updateFilters();
    updateVisualization();
}

// Поиск индекса колонки по возможным названиям
function findColumnIndex(headers, possibleNames) {
    for (let i = 0; i < headers.length; i++) {
        const header = String(headers[i] || '').toLowerCase();
        for (const name of possibleNames) {
            if (header.includes(name.toLowerCase())) {
                return i;
            }
        }
    }
    return -1;
}

// Получение региона по городу
function getRegionByCity(city) {
    const normalizedCity = city.trim();

    // Прямое соответствие
    if (cityToRegion[normalizedCity]) {
        return cityToRegion[normalizedCity];
    }

    // Поиск по частичному совпадению
    for (const [knownCity, region] of Object.entries(cityToRegion)) {
        if (normalizedCity.includes(knownCity) || knownCity.includes(normalizedCity)) {
            return region;
        }
    }

    return 'Другие регионы';
}

// Обновление фильтров
function updateFilters() {
    const productFilter = document.getElementById('productFilter');
    const regionFilter = document.getElementById('regionFilter');

    // Получаем уникальные товары и регионы
    const products = [...new Set(salesData.map(item => item.product))].sort();
    const regions = [...new Set(salesData.map(item => item.region))].sort();

    // Очищаем и заполняем фильтр товаров
    productFilter.innerHTML = '<option value="">Все товары</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productFilter.appendChild(option);
    });

    // Очищаем и заполняем фильтр регионов
    regionFilter.innerHTML = '<option value="">Все регионы</option>';
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });
}

// Применение фильтров
function applyFilters() {
    updateVisualization();
    updateDetails();
}

// Получение отфильтрованных данных
function getFilteredData() {
    const productFilter = document.getElementById('productFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;

    return salesData.filter(item => {
        return (!productFilter || item.product === productFilter) &&
               (!regionFilter || item.region === regionFilter);
    });
}

// Обновление визуализации
function updateVisualization() {
    const filteredData = getFilteredData();

    // Агрегация данных по регионам
    const regionStats = {};
    filteredData.forEach(item => {
        if (!regionStats[item.region]) {
            regionStats[item.region] = {
                orders: 0,
                amount: 0
            };
        }
        regionStats[item.region].orders += item.quantity;
        regionStats[item.region].amount += item.amount;
    });

    updateChart(regionStats);
    updateTable(regionStats);
}

// Обновление круговой диаграммы
function updateChart(regionStats) {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js не доступен');
        document.getElementById('regionChart').parentElement.innerHTML =
            '<p class="text-danger">Ошибка загрузки Chart.js</p>';
        return;
    }

    const ctx = document.getElementById('regionChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    const labels = Object.keys(regionStats);
    const data = Object.values(regionStats).map(stat => stat.orders);
    const colors = generateColors(labels.length);

    try {
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} заказов (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Ошибка создания диаграммы:', error);
        document.getElementById('regionChart').parentElement.innerHTML =
            '<p class="text-danger">Ошибка создания диаграммы: ' + error.message + '</p>';
    }
}

// Обновление таблицы
function updateTable(regionStats) {
    const tbody = document.getElementById('regionTableBody');
    tbody.innerHTML = '';

    // Сортируем регионы по количеству заказов
    const sortedRegions = Object.entries(regionStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    sortedRegions.forEach(([region, stats]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${region}</td>
            <td>${stats.orders}</td>
            <td>${formatCurrency(stats.amount)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Обновление детальной информации
function updateDetails() {
    const productFilter = document.getElementById('productFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    const detailsContent = document.getElementById('detailsContent');

    if (!productFilter && !regionFilter) {
        detailsContent.innerHTML = '<p class="text-muted">Выберите товар или регион для просмотра детальной информации</p>';
        return;
    }

    const filteredData = getFilteredData();

    if (productFilter) {
        showProductDetails(productFilter, filteredData, detailsContent);
    } else if (regionFilter) {
        showRegionDetails(regionFilter, filteredData, detailsContent);
    }
}

// Показать детали по товару
function showProductDetails(product, data, container) {
    const productData = data.filter(item => item.product === product);
    const regionStats = {};

    productData.forEach(item => {
        if (!regionStats[item.region]) {
            regionStats[item.region] = { orders: 0, amount: 0 };
        }
        regionStats[item.region].orders += item.quantity;
        regionStats[item.region].amount += item.amount;
    });

    const sortedRegions = Object.entries(regionStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    let html = `<h6>Продажи товара "${product}" по регионам:</h6>`;
    html += '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th>Регион</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>';

    sortedRegions.forEach(([region, stats]) => {
        html += `<tr><td>${region}</td><td>${stats.orders}</td><td>${formatCurrency(stats.amount)}</td></tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Показать детали по региону
function showRegionDetails(region, data, container) {
    const regionData = data.filter(item => item.region === region);
    const productStats = {};

    regionData.forEach(item => {
        if (!productStats[item.product]) {
            productStats[item.product] = { orders: 0, amount: 0 };
        }
        productStats[item.product].orders += item.quantity;
        productStats[item.product].amount += item.amount;
    });

    const sortedProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    let html = `<h6>Товары в регионе "${region}":</h6>`;
    html += '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th>Товар</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>';

    sortedProducts.forEach(([product, stats]) => {
        html += `<tr><td>${product}</td><td>${stats.orders}</td><td>${formatCurrency(stats.amount)}</td></tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Генерация цветов для диаграммы
function generateColors(count) {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}