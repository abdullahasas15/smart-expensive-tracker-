document.addEventListener("DOMContentLoaded", async function () {
    const canvas = document.getElementById("expensechart");
    
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    try {
        const response = await fetch("/chart-data");
        const data = await response.json();

        console.log("Chart Data Received:", data);

        const labels = data.map(entry => entry.month);
        const values = data.map(entry => parseFloat(entry.total));

        const ctx = canvas.getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Monthly Expenses",
                    data: values,
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

    } catch (error) {
        console.error("Error loading chart data:", error);
    }
});