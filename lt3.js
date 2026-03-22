let tireData = JSON.parse(localStorage.getItem("tireData")) || [
  { carNo: "京A12345", customer: "张先生", tireSpec: "205/55R16", location: "A区03柜", storageDate: "2026-03-10" },
  { carNo: "沪B67890", customer: "李女士", tireSpec: "225/45R18", location: "B区12柜", storageDate: "2026-03-15" }
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
  const val = document.getElementById("carInput").value.trim().toUpperCase();
  const area = document.getElementById("resultArea");
  if (!val) {
    area.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-triangle-exclamation"></i><p>请输入车牌号</p></div>`;
    return;
  }
  const item = tireData.find(i => i.carNo === val);
  if (item) {
    area.innerHTML = `
      <div style="line-height:2;">
        <div style="font-size:18px; font-weight:bold; color:#1e40af; margin-bottom:10px;">✅ 查询成功</div>
        <div>车牌号：${item.carNo}</div>
        <div>客户：${item.customer}</div>
        <div>规格：${item.tireSpec}</div>
        <div>位置：${item.location}</div>
        <div>日期：${item.storageDate}</div>
      </div>`;
  } else {
    area.innerHTML = `<div class="empty-tip"><i class="fa-solid fa-xmark"></i><p>未找到车牌号：${val}</p></div>`;
  }
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
        <strong>${item.carNo}</strong>｜${item.customer}｜${item.tireSpec}｜${item.location}
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
  const carNo = document.getElementById("addCarNo").value.trim().toUpperCase();
  const customer = document.getElementById("addCustomer").value.trim();
  const tireSpec = document.getElementById("addTireSpec").value.trim();
  const location = document.getElementById("addLocation").value.trim();
  const storageDate = new Date().toISOString().split("T")[0];

  if (!carNo || !customer || !tireSpec || !location) {
    alert("请填写完整信息！");
    return;
  }
  if (tireData.some(i => i.carNo === carNo)) {
    alert("该车牌号已存在！");
    return;
  }
  tireData.push({ carNo, customer, tireSpec, location, storageDate });
  saveData();
  alert("添加成功！");
  document.getElementById("addCarNo").value = "";
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
  alert("导出成功！可微信发送到其他设备导入");
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
    } catch {
      alert("文件格式错误！");
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm("⚠️ 危险操作！将删除所有数据，无法恢复！\n确定继续？")) {
    if (confirm("🔁 再次确认：真的要清空所有数据吗？")) {
      tireData = [];
      saveData();
      renderList();
      alert("✅ 所有数据已清空！");
    }
  }
}
