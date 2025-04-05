// 全局變量
const imageFiles = [];
let mainImageIndex = -1;
let tabImageIndex = -1;
const gridCells = [];

// DOM 元素
const fileInput = document.getElementById('fileInput');
const imageGrid = document.getElementById('imageGrid');
const addImagesBtn = document.getElementById('addImagesBtn');
const settingsBtn = document.getElementById('settingsBtn');
const processBtn = document.getElementById('processBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const overlay = document.getElementById('overlay');
const status = document.getElementById('status');

// 設定
const LINE_STICKER_COUNTS = [8, 16, 24, 32, 40];
const DEFAULT_GRID_SIZE = 16 // 改為16張，預設顯示最大數量

// 初始化全局設定
window.mainImageSize = { width: 240, height: 240 };
window.maxImageSize = { width: 370, height: 320 };

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化網格
    generateGridCells(DEFAULT_GRID_SIZE);
    setupDropzones();
    setupDragDrop();

    // 設定事件監聽器
    addImagesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    processBtn.addEventListener('click', processImages);
    settingsBtn.addEventListener('click', toggleSettings);
    closeSettingsBtn.addEventListener('click', toggleSettings);
    overlay.addEventListener('click', toggleSettings);

    // 設定格子數量選擇器
    const gridSizeSelector = document.getElementById('gridSizeSelector');
    if (gridSizeSelector) {
        gridSizeSelector.addEventListener('change', (e) => {
            changeGridSize(parseInt(e.target.value));
        });
    }
});

// 變更格子數量
function changeGridSize(size) {
    // 確保選擇的大小是有效的
    if (LINE_STICKER_COUNTS.includes(size)) {
        generateGridCells(size);
        setupDropzones();
        setupDragDrop();

        // 將已有的圖片重新填入格子
        refreshGridImages();
        showStatus(`已將貼圖格數調整為 ${size} 張`, 'success');
    }
}

// 生成網格單元格
function generateGridCells(count) {
    // 先清除除了特殊單元格以外的所有單元格
    Array.from(imageGrid.children).forEach(child => {
        if (!child.classList.contains('special-cell')) {
            child.remove();
        }
    });

    // 重置網格單元數組
    gridCells.length = 0;

    // 生成新的單元格
    for (let i = 0; i < count; i++) {
        const cellIndex = i + 1;
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = cellIndex;

        cell.innerHTML = `
            <div class="cell-inner dropzone" data-index="${cellIndex}">
                <div class="cell-label">貼圖 ${String(cellIndex).padStart(2, '0')}</div>
                <div class="placeholder-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>拖放至此</span>
                </div>
            </div>
        `;

        imageGrid.appendChild(cell);
        gridCells.push(cell);
    }
}

