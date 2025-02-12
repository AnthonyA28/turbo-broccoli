
function toggleContainer(containerId) {
    if (containerId === "toggle-all") {
        document.querySelectorAll(".container").forEach(container => {
            container.classList.toggle("hidden");
        });
    } else {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.toggle("hidden");
        } else {
            console.warn(`Container with id "${containerId}" not found.`);
        }
    }
    window.dispatchEvent(new Event("resize"));
}

document.addEventListener("DOMContentLoaded", () => {
    console.log(" DOM fully loaded.");
    if (window.electronAPI) {
        window.electronAPI.receive('toggle-container', (containerId) => {
            console.log(`🔄 Toggling ${containerId}`);
            toggleContainer(containerId);
            
        });
    } else {
        console.warn("Electron API not found. Skipping event listener.");
    }
    
});
