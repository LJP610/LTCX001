// 1. 初始化 Supabase 客户端（替换为你的项目信息）
const supabaseUrl = "<你的Supabase URL>";
const supabaseKey = "<你的anon密钥>";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. 关键词高亮处理（保留原有逻辑）
function highlightText(text, keyword) {
  if (!keyword || !text) return text || "无";
  return text.replace(new RegExp(keyword, "gi"), match => `<span class="highlight">${match}</span>`);
}

// 3. 切换标签页（保留原有逻辑，仅修改列表渲染为云数据）
function showTab(tabName) {
  document.querySelectorAll(".tab, .nav-item").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.add("active");
  document.querySelector(`.nav-item[onclick="showTab('${tabName}')"]`).classList.add("active");
  if (tabName === "list") renderList(); // 改为从云数据库渲染
}

// 4. 从 Supabase 获取所有记录
async function getAllTireRecords() {
  const { data, error } = await supabase
    .from('tire_records')
    .select('*')
    .order('created_at', { ascending: false }); // 按创建时间倒序
  
  if (error) {
    alert(`获取数据失败：${error.message}`);
    return [];
  }
  return data;
}

// 5. 渲染全部列表（改为从云数据库获取）
async function renderList() {
  const listBox = document.getElementById("tireList");
  listBox.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-spinner fa-spin"></i><p>加载中...</p></div>`;
  
  const tireData = await getAllTireRecords();
  if (tireData.length === 0) {
    listBox.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-inbox"></i><p>暂无记录</p></div>`;
    return;
  }
  
  listBox.innerHTML = tireData.map((item, idx) => `
    <div class="item-row" data-id="${item.id}">
      <div class="item-info">
        <strong>${item.car_no || '无牌'}</strong>｜${item.phone || '无电话'}｜${item.customer}｜${item.tire_spec || '无规格'}
      </div>
      <button class="del-btn" onclick="delItem('${item.id}')">删除</button>
    </div>
  `).join("");
}

// 6. 多条件查询（改为从云数据库查询）
async function searchCar() {
  const kw = document.getElementById("searchInput").value.trim();
  const resultArea = document.getElementById("resultArea");

  if (!kw) {
    resultArea.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-triangle-exclamation"></i><p>请输入查询内容</p></div>`;
    return;
  }

  // 显示加载状态
  resultArea.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-spinner fa-spin"></i><p>查询中...</p></div>`;

  // 从云数据库筛选数据
  const tireData = await getAllTireRecords();
  const results = tireData.filter(item => {
    const carLast4 = (item.car_no || "").slice(-4);
    const phoneLast4 = (item.phone || "").slice(-4);
    return carLast4.includes(kw) || phoneLast4.includes(kw) || (item.customer || "").includes(kw);
  });

  if (results.length === 0) {
    resultArea.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-xmark"></i><p>未找到匹配记录</p></div>`;
    return;
  }

  // 渲染带高亮的结果
  let html = "";
  results.forEach((item, i) => {
    html += `
      <div style="padding:12px; border-bottom:1px solid #eee; line-height:1.8;">
        <div style="font-weight:bold; color:#1e40af; font-size:16px;">匹配记录 ${i+1}</div>
        <div>车牌号：${highlightText(item.car_no, kw)}</div>
        <div>手机号：${highlightText(item.phone, kw)}</div>
        <div>客户：${highlightText(item.customer, kw)}</div>
        <div>轮胎规格：${highlightText(item.tire_spec, kw)}</div>
        <div>存放位置：${item.location}</div>
        <div>日期：${item.storage_date}</div>
      </div>
    `;
  });
  resultArea.innerHTML = html;
}

// 7. 删除单条记录（改为删除云数据库数据）
async function delItem(recordId) {
  if (!confirm("确定删除这条记录？")) return;

  const { error } = await supabase
    .from('tire_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    alert(`删除失败：${error.message}`);
    return;
  }

  alert("删除成功！");
  renderList();
}

// 8. 新增记录（改为保存到云数据库）
async function addTireRecord() {
  // 获取表单值
  const carNo = document.getElementById("addCarNo").value.trim();
  const phone = document.getElementById("addPhone").value.trim();
  const customer = document.getElementById("addCustomer").value.trim();
  const tireSpec = document.getElementById("addTireSpec").value.trim();
  const location = document.getElementById("addLocation").value.trim();
  const storageDate = new Date().toISOString().split("T")[0];

  // 基础校验
  if (!carNo && !phone && !customer) {
    alert("车牌、手机号、姓名至少填写一项！");
    return;
  }
  if (!location) {
    alert("请填写存放位置！");
    return;
  }
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
    alert("手机号格式错误（请填写11位有效手机号）！");
    return;
  }

  // 保存到云数据库
  const { error } = await supabase
    .from('tire_records')
    .insert([{
      car_no: carNo,
      phone: phone,
      customer: customer,
      tire_spec: tireSpec,
      location: location,
      storage_date: storageDate
    }]);

  if (error) {
    alert(`添加失败：${error.message}`);
    return;
  }

  alert("添加成功！");
  // 清空表单
  document.querySelectorAll("#addTab input").forEach(input => input.value = "");
  // 自动切换到列表页
  showTab("list");
}

// 9. 导出数据（从云数据库导出）
async function exportData() {
  const tireData = await getAllTireRecords();
  const blob = new Blob([JSON.stringify(tireData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `轮胎数据_${new Date().toLocaleDateString()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  alert("导出成功！");
}

// 10. 导入数据（导入到云数据库）
async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const importedData = JSON.parse(ev.target.result);
      if (!confirm("导入会覆盖当前所有云数据，确定继续？")) return;

      // 先清空现有数据
      await supabase.from('tire_records').delete().not('id', 'eq', '');
      // 批量导入新数据
      const formattedData = importedData.map(item => ({
        car_no: item.carNo || item.car_no,
        phone: item.phone,
        customer: item.customer,
        tire_spec: item.tireSpec || item.tire_spec,
        location: item.location,
        storage_date: item.storageDate || item.storage_date
      }));

      const { error } = await supabase
        .from('tire_records')
        .insert(formattedData);

      if (error) {
        alert(`导入失败：${error.message}`);
        return;
      }

      alert("导入成功！");
      renderList();
    } catch (err) {
      alert("文件格式错误！请上传JSON文件");
    }
  };
  reader.readAsText(file);
}

// 11. 清空所有数据（清空云数据库）
async function clearAllData() {
  if (!confirm("⚠️ 危险操作！将删除云端所有数据，无法恢复！\n确定继续？") || !confirm("🔁 再次确认：真的要清空所有数据吗？")) {
    return;
  }

  const { error } = await supabase
    .from('tire_records')
    .delete()
    .not('id', 'eq', ''); // 条件：id不等于空（即删除所有）

  if (error) {
    alert(`清空失败：${error.message}`);
    return;
  }

  alert("✅ 云端所有数据已清空！");
  renderList();
}

// 初始化：页面加载后渲染列表
window.onload = () => {
  renderList();
};