// 設置所有拖放區域
function setupDropzones() {
    console.log('設置放置區域');
    const dropzones = document.querySelectorAll('.dropzone');
    console.log('找到放置區域數量:', dropzones.length);

    dropzones.forEach(dropzone => {
        // 拖曳進入時
        dropzone.addEventListener('dragenter', (e) => {
            console.log('拖曳進入放置區域');
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        // 拖曳在區域上方移動時
        dropzone.addEventListener('dragover', (e) => {
            console.log('拖曳在放置區域上方移動');
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // 拖曳離開時
        dropzone.addEventListener('dragleave', () => {
            console.log('拖曳離開放置區域');
            dropzone.classList.remove('dragover');
        });

        // 放置時
        dropzone.addEventListener('drop', (e) => {
            console.log('放置事件觸發');
            e.preventDefault();
            dropzone.classList.remove('dragover');

            const targetCellIndex = parseInt(dropzone.dataset.index);
            const sourceCellIndex = parseInt(e.dataTransfer.getData('text/plain'));
            console.log('源單元格索引:', sourceCellIndex);
            console.log('目標單元格索引:', targetCellIndex);

            if (!isNaN(sourceCellIndex) && !isNaN(targetCellIndex)) {
                // 找到源圖片和目標圖片的索引
                const sourceImageIndex = imageFiles.findIndex(img => img.cellIndex === sourceCellIndex);
                const targetImageIndex = imageFiles.findIndex(img => img.cellIndex === targetCellIndex);
                console.log('源圖片索引:', sourceImageIndex);
                console.log('目標圖片索引:', targetImageIndex);

                if (sourceImageIndex !== -1 && targetImageIndex !== -1) {
                    console.log('開始交換圖片');

                    // 備份原始圖片數據
                    const sourceImage = {...imageFiles[sourceImageIndex]};
                    const targetImage = {...imageFiles[targetImageIndex]};

                    // 交換 cellIndex
                    sourceImage.cellIndex = targetCellIndex;
                    targetImage.cellIndex = sourceCellIndex;

                    // 更新圖片數組
                    imageFiles[sourceImageIndex] = sourceImage;
                    imageFiles[targetImageIndex] = targetImage;

                    // 清除原有圖片
                    clearCellImage('regular', sourceCellIndex);
                    clearCellImage('regular', targetCellIndex);

                    // 更新顯示
                    updateCellImage('regular', sourceImage, sourceImageIndex);
                    updateCellImage('regular', targetImage, targetImageIndex);

                    showStatus(`已交換貼圖 ${String(sourceCellIndex).padStart(2, '0')} 和貼圖 ${String(targetCellIndex).padStart(2, '0')}`, 'success');
                    console.log('圖片交換完成');

                    // 重新檢查可拖曳的圖片數量
                    console.log('重新檢查可拖曳圖片數量');
                    const draggableImages = document.querySelectorAll('.cell-image');
                    console.log('目前可拖曳的圖片數量:', draggableImages.length);

                    // 重新設置拖曳功能
                    setupDragDrop();
                }
            }
        });

        // 點擊上傳
        dropzone.addEventListener('click', () => {
            const cellType = dropzone.dataset.type;
            const cellIndex = parseInt(dropzone.dataset.index) || 0;

            // 創建一個臨時的文件輸入
            const tempFileInput = document.createElement('input');
            tempFileInput.type = 'file';
            tempFileInput.accept = 'image/*';
            tempFileInput.style.display = 'none';

            document.body.appendChild(tempFileInput);

            tempFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleDroppedFile(e.target.files[0], cellType, cellIndex);
                }
                // 使用後移除
                document.body.removeChild(tempFileInput);
            });

            tempFileInput.click();
        });
    });
}

// 重設拖放功能，確保所有圖片可拖拽
function setupDragDrop() {
    console.log('設置拖曳功能');
    const draggableImages = document.querySelectorAll('.cell-image');
    console.log('找到可拖曳的圖片數量:', draggableImages.length);

    draggableImages.forEach(img => {
        // 確保圖片可以拖曳
        img.setAttribute('draggable', 'true');
        console.log('設置圖片可拖曳:', img.dataset.index);

        // 拖曳開始時
        img.addEventListener('dragstart', (e) => {
            console.log('開始拖曳');
            const cellIndex = parseInt(img.dataset.cellIndex);
            console.log('拖曳的單元格索引:', cellIndex);
            e.dataTransfer.setData('text/plain', cellIndex.toString());
            e.target.classList.add('dragging');

            // 設置拖曳時的視覺效果
            e.dataTransfer.effectAllowed = 'move';

            // 創建拖曳時的預覽圖
            const dragIcon = img.cloneNode(true);
            dragIcon.style.width = '100px';
            dragIcon.style.height = '100px';
            dragIcon.style.opacity = '0.7';
            document.body.appendChild(dragIcon);
            e.dataTransfer.setDragImage(dragIcon, 50, 50);

            // 延遲移除預覽圖
            setTimeout(() => {
                document.body.removeChild(dragIcon);
            }, 0);
        });

        // 拖曳結束時
        img.addEventListener('dragend', (e) => {
            console.log('結束拖曳');
            e.target.classList.remove('dragging');
        });
    });
}

// 處理文件選擇
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    // 如果選擇的圖片超過可用的單元格，則增加單元格
    const currentCellCount = gridCells.length;
    const neededCells = files.length;

    if (neededCells > currentCellCount) {
        // 找出最接近的標準貼圖數量
        let targetCount = LINE_STICKER_COUNTS[0];
        for (const count of LINE_STICKER_COUNTS) {
            if (count >= neededCells) {
                targetCount = count;
                break;
            }
        }

        // 如果沒有合適的大小，使用最大的
        if (targetCount < neededCells) {
            targetCount = LINE_STICKER_COUNTS[LINE_STICKER_COUNTS.length - 1];
        }

        generateGridCells(targetCount);
        setupDropzones();
    }

    // 自動分配圖片到空格子
    const availableCells = getAvailableCells();

    // 遍歷所有文件
    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        // 查找下一個可用的單元格
        if (index < availableCells.length) {
            const cell = availableCells[index];
            handleDroppedFile(file, 'regular', parseInt(cell.dataset.index));
        } else {
            showStatus('沒有足夠的空間放置所有圖片', 'error');
        }
    });

    // 清空輸入
    fileInput.value = '';

    // 重新設置拖曳功能
    setTimeout(() => {
        setupDragDrop();
    }, 100);
}

