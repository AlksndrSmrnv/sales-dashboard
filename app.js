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
    const nomenclatureIndex = findColumnIndex(headers, ['номенклатура', 'nomenclature', 'артикул', 'код', 'Номенклатура', 'НОМЕНКЛАТУРА']);
    const quantityIndex = findColumnIndex(headers, ['количество', 'quantity', 'кол-во', 'Quantity', 'КОЛИЧЕСТВО', 'qty', 'доставлено шт', 'заказано шт']);
    const amountIndex = findColumnIndex(headers, ['сумма', 'amount', 'стоимость', 'Amount', 'СУММА', 'price', 'цена', 'общая сумма', 'итого', 'доставлено руб', 'заказано руб']);

    console.log('Найденные индексы:', { cityIndex, productIndex, nomenclatureIndex, quantityIndex, amountIndex });
    console.log('Заголовки по индексам:', {
        city: headers[cityIndex],
        product: headers[productIndex],
        nomenclature: headers[nomenclatureIndex],
        quantity: headers[quantityIndex],
        amount: headers[amountIndex]
    });

    if (cityIndex === -1 || productIndex === -1) {
        const errorMessage = `Не найдены обязательные колонки: город и товар

Доступные заголовки: ${headers.join(', ')}

Ожидаемые названия колонок:
• Город: "город", "city", "City", "ГОРОД", "город доставки"
• Товар: "товар", "product", "наименование", "Product", "ТОВАР"
• Номенклатура (опционально): "номенклатура", "артикул", "код"`;

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
        const nomenclature = nomenclatureIndex !== -1 ? String(row[nomenclatureIndex] || '').trim() : '';

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
            // Формируем полное название товара с номенклатурой
            const fullProductName = nomenclature ? `${nomenclature} - ${product}` : product;

            salesData.push({
                city,
                warehouse,
                product: fullProductName,
                nomenclature,
                quantity,
                amount
            });
            processedRows++;

            // Логируем первые несколько записей для отладки
            if (processedRows <= 5) {
                console.log(`📦 Строка ${i + 1}:`, {
                    city,
                    warehouse,
                    nomenclature,
                    product: fullProductName,
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
    updatePivotTable(filteredData);
}

// Обновление pivot таблицы (товары × склады)
function updatePivotTable(data) {
    const thead = document.getElementById('pivotTableHeader');
    const tbody = document.getElementById('pivotTableBody');

    // Получаем уникальные товары и склады
    const products = [...new Set(data.map(item => item.product))].sort();
    const warehouses = [...new Set(data.map(item => item.warehouse))].sort();

    // Строим pivot структуру: товар -> склад -> {quantity, amount}
    const pivot = {};
    data.forEach(item => {
        if (!pivot[item.product]) {
            pivot[item.product] = {};
        }
        if (!pivot[item.product][item.warehouse]) {
            pivot[item.product][item.warehouse] = { quantity: 0, amount: 0 };
        }
        pivot[item.product][item.warehouse].quantity += item.quantity;
        pivot[item.product][item.warehouse].amount += item.amount;
    });

    // Заполняем заголовок таблицы
    thead.innerHTML = '<th>Товар</th>';
    warehouses.forEach(warehouse => {
        const th = document.createElement('th');
        th.textContent = warehouse;
        thead.appendChild(th);
    });
    // Добавляем столбец "Итого"
    const thTotal = document.createElement('th');
    thTotal.textContent = 'Итого';
    thead.appendChild(thTotal);

    // Заполняем тело таблицы
    tbody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');

        // Первая ячейка - название товара
        const productCell = document.createElement('td');
        productCell.textContent = product;
        productCell.style.fontWeight = '600';
        row.appendChild(productCell);

        let totalQuantity = 0;
        let totalAmount = 0;

        // Ячейки для каждого склада
        warehouses.forEach(warehouse => {
            const cell = document.createElement('td');
            const stats = pivot[product] && pivot[product][warehouse];

            if (stats && stats.quantity > 0) {
                cell.innerHTML = `
                    <div style="font-weight: 500;">${stats.quantity} шт</div>
                    <div style="font-size: 0.85em; color: #666;">${formatCurrency(stats.amount)}</div>
                `;
                totalQuantity += stats.quantity;
                totalAmount += stats.amount;
            } else {
                cell.textContent = '—';
                cell.style.color = '#ccc';
                cell.style.textAlign = 'center';
            }

            row.appendChild(cell);
        });

        // Ячейка "Итого" для товара
        const totalCell = document.createElement('td');
        totalCell.innerHTML = `
            <div style="font-weight: 700;">${totalQuantity} шт</div>
            <div style="font-size: 0.85em; color: #666;">${formatCurrency(totalAmount)}</div>
        `;
        totalCell.style.backgroundColor = 'rgba(192, 255, 0, 0.15)';
        row.appendChild(totalCell);

        tbody.appendChild(row);
    });

    // Добавляем строку "Итого" для складов
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = '700';
    totalRow.style.backgroundColor = 'rgba(192, 255, 0, 0.25)';

    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = 'ИТОГО';
    totalRow.appendChild(totalLabelCell);

    let grandTotalQuantity = 0;
    let grandTotalAmount = 0;

    warehouses.forEach(warehouse => {
        const cell = document.createElement('td');
        let warehouseQuantity = 0;
        let warehouseAmount = 0;

        data.forEach(item => {
            if (item.warehouse === warehouse) {
                warehouseQuantity += item.quantity;
                warehouseAmount += item.amount;
            }
        });

        if (warehouseQuantity > 0) {
            cell.innerHTML = `
                <div>${warehouseQuantity} шт</div>
                <div style="font-size: 0.85em;">${formatCurrency(warehouseAmount)}</div>
            `;
            grandTotalQuantity += warehouseQuantity;
            grandTotalAmount += warehouseAmount;
        } else {
            cell.textContent = '—';
        }

        totalRow.appendChild(cell);
    });

    // Ячейка "Итого ИТОГО"
    const grandTotalCell = document.createElement('td');
    grandTotalCell.innerHTML = `
        <div>${grandTotalQuantity} шт</div>
        <div style="font-size: 0.85em;">${formatCurrency(grandTotalAmount)}</div>
    `;
    grandTotalCell.style.backgroundColor = 'rgba(192, 255, 0, 0.35)';
    totalRow.appendChild(grandTotalCell);

    tbody.appendChild(totalRow);

    // Показываем кнопку экспорта
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.style.display = 'block';
    }
}

