// Supabase 配置
const SUPABASE_URL = 'https://fafulmnczqmsebhibmds.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZnVsbW5jenFtc2ViaGlibWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3NTM4ODUsImV4cCI6MjA1MDMyOTg4NX0.7a4I_m06ICUbH5Z8LutXVDcT8lN7Hl6x6QzCraGTA7g';

// 初始化 Supabase 客戶端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 更新訪問統計顯示
async function updateVisitDisplay() {
    try {
        const stats = await getVisitStats();
        document.getElementById('todayVisits').textContent = stats.today;
        document.getElementById('totalVisits').textContent = stats.total;
    } catch (error) {
        console.error('更新訪問統計顯示時發生錯誤:', error);
    }
}

// 記錄訪問
async function recordVisit() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 檢查今天是否已有記錄
        const { data: existingVisit, error: selectError } = await supabaseClient
            .from('daily_visits')
            .select('*')
            .eq('visit_date', today)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error('查詢訪問記錄時發生錯誤:', selectError);
            return;
        }

        if (existingVisit) {
            // 更新今天的訪問次數
            const { error: updateError } = await supabaseClient
                .from('daily_visits')
                .update({
                    visit_count: existingVisit.visit_count + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('visit_date', today);

            if (updateError) {
                console.error('更新每日訪問次數時發生錯誤:', updateError);
                return;
            }
        } else {
            // 創建新的一天的訪問記錄
            const { error: insertError } = await supabaseClient
                .from('daily_visits')
                .insert([
                    {
                        visit_date: today,
                        visit_count: 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error('創建每日訪問記錄時發生錯誤:', insertError);
                return;
            }
        }

        // 更新總訪問次數
        const { data: totalVisits, error: totalSelectError } = await supabaseClient
            .from('total_visits')
            .select('*')
            .single();

        if (totalSelectError && totalSelectError.code !== 'PGRST116') {
            console.error('查詢總訪問次數時發生錯誤:', totalSelectError);
            return;
        }

        if (totalVisits) {
            const { error: totalUpdateError } = await supabaseClient
                .from('total_visits')
                .update({
                    total_count: totalVisits.total_count + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', totalVisits.id);

            if (totalUpdateError) {
                console.error('更新總訪問次數時發生錯誤:', totalUpdateError);
                return;
            }
        } else {
            const { error: totalInsertError } = await supabaseClient
                .from('total_visits')
                .insert([
                    {
                        id: 1,
                        total_count: 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (totalInsertError) {
                console.error('創建總訪問記錄時發生錯誤:', totalInsertError);
                return;
            }
        }

        // 更新顯示
        await updateVisitDisplay();
    } catch (error) {
        console.error('記錄訪問時發生錯誤:', error);
    }
}

// 獲取訪問統計
async function getVisitStats() {
    try {
        // 獲取今天的訪問次數
        const today = new Date().toISOString().split('T')[0];
        const { data: todayVisits, error: todayError } = await supabaseClient
            .from('daily_visits')
            .select('visit_count')
            .eq('visit_date', today)
            .single();

        if (todayError && todayError.code !== 'PGRST116') {
            console.error('獲取今日訪問次數時發生錯誤:', todayError);
        }

        // 獲取總訪問次數
        const { data: totalVisits, error: totalError } = await supabaseClient
            .from('total_visits')
            .select('total_count')
            .single();

        if (totalError && totalError.code !== 'PGRST116') {
            console.error('獲取總訪問次數時發生錯誤:', totalError);
        }

        return {
            today: todayVisits?.visit_count || 0,
            total: totalVisits?.total_count || 0
        };
    } catch (error) {
        console.error('獲取訪問統計時發生錯誤:', error);
        return { today: 0, total: 0 };
    }
}

// 當頁面載入時記錄訪問並開始定期更新顯示
document.addEventListener('DOMContentLoaded', () => {
    recordVisit();
    // 每分鐘更新一次顯示
    setInterval(updateVisitDisplay, 60000);
});