// 處理拖放的文件
function handleDroppedFile(file, cellType, cellIndex) {
    if (!file.type.startsWith('image/')) {
        showStatus('只能選擇圖片文件', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = {
            file: file,
            dataUrl: e.target.result,
            type: cellType,
            cellIndex: cellIndex
        };

        // 根據單元格類型處理
        if (cellType === 'main') {
            // 設置為主圖片
            if (mainImageIndex !== -1) {
                // 已有主圖片，替換
                imageFiles[mainImageIndex] = imageData;
            } else {
                // 新增主圖片
                mainImageIndex = imageFiles.length;
                imageFiles.push(imageData);
            }
            updateCellImage('main', imageData, mainImageIndex);
            showStatus('已設定主圖片', 'success');
        } else if (cellType === 'tab') {
            // 設置為標籤圖片
            if (tabImageIndex !== -1) {
                // 已有標籤圖片，替換
                imageFiles[tabImageIndex] = imageData;
            } else {
                // 新增標籤圖片
                tabImageIndex = imageFiles.length;
                imageFiles.push(imageData);
            }
            updateCellImage('tab', imageData, tabImageIndex);
            showStatus('已設定標籤圖片', 'success');
        } else {
            // 一般貼圖
            imageFiles.push(imageData);
            updateCellImage('regular', imageData, imageFiles.length - 1);
        }

        // 更新按鈕狀態
        updateButtonStates();

        // 重新檢查可拖曳的圖片數量
        console.log('重新檢查可拖曳圖片數量');
        const draggableImages = document.querySelectorAll('.cell-image');
        console.log('目前可拖曳的圖片數量:', draggableImages.length);

        // 重新設置拖曳功能
        setupDragDrop();
    };

    reader.readAsDataURL(file);
}

// 修改移動圖片函數 - 確保只有兩張圖片正確互換位置
function moveImage(sourceIndex, targetCellType, targetCellIndex) {
    console.log(`開始移動: 源索引=${sourceIndex}, 目標類型=${targetCellType}, 目標索引=${targetCellIndex}`);

    // 檢查源索引是否有效
    if (sourceIndex < 0 || sourceIndex >= imageFiles.length) {
        console.log('無效的源索引');
        return;
    }

    // 獲取源圖片信息
    const sourceImage = imageFiles[sourceIndex];
    const sourceType = sourceImage.type;
    const sourceCellIndex = sourceImage.cellIndex;

    console.log(`源圖片信息: 類型=${sourceType}, 索引=${sourceCellIndex}`);

    // 找到目標圖片索引 (排除源圖片本身)
    let targetIndex = -1;
    for (let i = 0; i < imageFiles.length; i++) {
        if (i !== sourceIndex && imageFiles[i].type === targetCellType &&
            imageFiles[i].cellIndex === targetCellIndex) {
            targetIndex = i;
            break;
        }
    }

    console.log(`目標圖片索引: ${targetIndex}`);

    // 如果目標位置有圖片，執行正確的互換邏輯
    if (targetIndex !== -1) {
        console.log(`執行互換: ${sourceIndex} <-> ${targetIndex}`);

        // 暫存原始圖片完整數據
        const tempSourceData = {
            file: imageFiles[sourceIndex].file,
            dataUrl: imageFiles[sourceIndex].dataUrl,
            type: sourceType,
            cellIndex: sourceCellIndex
        };

        const tempTargetData = {
            file: imageFiles[targetIndex].file,
            dataUrl: imageFiles[targetIndex].dataUrl,
            type: targetCellType,
            cellIndex: targetCellIndex
        };

        // 處理主圖片和標籤圖片的索引更新
        if (sourceType === 'main') {
            mainImageIndex = targetIndex;
        } else if (sourceType === 'tab') {
            tabImageIndex = targetIndex;
        }

        if (targetCellType === 'main') {
            mainImageIndex = sourceIndex;
        } else if (targetCellType === 'tab') {
            tabImageIndex = sourceIndex;
        }

        // 交換圖片數據 - 關鍵是交換file和dataUrl，但保留type和cellIndex
        imageFiles[sourceIndex] = {
            file: tempTargetData.file,
            dataUrl: tempTargetData.dataUrl,
            type: tempSourceData.type,
            cellIndex: tempSourceData.cellIndex
        };

        imageFiles[targetIndex] = {
            file: tempSourceData.file,
            dataUrl: tempSourceData.dataUrl,
            type: tempTargetData.type,
            cellIndex: tempTargetData.cellIndex
        };

        // 清除兩個位置的顯示
        clearCellImage(sourceType, sourceCellIndex);
        clearCellImage(targetCellType, targetCellIndex);

        // 重新顯示交換後的圖片
        updateCellImage(sourceType, imageFiles[sourceIndex], sourceIndex);
        updateCellImage(targetCellType, imageFiles[targetIndex], targetIndex);

        console.log(`互換完成: 主圖片索引=${mainImageIndex}, 標籤圖片索引=${tabImageIndex}`);
        showStatus('圖片已互換位置', 'success');
    } else {
        // 目標位置沒有圖片，直接移動
        console.log(`移動圖片: ${sourceIndex}(${sourceType}) -> ${targetCellType}`);

        // 如果是移動到主圖片或標籤圖片
        if (targetCellType === 'main') {
            // 如果已有主圖片，重新分配原主圖片
            if (mainImageIndex !== -1) {
                const oldMainImage = {...imageFiles[mainImageIndex]};
                // 找一個空的格子放原主圖片
                const emptyCellIndex = findAvailableCellIndex();
                if (emptyCellIndex !== -1) {
                    // 清除原有主圖片位置
                    clearCellImage('main', 0);

                    // 更新原主圖片為一般圖片
                    imageFiles[mainImageIndex] = {
                        ...oldMainImage,
                        type: 'regular',
                        cellIndex: emptyCellIndex
                    };

                    // 顯示在新位置
                    updateCellImage('regular', imageFiles[mainImageIndex], mainImageIndex);
                } else {
                    showStatus('沒有足夠的空格來移動圖片', 'error');
                    return;
                }
            }

            // 清除原圖片位置
            clearCellImage(sourceType, sourceCellIndex);

            // 設置新的主圖片
            mainImageIndex = sourceIndex;
            imageFiles[sourceIndex] = {
                ...sourceImage,
                type: 'main',
                cellIndex: 0
            };

            // 顯示新主圖片
            updateCellImage('main', imageFiles[sourceIndex], sourceIndex);

            showStatus('已設定為主圖片', 'success');
        } else if (targetCellType === 'tab') {
            // 如果已有標籤圖片，重新分配原標籤圖片
            if (tabImageIndex !== -1) {
                const oldTabImage = {...imageFiles[tabImageIndex]};
                // 找一個空的格子放原標籤圖片
                const emptyCellIndex = findAvailableCellIndex();
                if (emptyCellIndex !== -1) {
                    // 清除原有標籤圖片位置
                    clearCellImage('tab', 0);

                    // 更新原標籤圖片為一般圖片
                    imageFiles[tabImageIndex] = {
                        ...oldTabImage,
                        type: 'regular',
                        cellIndex: emptyCellIndex
                    };

                    // 顯示在新位置
                    updateCellImage('regular', imageFiles[tabImageIndex], tabImageIndex);
                } else {
                    showStatus('沒有足夠的空格來移動圖片', 'error');
                    return;
                }
            }

            // 清除原圖片位置
            clearCellImage(sourceType, sourceCellIndex);

            // 設置新的標籤圖片
            tabImageIndex = sourceIndex;
            imageFiles[sourceIndex] = {
                ...sourceImage,
                type: 'tab',
                cellIndex: 0
            };

            // 顯示新標籤圖片
            updateCellImage('tab', imageFiles[sourceIndex], sourceIndex);

            showStatus('已設定為標籤圖片', 'success');
        } else {
            // 移動到一般格子
            // 清除原位置
            clearCellImage(sourceType, sourceCellIndex);

            // 更新圖片資訊
            imageFiles[sourceIndex] = {
                ...sourceImage,
                type: 'regular',
                cellIndex: targetCellIndex
            };

            // 顯示在新位置
            updateCellImage('regular', imageFiles[sourceIndex], sourceIndex);

            showStatus('圖片已移動', 'success');
        }
    }

    // 每次移動後重新設置拖放功能
    setupDragDrop();
}

// 更新單元格圖片
function updateCellImage(cellType, imageData, imageIndex) {
    let selector;

    // 根據單元格類型找到對應的DOM元素
    if (cellType === 'main') {
        selector = '.main-cell .cell-inner';
    } else if (cellType === 'tab') {
        selector = '.tab-cell .cell-inner';
    } else {
        selector = `.grid-cell:not(.special-cell) .cell-inner[data-index="${imageData.cellIndex}"]`;
    }

    console.log('更新圖片選擇器:', selector);
    console.log('更新圖片數據:', imageData);

    const cellInner = document.querySelector(selector);
    if (!cellInner) {
        console.error(`找不到單元格: ${selector}, cellType=${cellType}, cellIndex=${imageData.cellIndex}`);
        return;
    }

    // 移除舊的圖片
    const oldImage = cellInner.querySelector('.cell-image');
    if (oldImage) {
        oldImage.remove();
    }

    // 添加新的圖片
    const img = document.createElement('img');
    img.src = imageData.dataUrl;
    img.className = 'cell-image';
    img.setAttribute('draggable', 'true');
    img.dataset.index = imageIndex;
    img.dataset.cellIndex = imageData.cellIndex;

    cellInner.appendChild(img);
    cellInner.classList.add('has-image');

    // 隱藏占位符內容
    const placeholder = cellInner.querySelector('.placeholder-content');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    console.log(`更新圖片完成: 類型=${cellType}, 索引=${imageIndex}, 單元格索引=${imageData.cellIndex}`);

    // 重新設置拖曳功能
    setTimeout(() => {
        setupDragDrop();
    }, 100);
}

// 清除單元格圖片
function clearCellImage(cellType, cellIndex) {
    let selector;

    if (cellType === 'main') {
        selector = '.main-cell .cell-inner';
    } else if (cellType === 'tab') {
        selector = '.tab-cell .cell-inner';
    } else {
        selector = `.grid-cell:not(.special-cell) .cell-inner[data-index="${cellIndex}"]`;
    }

    const cellInner = document.querySelector(selector);
    if (!cellInner) {
        console.error(`找不到單元格: ${selector}`);
        return;
    }

    // 移除圖片
    const image = cellInner.querySelector('.cell-image');
    if (image) {
        image.remove();
    }

    // 恢復占位符
    cellInner.classList.remove('has-image');
    const placeholder = cellInner.querySelector('.placeholder-content');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }

    console.log(`清除圖片: 類型=${cellType}, 索引=${cellIndex}`);
}

