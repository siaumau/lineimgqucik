// 初始化 i18next
document.addEventListener('DOMContentLoaded', () => {
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'zh-TW',
            supportedLngs: ['zh-TW', 'en'],
            debug: true,
            backend: {
                loadPath: '/locales/{{lng}}/translation.json',
            },
            detection: {
                order: ['querystring', 'cookie', 'localStorage', 'navigator'],
                lookupQuerystring: 'lng',
                lookupCookie: 'i18next',
                lookupLocalStorage: 'i18nextLng',
                caches: ['localStorage', 'cookie'],
            },
            load: 'currentOnly'
        }).then(function() {
            // 初始化完成後更新內容
            updateContent();
            updateLanguageButtons();

            // 添加語言切換按鈕事件監聽
            document.querySelectorAll('.language-switch').forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetLang = e.target.getAttribute('data-lang');
                    changeLanguage(targetLang);
                });
            });
        }).catch(function(err) {
            console.error('i18next 初始化錯誤:', err);
        });
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
    try {
        // 更新標題
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = i18next.t('title');
            document.title = i18next.t('title');
        }

        // 更新介紹文字
        const introElement = document.querySelector('.intro-text');
        if (introElement) {
            introElement.textContent = i18next.t('intro.description');
        }

        // 更新卡片內容
        updateCards();

        // 更新按鈕文字
        updateButtons();

        // 更新拖放區域文字
        updateDropzones();

        // 更新設定面板
        updateSettings();
    } catch (error) {
        console.error('更新內容時發生錯誤:', error);
    }
}

// 更新卡片內容
function updateCards() {
    try {
        // 官方資源卡片
        const officialTitle = document.querySelector('.info-card:nth-child(1) h3');
        if (officialTitle) {
            officialTitle.textContent = i18next.t('cards.official.title');
        }

        const officialLinks = document.querySelectorAll('.info-card:nth-child(1) .official-link');
        if (officialLinks.length >= 2) {
            officialLinks[0].textContent = i18next.t('cards.official.guide');
            officialLinks[1].textContent = i18next.t('cards.official.market');
        }

        // 工具特色卡片
        const featuresTitle = document.querySelector('.info-card:nth-child(2) h3');
        if (featuresTitle) {
            featuresTitle.textContent = i18next.t('cards.features.title');
        }

        const featuresList = document.querySelector('.info-card:nth-child(2) ul');
        if (featuresList) {
            const features = featuresList.children;
            if (features.length >= 4) {
                features[0].textContent = i18next.t('cards.features.dragDrop');
                features[1].textContent = i18next.t('cards.features.autoResize');
                features[2].textContent = i18next.t('cards.features.batchProcess');
                features[3].textContent = i18next.t('cards.features.preview');
            }
        }

        // 圖片規格卡片
        const specsTitle = document.querySelector('.info-card:nth-child(3) h3');
        if (specsTitle) {
            specsTitle.textContent = i18next.t('cards.specs.title');
        }

        const specLabels = document.querySelectorAll('.info-card:nth-child(3) .spec-label');
        if (specLabels.length >= 3) {
            specLabels[0].textContent = i18next.t('cards.specs.main');
            specLabels[1].textContent = i18next.t('cards.specs.tab');
            specLabels[2].textContent = i18next.t('cards.specs.format');
        }

        // 注意事項卡片
        const notesTitle = document.querySelector('.info-card:nth-child(4) h3');
        if (notesTitle) {
            notesTitle.textContent = i18next.t('cards.notes.title');
        }

        const notesList = document.querySelector('.info-card:nth-child(4) ul');
        if (notesList) {
            const notes = notesList.children;
            if (notes.length >= 4) {
                notes[0].textContent = i18next.t('cards.notes.transparency');
                notes[1].textContent = i18next.t('cards.notes.fileSize');
                notes[2].textContent = i18next.t('cards.notes.batchUpload');
                notes[3].textContent = i18next.t('cards.notes.autoSave');
            }
        }
    } catch (error) {
        console.error('更新卡片內容時發生錯誤:', error);
    }
}

// 更新按鈕文字
function updateButtons() {
    try {
        const buttons = {
            'addImagesBtn': 'buttons.selectImage',
            'importZipBtn': 'buttons.importZip',
            'exportZipBtn': 'buttons.exportZip',
            'settingsBtn': 'buttons.settings',
            'processBtn': 'buttons.generate'
        };

        for (const [id, translationKey] of Object.entries(buttons)) {
            const button = document.getElementById(id);
            if (button) {
                button.textContent = i18next.t(translationKey);
            }
        }
    } catch (error) {
        console.error('更新按鈕文字時發生錯誤:', error);
    }
}

// 更新拖放區域文字
function updateDropzones() {
    try {
        const mainLabel = document.querySelector('.main-cell .cell-label');
        if (mainLabel) {
            mainLabel.textContent = i18next.t('dropzone.main');
        }

        const tabLabel = document.querySelector('.tab-cell .cell-label');
        if (tabLabel) {
            tabLabel.textContent = i18next.t('dropzone.tab');
        }

        document.querySelectorAll('.grid-cell .cell-label').forEach((label, index) => {
            label.textContent = `${i18next.t('dropzone.sticker')} ${String(index + 1).padStart(2, '0')}`;
        });

        document.querySelectorAll('.placeholder-content span').forEach(span => {
            span.textContent = i18next.t('dropzone.dropHere');
        });
    } catch (error) {
        console.error('更新拖放區域文字時發生錯誤:', error);
    }
}

// 更新設定面板
function updateSettings() {
    try {
        const settingsTitle = document.querySelector('.settings-header h2');
        if (settingsTitle) {
            settingsTitle.textContent = i18next.t('settings.title');
        }

        const gridSizeLabel = document.querySelector('.setting-group h3');
        if (gridSizeLabel) {
            gridSizeLabel.textContent = i18next.t('settings.gridSize.label');
        }

        const options = document.querySelectorAll('#gridSizeSelector option');
        options.forEach(option => {
            option.textContent = i18next.t(`settings.gridSize.options.${option.value}`);
        });

        const infoTitle = document.querySelector('.setting-group:nth-child(2) h3');
        if (infoTitle) {
            infoTitle.textContent = i18next.t('settings.info.title');
        }

        const infoList = document.querySelector('.info-list');
        if (infoList) {
            const items = infoList.children;
            if (items.length >= 4) {
                items[0].textContent = i18next.t('settings.info.mainSize');
                items[1].textContent = i18next.t('settings.info.tabSize');
                items[2].textContent = i18next.t('settings.info.count');
                items[3].textContent = i18next.t('settings.info.ratio');
            }
        }
    } catch (error) {
        console.error('更新設定面板時發生錯誤:', error);
    }
}