// Форматирование валюты
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}

// Экспорт таблицы в Excel
function exportToExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Библиотека XLSX не загружена. Проверьте подключение к интернету.');
            return;
        }

        const filteredData = getFilteredData();
        if (filteredData.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        // Получаем уникальные товары и склады
        const products = [...new Set(filteredData.map(item => item.product))].sort();
        const warehouses = [...new Set(filteredData.map(item => item.warehouse))].sort();

        // Строим pivot структуру
        const pivot = {};
        filteredData.forEach(item => {
            if (!pivot[item.product]) {
                pivot[item.product] = {};
            }
            if (!pivot[item.product][item.warehouse]) {
                pivot[item.product][item.warehouse] = { quantity: 0, amount: 0 };
            }
            pivot[item.product][item.warehouse].quantity += item.quantity;
            pivot[item.product][item.warehouse].amount += item.amount;
        });

        // Создаем массив массивов для Excel
        const data = [];

        // Заголовок
        const header = ['Товар', ...warehouses, 'Итого (кол-во)', 'Итого (сумма)'];
        data.push(header);

        // Строки с товарами
        products.forEach(product => {
            const row = [product];
            let totalQuantity = 0;
            let totalAmount = 0;

            warehouses.forEach(warehouse => {
                const stats = pivot[product] && pivot[product][warehouse];
                if (stats && stats.quantity > 0) {
                    row.push(`${stats.quantity} шт / ${stats.amount.toFixed(2)} ₽`);
                    totalQuantity += stats.quantity;
                    totalAmount += stats.amount;
                } else {
                    row.push('—');
                }
            });

            row.push(totalQuantity);
            row.push(totalAmount.toFixed(2));
            data.push(row);
        });

        // Итоговая строка
        const totalRow = ['ИТОГО'];
        let grandTotalQuantity = 0;
        let grandTotalAmount = 0;

        warehouses.forEach(warehouse => {
            let warehouseQuantity = 0;
            let warehouseAmount = 0;

            filteredData.forEach(item => {
                if (item.warehouse === warehouse) {
                    warehouseQuantity += item.quantity;
                    warehouseAmount += item.amount;
                }
            });

            totalRow.push(warehouseQuantity > 0 ? `${warehouseQuantity} шт / ${warehouseAmount.toFixed(2)} ₽` : '—');
            grandTotalQuantity += warehouseQuantity;
            grandTotalAmount += warehouseAmount;
        });

        totalRow.push(grandTotalQuantity);
        totalRow.push(grandTotalAmount.toFixed(2));
        data.push(totalRow);

        // Создаем книгу и лист
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Устанавливаем ширину колонок
        const colWidths = [{ wch: 30 }]; // Первая колонка (товар) шире
        for (let i = 0; i < warehouses.length + 2; i++) {
            colWidths.push({ wch: 20 });
        }
        ws['!cols'] = colWidths;

        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(wb, ws, 'Матрица продаж');

        // Генерируем имя файла с датой
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const fileName = `Матрица_продаж_${dateStr}.xlsx`;

        // Сохраняем файл
        XLSX.writeFile(wb, fileName);

        if (typeof showStatus === 'function') {
            showStatus(`Файл ${fileName} успешно сохранен`, 'success');
        }
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        alert('Ошибка при экспорте в Excel: ' + error.message);
    }
}