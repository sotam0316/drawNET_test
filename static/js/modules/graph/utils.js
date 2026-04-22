/**
 * Snap a position to the nearest grid interval, accounting for the object's dimension
 * to ensure its edges or center align properly with the grid.
 */
export function snapPosition(pos, dimension, spacing) {
    const offset = (dimension / 2) % spacing;
    return Math.round((pos - offset) / spacing) * spacing + offset;
}
