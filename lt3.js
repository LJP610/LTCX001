const SUPABASE_URL = "https://kdfyfblpfgmupdgariske.supabase.co";
const SUPABASE_KEY = "sb_publishable_9c9-Zb9mSfptFG6um-819w_BtLX3k8R";
window.onload = function() {
  // 1. 正确初始化Supabase（CDN引入后的唯一正确写法）
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // 2. 标签切换功能（修复点击不生效问题）
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      // 清除所有激活状态
      navItems.forEach(i => i.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      // 激活当前标签
      item.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      // 切换到列表页时，刷新数据
      if (targetTab === 'list') {
        loadList();
      }
    });
  });

  // 3. 加载记录列表（全局可用，修复删除按钮绑定问题）
  window.loadList = async function(keyword = '') {
    try {
      // 从数据库查询数据
      const { data, error } = await supabase
        .from('tire_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 搜索过滤
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
          <button class="del-btn" onclick="deleteItem('${item.id}')">删除</button>
        </div>
      `).join('');

      // 空数据提示
      document.getElementById('listContainer').innerHTML = listHtml || '<div class="empty-tip">暂无记录</div>';
    } catch (err) {
      console.error('加载列表失败：', err);
      alert('加载数据失败：' + err.message);
    }
  };

  // 4. 删除记录功能（全局可用，修复点击无反应问题）
  window.deleteItem = async function(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const { error } = await supabase.from('tire_records').delete().eq('id', id);
      if (error) throw error;
      // 删除成功后刷新列表
      loadList();
    } catch (err) {
      console.error('删除失败：', err);
      alert('删除失败：' + err.message);
    }
  };

  // 5. 全局搜索功能（实时过滤）
  document.getElementById('searchAll').addEventListener('input', (e) => {
    loadList(e.target.value.trim());
  });

  // 6. 保存记录功能（修复表单提交问题）
  document.getElementById('saveBtn').addEventListener('click', async () => {
    // 获取表单数据
    const carNo = document.getElementById('carNo').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const customer = document.getElementById('customer').value.trim();
    const tireSpec = document.getElementById('tireSpec').value.trim();
    const location = document.getElementById('location').value.trim();

    // 必填项校验
    if (!carNo || !phone || !customer) {
      alert('请填写车牌号、手机号、客户姓名（必填项）');
      return;
    }

    try {
      // 插入数据到数据库
      const { error } = await supabase.from('tire_records').insert([
        { carNo, phone, customer, tireSpec, location }
      ]);
      if (error) throw error;

      alert('保存成功！');
      // 清空表单
      document.querySelectorAll('#add input').forEach(input => input.value = '');
      // 自动跳转到列表页
      navItems[0].click();
    } catch (err) {
      console.error('保存失败：', err);
      alert('保存失败：' + err.message);
    }
  });

  // 7. 高级查询功能（修复多条件查询问题）
  document.getElementById('searchBtn').addEventListener('click', async () => {
    // 获取查询条件
    const carNo = document.getElementById('q_car').value.trim();
    const phone = document.getElementById('q_phone').value.trim();
    const customer = document.getElementById('q_name').value.trim();

    try {
      // 构建查询
      let query = supabase.from('tire_records').select('*');
      if (carNo) query = query.ilike('carNo', `%${carNo}`);
      if (phone) query = query.ilike('phone', `%${phone}`);
      if (customer) query = query.ilike('customer', `%${customer}%`);

      const { data } = await query;
      const resultBox = document.getElementById('searchResult');

      // 空结果提示
      if (!data || data.length === 0) {
        resultBox.innerHTML = '<div class="empty-tip">未找到匹配的记录</div>';
        return;
      }

      // 渲染查询结果
      resultBox.innerHTML = data.map(item => `
        <div class="item-info" style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.carNo}</strong>
          <div>${item.customer} | ${item.phone}</div>
          <div>${item.tireSpec} | 存放位置：${item.location}</div>
        </div>
      `).join('');
    } catch (err) {
      console.error('查询失败：', err);
      alert('查询失败：' + err.message);
    }
  });

  // 8. 页面初始化，加载列表
  loadList();
};
