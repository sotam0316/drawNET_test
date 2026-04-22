export const ioHandlers = {
    exportJson: () => {
        const exportBtn = document.getElementById('export-json');
        if (exportBtn) exportBtn.click();
    },
    importJson: () => {
        const importBtn = document.getElementById('import-json');
        if (importBtn) importBtn.click();
    }
};