// 查找可用的單元格索引
function findAvailableCellIndex() {
    // 獲取所有被使用的單元格索引
    const usedIndices = imageFiles
        .filter(img => img.type === 'regular')
        .map(img => img.cellIndex);

    // 查找未使用的索引
    for (let i = 1; i <= gridCells.length; i++) {
        if (!usedIndices.includes(i)) {
            return i;
        }
    }

    return -1;
}

// 獲取所有可用的單元格
function getAvailableCells() {
    // 獲取所有已使用的單元格索引
    const usedIndices = imageFiles
        .filter(img => img.type === 'regular')
        .map(img => img.cellIndex);

    // 獲取所有未使用的單元格
    return gridCells.filter(cell => {
        const index = parseInt(cell.dataset.index);
        return !usedIndices.includes(index);
    });
}

// 刷新網格中的圖片，用於網格大小變化時
function refreshGridImages() {
    // 清除所有單元格圖片
    document.querySelectorAll('.cell-inner.has-image').forEach(cell => {
        cell.classList.remove('has-image');
        const image = cell.querySelector('.cell-image');
        if (image) image.remove();
        const placeholder = cell.querySelector('.placeholder-content');
        if (placeholder) placeholder.style.display = 'flex';
    });

    // 重新填充圖片
    for (let i = 0; i < imageFiles.length; i++) {
        const img = imageFiles[i];

        if (img.type === 'main') {
            updateCellImage('main', img, i);
        } else if (img.type === 'tab') {
            updateCellImage('tab', img, i);
        } else {
            updateCellImage('regular', img, i);
        }
    }

    // 更新拖放設置
    setupDragDrop();
}

