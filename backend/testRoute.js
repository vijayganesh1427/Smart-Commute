const points = [
    [12.845, 80.226],
    [12.789579, 80.221533],
    [12.827538, 80.165069],
    [12.8405, 80.153]
];
async function tryy(){
const response = await fetch("http://localhost:5000/api/route", {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        points
    })
});

const data = await response.json();

console.log(data);
}
tryy();