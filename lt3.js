// ====================== 在这里填你的 Supabase 信息 ======================
const SUPABASE_URL = "sb_publishable_9c9-Zb9m5FptFG6um-8i0w_8WLX3kRR";
// =======================================================================

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
let tireData = [];

async function refreshList() {
  const { data, error } = await supabase
    .from("tire_records")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    alert("加载失败：" + error.message);
    return;
  }
  tireData = data;
  renderList();
}

function showTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.add("active");
  document.querySelector(`.nav-item[onclick="showTab('${tabName}')"]`).classList.add("active");
  if (tabName === "list") refreshList();
}

function searchCar() {
  const kw = document.getElementById("searchInput").value.trim();
  const area = document.getElementById("resultArea");

  if (!kw) {
    area.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-triangle-exclamation"></i><p>请输入查询内容</p></div>`;
    return;
  }

  const results = tireData.filter(item => {
    const carLast4 = (item.carNo || "").slice(-4);
    const phoneLast4 = (item.phone || "").slice(-4);
    const name = (item.customer || "");
    return carLast4.includes(kw) || phoneLast4.includes(kw) || name.includes(kw);
  });

  if (results.length === 0) {
    area.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-xmark"></i><p>未找到匹配记录</p></div>`;
    return;
  }

  let html = `<div style="padding:10px 0;">`;
  results.forEach((item, i) => {
    html += `
      <div style="padding:12px; border-bottom:1px solid #eee; line-height:1.8;">
        <div style="font-weight:bold; color:#1e40af; font-size:16px;">匹配记录 ${i+1}</div>
        <div>车牌号：${item.carNo || '无'}</div>
        <div>手机号：${item.phone || '无'}</div>
        <div>客户：${item.customer || '无'}</div>
        <div>轮胎规格：${item.tireSpec || '无'}</div>
        <div>存放位置：${item.location || '无'}</div>
        <div>日期：${item.storageDate}</div>
      </div>
    `;
  });
  html += `</div>`;
  area.innerHTML = html;
}

function renderList() {
  const box = document.getElementById("tireList");
  if (tireData.length === 0) {
    box.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-inbox"></i><p>暂无记录</p></div>`;
    return;
  }
  box.innerHTML = tireData.map((item, idx) => `
    <div class="item-row">
      <div class="item-info">
        <strong>${item.carNo || '无牌'}</strong>｜${item.phone || '无电话'}｜${item.customer}｜${item.tireSpec || '无规格'}
      </div>
      <button class="del-btn" onclick="delItem(${item.id})">删除</button>
    </div>
  `).join("");
}

async function delItem(id) {
  if (!confirm("确定删除这条记录？")) return;
  const { error } = await supabase.from("tire_records").delete().eq("id", id);
  if (error) {
    alert("删除失败：" + error.message);
  } else {
    alert("删除成功");
    refreshList();
  }
}

async function addTireRecord() {
  const carNo = document.getElementById("addCarNo").value.trim();
  const phone = document.getElementById("addPhone").value.trim();
  const customer = document.getElementById("addCustomer").value.trim();
  const tireSpec = document.getElementById("addTireSpec").value.trim();
  const location = document.getElementById("addLocation").value.trim();
  const storageDate = new Date().toISOString().split("T")[0];

  if (!carNo && !phone && !customer) {
    alert("车牌、手机号、姓名至少填写一项！");
    return;
  }
  if (!location) {
    alert("请填写存放位置！");
    return;
  }

  const { error } = await supabase.from("tire_records").insert([
    { carNo, phone, customer, tireSpec, location, storageDate }
  ]);

  if (error) {
    alert("保存失败：" + error.message);
  } else {
    alert("添加成功！");
    document.getElementById("addCarNo").value = "";
    document.getElementById("addPhone").value = "";
    document.getElementById("addCustomer").value = "";
    document.getElementById("addTireSpec").value = "";
    document.getElementById("addLocation").value = "";
  }
}

async function clearAllData() {
  if (!confirm("⚠️ 危险操作！清空云端所有数据，无法恢复！")) return;
  if (!confirm("🔁 再次确认：真的要清空云端所有数据吗？")) return;
  
  const { error } = await supabase.from("tire_records").delete().gte("id", 0);
  if (error) {
    alert("清空失败：" + error.message);
  } else {
    alert("✅ 所有数据已清空！");
    refreshList();
  }
}

// 页面加载时自动刷新
window.onload = () => {
  showTab('search');
};