// 更新按鈕狀態
function updateButtonStates() {
    // 至少有主圖片和標籤圖片時，啟用處理按鈕
    processBtn.disabled = mainImageIndex === -1 || tabImageIndex === -1;
}

// 切換設定面板
function toggleSettings() {
    settingsPanel.classList.toggle('open');
    overlay.classList.toggle('active');
}

// 顯示狀態訊息
function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
    status.classList.add('show');

    // 設置自動消失
    setTimeout(() => {
        status.classList.remove('show');
    }, 3000);
}

// 調整圖片大小
async function resizeImage(dataUrl, option = 'max') {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            let dx = 0;
            let dy = 0;
            let dWidth, dHeight;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (option === 'main') {
                // 使用主圖片尺寸設定 (240x240)
                const { width: maxWidth, height: maxHeight } = window.mainImageSize;
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                ctx.clearRect(0, 0, maxWidth, maxHeight);

                const scale = Math.min(maxWidth / width, maxHeight / height);
                dWidth = Math.floor(width * scale);
                dHeight = Math.floor(height * scale);

                dWidth = dWidth % 2 !== 0 ? dWidth - 1 : dWidth;
                dHeight = dHeight % 2 !== 0 ? dHeight - 1 : dHeight;

                dx = Math.floor((maxWidth - dWidth) / 2);
                dy = Math.floor((maxHeight - dHeight) / 2);

                ctx.drawImage(img, dx, dy, dWidth, dHeight);
            } else if (option === 'tab') {
                // 標籤圖片固定尺寸 (96x74)
                const tabWidth = 96;
                const tabHeight = 74;
                canvas.width = tabWidth;
                canvas.height = tabHeight;
                ctx.clearRect(0, 0, tabWidth, tabHeight);

                const scale = Math.min(tabWidth / width, tabHeight / height);
                dWidth = Math.floor(width * scale);
                dHeight = Math.floor(height * scale);

                dWidth = dWidth % 2 !== 0 ? dWidth - 1 : dWidth;
                dHeight = dHeight % 2 !== 0 ? dHeight - 1 : dHeight;

                dx = Math.floor((tabWidth - dWidth) / 2);
                dy = Math.floor((tabHeight - dHeight) / 2);

                ctx.drawImage(img, dx, dy, dWidth, dHeight);
            } else {
                // 使用最大圖片尺寸設定
                const { width: maxWidth, height: maxHeight } = window.maxImageSize;
                if (width > maxWidth) {
                    height = Math.floor((height * maxWidth) / width);
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = Math.floor((width * maxHeight) / height);
                    height = maxHeight;
                }

                width = width % 2 !== 0 ? width - 1 : width;
                height = height % 2 !== 0 ? height - 1 : height;

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
            }

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        };

        img.src = dataUrl;
    });
}

