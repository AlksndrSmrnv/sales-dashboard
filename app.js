// Глобальные переменные
let salesData = [];
let warehouseMapping = {};
let chart;

// База данных соответствия регионов и складов (загружается из файла)
let regionToWarehouse = {};

// База данных соответствия городов и регионов (загружается из файла)
let cityToRegion = {};

// Инициализация приложения
async function initializeApp() {
    console.log('Инициализация приложения...');

    // Загружаем данные о городах и складах
    await loadCityToRegionData();
    await loadWarehouseData();

    // Проверяем доступность всех необходимых элементов
    const fileInput = document.getElementById('excelFile');
    const productFilter = document.getElementById('productFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');

    if (!fileInput || !productFilter || !warehouseFilter) {
        console.error('Не найдены необходимые элементы DOM');
        return;
    }

    fileInput.addEventListener('change', handleFileUpload);
    productFilter.addEventListener('change', applyFilters);
    warehouseFilter.addEventListener('change', applyFilters);

    console.log('Приложение инициализировано успешно');
}

// Запускаем инициализацию когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Загрузка данных о складах из файла
async function loadWarehouseData() {
    try {
        const response = await fetch('склады.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        // Парсим данные из файла (формат: Регион:Склад)
        const lines = text.split('\n').filter(line => line.trim());
        regionToWarehouse = {};

        lines.forEach(line => {
            const [region, warehouse] = line.split(':').map(s => s.trim());
            if (region && warehouse) {
                regionToWarehouse[region] = warehouse;
            }
        });

        console.log('Загружены данные о складах:', Object.keys(regionToWarehouse).length, 'регионов');
        return regionToWarehouse;
    } catch (error) {
        console.error("Ошибка при загрузке данных о складах:", error);
        console.log("Используем встроенные данные о складах");
        // Используем встроенные данные в случае ошибки
        regionToWarehouse = {
            "Курганская область": "Екатеринбург Южный",
            "Пермский край": "Екатеринбург Южный",
            "Республика Коми": "Екатеринбург Южный",
            "Свердловская область": "Екатеринбург Южный",
            "Тюменская область": "Екатеринбург Южный",
            "Удмуртская Республика": "Екатеринбург Южный",
            "Ханты-Мансийский Автономный округ - Югра": "Екатеринбург Южный",
            "Челябинская область": "Екатеринбург Южный",
            "Ямало-Ненецкий АО": "Екатеринбург Южный",
            "Астраханская область": "Краснодар Индустриальный",
            "Волгоградская область": "Краснодар Индустриальный",
            "Кабардино-Балкарская Республика": "Краснодар Индустриальный",
            "Карачаево-Черкесская Республика": "Краснодар Индустриальный",
            "Краснодарский край": "Краснодар Индустриальный",
            "Республика Адыгея": "Краснодар Индустриальный",
            "Республика Дагестан": "Краснодар Индустриальный",
            "Республика Ингушетия": "Краснодар Индустриальный",
            "Республика Крым": "Краснодар Индустриальный",
            "Республика Северная Осетия - Алания": "Краснодар Индустриальный",
            "Ростовская область": "Краснодар Индустриальный",
            "Севастополь": "Краснодар Индустриальный",
            "Ставропольский край": "Краснодар Индустриальный",
            "Чеченская Республика": "Краснодар Индустриальный",
            "Амурская область": "Новосибирск Планетная",
            "Еврейская автономная область": "Новосибирск Планетная",
            "Забайкальский край": "Новосибирск Планетная",
            "Иркутская область": "Новосибирск Планетная",
            "Камчатский край": "Новосибирск Планетная",
            "Кемеровская область": "Новосибирск Планетная",
            "Красноярский край": "Новосибирск Планетная",
            "Магаданская область": "Новосибирск Планетная",
            "Ненецкий АО": "Новосибирск Планетная",
            "Новосибирская область": "Новосибирск Планетная",
            "Омская область": "Новосибирск Планетная",
            "Приморский край": "Новосибирск Планетная",
            "Республика Алтай": "Новосибирск Планетная",
            "Республика Бурятия": "Новосибирск Планетная",
            "Республика Саха-Якутия": "Новосибирск Планетная",
            "Республика Тыва": "Новосибирск Планетная",
            "Республика Хакасия": "Новосибирск Планетная",
            "Сахалинская область": "Новосибирск Планетная",
            "Томская область": "Новосибирск Планетная",
            "Хабаровский край": "Новосибирск Планетная",
            "Чукотский АО": "Новосибирск Планетная",
            "Архангельская область": "Санкт-Петербург Шушары",
            "Вологодская область": "Санкт-Петербург Шушары",
            "Ленинградская область": "САНКТ-ПЕТЕРБУРГ ШУШАРЫ/ПАРГОЛОВО",
            "Мурманская область": "Санкт-Петербург Шушары",
            "Новгородская область": "Санкт-Петербург Шушары",
            "Псковская область": "Санкт-Петербург Шушары",
            "Республика Карелия": "Санкт-Петербург Шушары",
            "Санкт-Петербург": "САНКТ-ПЕТЕРБУРГ ШУШАРЫ/ПАРГОЛОВО",
            "Калининградская область": "Санкт-Петербург Парголово",
            "Республика Калмыкия": "Ростов Грушевская"
        };
        console.log("Загружены встроенные данные о складах:", Object.keys(regionToWarehouse).length, "регионов");
        return regionToWarehouse;
    }
}

// Загрузка данных о городах из файла
async function loadCityToRegionData() {
    try {
        const response = await fetch('города.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();

        // Парсим данные из файла (формат: Город:Регион)
        const lines = text.split('\n').filter(line => line.trim());
        cityToRegion = {};

        lines.forEach(line => {
            const [city, region] = line.split(':').map(s => s.trim());
            if (city && region) {
                cityToRegion[city] = region;
            }
        });

        console.log('Загружены данные о городах:', Object.keys(cityToRegion).length, 'городов');
        return cityToRegion;
    } catch (error) {
        console.error("Ошибка при загрузке данных о городах:", error);
        console.log("Используем встроенные данные о городах");

        // Встроенные данные на случай ошибки загрузки файла
        cityToRegion = {
            "Курган": "Курганская область",
            "Пермь": "Пермский край",
            "Сыктывкар": "Республика Коми",
            "Ухта": "Республика Коми",
            "Екатеринбург": "Свердловская область",
            "Нижний Тагил": "Свердловская область",
            "Тюмень": "Тюменская область",
            "Ижевск": "Удмуртская Республика",
            "Ханты-Мансийск": "Ханты-Мансийский Автономный округ - Югра",
            "Сургут": "Ханты-Мансийский Автономный округ - Югра",
            "Нижневартовск": "Ханты-Мансийский Автономный округ - Югра",
            "Челябинск": "Челябинская область",
            "Магнитогорск": "Челябинская область",
            "Салехард": "Ямало-Ненецкий АО",
            "Новый Уренгой": "Ямало-Ненецкий АО",
            "Астрахань": "Астраханская область",
            "Волгоград": "Волгоградская область",
            "Волжский": "Волгоградская область",
            "Нальчик": "Кабардино-Балкарская Республика",
            "Черкесск": "Карачаево-Черкесская Республика",
            "Краснодар": "Краснодарский край",
            "Сочи": "Краснодарский край",
            "Новороссийск": "Краснодарский край",
            "Майкоп": "Республика Адыгея",
            "Махачкала": "Республика Дагестан",
            "Дербент": "Республика Дагестан",
            "Назрань": "Республика Ингушетия",
            "Симферополь": "Республика Крым",
            "Ялта": "Республика Крым",
            "Владикавказ": "Республика Северная Осетия - Алания",
            "Ростов-на-Дону": "Ростовская область",
            "Таганрог": "Ростовская область",
            "Шахты": "Ростовская область",
            "Севастополь": "Севастополь",
            "Ставрополь": "Ставропольский край",
            "Пятигорск": "Ставропольский край",
            "Грозный": "Чеченская Республика",
            "Благовещенск": "Амурская область",
            "Биробиджан": "Еврейская автономная область",
            "Чита": "Забайкальский край",
            "Иркутск": "Иркутская область",
            "Петропавловск-Камчатский": "Камчатский край",
            "Кемерово": "Кемеровская область",
            "Новокузнецк": "Кемеровская область",
            "Красноярск": "Красноярский край",
            "Норильск": "Красноярский край",
            "Магадан": "Магаданская область",
            "Нарьян-Мар": "Ненецкий АО",
            "Новосибирск": "Новосибирская область",
            "Омск": "Омская область",
            "Владивосток": "Приморский край",
            "Находка": "Приморский край",
            "Горно-Алтайск": "Республика Алтай",
            "Улан-Удэ": "Республика Бурятия",
            "Якутск": "Республика Саха-Якутия",
            "Кызыл": "Республика Тыва",
            "Абакан": "Республика Хакасия",
            "Южно-Сахалинск": "Сахалинская область",
            "Томск": "Томская область",
            "Хабаровск": "Хабаровский край",
            "Анадырь": "Чукотский АО",
            "Архангельск": "Архангельская область",
            "Северодвинск": "Архангельская область",
            "Вологда": "Вологодская область",
            "Череповец": "Вологодская область",
            "Гатчина": "Ленинградская область",
            "Выборг": "Ленинградская область",
            "Мурманск": "Мурманская область",
            "Великий Новгород": "Новгородская область",
            "Псков": "Псковская область",
            "Петрозаводск": "Республика Карелия",
            "Санкт-Петербург": "Санкт-Петербург",
            "СПб": "Санкт-Петербург",
            "Питер": "Санкт-Петербург",
            "Калининград": "Калининградская область",
            "Элиста": "Республика Калмыкия",
            "Москва": "Московская область",
            "Мск": "Московская область",
            "Саранск": "Республика Мордовия",
            "Йошкар-Ола": "Республика Марий Эл",
            "Чебоксары": "Чувашская Республика",
            "Казань": "Республика Татарстан",
            "Набережные Челны": "Республика Татарстан",
            "Киров": "Кировская область",
            "Нижний Новгород": "Нижегородская область",
            "Дзержинск": "Нижегородская область",
            "Оренбург": "Оренбургская область",
            "Пенза": "Пензенская область",
            "Самара": "Самарская область",
            "Тольятти": "Самарская область",
            "Саратов": "Саратовская область",
            "Ульяновск": "Ульяновская область",
            "Уфа": "Республика Башкортостан",
            "Стерлитамак": "Республика Башкортостан"
        };

        console.log("Загружены встроенные данные о городах:", Object.keys(cityToRegion).length, "городов");
        return cityToRegion;
    }
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
    console.log('📊 Состояние маппинга:');
    console.log(`  • Городов загружено: ${Object.keys(cityToRegion).length}`);
    console.log(`  • Складов загружено: ${Object.keys(regionToWarehouse).length}`);

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
            const parsedQty = parseFloat(cleanQty);
            quantity = Number.isNaN(parsedQty) ? 1 : parsedQty;
        }

        if (amountIndex !== -1) {
            const amtValue = row[amountIndex];
            // Удаляем пробелы, валютные символы и заменяем запятые на точки
            const cleanAmt = String(amtValue || '').replace(/[\s₽$€]/g, '').replace(',', '.');
            amount = parseFloat(cleanAmt) || 0;
        }

        if (city && product) {
            const warehouse = getWarehouseByRegion(city);
            salesData.push({
                city,
                warehouse,
                product,
                quantity,
                amount
            });
            processedRows++;

            // Логируем первые несколько записей для отладки
            if (processedRows <= 5) {
                console.log(`📦 Строка ${i + 1}:`, {
                    city,
                    warehouse,
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

    // Показываем интерфейс и обновляем данные с анимациями
    if (typeof showSection === 'function') {
        showSection('filtersSection');
        showSection('contentSection');
    } else {
        document.getElementById('filtersSection').style.display = 'block';
        document.getElementById('contentSection').style.display = 'block';
    }

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

// Получение склада по региону/городу
let diagnosticShown = false; // Флаг для однократного вывода диагностики

function getWarehouseByRegion(city) {
    const defaultWarehouse = 'МОСКВА ЧЕХОВ\\ДОРОЖНАЯ';

    // Диагностика (только один раз)
    if (!diagnosticShown) {
        if (Object.keys(cityToRegion).length === 0) {
            console.warn('⚠️ cityToRegion пуст! Данные о городах не загружены.');
        } else {
            console.log(`ℹ️ Загружено городов: ${Object.keys(cityToRegion).length}`);
        }
        if (Object.keys(regionToWarehouse).length === 0) {
            console.warn('⚠️ regionToWarehouse пуст! Данные о складах не загружены.');
        } else {
            console.log(`ℹ️ Загружено складов: ${Object.keys(regionToWarehouse).length}`);
        }
        diagnosticShown = true;
    }

    if (typeof city !== 'string') {
        console.log(`❌ Город не строка: ${city}, используем дефолтный склад`);
        return defaultWarehouse;
    }

    const normalizedCity = city.trim().toLowerCase();
    if (!normalizedCity) {
        console.log(`❌ Пустой город, используем дефолтный склад`);
        return defaultWarehouse;
    }

    // Этап 1: Поиск города в маппинге город -> область
    let region = null;

    // Прямое совпадение по городу
    for (const [cityName, regionName] of Object.entries(cityToRegion)) {
        if (normalizedCity === cityName.trim().toLowerCase()) {
            region = regionName;
            console.log(`✅ Прямое совпадение: "${city}" → область "${region}"`);
            break;
        }
    }

    // Если не нашли прямое совпадение, ищем частичное
    if (!region) {
        let bestCityMatch = null;
        let bestCityMatchLength = 0;
        let matchedCityName = null;

        for (const [cityName, regionName] of Object.entries(cityToRegion)) {
            const normalizedCityName = cityName.trim().toLowerCase();

            if (normalizedCity.includes(normalizedCityName) || normalizedCityName.includes(normalizedCity)) {
                if (normalizedCityName.length > bestCityMatchLength) {
                    bestCityMatch = regionName;
                    bestCityMatchLength = normalizedCityName.length;
                    matchedCityName = cityName;
                }
            }
        }

        region = bestCityMatch;
        if (region) {
            console.log(`🔍 Частичное совпадение: "${city}" → "${matchedCityName}" → область "${region}"`);
        }
    }

    // Если город не найден, возвращаем дефолтный склад
    if (!region) {
        console.log(`❌ Город "${city}" не найден в маппинге, используем дефолтный склад: ${defaultWarehouse}`);
        return defaultWarehouse;
    }

    // Этап 2: Поиск склада по области в маппинге область -> склад
    const normalizedRegion = region.trim().toLowerCase();

    // Прямое совпадение по области
    for (const [regionName, warehouse] of Object.entries(regionToWarehouse)) {
        if (normalizedRegion === regionName.trim().toLowerCase()) {
            console.log(`✅ Склад найден: область "${region}" → склад "${warehouse}"`);
            return warehouse;
        }
    }

    // Частичное совпадение по области
    let bestRegionMatch = null;
    let bestRegionMatchLength = 0;
    let matchedRegionName = null;

    for (const [regionName, warehouse] of Object.entries(regionToWarehouse)) {
        const normalizedRegionName = regionName.trim().toLowerCase();

        if (normalizedRegion.includes(normalizedRegionName) || normalizedRegionName.includes(normalizedRegion)) {
            if (normalizedRegionName.length > bestRegionMatchLength) {
                bestRegionMatch = warehouse;
                bestRegionMatchLength = normalizedRegionName.length;
                matchedRegionName = regionName;
            }
        }
    }

    if (bestRegionMatch) {
        console.log(`🔍 Частичное совпадение по области: "${region}" → "${matchedRegionName}" → склад "${bestRegionMatch}"`);
        return bestRegionMatch;
    }

    // Если склад для области не найден, возвращаем дефолтный
    console.log(`❌ Склад для области "${region}" не найден, используем дефолтный склад: ${defaultWarehouse}`);
    return defaultWarehouse;
}

// Обновление фильтров
function updateFilters() {
    const productFilter = document.getElementById('productFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');

    // Получаем уникальные товары и склады
    const products = [...new Set(salesData.map(item => item.product))].sort();
    const warehouses = [...new Set(salesData.map(item => item.warehouse))].sort();

    // Очищаем и заполняем фильтр товаров
    productFilter.innerHTML = '<option value="">Все товары</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productFilter.appendChild(option);
    });

    // Очищаем и заполняем фильтр складов
    warehouseFilter.innerHTML = '<option value="">Все склады</option>';
    warehouses.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        warehouseFilter.appendChild(option);
    });
}

// Применение фильтров
function applyFilters() {
    updateVisualization();
    updateDetails();
}

// Получение отфильтрованных данных
function getFilteredData() {
    const productFilter = document.getElementById('productFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');

    // Получаем выбранные значения из multiple select
    const selectedProducts = Array.from(productFilter.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== ""); // Исключаем пустой "Все товары"

    const selectedWarehouses = Array.from(warehouseFilter.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== ""); // Исключаем пустой "Все склады"

    return salesData.filter(item => {
        const productMatch = selectedProducts.length === 0 || selectedProducts.includes(item.product);
        const warehouseMatch = selectedWarehouses.length === 0 || selectedWarehouses.includes(item.warehouse);

        return productMatch && warehouseMatch;
    });
}

// Обновление визуализации
function updateVisualization() {
    const filteredData = getFilteredData();

    // Агрегация данных по складам
    const warehouseStats = {};
    filteredData.forEach(item => {
        if (!warehouseStats[item.warehouse]) {
            warehouseStats[item.warehouse] = {
                orders: 0,
                amount: 0
            };
        }
        warehouseStats[item.warehouse].orders += item.quantity;
        warehouseStats[item.warehouse].amount += item.amount;
    });

    updateChart(warehouseStats);
    updateTable(warehouseStats);
}

// Обновление круговой диаграммы
function updateChart(warehouseStats) {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js не доступен');
        document.getElementById('warehouseChart').parentElement.innerHTML =
            '<p class="text-danger">Ошибка загрузки Chart.js</p>';
        return;
    }

    const ctx = document.getElementById('warehouseChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    const labels = Object.keys(warehouseStats);
    const data = Object.values(warehouseStats).map(stat => stat.orders);
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
        document.getElementById('warehouseChart').parentElement.innerHTML =
            '<p class="text-danger">Ошибка создания диаграммы: ' + error.message + '</p>';
    }
}

// Обновление таблицы
function updateTable(warehouseStats) {
    const tbody = document.getElementById('warehouseTableBody');
    tbody.innerHTML = '';

    // Сортируем склады по количеству заказов
    const sortedWarehouses = Object.entries(warehouseStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    sortedWarehouses.forEach(([region, stats]) => {
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
    const productFilter = document.getElementById('productFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');
    const detailsContent = document.getElementById('detailsContent');

    // Получаем выбранные значения из multiple select
    const selectedProducts = Array.from(productFilter.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== "");

    const selectedWarehouses = Array.from(warehouseFilter.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== "");

    if (selectedProducts.length === 0 && selectedWarehouses.length === 0) {
        detailsContent.innerHTML = '<p class="text-muted">Выберите товары или склады для просмотра детальной информации</p>';
        return;
    }

    const filteredData = getFilteredData();

    if (selectedProducts.length === 1 && selectedWarehouses.length === 0) {
        // Показать детали по одному товару
        showProductDetails(selectedProducts[0], filteredData, detailsContent);
    } else if (selectedProducts.length === 0 && selectedWarehouses.length === 1) {
        // Показать детали по одному складу
        showWarehouseDetails(selectedWarehouses[0], filteredData, detailsContent);
    } else {
        // Показать общую статистику по выбранным фильтрам
        showMultipleSelectionDetails(selectedProducts, selectedWarehouses, filteredData, detailsContent);
    }
}

// Показать детали по товару
function showProductDetails(product, data, container) {
    const productData = data.filter(item => item.product === product);
    const warehouseStats = {};

    productData.forEach(item => {
        if (!warehouseStats[item.warehouse]) {
            warehouseStats[item.warehouse] = { orders: 0, amount: 0 };
        }
        warehouseStats[item.warehouse].orders += item.quantity;
        warehouseStats[item.warehouse].amount += item.amount;
    });

    const sortedWarehouses = Object.entries(warehouseStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    let html = `<h6>Продажи товара "${product}" по складам:</h6>`;
    html += '<div class="table-responsive"><table class="table table-sm">';
    html += '<thead><tr><th>Склад</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>';

    sortedWarehouses.forEach(([region, stats]) => {
        html += `<tr><td>${region}</td><td>${stats.orders}</td><td>${formatCurrency(stats.amount)}</td></tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Показать детали по складу
function showWarehouseDetails(region, data, container) {
    const warehouseData = data.filter(item => item.warehouse === region);
    const productStats = {};

    warehouseData.forEach(item => {
        if (!productStats[item.product]) {
            productStats[item.product] = { orders: 0, amount: 0 };
        }
        productStats[item.product].orders += item.quantity;
        productStats[item.product].amount += item.amount;
    });

    const sortedProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.orders - a.orders);

    let html = `<h6>Товары на складе "${region}":</h6>`;
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

// Показать детальную информацию для множественного выбора
function showMultipleSelectionDetails(selectedProducts, selectedWarehouses, data, container) {
    let html = '<h6>Статистика по выбранным фильтрам:</h6>';

    if (selectedProducts.length > 0) {
        html += '<h7><strong>Выбранные товары:</strong> ' + selectedProducts.join(', ') + '</h7><br>';
    }

    if (selectedWarehouses.length > 0) {
        html += '<h7><strong>Выбранные склады:</strong> ' + selectedWarehouses.join(', ') + '</h7><br>';
    }

    // Общая статистика
    const totalOrders = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    html += `<div class="alert alert-info">
        <strong>Общая статистика:</strong><br>
        Количество заказов: ${totalOrders}<br>
        Общая сумма: ${formatCurrency(totalAmount)}
    </div>`;

    // Если выбрано несколько товаров, показываем разбивку по товарам
    if (selectedProducts.length > 1) {
        const productStats = {};
        data.forEach(item => {
            if (!productStats[item.product]) {
                productStats[item.product] = { orders: 0, amount: 0 };
            }
            productStats[item.product].orders += item.quantity;
            productStats[item.product].amount += item.amount;
        });

        html += '<div class="table-responsive"><h6>Разбивка по товарам:</h6>';
        html += '<table class="table table-sm"><thead><tr><th>Товар</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>';

        Object.entries(productStats)
            .sort(([,a], [,b]) => b.orders - a.orders)
            .forEach(([product, stats]) => {
                html += `<tr><td>${product}</td><td>${stats.orders}</td><td>${formatCurrency(stats.amount)}</td></tr>`;
            });

        html += '</tbody></table></div>';
    }

    // Если выбрано несколько складов, показываем разбивку по складам
    if (selectedWarehouses.length > 1) {
        const warehouseStats = {};
        data.forEach(item => {
            if (!warehouseStats[item.warehouse]) {
                warehouseStats[item.warehouse] = { orders: 0, amount: 0 };
            }
            warehouseStats[item.warehouse].orders += item.quantity;
            warehouseStats[item.warehouse].amount += item.amount;
        });

        html += '<div class="table-responsive"><h6>Разбивка по складам:</h6>';
        html += '<table class="table table-sm"><thead><tr><th>Склад</th><th>Количество</th><th>Сумма</th></tr></thead><tbody>';

        Object.entries(warehouseStats)
            .sort(([,a], [,b]) => b.orders - a.orders)
            .forEach(([warehouse, stats]) => {
                html += `<tr><td>${warehouse}</td><td>${stats.orders}</td><td>${formatCurrency(stats.amount)}</td></tr>`;
            });

        html += '</tbody></table></div>';
    }

    container.innerHTML = html;
}

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}