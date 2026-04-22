export const studioState = {
    sources: [], // Original files [{file, id, previewUrl, type}]
    selectedIds: new Set(),
    packInfo: {
        id: '',
        name: '',
        vendor: '',
        version: '1.0.0'
    },
    categories: ['Network', 'Security', 'Compute', 'Cloud', 'Device', 'Other'],
    
    addCategory(name) {
        if (name && !this.categories.includes(name)) {
            this.categories.push(name);
            return true;
        }
        return false;
    },
    
    addSource(file) {
        const baseId = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, '_');
        let id = baseId;
        let counter = 1;
        
        // Ensure ID is unique
        while (this.sources.some(s => s.id === id)) {
            id = `${baseId}_${counter++}`;
        }

        const previewUrl = URL.createObjectURL(file);
        this.sources.push({
            id,
            file,
            name: file.name,
            label: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            previewUrl,
            category: 'Other',
            type: file.type.includes('svg') ? 'svg' : 'png',
            choice: file.type.includes('svg') ? 'svg' : 'png', // png, svg
            svgData: null,
            threshold: 128,
            status: 'pending' // pending, processing, done, error
        });
    },

    updateSource(id, data) {
        const src = this.sources.find(s => s.id === id);
        if (src) Object.assign(src, data);
    },

    setChoice(id, choice) {
        const src = this.sources.find(s => s.id === id);
        if (src) src.choice = choice;
    },

    removeSource(id) {
        const index = this.sources.findIndex(s => s.id === id);
        if (index > -1) {
            URL.revokeObjectURL(this.sources[index].previewUrl);
            this.sources.splice(index, 1);
            this.selectedIds.delete(id);
        }
    },

    clearSources() {
        this.sources.forEach(s => URL.revokeObjectURL(s.previewUrl));
        this.sources = [];
        this.selectedIds.clear();
    },

    toggleSelection(id, multi = false) {
        if (!multi) {
            const wasSelected = this.selectedIds.has(id);
            this.selectedIds.clear();
            if (!wasSelected) this.selectedIds.add(id);
        } else {
            if (this.selectedIds.has(id)) this.selectedIds.delete(id);
            else this.selectedIds.add(id);
        }
    },

    loadFromMetadata(metadata) {
        this.clearSources();
        this.packInfo = {
            id: metadata.id || '',
            name: metadata.name || metadata.id || '',
            vendor: metadata.vendor || '',
            version: metadata.version || '1.0.0'
        };

        if (metadata.assets) {
            metadata.assets.forEach(asset => {
                const choice = asset.views && asset.views.icon && asset.views.icon.endsWith('.svg') ? 'svg' : 'png';
                const filename = asset.views ? asset.views.icon : '';
                const previewUrl = `/static/assets/packs/${metadata.id}/${filename}`;
                
                this.sources.push({
                    id: asset.id,
                    file: null, // No local file object for loaded assets
                    name: filename,
                    label: asset.label || asset.id,
                    previewUrl,
                    category: asset.category || 'Other',
                    type: choice,
                    choice: choice,
                    svgData: null,
                    threshold: 128,
                    status: 'done'
                });

                // Ensure category exists in the list
                if (asset.category && !this.categories.includes(asset.category)) {
                    this.categories.push(asset.category);
                }
            });
        }
    }
};