// 處理圖片並生成 ZIP
async function processImages() {
    // 檢查主圖片和標籤圖片
    if (mainImageIndex === -1 || tabImageIndex === -1) {
        showStatus('請先選擇主圖片和標籤圖片', 'error');
        return;
    }

    // 檢查 LINE 貼圖數量規範 (不含 main 和 tab)
    const regularImages = imageFiles.filter(img => img.type === 'regular');
    const regularCount = regularImages.length;

    if (!LINE_STICKER_COUNTS.includes(regularCount)) {
        const proceed = confirm(
            `LINE 貼圖數量應為 ${LINE_STICKER_COUNTS.join('、')} 張（不含主圖和標籤圖）。\n` +
            `您目前有 ${regularCount} 張貼圖（不含主圖和標籤圖）。\n` +
            `是否仍要繼續處理？`
        );

        if (!proceed) {
            return;
        }
    }

    // 更新按鈕為處理中狀態
    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="processing-indicator"></span>處理中...';

    try {
        showStatus('正在處理圖片...', 'info');

        // 創建 ZIP 檔案
        const zip = new JSZip();

        // 處理主圖片 (240x240)
        const mainImg = await resizeImage(
            imageFiles[mainImageIndex].dataUrl,
            'main'  // 使用 'main' 選項，會自動使用 mainImageSize 設定
        );
        zip.file('main.png', mainImg);

        // 處理標籤圖片 (96x74)
        const tabImg = await resizeImage(
            imageFiles[tabImageIndex].dataUrl,
            'tab'  // 新增 'tab' 選項處理
        );
        zip.file('tab.png', tabImg);

        // 排序一般貼圖
        const sortedRegularImages = [...regularImages].sort((a, b) => a.cellIndex - b.cellIndex);

        // 處理一般貼圖
        for (let i = 0; i < sortedRegularImages.length; i++) {
            const img = sortedRegularImages[i];
            const filename = String(i + 1).padStart(2, '0') + '.png';

            // 調整圖片大小
            const resizedImg = await resizeImage(img.dataUrl, 'max');

            // 添加到 ZIP
            zip.file(filename, resizedImg);

            // 更新狀態
            showStatus(`處理圖片 ${i + 1}/${sortedRegularImages.length}...`, 'info');
        }

        // 生成並下載 ZIP
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });

        // 創建下載連結
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'line_stickers.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus('貼圖包已成功產生並下載！', 'success');
    } catch (error) {
        console.error('處理圖片時發生錯誤:', error);
        showStatus('處理圖片時發生錯誤: ' + error.message, 'error');
    } finally {
        // 恢復按鈕狀態
        processBtn.disabled = false;
        processBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            產生貼圖
        `;
    }
}

// 更新主圖片
async function updateMainImage(file) {
    try {
        const dataUrl = await readFileAsDataURL(file);
        const resizedBlob = await resizeImage(dataUrl, 'main');
        const resizedDataUrl = await blobToDataURL(resizedBlob);

        const mainCell = document.querySelector('.cell[data-type="main"]');
        if (mainCell) {
            updateCellImage('main', 0, resizedDataUrl);
            window.mainImage = resizedDataUrl;
        }
    } catch (error) {
        console.error('更新主圖片時發生錯誤：', error);
    }
}
