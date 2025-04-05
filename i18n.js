// 初始化 i18next
i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'zh-TW',
        debug: true,
        backend: {
            loadPath: 'locales/{{lng}}/translation.json',
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            lookupQuerystring: 'lng',
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage', 'cookie'],
        }
    }).then(function() {
        // 初始化完成後更新內容
        updateContent();
        updateLanguageButtons();
    });

// 語言切換函數
function changeLanguage(lng) {
    i18next.changeLanguage(lng).then(() => {
        updateContent();
        updateLanguageButtons();
        // 儲存語言選擇
        localStorage.setItem('i18nextLng', lng);
    }).catch((err) => {
        console.error('語言切換錯誤:', err);
    });
}

// 更新語言按鈕狀態
function updateLanguageButtons() {
    const currentLang = i18next.language;
    document.querySelectorAll('.language-switch').forEach(button => {
        const buttonLang = button.getAttribute('data-lang');
        if (buttonLang === currentLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 更新頁面內容
function updateContent() {
    // 更新標題
    document.querySelector('h1').textContent = i18next.t('title');
    document.title = i18next.t('title');

    // 更新介紹文字
    document.querySelector('.intro-text').textContent = i18next.t('intro.description');

    // 更新卡片內容
    updateCards();

    // 更新按鈕文字
    updateButtons();

    // 更新拖放區域文字
    updateDropzones();

    // 更新設定面板
    updateSettings();
}

// 更新卡片內容
function updateCards() {
    // 官方資源卡片
    document.querySelector('.info-card:nth-child(1) h3').textContent = i18next.t('cards.official.title');
    document.querySelectorAll('.info-card:nth-child(1) .official-link')[0].textContent = i18next.t('cards.official.guide');
    document.querySelectorAll('.info-card:nth-child(1) .official-link')[1].textContent = i18next.t('cards.official.market');

    // 工具特色卡片
    document.querySelector('.info-card:nth-child(2) h3').textContent = i18next.t('cards.features.title');
    const featuresList = document.querySelector('.info-card:nth-child(2) ul').children;
    featuresList[0].textContent = i18next.t('cards.features.dragDrop');
    featuresList[1].textContent = i18next.t('cards.features.autoResize');
    featuresList[2].textContent = i18next.t('cards.features.batchProcess');
    featuresList[3].textContent = i18next.t('cards.features.preview');

    // 圖片規格卡片
    document.querySelector('.info-card:nth-child(3) h3').textContent = i18next.t('cards.specs.title');
    document.querySelector('.info-card:nth-child(3) .spec-label').textContent = i18next.t('cards.specs.main');
    document.querySelectorAll('.info-card:nth-child(3) .spec-label')[1].textContent = i18next.t('cards.specs.tab');
    document.querySelectorAll('.info-card:nth-child(3) .spec-label')[2].textContent = i18next.t('cards.specs.format');

    // 注意事項卡片
    document.querySelector('.info-card:nth-child(4) h3').textContent = i18next.t('cards.notes.title');
    const notesList = document.querySelector('.info-card:nth-child(4) ul').children;
    notesList[0].textContent = i18next.t('cards.notes.transparency');
    notesList[1].textContent = i18next.t('cards.notes.fileSize');
    notesList[2].textContent = i18next.t('cards.notes.batchUpload');
    notesList[3].textContent = i18next.t('cards.notes.autoSave');
}

// 更新按鈕文字
function updateButtons() {
    document.querySelector('#addImagesBtn').textContent = i18next.t('buttons.selectImage');
    document.querySelector('#importZipBtn').textContent = i18next.t('buttons.importZip');
    document.querySelector('#exportZipBtn').textContent = i18next.t('buttons.exportZip');
    document.querySelector('#settingsBtn').textContent = i18next.t('buttons.settings');
    document.querySelector('#processBtn').textContent = i18next.t('buttons.generate');
}

// 更新拖放區域文字
function updateDropzones() {
    document.querySelector('.main-cell .cell-label').textContent = i18next.t('dropzone.main');
    document.querySelector('.tab-cell .cell-label').textContent = i18next.t('dropzone.tab');
    document.querySelectorAll('.grid-cell .cell-label').forEach((label, index) => {
        label.textContent = `${i18next.t('dropzone.sticker')} ${String(index + 1).padStart(2, '0')}`;
    });
    document.querySelectorAll('.placeholder-content span').forEach(span => {
        span.textContent = i18next.t('dropzone.dropHere');
    });
}

// 更新設定面板
function updateSettings() {
    document.querySelector('.settings-header h2').textContent = i18next.t('settings.title');
    document.querySelector('.setting-group h3').textContent = i18next.t('settings.gridSize.label');

    const options = document.querySelectorAll('#gridSizeSelector option');
    options.forEach(option => {
        option.textContent = i18next.t(`settings.gridSize.options.${option.value}`);
    });

    const infoTitle = document.querySelector('.setting-group:nth-child(2) h3');
    infoTitle.textContent = i18next.t('settings.info.title');

    const infoList = document.querySelector('.info-list').children;
    infoList[0].textContent = i18next.t('settings.info.mainSize');
    infoList[1].textContent = i18next.t('settings.info.tabSize');
    infoList[2].textContent = i18next.t('settings.info.count');
    infoList[3].textContent = i18next.t('settings.info.ratio');
}

// 監聽 DOM 載入完成事件
document.addEventListener('DOMContentLoaded', () => {
    // 添加語言切換按鈕事件監聽
    document.querySelectorAll('.language-switch').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetLang = e.target.getAttribute('data-lang');
            changeLanguage(targetLang);
        });
    });
});
