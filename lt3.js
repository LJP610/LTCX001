// 填入你的 Supabase 信息
const SUPABASE_URL = "https://kdfyfblpfgmupdgariske.supabase.co";
const SUPABASE_KEY = "sb_publishable_9c9-Zb9m5FptFG6um-8i0w_8WLX3kRR";

// 初始化 Supabase
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);

// 标签切换（修复点击不生效问题）
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetTab = item.dataset.tab;
    // 移除所有激活状态
    navItems.forEach(i => i.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    // 添加当前激活状态
    item.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    // 切换到列表时刷新数据
    if (targetTab === 'list') loadList();
  });
});

// 加载记录列表（修复数据渲染与删除按钮绑定）
async function loadList(keyword = '') {
  try {
    const { data, error } = await supabase
      .from('tire_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    let filteredData = data;
    if (keyword) {
      filteredData = data.filter(item => {
        const carNo = (item.carNo || '').toUpperCase();
        const phone = item.phone || '';
        const customer = item.customer || '';
        return carNo.includes(keyword) || phone.slice(-4).includes(keyword) || customer.includes(keyword);
      });
    }

    // 渲染列表
    const listHtml = filteredData.map(item => `
      <div class="item-row">
        <div class="item-info">
          <strong>${item.carNo}</strong>
          <div>${item.customer} | ${item.phone}</div>
          <div>${item.tireSpec} | 存放位置：${item.location}</div>
        </div>
        <button class="del-btn" data-id="${item.id}">删除</button>
      </div>
    `).join('');
    document.getElementById('listContainer').innerHTML = listHtml || '<div class="empty-tip">暂无记录</div>';

    // 绑定删除事件（修复重复绑定）
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('确定删除该记录？')) return;
        const id = btn.dataset.id;
        await supabase.from('tire_records').delete().eq('id', id);
        loadList();
      });
    });
  } catch (err) {
    console.error('加载列表失败：', err);
    alert('加载失败，请重试');
  }
}

// 全局搜索（实时过滤）
document.getElementById('searchAll').addEventListener('input', (e) => {
  loadList(e.target.value.trim());
});

// 保存记录（修复表单提交与跳转）
document.getElementById('saveBtn').addEventListener('click', async () => {
  const carNo = document.getElementById('carNo').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const customer = document.getElementById('customer').value.trim();
  const tireSpec = document.getElementById('tireSpec').value.trim();
  const location = document.getElementById('location').value.trim();

  if (!carNo || !phone || !customer) {
    alert('请填写车牌号、手机号、客户姓名（必填）');
    return;
  }

  try {
    const { error } = await supabase.from('tire_records').insert([
      { carNo, phone, customer, tireSpec, location }
    ]);
    if (error) throw error;
    alert('保存成功！');
    // 清空表单
    document.querySelectorAll('#add input').forEach(input => input.value = '');
    // 切换到列表页
    navItems[0].click();
  } catch (err) {
    console.error('保存失败：', err);
    alert('保存失败：' + err.message);
  }
});

// 高级查询（修复多条件查询逻辑）
document.getElementById('searchBtn').addEventListener('click', async () => {
  const car = document.getElementById('q_car').value.trim();
  const phone = document.getElementById('q_phone').value.trim();
  const name = document.getElementById('q_name').value.trim();

  try {
    let query = supabase.from('tire_records').select('*');
    if (car) query = query.ilike('carNo', `%${car}`);
    if (phone) query = query.ilike('phone', `%${phone}`);
    if (name) query = query.ilike('customer', `%${name}%`);

    const { data } = await query;
    const resultBox = document.getElementById('searchResult');

    if (!data || data.length === 0) {
      resultBox.innerHTML = '<div class="empty-tip">未找到匹配记录</div>';
      return;
    }

    resultBox.innerHTML = data.map(item => `
      <div class="item-info" style="margin-bottom:12px;">
        <strong>${item.carNo}</strong>
        <div>${item.customer} | ${item.phone}</div>
        <div>${item.tireSpec} | ${item.location}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('查询失败：', err);
    alert('查询失败，请重试');
  }
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  loadList();
});
