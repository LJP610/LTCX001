const SUPABASE_URL = "https://kdfylbpfgmupdgariske.supabase.co";
const SUPABASE_KEY = "sb_publishable_9c9-Zb9m5FptFG6um-8i0w_8WLX3kRR";

window.onload = function() {
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      navItems.forEach(i => i.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      if (targetTab === 'list') loadList();
    });
  });

  window.loadList = async function(keyword = '') {
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
      document.getElementById('listContainer').innerHTML = listHtml || '<div class="empty-tip">暂无记录</div>';
    } catch (err) {
      alert('加载数据失败：' + err.message);
    }
  };

  window.deleteItem = async function(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const { error } = await supabase.from('tire_records').delete().eq('id', id);
      if (error) throw error;
      loadList();
    } catch (err) {
      alert('删除失败：' + err.message);
    }
  };

  document.getElementById('searchAll').addEventListener('input', (e) => {
    loadList(e.target.value.trim());
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const carNo = document.getElementById('carNo').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const customer = document.getElementById('customer').value.trim();
    const tireSpec = document.getElementById('tireSpec').value.trim();
    const location = document.getElementById('location').value.trim();

    if (!carNo || !phone || !customer) {
      alert('请填写车牌号、手机号、客户姓名');
      return;
    }

    try {
      const { error } = await supabase.from('tire_records').insert([
        { carNo, phone, customer, tireSpec, location }
      ]);
      if (error) throw error;
      alert('保存成功！');
      document.querySelectorAll('#add input').forEach(input => input.value = '');
      navItems[0].click();
    } catch (err) {
      alert('保存失败：' + err.message);
    }
  });

  document.getElementById('searchBtn').addEventListener('click', async () => {
    const carNo = document.getElementById('q_car').value.trim();
    const phone = document.getElementById('q_phone').value.trim();
    const customer = document.getElementById('q_name').value.trim();

    try {
      let query = supabase.from('tire_records').select('*');
      if (carNo) query = query.ilike('carNo', `%${carNo}`);
      if (phone) query = query.ilike('phone', `%${phone}`);
      if (customer) query = query.ilike('customer', `%${customer}%`);

      const { data } = await query;
      const resultBox = document.getElementById('searchResult');

      if (!data || data.length === 0) {
        resultBox.innerHTML = '<div class="empty-tip">未找到匹配的记录</div>';
        return;
      }

      resultBox.innerHTML = data.map(item => `
        <div class="item-info" style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.carNo}</strong>
          <div>${item.customer} | ${item.phone}</div>
          <div>${item.tireSpec} | 存放位置：${item.location}</div>
        </div>
      `).join('');
    } catch (err) {
      alert('查询失败：' + err.message);
    }
  });

  loadList();
};
