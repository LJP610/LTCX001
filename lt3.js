// 客户轮胎存放数据库（你可以随时增删改）
const tireStorage = [
    { carNo: "京A12345", customer: "张先生", tireSpec: "205/55R16", location: "A区03号柜", storageDate: "2025-03-10" },
    { carNo: "沪B67890", customer: "李女士", tireSpec: "225/45R18", location: "B区12号柜", storageDate: "2025-03-15" },
    { carNo: "粤C24680", customer: "王先生", tireSpec: "215/60R17", location: "C区05号柜", storageDate: "2025-03-20" },
    { carNo: "川D13579", customer: "赵先生", tireSpec: "235/55R19", location: "A区08号柜", storageDate: "2025-03-22" }
];

function searchCar() {
    const input = document.getElementById("carInput").value.trim().toUpperCase(); // 自动转大写，避免大小写问题
    const resultBox = document.getElementById("result");

    if (!input) {
        resultBox.innerHTML = "⚠️ 请输入车牌号后再查询";
        return;
    }

    const found = tireStorage.find(item => item.carNo === input);

    if (found) {
        resultBox.innerHTML = `
            <strong>✅ 找到客户信息：</strong><br>
            车牌号：${found.carNo}<br>
            客户姓名：${found.customer}<br>
            轮胎规格：${found.tireSpec}<br>
            存放位置：${found.location}<br>
            存放日期：${found.storageDate}
        `;
    } else {
        resultBox.innerHTML = `
            ❌ 未找到车牌号「${input}」的存放信息<br>
            请检查车牌号是否正确，或新增该客户记录
        `;
    }
}
