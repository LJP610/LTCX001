let tireData = JSON.parse(localStorage.getItem("tireData")) || [
  {
    carNo: "京A12345",
    phone: "13800138000",
    customer: "张先生",
    tireSpec: "205/55R16",
    location: "A区03柜",
    storageDate: "2026-03-10"
  },
  {
    carNo: "沪B67890",
    phone: "13912345678",
    customer: "李女士",
    tireSpec: "225/45R18",
    location: "B区12柜",
    storageDate: "2026-03-15"
  }
];

function saveData() {
  localStorage.setItem("tireData", JSON.stringify(tireData));
}

function showTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(tabName + "Tab").classList.add("active");
  document.querySelector(`.nav-item[onclick="showTab('${tabName}')"]`).classList.add("active");
  if (tabName === "list") renderList();
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
      <button class="del-btn" onclick="delItem(${idx})">删除</button>
    </div>
  `).join("");
}

function delItem(index) {
  if (confirm("确定删除这条记录？")) {
    tireData.splice(index, 1);
    saveData();
    renderList();
  }
}

function addTireRecord() {
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

  tireData.push({
    carNo, phone, customer, tireSpec, location, storageDate
  });
  saveData();
  alert("添加成功！");

  document.getElementById("addCarNo").value = "";
  document.getElementById("addPhone").value = "";
  document.getElementById("addCustomer").value = "";
  document.getElementById("addTireSpec").value = "";
  document.getElementById("addLocation").value = "";
}

function exportData() {
  const str = JSON.stringify(tireData, null, 2);
  const blob = new Blob([str], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "轮胎数据.json";
  a.click();
  URL.revokeObjectURL(url);
  alert("导出成功！");
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (confirm("导入会覆盖当前数据，确定继续？")) {
        tireData = data;
        saveData();
        alert("导入成功！");
        renderList();
      }
    } c
