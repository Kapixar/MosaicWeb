const errorBar = document.querySelector('#error_bar');
const tBody = document.querySelector('table tbody');
const table = document.querySelector('table');
const search = document.querySelector('#search_user');
downloadData();

document.querySelector('#refresh').onclick = () => { downloadData(); }

const stakes = {
    img: 1,
    iron: 2500,
    paint: 12
}

const cellIndexes = {
    0: 0, 
    1: 1,
    2: 2, 
    3: 4,
    4: 6
}

const removed = ['kapixar', 'mecha.02', 'public', '.floofy.exe'];

document.querySelector('#tickets_iron').textContent = `${stakes.iron / 1000}k`;
document.querySelector('#tickets_ship').textContent = stakes.paint;

async function downloadData() {
    console.log('Starting download');
    try {
        errorBar.classList.add('loading');
        errorBar.textContent = `Loading data...`;
        const res = await fetch('data.json', { method: 'get' })
        if (res.status == 503) {
            const dog = await res.text();
            console.log(dog);
            throw new Error('Bot unavailable');
        }
        else if (res.status == 429) throw new Error('Slow down! Try again later.')
        
        const data = await res.json();
        fillTable(data[0]);
        fillShadow(data[1]);
        errorBar.classList.remove('loading');
        console.log('Download success!');
    } catch (error) {
        errorBar.textContent = `Download failed. ${error}`;
    }
}


function fillTable(users) {
    tBody.replaceChildren();
    let allTickets = 0, sumIronDonated = 0, allUsers = 0, sumIronGathered = 0;
    const rows = [];
    const ships = {};
    for (const data of Object.values(users)) {
        const imgTickets = data.img * stakes.img;
        const ironTickets = Math.round(data.i / stakes.iron * 100) / 100;
        const paintTickets = Math.round(data.p * stakes.paint * 100) / 100 ;

        const sumTickets = Math.round(imgTickets + ironTickets + paintTickets);

        sumIronGathered += data.i;
        if(!removed.includes(data.name)) {
            sumIronDonated += data.i;
            allTickets += sumTickets;
            allUsers++;
        }

        rows.push([data.name, sumTickets,
        data.img ? '✔' : 'X', `${imgTickets}`,
        `${data.i / 1000}k`, `${ironTickets}`,
        data.p, `${paintTickets}`,
        ]);
    }
    rows.sort((a, b) => b[1] - a[1]);
    for (const row of rows) {
        if (removed.includes(row[0])) continue;
        const tr = document.createElement('tr');
        for (const cell of row) {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.append(td);
        }
        tBody.append(tr);
    }
    document.querySelector('th:nth-of-type(2)').classList.add('sorted');
    const rowses = Array.from(tBody.rows);
    const headerCells = table.tHead.rows[0].cells;

    for (const th of headerCells) {
        const cellIndex = cellIndexes[th.cellIndex];

        th.addEventListener("click", () => {
            for (const th2 of headerCells) th2.classList.remove('sorted');
            th.classList.add('sorted');
            rowses.sort((tr1, tr2) => {
                const tr1Text = tr1.cells[cellIndex].textContent;
                const tr2Text = tr2.cells[cellIndex].textContent;
                if(cellIndex == 0 || cellIndex == 2) return tr1Text.localeCompare(tr2Text);
                return parseFloat(tr2Text) - parseFloat(tr1Text);
            });
            tBody.append(...rowses);
        });
    }
    setMobileTable();
    const gatherPerc = 100 - sumIronGathered / 1333200 * 100;
    document.querySelector('#iron_gathered').style = `background: linear-gradient(var(--angle), #c56c1e ${gatherPerc}%, #004d4d ${gatherPerc}%)`;
    document.querySelector('#iron_gathered').setAttribute('title', sumIronGathered);
    document.querySelector('#iron_donated').textContent = sumIronDonated / 1000;
    document.querySelector('#iron_collected').textContent = sumIronGathered / 1000;
    document.querySelector('#tickets_sum').textContent = `${allTickets} (${allUsers} entries)`;

    // const rows = document.querySelectorAll('table tr');
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

fillShadow();

function fillShadow(data = {}) {
    let sumShips = 0;
    for (let y = 0; y < canvas.width; y += 32) {
        for (let x = 0; x < canvas.width; x += 32) {
            ctx.fillStyle = 'rgb(197,108,30)';
            const id = 91 - (y / 32) * 10 + x / 32;
            if (data.hasOwnProperty(id)) {
                ctx.fillStyle = `rgba(0,77,77,${data[id]})`;
                sumShips += data[id];
            }
            ctx.fillRect(x, y, 30, 30);
        }
    }
    document.querySelector('#ships_ready').style = `background: linear-gradient(var(--angle), #c56c1e ${100 - sumShips}%, #004d4d ${100 - sumShips}%)`;
    document.querySelector('#ships_ready').setAttribute('title', sumShips);

}

window.setMobileTable = function () {
    // if (window.innerWidth > 600) return false;
    const tableEl = document.querySelector('table');
    const thEls = tableEl.querySelectorAll('thead th');
    const tdLabels = Array.from(thEls).map(el => el.textContent);
    tableEl.querySelectorAll('tbody tr').forEach(tr => {
        let id = 0;
        Array.from(tr.children).forEach((td, ndx) => {
            if(Object.values(cellIndexes).includes(ndx)){
                td.setAttribute('label', tdLabels[id]);
                id++;
            }
        }
        );
    });
}

search.oninput = function () {
    const rowses = Array.from(tBody.rows);
    for (const row of rowses) {
        if (!row.cells[0].textContent.toLowerCase().includes(this.value.toLowerCase())) row.classList.add('hidden');
        else row.classList.remove('hidden');
    }
}

const themeBtn = document.querySelector('#theme');
themeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    themeBtn.textContent = document.body.classList.contains('dark') ? '🌞' : '🌙';
}