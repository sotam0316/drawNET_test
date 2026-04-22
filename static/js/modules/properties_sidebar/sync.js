/**
 * Synchronizes the changes made in the properties sidebar back to the DSL in the editor.
 */
export async function syncToDSL(ele, oldLabel) {
    const editor = document.getElementById('editor');
    if (!editor) return;

    let dsl = editor.value;
    const data = ele.getData() || {};
    const isNode = ele.isNode();

    if (isNode) {
        if (data.is_group) {
            // Update group definition: group Name { attrs }
            const regex = new RegExp(`^group\\s+${oldLabel}(\\s*\\{.*?\\})?`, 'mi');
            let attrParts = [];
            if (data.background) attrParts.push(`background: ${data.background}`);
            if (data.padding) attrParts.push(`padding: ${data.padding}`);
            const attrs = attrParts.length > 0 ? `{ ${attrParts.join(', ')} }` : '';
            
            if (regex.test(dsl)) {
                dsl = dsl.replace(regex, `group ${data.label} ${attrs}`);
            } else {
                dsl += `\ngroup ${data.label} ${attrs}\n`;
            }

            // If label changed, update all 'in' lines
            if (oldLabel !== data.label) {
                const memberRegex = new RegExp(`\\s+in\\s+${oldLabel}\\b`, 'gi');
                dsl = dsl.replace(memberRegex, ` in ${data.label}`);
            }
        } else {
            // Update node definition: Label [Type] { attrs }
            const regex = new RegExp(`^\\s*${oldLabel}(\\s*\\[.*?\\])?(\\s*\\{.*?\\})?\\s*(?!->)$`, 'm');
            const typeStr = data.type && data.type !== 'default' ? ` [${data.type}]` : '';
            const parentStr = data.parent ? ` { parent: ${data.parent} }` : '';
            
            if (regex.test(dsl)) {
                dsl = dsl.replace(regex, `${data.label}${typeStr}${parentStr}`);
            } else {
                dsl += `\n${data.label}${typeStr}${parentStr}\n`;
            }
        }
    } else {
        // Update edge definition: Source -> Target { attrs }
        const sourceNode = ele.getSourceNode();
        const targetNode = ele.getTargetNode();
        const sourceLabel = sourceNode?.getData()?.label || sourceNode?.id;
        const targetLabel = targetNode?.getData()?.label || targetNode?.id;

        if (sourceLabel && targetLabel) {
            const escSrc = sourceLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escDst = targetLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Match the whole line for the edge
            const edgeRegex = new RegExp(`^\\s*${escSrc}(?:\\s*\\[.*?\\])?(?:\\s*:[a-z]+)?\\s*->\\s*${escDst}(?:\\s*\\[.*?\\])?(?:\\s*:[a-z]+)?\\s*(\\{.*?\\})?\\s*$`, 'mi');

            let attrParts = [];
            if (data.color) attrParts.push(`color: ${data.color}`);
            if (data.style) attrParts.push(`style: ${data.style}`);
            if (data.source_anchor) attrParts.push(`source_anchor: ${data.source_anchor}`);
            if (data.target_anchor) attrParts.push(`target_anchor: ${data.target_anchor}`);
            if (data.direction && data.direction !== 'forward') attrParts.push(`direction: ${data.direction}`);
            if (data.is_tunnel) attrParts.push(`is_tunnel: true`);
            if (data.label) attrParts.push(`label: ${data.label}`);
            
            const attrs = attrParts.length > 0 ? ` { ${attrParts.join(', ')} }` : '';

            if (edgeRegex.test(dsl)) {
                dsl = dsl.replace(edgeRegex, (match) => {
                    const baseMatch = match.split('{')[0].trim();
                    return `${baseMatch}${attrs}`;
                });
            } else {
                dsl += `\n${sourceLabel} -> ${targetLabel}${attrs}\n`;
            }
        }
    }

    editor.value = dsl;
    // Trigger analyze with force=true to avoid race
    const editorModule = await import('../editor.js');
    editorModule.analyzeTopology(true);
}
