// 1. 初始化 Supabase 客户端（替换为你的正确信息）
const supabaseUrl = "你的Project URL"; // 比如 https://abc123.supabase.co
const supabaseKey = "你的anon密钥"; // 以eyJhbGci开头的长字符串
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. 关键词高亮（不变）
function highlightText(text, keyword) {
  if (!keyword || !text) return text || "无";
  return text.replace(new RegExp(keyword, "gi"), match => `<span class="highlight">${match}</span>`);
}

// 3. 切换标签页（不变）
function showTab(tabName) {
  document.querySelectorAll(".tab, .nav-item").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.add("active");
  document.querySelector(`.nav-item[onclick="showTab('${tabName}')"]`).classList.add("active");
  if (tabName === "list") renderList();
}

// 4. 从 Supabase 获取所有记录（优化：增加错误兜底）
async function getAllTireRecords() {
  try {
    const { data, error } = await supabase
      .from('tire_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  } catch (err) {
    alert(`获取数据失败：${err.message}`);
    return [];
  }
}

// 5. 渲染全部列表（核心优化：无论成败都停止加载）
async function renderList() {
  const listBox = document.getElementById("tireList");
  // 显示加载中
  listBox.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-spinner fa-spin"></i><p>加载中...</p></div>`;
  
  try {
    const tireData = await getAllTireRecords();
    // 停止加载，渲染数据
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
  } catch (err) {
    // 出错时停止加载，显示错误提示
    listBox.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-exclamation-circle"></i><p>加载失败：${err.message}</p></div>`;
  }
}

// 其他函数（searchCar/delItem/addTireRecord等）保持不变，仅需确保每个异步函数都有try/catch
// 以下是新增/删除/导入导出的优化版（带错误处理）：
async function addTireRecord() {
  const carNo = document.getElementById("addCarNo").value.trim();
  const phone = document.getElementById("addPhone").value.trim();
  const customer = document.getElementById("addCustomer").value.trim();
  const tireSpec = document.getElementById("addTireSpec").value.trim();
  const location = document.getElementById("addLocation").value.trim();
  const storageDate = new Date().toISOString().split("T")[0];

  // 基础校验（不变）
  if (!carNo && !phone && !customer) {
    alert("车牌、手机号、姓名至少填写一项！");
    return;
  }
  if (!location) {
    alert("请填写存放位置！");
    return;
  }
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
    alert("手机号格式错误！");
    return;
  }

  try {
    const { error } = await supabase
      .from('tire_records')
      .insert([{
        car_no: carNo, phone: phone, customer: customer,
        tire_spec: tireSpec, location: location, storage_date: storageDate
      }]);
    if (error) throw new Error(error.message);
    
    alert("添加成功！");
    document.querySelectorAll("#addTab input").forEach(input => input.value = "");
    showTab("list");
  } catch (err) {
    alert(`添加失败：${err.message}`);
  }
}

async function delItem(recordId) {
  if (!confirm("确定删除？")) return;
  try {
    const { error } = await supabase.from('tire_records').delete().eq('id', recordId);
    if (error) throw new Error(error.message);
    alert("删除成功！");
    renderList();
  } catch (err) {
    alert(`删除失败：${err.message}`);
  }
}

async function clearAllData() {
  if (!confirm("⚠️ 确定清空所有云端数据？") || !confirm("再次确认？")) return;
  try {
    const { error } = await supabase.from('tire_records').delete().not('id', 'eq', '');
    if (error) throw new Error(error.message);
    alert("清空成功！");
    renderList();
  } catch (err) {
    alert(`清空失败：${err.message}`);
  }
}

// 初始化
window.onload = () => {
  renderList();
};
